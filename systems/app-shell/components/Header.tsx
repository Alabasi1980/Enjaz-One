import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Menu, Plus, Bell, Settings, Search, Command, CheckCheck, AlertOctagon, AtSign, Zap, HelpCircle, ChevronLeft } from 'lucide-react';
import { Notification, NotificationPriority } from '../../../shared/types';

type View = 'dashboard' | 'ceo-board' | 'workitems' | 'approvals' | 'projects' | 'field-ops' | 'project-detail' | 'documents' | 'knowledge' | 'assets' | 'inventory' | 'finance' | 'procurement' | 'hr' | 'payroll' | 'settings' | 'profile';

interface HeaderProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  onOpenCreateModal: () => void;
  notifications: Notification[];
  onNotificationClick: (n: Notification) => void;
  onMarkAllRead: () => void;
  unreadCount: number;
  projectTitle?: string;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  setIsSidebarOpen,
  onOpenCreateModal,
  notifications,
  onNotificationClick,
  onMarkAllRead,
  unreadCount,
  projectTitle
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

  const getPageTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'لوحة التحكم';
      case 'ceo-board': return 'الإدارة الاستراتيجية';
      case 'workitems': return 'مركز العمليات';
      case 'approvals': return 'الاعتمادات';
      case 'projects': return 'المشاريع';
      case 'project-detail': return projectTitle || 'التفاصيل';
      case 'documents': return 'الأرشيف';
      case 'assets': return 'الأصول';
      case 'knowledge': return 'المعرفة';
      case 'field-ops': return 'الميدان';
      default: return 'Enjaz One';
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (notifFilter === 'critical') return n.priority === 'critical' || n.priority === 'high';
      if (notifFilter === 'mentions') return n.category === 'mention';
      return true;
    });
  }, [notifications, notifFilter]);

  return (
    <header className="h-20 glass-header flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-40" dir="rtl">
      {/* Navigation Info */}
      <div className="flex items-center gap-5 flex-1">
        <button 
          className="lg:hidden p-3 text-slate-600 hover:bg-white rounded-2xl shadow-sm transition-all"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu size={22} />
        </button>
        
        <div className="flex flex-col">
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span>الرئيسية</span>
              <ChevronLeft size={10} />
              <span className="text-blue-500">{currentView === 'project-detail' ? 'المشاريع' : 'النظام'}</span>
           </div>
           <h2 className="text-xl font-black text-slate-900 tracking-tight">
             {getPageTitle()}
           </h2>
        </div>
      </div>

      {/* Modern Search */}
      <div className="hidden md:flex flex-1 max-w-lg mx-6">
         <div className="relative w-full group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="بحث سريع في النظام..." 
              className="w-full pl-12 pr-12 py-3 bg-white/50 border border-slate-200/60 rounded-[1.2rem] text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 outline-none transition-all shadow-sm"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-[9px] font-black text-slate-400 shadow-inner">
               <Command size={10} /> K
            </div>
         </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
          <button 
            onClick={onOpenCreateModal}
            className="hidden lg:flex items-center gap-2 bg-slate-900 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-xl shadow-slate-900/10 hover:scale-105"
          >
            <Plus size={16} /> إضافة
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>
          
          {/* Notifications */}
          <div className="relative" ref={notifDropdownRef}>
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className={`p-3.5 rounded-2xl relative transition-all ${isNotifOpen ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg' : 'bg-white text-slate-500 hover:text-slate-900 shadow-sm border border-slate-100'}`}
            >
              <Bell size={20} className={unreadCount > 0 ? 'animate-wiggle' : ''} />
              {unreadCount > 0 && !isNotifOpen && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute left-0 top-full mt-4 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 z-50 overflow-hidden animate-scale-in origin-top-left">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <span className="text-base font-black text-slate-800">التنبيهات</span>
                    <button onClick={onMarkAllRead} className="text-[10px] font-black text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl transition-all">قراءة الكل</button>
                </div>
                
                <div className="max-h-[28rem] overflow-y-auto no-scrollbar">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-16 text-center text-slate-400">
                      <Bell size={40} className="mx-auto mb-4 opacity-10" />
                      <p className="text-sm font-bold">كل شيء هادئ هنا!</p>
                    </div>
                  ) : (
                    filteredNotifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => { onNotificationClick(n); setIsNotifOpen(false); }}
                        className={`p-5 border-b border-slate-50 hover:bg-blue-50/40 cursor-pointer flex gap-4 transition-all ${!n.isRead ? 'bg-blue-50/20' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center border ${n.priority === 'critical' ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-white border-slate-100 text-blue-500'}`}>
                           {n.priority === 'critical' ? <AlertOctagon size={18}/> : <Zap size={18}/>}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                               <p className="text-sm font-black text-slate-800 truncate max-w-[180px]">{n.title}</p>
                               <span className="text-[9px] font-black text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
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
            className={`p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-500 hover:text-blue-600 transition-all ${currentView === 'settings' ? 'text-blue-600 border-blue-100' : ''}`}
          >
            <Settings size={20} />
          </button>
      </div>
    </header>
  );
};

export default Header;