
import { Notification, NotificationPreferences } from "../types";
import { db } from "./db";
import { analyzeNotification } from "./geminiService";

const COLLECTION = 'NOTIFICATIONS';
const PREFS_KEY = 'enjaz_notification_prefs';

const DEFAULT_PREFS: NotificationPreferences = {
  userId: 'default',
  dndEnabled: false,
  dndStartTime: '22:00',
  dndEndTime: '07:00',
  channels: {
    critical: { email: true, inApp: true, push: true },
    mentions: { email: true, inApp: true, push: true },
    updates: { email: false, inApp: true, push: false },
  }
};

export const notificationsRepo = {
  getAll: async (): Promise<Notification[]> => {
    return await db.get<Notification>(COLLECTION);
  },

  getForUser: async (userId: string): Promise<Notification[]> => {
    const all = await db.get<Notification>(COLLECTION);
    return all.filter(n => n.userId === userId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const all = await db.get<Notification>(COLLECTION);
    return all.filter(n => n.userId === userId && !n.isRead).length;
  },

  create: async (notification: Partial<Notification>): Promise<Notification> => {
    // 1. Basic Construction
    let newNotif: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: notification.userId!,
      title: notification.title || 'System Notification',
      message: notification.message || '',
      type: notification.type || 'info',
      priority: 'normal', // Default
      category: 'system', // Default
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedItemId: notification.relatedItemId
    };

    // 2. AI Enhancement (Async but awaited for demo purposes, in real app could be background job)
    // We try to make it fast using Flash model
    try {
       const aiResult = await analyzeNotification(newNotif.title, newNotif.message);
       newNotif.priority = aiResult.priority;
       newNotif.category = aiResult.category;
       newNotif.aiSummary = aiResult.summary;
       
       // Override type visual based on priority
       if (newNotif.priority === 'critical') newNotif.type = 'error';
       if (newNotif.priority === 'high') newNotif.type = 'warning';
    } catch (e) {
       console.warn("Skipping AI enhancement for notification");
    }

    return await db.add<Notification>(COLLECTION, newNotif);
  },

  markAsRead: async (id: string): Promise<void> => {
    await db.update<Notification>(COLLECTION, id, { isRead: true });
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    const all = await db.get<Notification>(COLLECTION);
    const updated = all.map(n => n.userId === userId ? { ...n, isRead: true } : n);
    await db.set(COLLECTION, updated);
  },

  // Preferences Management
  getPreferences: (): NotificationPreferences => {
    const stored = localStorage.getItem(PREFS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_PREFS;
  },

  savePreferences: (prefs: NotificationPreferences): void => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }
};
