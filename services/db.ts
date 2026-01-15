
import { MOCK_PROJECTS, MOCK_USERS, MOCK_WORK_ITEMS, MOCK_ARTICLES, MOCK_ASSETS } from "../constants";

const STORAGE_KEYS = {
  WORK_ITEMS: 'enjaz_work_items',
  PROJECTS: 'enjaz_projects',
  USERS: 'enjaz_users',
  NOTIFICATIONS: 'enjaz_notifications',
  DOCUMENTS: 'enjaz_documents',
  KNOWLEDGE_BASE: 'enjaz_knowledge_base',
  ASSETS: 'enjaz_assets'
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function get<T>(collection: keyof typeof STORAGE_KEYS): Promise<T[]> {
  await delay(150); 
  const key = STORAGE_KEYS[collection];
  const data = localStorage.getItem(key);
  
  if (data) {
    try {
      return JSON.parse(data) as T[];
    } catch (e) {
      console.error("Local storage corruption detected", e);
    }
  }

  let seedData: any[] = [];
  if (collection === 'WORK_ITEMS') seedData = MOCK_WORK_ITEMS;
  if (collection === 'PROJECTS') seedData = MOCK_PROJECTS;
  if (collection === 'USERS') seedData = MOCK_USERS;
  if (collection === 'KNOWLEDGE_BASE') seedData = MOCK_ARTICLES;
  if (collection === 'ASSETS') seedData = MOCK_ASSETS;

  localStorage.setItem(key, JSON.stringify(seedData));
  return seedData as T[];
}

async function set<T>(collection: keyof typeof STORAGE_KEYS, data: T[]): Promise<void> {
  await delay(100);
  const key = STORAGE_KEYS[collection];
  localStorage.setItem(key, JSON.stringify(data));
}

async function add<T extends { id: string }>(collection: keyof typeof STORAGE_KEYS, item: T): Promise<T> {
  const items = await get<T>(collection);
  const updatedItems = [item, ...items];
  await set(collection, updatedItems);
  return item;
}

async function update<T extends { id: string }>(collection: keyof typeof STORAGE_KEYS, id: string, updates: Partial<T>): Promise<T | null> {
  const items = await get<T>(collection);
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;

  const updatedItem = { ...items[index], ...updates };
  const updatedItems = [...items];
  updatedItems[index] = updatedItem;
  await set(collection, updatedItems);
  return updatedItem;
}

async function remove<T extends { id: string }>(collection: keyof typeof STORAGE_KEYS, id: string): Promise<void> {
  const items = await get<T>(collection);
  const filtered = items.filter(i => i.id !== id);
  await set(collection, filtered);
}

export const db = { get, set, add, update, remove };
