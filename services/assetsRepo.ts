import { Asset } from "../types";
import { db } from "./db";

const COLLECTION = 'ASSETS';

export const assetsRepo = {
  getAll: async (): Promise<Asset[]> => {
    return await db.get<Asset>(COLLECTION);
  },

  getById: async (id: string): Promise<Asset | undefined> => {
    const all = await db.get<Asset>(COLLECTION);
    return all.find(a => a.id === id);
  },

  update: async (id: string, updates: Partial<Asset>): Promise<Asset | null> => {
    return await db.update<Asset>(COLLECTION, id, updates);
  },

  create: async (asset: Partial<Asset>): Promise<Asset> => {
    const newAsset: any = {
      ...asset,
      id: asset.id || `AST-${Date.now()}`
    };
    return await db.add<Asset>(COLLECTION, newAsset);
  }
};
