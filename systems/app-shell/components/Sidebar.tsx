import React, { useState } from 'react';
import { 
  LayoutGrid, CheckSquare, Building2, FolderOpen, BookOpen, 
  Box, HardHat, ChevronLeft, ChevronDown, UserCircle, LogOut,
  ShieldCheck, Activity, ShoppingBag, FileText, 
  Settings as SettingsIcon, Wallet, Users, ShoppingCart,
  Crown, CreditCard, PieChart, Search, Zap, ListTodo, 
  FileBarChart, Cog, Landmark, Inbox
} from 'lucide-react';
import { User } from '../../../shared/types';
import { authService } from '../../auth';

type View = 'dashboard' | 'ceo-board' | 'workitems' | 'approvals' | 'projects' | 'field-ops' | 'project-detail' | 'documents' | 'knowledge' | 'assets' | 'inventory' | 'finance' | 'hr' | 'payroll' | 'procurement' | 'settings' | 'profile';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: any) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  currentUser: User | null;
  users: User[];
  pendingCount: number;
  onSwitchUser: (userId: string) => void;
}

interface NavAction {
  id: string;
  label: string;
  icon: any;
  view: View;
}

interface MainSystem {
  id: string;
  label: string;
  icon: any;
  actions: NavAction[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  setCurrentView, 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isCollapsed,
  setIsCollapsed,
  currentUser, 
  pendingCount 
}) => {
  const [openSystems, setOpenSystems] = useState<string[]>(['ops', 'projects']);

  const toggleSystem = (id: string) => {
    setOpenSystems(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const systems: MainSystem[] = [
    {
      id: 'exec',
      label: 'الجناح الاستراتيجي',
      icon: Crown,
      actions: [
        { id: 'ceo-dash', label: 'القيادة التنفيذية', icon: LayoutGrid, view: 'ceo-board' },
      ]
    },
    {
      id: 'ops',
      label: 'نظام العمليات',
      icon: HardHat,
      actions: [
        { id: 'ops-daily', label: 'مركز العمليات', icon: ListTodo, view: 'workitems' },
        { id: 'ops-appr', label: 'مركز الاعتمادات', icon: ShieldCheck, view: 'approvals' },
        { id: 'fld-gate', label: 'بوابة الميدان', icon: Zap, view: 'field-ops' },
      ]
    },
    {
      id: 'projects',
      label: 'إدارة المشاريع',
      icon: Building2,
      actions: [
        { id: 'prj-list', label: 'مستكشف المشاريع', icon: LayoutGrid, view: 'projects' },
      ]
    },
    {
      id: 'supply',
      label: 'سلاسل الإمداد',
      icon: ShoppingBag,
      actions: [
        { id: 'proc-daily', label: 'المشتريات', icon: ShoppingCart, view: 'procurement' },
        { id: 'inv-daily', label: 'المستودع الرقمي', icon: Box, view: 'inventory' },
        { id: 'ast-daily', label: 'سجل الأصول', icon: Construction, view: 'assets' },
      ]
    },
    {
      id: 'finance',
      label: 'المالية والرقابة',
      icon: Wallet,
      actions: [
        { id: 'fin-daily', label: 'إدارة التكاليف', icon: FileBarChart, view: 'finance' },
      ]
    },
    {
      id: 'hr',
      label: 'رأس المال البشري',
      icon: Users,
      actions: [
        { id: 'hr-daily', label: 'شؤون الموظفين', icon: Users, view: 'hr' },
        { id: 'pay-daily', label: 'مسير الرواتب', icon: CreditCard, view: 'payroll' },
      ]
    },
    {
      id: 'resources',
      label: 'المعرفة والأرشيف',
      icon: FolderOpen,
      actions: [
        { id: 'doc-archive', label: 'أرشيف الوثائق', icon: FolderOpen, view: 'documents' },
        { id: 'knowledge-wiki', label: 'قاعدة المعرفة', icon: BookOpen, view: 'knowledge' },
      ]
    },
    {
      id: 'core',
      label: 'النظام',
      icon: Cog,
      actions: [
        { id: 'main-dash', label: 'الرئيسية', icon: LayoutGrid, view: 'dashboard' },
        { id: 'user-profile', label: 'الملف الشخصي', icon: UserCircle, view: 'profile' },
        { id: 'sys-settings', label: 'إعدادات المنصة', icon: SettingsIcon, view: 'settings' },
      ]
    }
  ];

  return (
    <>
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:sticky top-0 right-0 h-screen bg-slate-900 text-white z-50
        transition-all duration-500 ease-in-out flex flex-col border-l border-slate-800
        ${isSidebarOpen ? 'translate-x-0 w-80' : 'translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-24' : 'lg:w-80'}
      `} dir="rtl">
        
        {/* Logo */}
        <div className={`flex items-center gap-4 p-8 mb-4 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-12 h-12 bg-blue-600 rounded-[1.2rem] flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/20 shrink-0 transform group-hover:rotate-12 transition-transform">E</div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <h1 className="text-2xl font-black tracking-tighter text-white">Enjaz One</h1>
              <p className="text-[8px] text-blue-500 uppercase font-black tracking-[0.2em]">Enterprise Core v2.9</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-2 pb-10">
          {systems.map((system) => (
            <div key={system.id} className="mb-2">
              <button 
                onClick={() => !isCollapsed && toggleSystem(system.id)}
                className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
                  openSystems.includes(system.id) ? 'bg-white/5 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <system.icon size={20} className={`${openSystems.includes(system.id) ? 'text-blue-500' : 'group-hover:text-slate-300'}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-right text-xs font-black tracking-tight uppercase">{system.label}</span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${openSystems.includes(system.id) ? '' : '-rotate-90 opacity-20'}`} />
                  </>
                )}
              </button>

              {!isCollapsed && openSystems.includes(system.id) && (
                <div className="mr-6 mt-1 pr-4 border-r border-slate-800/50 space-y-1 animate-fade-in">
                  {system.actions.map((action) => {
                     const isActive = currentView === action.view;
                     return (
                       <button
                         key={action.id}
                         onClick={() => { setCurrentView(action.view); setIsSidebarOpen(false); }}
                         className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                           isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                         }`}
                       >
                         <action.icon size={14} className={isActive ? 'text-white' : 'text-slate-700'} />
                         <span>{action.label}</span>
                       </button>
                     );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer User Area */}
        <div className="p-6 border-t border-slate-800/50 bg-slate-900/80 backdrop-blur-md">
           <button 
             onClick={() => authService.logout()}
             className={`w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-rose-600/10 text-slate-500 hover:text-rose-500 transition-all ${isCollapsed ? 'justify-center' : ''}`}
           >
             <LogOut size={20} />
             {!isCollapsed && <span className="font-black text-xs uppercase tracking-widest">خروج آمن</span>}
           </button>
        </div>
      </aside>
    </>
  );
};

const Construction = ({ size, className }: any) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="8" rx="1"/><path d="M17 14v7"/><path d="M7 14v7"/><path d="M17 3v3"/><path d="M7 3v3"/><path d="M10 14 2.3 6.3"/><path d="m14 14 7.7-7.7"/><path d="m8 6 8 8"/></svg>
);

export default Sidebar;