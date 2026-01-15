import { Notification } from "../types";
import { db } from "./db";

const COLLECTION = 'NOTIFICATIONS';

export const notificationsRepo = {
  getAll: async (): Promise<Notification[]> => {
    return await db.get<Notification>(COLLECTION);
  },

  getForUser: async (userId: string): Promise<Notification[]> => {
    const all = await db.get<Notification>(COLLECTION);
    // Return newest first
    return all.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const all = await db.get<Notification>(COLLECTION);
    return all.filter(n => n.userId === userId && !n.isRead).length;
  },

  create: async (notification: Partial<Notification>): Promise<Notification> => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: notification.userId!,
      title: notification.title || 'System Notification',
      message: notification.message || '',
      type: notification.type || 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedItemId: notification.relatedItemId
    };
    return await db.add<Notification>(COLLECTION, newNotif);
  },

  markAsRead: async (id: string): Promise<void> => {
    await db.update<Notification>(COLLECTION, id, { isRead: true });
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    const all = await db.get<Notification>(COLLECTION);
    const updated = all.map(n => n.userId === userId ? { ...n, isRead: true } : n);
    await db.set(COLLECTION, updated);
  }
};
