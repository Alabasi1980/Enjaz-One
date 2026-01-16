
import { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { WorkItem, Project, User, Notification, Status } from '../types';

export const useEnjazCore = () => {
  const data = useData();
  
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pendingUpdatesCount = useRef(0);
  const activeAbortController = useRef<AbortController | null>(null);

  const loadAllData = useCallback(async (forceRefresh = false) => {
    if (activeAbortController.current) {
      activeAbortController.current.abort();
    }
    
    const controller = new AbortController();
    activeAbortController.current = controller;

    try {
      if (forceRefresh) data.invalidateCache();
      
      // جلب البيانات الأساسية
      const [items, projs, usrs, currUser] = await Promise.all([
        data.workItems.getAll(forceRefresh),
        data.projects.getAll(forceRefresh),
        data.users.getAll(forceRefresh),
        data.users.getCurrentUser()
      ]);
      
      if (controller.signal.aborted) return;

      setWorkItems(items);
      setProjects(projs);
      setUsers(usrs);
      setCurrentUser(currUser);
      
      if (currUser) {
        const notifs = await data.notifications.getForUser(currUser.id);
        setNotifications(notifs);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Critical: Data Load Failed", err);
      setError("فشل في مزامنة البيانات. سيتم المحاولة مجدداً.");
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [data]);

  // التحميل الأولي فقط عند تشغيل التطبيق أو تغيير مزود البيانات
  useEffect(() => {
    loadAllData();
    return () => activeAbortController.current?.abort();
  }, [loadAllData]);

  // التحديث الدوري (Polling) في useEffect منفصل
  useEffect(() => {
    if (!currentUser || isLoading) return;

    const pollInterval = setInterval(() => {
      if (pendingUpdatesCount.current > 0) return;

      // تحديث التنبيهات والعمليات في الخلفية دون تفعيل حالة التحميل الرئيسية
      data.notifications.getForUser(currentUser.id).then(notifs => {
          setNotifications(notifs);
      }).catch(() => {});
      
      data.workItems.getAll(true).then(items => {
          setWorkItems(items);
      }).catch(() => {});

    }, 30000); 

    return () => clearInterval(pollInterval);
  }, [currentUser, data, isLoading]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    pendingUpdatesCount.current++;
    setWorkItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    
    try {
      await data.workItems.updateStatus(id, newStatus);
    } catch (err: any) {
      setError("فشل تحديث الحالة. جاري إعادة المحاولة...");
      await loadAllData(true);
    } finally {
      pendingUpdatesCount.current = Math.max(0, pendingUpdatesCount.current - 1);
    }
  };

  const handleSwitchUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const newUser = await data.users.setCurrentUser(userId);
      if (newUser) {
        setCurrentUser(newUser);
        await loadAllData(true);
      }
    } catch (err) {
      setError("فشل تبديل المستخدم.");
      setIsLoading(false);
    }
  };

  const markAllNotifsRead = async () => {
    if (currentUser) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      try {
        await data.notifications.markAllAsRead(currentUser.id);
      } catch (err) {}
    }
  };

  return {
    workItems, projects, users, currentUser, notifications, isLoading, error, setError,
    loadAllData, handleStatusUpdate, handleSwitchUser, markAllNotifsRead
  };
};
