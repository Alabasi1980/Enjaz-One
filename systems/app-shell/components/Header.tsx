import React, { useRef, useState, useEffect } from 'react';
import { Menu, Plus, Bell, Settings } from 'lucide-react';
import { Notification } from '../../../shared/types';

type View = 'dashboard' | 'workitems' | 'approvals' | 'projects' | 'field-ops' | 'project-detail' | 'documents' | 'knowledge' | 'assets' | 'settings' | 'profile';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onOpenCreateModal: () => void;
  notifications: Notification[];
  onNotificationClick: (n: Notification) => void;
  onMarkAllRead: () => void;
  unreadCount: number;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  setIsSidebarOpen,
  onOpenCreateModal,
  notifications,
  onNotificationClick,
  onMarkAllRead,
  unreadCount
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifClickInternal = (n: Notification) => {
      onNotificationClick(n);
      setIsNotifOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 relative">
      <div className="flex items-center gap-4">
        <button 
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-slate-800 capitalize">
          {currentView === 'workitems' ? 'Operations Center' : currentView.replace('-', ' ')}
        </h2>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onOpenCreateModal}
            className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm shadow-blue-200"
          >
            <Plus size={18} /> New Item
          </button>
          <button className="md:hidden p-2 bg-blue-600 text-white rounded-lg" onClick={onOpenCreateModal}>
            <Plus size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200 mx-1"></div>
          
          {/* Notification Bell */}
          <div className="relative" ref={notifDropdownRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-full relative transition-colors ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-fade-in-down">
                <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <span className="text-sm font-bold text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={onMarkAllRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotifClickInternal(n)}
                        className={`p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer flex gap-3 ${n.isRead ? 'opacity-70' : 'bg-blue-50/30'}`}
                      >
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.isRead ? 'bg-slate-300' : 'bg-blue-500'}`}></div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleTimeString()} {new Date(n.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setCurrentView('settings')}
            className={`p-2 rounded-full transition-colors ${currentView === 'settings' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <Settings size={20} />
          </button>
      </div>
    </header>
  );
};

export default Header;