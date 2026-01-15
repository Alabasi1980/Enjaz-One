import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, X } from 'lucide-react';

// Data Layer
import { DataProvider, useData } from './context/DataContext';

// System-Based Architecture Imports
import { Sidebar, Header } from './systems/app-shell';
import { Dashboard } from './systems/dashboard';
import { SettingsView } from './systems/settings';
import { ProfileView } from './systems/profile';
import { WorkItemList, WorkItemDetail, CreateWorkItemModal, ApprovalsView } from './systems/operations';
import { ProjectsListView, ProjectDetail } from './systems/projects';
import { DocumentsView } from './systems/documents';
import { KnowledgeBase } from './systems/knowledge';
import { AssetsView } from './systems/assets';
import { FieldOps } from './systems/field-ops';
import { LoginView, MfaVerification, authService } from './systems/auth';

// Shared
import { useEnjazCore } from './shared/hooks/useEnjazCore';
import { WorkItem, Project, User } from './shared/types';

type View = 'dashboard' | 'workitems' | 'approvals' | 'projects' | 'field-ops' | 'project-detail' | 'documents' | 'knowledge' | 'assets' | 'settings' | 'profile';
type AuthState = 'LOGIN' | 'MFA' | 'AUTHENTICATED';

function AppContent() {
  const data = useData(); // Unified Data Source
  const [authState, setAuthState] = useState<AuthState>('LOGIN');
  const [authUser, setAuthUser] = useState<User | null>(null);

  const { 
    workItems, projects, users, currentUser, notifications, isLoading: isDataLoading, error, setError,
    handleStatusUpdate, handleSwitchUser, markAllNotifsRead, loadAllData 
  } = useEnjazCore();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const sessionUser = authService.getSession();
    if (sessionUser) {
      setAuthUser(sessionUser);
      setAuthState('AUTHENTICATED');
      data.users.setCurrentUser(sessionUser.id);
    }
  }, [data]);

  const handleLoginSuccess = (user: User) => {
    setAuthUser(user);
    setAuthState('MFA');
  };

  const handleMfaVerified = () => {
    if (authUser) {
      authService.createSession(authUser);
      data.users.setCurrentUser(authUser.id);
      setAuthState('AUTHENTICATED');
      loadAllData();
    }
  };

  const handleLogout = () => {
    authService.logout();
    setAuthState('LOGIN');
    setAuthUser(null);
  };

  const handleCreateWorkItem = async (newItem: Partial<WorkItem>) => {
    try {
      await data.workItems.create(newItem);
      await loadAllData();
      setIsCreateModalOpen(false);
    } catch (err) {
      setError("فشل إنشاء العملية الجديدة.");
    }
  };

  if (authState === 'LOGIN') {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  if (authState === 'MFA' && authUser) {
    return <MfaVerification user={authUser} onVerified={handleMfaVerified} onCancel={handleLogout} />;
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="text-center">
          <p className="text-white font-black tracking-widest text-xs">ENJAZ ONE CORE</p>
          <p className="text-slate-500 text-[10px] font-bold mt-1">جاري تحميل البيانات المشفرة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden relative">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md animate-slide-in-down px-4" dir="rtl">
           <div className="bg-rose-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-rose-500">
              <div className="flex items-center gap-3">
                 <AlertCircle size={20} />
                 <p className="text-sm font-bold">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={18}/></button>
           </div>
        </div>
      )}

      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView as any}
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        currentUser={currentUser} 
        users={users}
        pendingCount={workItems.filter(i => i.status === 'Pending Approval').length}
        onSwitchUser={(id) => { handleSwitchUser(id); }}
      />

      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-hidden transition-all duration-300 ease-in-out`}>
        <Header 
          currentView={currentView} 
          setCurrentView={setCurrentView as any}
          setIsSidebarOpen={setIsSidebarOpen} 
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          notifications={notifications} 
          unreadCount={notifications.filter(n => !n.isRead).length}
          onNotificationClick={(n) => { 
            if(n.relatedItemId) {
              const item = workItems.find(i => i.id === n.relatedItemId);
              if(item) setSelectedItem(item);
            }
          }}
          onMarkAllRead={markAllNotifsRead}
          projectTitle={currentView === 'project-detail' ? selectedProject?.name : undefined}
        />

        <div className="flex-1 p-4 lg:p-6 overflow-y-auto no-scrollbar pb-24">
          {/* Fix: Added missing projects and users props to Dashboard component to satisfy type requirements */}
          {currentView === 'dashboard' && <Dashboard items={workItems} projects={projects} users={users} />}
          {currentView === 'workitems' && <WorkItemList items={workItems} onItemClick={setSelectedItem} />}
          {currentView === 'approvals' && <ApprovalsView items={workItems} currentUser={currentUser} onItemClick={setSelectedItem} />}
          {currentView === 'projects' && (
            <ProjectsListView 
              projects={projects} 
              workItems={workItems} 
              onSelectProject={(p) => { setSelectedProject(p); setCurrentView('project-detail'); }} 
              onCreateProject={() => setIsCreateModalOpen(true)} 
            />
          )}
          {currentView === 'project-detail' && selectedProject && (
            <ProjectDetail 
              project={selectedProject} 
              items={workItems.filter(i => i.projectId === selectedProject.id)} 
              onBack={() => setCurrentView('projects')} 
              onItemClick={setSelectedItem} 
              onNavigate={setCurrentView as any} 
            />
          )}
          {currentView === 'documents' && <DocumentsView projects={projects} />}
          {currentView === 'knowledge' && <KnowledgeBase />}
          {currentView === 'assets' && <AssetsView />}
          {currentView === 'field-ops' && <FieldOps projects={projects} onSubmit={handleCreateWorkItem} />}
          {currentView === 'settings' && <SettingsView />}
          {currentView === 'profile' && currentUser && (
            <ProfileView user={currentUser} onNavigate={setCurrentView as any} onItemClick={setSelectedItem} />
          )}
        </div>
      </div>

      <CreateWorkItemModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        projects={projects} 
        users={users} 
        currentUser={currentUser} 
        onCreate={handleCreateWorkItem} 
      />

      {selectedItem && (
        <WorkItemDetail 
          item={selectedItem} 
          project={projects.find(p => p.id === selectedItem.projectId)} 
          assignee={users.find(u => u.id === selectedItem.assigneeId)} 
          currentUser={currentUser} 
          onClose={() => setSelectedItem(null)} 
          onUpdateStatus={handleStatusUpdate} 
          onRefresh={loadAllData} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;