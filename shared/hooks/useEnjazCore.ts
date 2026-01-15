
import { useState, useEffect, useCallback } from 'react';
import { workItemsRepo } from '../../services/workItemsRepo';
import { projectsRepo } from '../../services/projectsRepo';
import { usersRepo } from '../../services/usersRepo';
import { notificationsRepo } from '../../services/notificationsRepo';
import { WorkItem, Project, User, Notification, Status } from '../../types';

export const useEnjazCore = () => {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    try {
      const [items, projs, usrs, currUser] = await Promise.all([
        workItemsRepo.getAll(),
        projectsRepo.getAll(),
        usersRepo.getAll(),
        usersRepo.getCurrentUser()
      ]);
      
      setWorkItems(items);
      setProjects(projs);
      setUsers(usrs);
      setCurrentUser(currUser);
      
      if (currUser) {
        const notifs = await notificationsRepo.getForUser(currUser.id);
        setNotifications(notifs);
      }
    } catch (error) {
      console.error("Critical: Data Load Failed", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(() => {
       if (currentUser) {
         notificationsRepo.getForUser(currentUser.id).then(setNotifications);
       }
    }, 30000);
    return () => clearInterval(interval);
  }, [currentUser, loadAllData]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    await workItemsRepo.updateStatus(id, newStatus);
    await loadAllData();
  };

  const handleSwitchUser = async (userId: string) => {
    const newUser = await usersRepo.setCurrentUser(userId);
    if (newUser) {
      setCurrentUser(newUser);
      await loadAllData();
    }
  };

  const markAllNotifsRead = async () => {
    if (currentUser) {
      await notificationsRepo.markAllAsRead(currentUser.id);
      await loadAllData();
    }
  };

  return {
    workItems, projects, users, currentUser, notifications, isLoading,
    loadAllData, handleStatusUpdate, handleSwitchUser, markAllNotifsRead
  };
};
