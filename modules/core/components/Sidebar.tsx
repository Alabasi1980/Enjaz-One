import React, { useState } from 'react';
import { LayoutGrid, CheckSquare, Building2, FolderOpen, BookOpen, Box, HardHat, ChevronRight, UserCircle, LogOut } from 'lucide-react';
import { User } from '../../../types';

type View = 'dashboard' | 'workitems' | 'approvals' | 'projects' | 'field-ops' | 'project-detail' | 'documents' | 'knowledge' | 'assets' | 'settings' | 'profile';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  currentUser: User | null;
  users: User[];
  pendingCount: number;
  onSwitchUser: (userId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  currentUser, 
  users, 
  pendingCount, 
  onSwitchUser 
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'workitems', label: 'Operations', icon: CheckSquare },
    { id: 'approvals', label: 'My Approvals', icon: CheckSquare, badge: pendingCount },
    { id: 'projects', label: 'Projects', icon: Building2 },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'assets', label: 'Asset Registry', icon: Box },
    { id: 'field-ops', label: 'Field Ops', icon: HardHat, category: 'Modules' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId as View);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-white p-6 z-50
        transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 mb-10 group cursor-pointer" onClick={() => handleNavClick('dashboard')}>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">E</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Enjaz One</h1>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">v2.0 Enterprise</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentView === item.id || (item.id === 'workitems' && currentView === 'approvals' && !item.badge);
            return (
              <React.Fragment key={item.id}>
                {item.category && (
                   <div className="pt-6 pb-2">
                     <p className="text-[10px] font-bold text-slate-500 px-4 uppercase tracking-widest">{item.category}</p>
                   </div>
                )}
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 font-bold' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-slate-800 relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
              <img src={currentUser?.avatar} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{currentUser?.role}</p>
            </div>
            <ChevronRight size={16} className={`text-slate-600 transition-transform ${isUserMenuOpen ? '-rotate-90' : ''}`} />
          </button>

          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 w-full mb-3 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden animate-slide-in-up">
               <div className="p-3 bg-slate-800/50 border-b border-slate-800">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account & Session</p>
               </div>
               <button 
                  onClick={() => { handleNavClick('profile'); setIsUserMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-slate-300 hover:bg-blue-600 hover:text-white transition-colors"
               >
                  <UserCircle size={18} /> My Profile
               </button>
               
               <div className="p-2 bg-slate-800/30 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 py-2">
                  Switch User
               </div>
               <div className="max-h-48 overflow-y-auto">
                 {users.map(u => (
                   <button
                     key={u.id}
                     onClick={() => { onSwitchUser(u.id); setIsUserMenuOpen(false); }}
                     className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-slate-800 transition-colors ${currentUser?.id === u.id ? 'text-blue-400 bg-blue-500/5 font-bold' : 'text-slate-400'}`}
                   >
                      <div className={`w-6 h-6 rounded-full border ${currentUser?.id === u.id ? 'border-blue-500' : 'border-slate-700'} overflow-hidden`}>
                         <img src={u.avatar} className="w-full h-full object-cover" />
                      </div>
                      <span className="truncate">{u.name}</span>
                   </button>
                 ))}
               </div>
               <button className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 text-red-400 hover:bg-red-500/10 border-t border-slate-800">
                  <LogOut size={18} /> Logout
               </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
