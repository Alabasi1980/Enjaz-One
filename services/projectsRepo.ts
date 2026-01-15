
import { Project } from "../types";
import { db } from "./db";

export const projectsRepo = {
  getAll: async (): Promise<Project[]> => {
    return await db.get<Project>('PROJECTS');
  },
  
  getById: async (id: string): Promise<Project | undefined> => {
    const items = await db.get<Project>('PROJECTS');
    return items.find(p => p.id === id);
  },

  update: async (id: string, updates: Partial<Project>): Promise<Project | null> => {
    return await db.update<Project>('PROJECTS', id, updates);
  }
};
