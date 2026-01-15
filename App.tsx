import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

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

// Shared
import { useEnjazCore } from './shared/hooks/useEnjazCore';
import { WorkItem, Project } from './shared/types';
import { workItemsRepo } from './shared/services/workItemsRepo';

type View = 'dashboard' | 'workitems' | 'approvals' | 'projects' | 'field-ops' | 'project-detail' | 'documents' | 'knowledge' | 'assets' | 'settings' | 'profile';

function App() {
  const { 
    workItems, projects, users, currentUser, notifications, isLoading,
    handleStatusUpdate, handleSwitchUser, markAllNotifsRead, loadAllData 
  } = useEnjazCore();

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleCreateWorkItem = async (item: Partial<WorkItem>) => {
    await workItemsRepo.create(item);
    await loadAllData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        <div className="text-center">
          <p className="text-white font-black tracking-widest text-xs">ENJAZ ONE CORE</p>
          <p className="text-slate-500 text-[10px] font-bold mt-1">جاري تحميل المحرك الفني...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView as any}
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        currentUser={currentUser} 
        users={users}
        pendingCount={workItems.filter(i => i.status === 'Pending Approval').length}
        onSwitchUser={handleSwitchUser}
      />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
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
        />

        <div className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar pb-20">
          {currentView === 'dashboard' && <Dashboard items={workItems} />}
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
      </main>

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

export default App;