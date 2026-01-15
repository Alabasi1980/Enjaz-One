import { User } from "../types";
import { db } from "./db";

export const usersRepo = {
  getAll: async (): Promise<User[]> => {
    return await db.get<User>('USERS');
  },

  getCurrentUser: async (): Promise<User> => {
    const users = await db.get<User>('USERS');
    const storedId = localStorage.getItem('enjaz_current_user_id');
    
    if (storedId) {
      const found = users.find(u => u.id === storedId);
      if (found) return found;
    }
    
    // Default to first user if none selected
    return users[0];
  },

  setCurrentUser: async (userId: string): Promise<User | undefined> => {
    const users = await db.get<User>('USERS');
    const user = users.find(u => u.id === userId);
    if (user) {
      localStorage.setItem('enjaz_current_user_id', user.id);
      return user;
    }
    return undefined;
  }
};
