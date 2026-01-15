import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import net from 'node:net';

const TARGET_URL = process.env.SMOKE_URL || 'http://127.0.0.1:5173/';
const TARGET = new URL(TARGET_URL);
const PORT = Number(TARGET.port || 80);
const HOST = TARGET.hostname;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForPortOpen({ host, port, timeoutMs }) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const isOpen = await new Promise((resolve) => {
      const socket = new net.Socket();
      socket
        .once('error', () => {
          socket.destroy();
          resolve(false);
        })
        .once('timeout', () => {
          socket.destroy();
          resolve(false);
        })
        .connect({ host, port }, () => {
          socket.end();
          resolve(true);
        });
      socket.setTimeout(500);
    });

    if (isOpen) return;
    await sleep(250);
  }
  throw new Error(`Timed out waiting for ${host}:${port} to open`);
}

function startViteDevServer() {
  const args = ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'];
  const child =
    process.platform === 'win32'
      ? spawn(process.env.comspec || 'cmd.exe', ['/d', '/s', '/c', `npm ${args.join(' ')}`], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env },
        })
      : spawn('npm', args, {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env },
        });

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  const logs = [];
  child.stdout.on('data', (d) => logs.push(d));
  child.stderr.on('data', (d) => logs.push(d));

  return { child, getLogs: () => logs.join('') };
}

async function main() {
  const { child, getLogs } = startViteDevServer();

  try {
    await waitForPortOpen({ host: HOST, port: PORT, timeoutMs: 20_000 });

    const browser = await chromium.launch();
    const page = await browser.newPage();

    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    page.on('pageerror', (err) => {
      pageErrors.push(String(err?.message || err));
    });

    const response = await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    const status = response?.status();

    // Allow any late module loading / runtime init to surface.
    await page.waitForTimeout(3000);

    await browser.close();

    const allErrors = [...pageErrors, ...consoleErrors];

    console.log(`SMOKE_URL=${TARGET_URL}`);
    console.log(`HTTP_STATUS=${status ?? 'unknown'}`);

    if (allErrors.length) {
      console.log('--- ERRORS (pageerror + console.error) ---');
      for (const e of allErrors) console.log(e);
      process.exitCode = 1;
    } else {
      console.log('OK: No runtime console/page errors detected.');
    }
  } finally {
    child.kill();
    // give vite a moment to release the port
    await sleep(500);
    const logs = getLogs();
    if (logs.trim()) {
      console.log('--- VITE LOGS ---');
      console.log(logs.trimEnd());
    }
  }
}

main().catch((err) => {
  console.error('SMOKE FAILED:', err?.stack || err);
  process.exit(1);
});
