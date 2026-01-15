
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Menu, Plus, Bell, Settings, Filter, CheckCheck, AlertOctagon, AtSign, Zap } from 'lucide-react';
import { Notification, NotificationPriority } from '../../../shared/types';

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
  const [notifFilter, setNotifFilter] = useState<'all' | 'critical' | 'mentions'>('all');
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

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (notifFilter === 'critical') return n.priority === 'critical' || n.priority === 'high';
      if (notifFilter === 'mentions') return n.category === 'mention';
      return true;
    });
  }, [notifications, notifFilter]);

  const getPriorityIcon = (priority: NotificationPriority) => {
    if (priority === 'critical') return <AlertOctagon size={14} className="text-white fill-rose-500" />;
    if (priority === 'high') return <Zap size={14} className="text-orange-500" />;
    return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0 relative z-30">
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
          
          {/* Smart Notification Bell */}
          <div className="relative" ref={notifDropdownRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-2 rounded-full relative transition-colors ${isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
              )}
            </button>

            {/* Smart Notifications Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden animate-fade-in-down origin-top-right ring-1 ring-black/5">
                <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-md">
                    <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                      Notifications <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] text-slate-500">{unreadCount}</span>
                    </span>
                    {unreadCount > 0 && (
                      <button onClick={onMarkAllRead} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                </div>
                
                {/* Filter Tabs */}
                <div className="flex gap-2 px-4 py-2 bg-slate-50/50 border-b border-slate-100 overflow-x-auto no-scrollbar">
                   <button 
                     onClick={() => setNotifFilter('all')}
                     className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${notifFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                   >
                     All Updates
                   </button>
                   <button 
                     onClick={() => setNotifFilter('critical')}
                     className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${notifFilter === 'critical' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'}`}
                   >
                     <AlertOctagon size={12} /> Critical
                   </button>
                   <button 
                     onClick={() => setNotifFilter('mentions')}
                     className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap flex items-center gap-1 ${notifFilter === 'mentions' ? 'bg-indigo-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200'}`}
                   >
                     <AtSign size={12} /> Mentions
                   </button>
                </div>

                <div className="max-h-[28rem] overflow-y-auto bg-slate-50/30">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                      <Bell size={32} className="opacity-20" />
                      <p className="text-xs font-medium">You're all caught up!</p>
                    </div>
                  ) : (
                    filteredNotifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotifClickInternal(n)}
                        className={`group p-4 border-b border-slate-100 hover:bg-blue-50/50 cursor-pointer flex gap-3 transition-colors relative ${!n.isRead ? 'bg-white' : 'bg-slate-50 opacity-80 hover:opacity-100'}`}
                      >
                        {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>}
                        
                        <div className={`mt-1 w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
                          n.priority === 'critical' ? 'bg-rose-50 border-rose-100 text-rose-600' : 
                          n.category === 'mention' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                          'bg-white border-slate-200 text-slate-400'
                        }`}>
                           {getPriorityIcon(n.priority)}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                               <p className={`text-sm font-bold truncate pr-2 ${n.priority === 'critical' ? 'text-rose-700' : 'text-slate-800'}`}>{n.title}</p>
                               <span className="text-[9px] text-slate-400 whitespace-nowrap">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            
                            {n.aiSummary ? (
                              <div className="flex items-start gap-1.5 mb-1 bg-blue-50/50 p-1.5 rounded-lg border border-blue-100/50">
                                 <Zap size={10} className="text-blue-500 mt-0.5 shrink-0" />
                                 <p className="text-[10px] font-bold text-blue-700 leading-tight">{n.aiSummary}</p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                            )}
                            
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">{n.category}</span>
                               {n.priority === 'critical' && <span className="text-[9px] font-bold uppercase text-white bg-rose-500 px-1.5 py-0.5 rounded">High Priority</span>}
                            </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-2 bg-slate-50 border-t border-slate-200 text-center">
                   <button 
                     onClick={() => {
                        setIsNotifOpen(false);
                        setCurrentView('settings');
                     }}
                     className="text-[10px] font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center justify-center gap-2 w-full py-2"
                   >
                     <Settings size={12} /> Configure Smart Alerts
                   </button>
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
