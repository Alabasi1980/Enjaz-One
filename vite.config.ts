import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use type assertion for process to access cwd() as Node types might be missing in this context
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures your existing code using process.env.API_KEY works without changes
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    resolve: {
      alias: {
        // Ensure imports resolve correctly
        '@': '/src'
      }
    }
  };
});