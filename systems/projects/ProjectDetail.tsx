
import React, { useState, useEffect } from 'react';
import { Project, WorkItem, ProjectStatus, User } from '../../shared/types';
import WorkItemList from '../operations/WorkItemList';
import ProjectOverview from './components/ProjectOverview';
import ProjectDocuments from './components/ProjectDocuments';
import ProjectAssets from './components/ProjectAssets';
import ProjectSettings from './components/ProjectSettings';
import ClientPortalView from './components/ClientPortalView';
import ConsultantPortalView from './components/ConsultantPortalView';
import SubcontractorPortalView from './components/SubcontractorPortalView'; 
import RegulatoryComplianceView from './components/RegulatoryComplianceView';
import BondsAndInsuranceView from '../finance/components/BondsAndInsuranceView';
import BlueprintCenter from './components/BlueprintCenter'; // New
import { DailyLogView } from '../daily-log'; 
import { useData } from '../../context/DataContext';
import { Building2, MapPin, ArrowLeft, Settings, Calendar, ShieldCheck, Users, Mail, Phone, Plus, Trash2, X, Search, Check, FileText, UserCircle, ShieldAlert, Briefcase, Landmark, Shield, Map as MapIcon } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  items: WorkItem[];
  onBack: () => void;
  onItemClick: (item: WorkItem) => void;
  onNavigate: (view: any) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, items, onBack, onItemClick, onNavigate }) => {
  const data = useData();
  const [tab, setTab] = useState<'overview' | 'workitems' | 'logs' | 'docs' | 'assets' | 'team' | 'settings' | 'client' | 'consultant' | 'sub' | 'regulatory' | 'finance' | 'blueprint'>('overview');
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  const loadTeam = async () => {
    const users = await data.users.getAll();
    setAllUsers(users);
    const currentProject = await data.projects.getById(project.id);
    const teamIds = currentProject?.teamIds || project.teamIds;
    const filtered = users.filter(u => teamIds.includes(u.id));
    setTeamMembers(filtered);
  };

  useEffect(() => {
    loadTeam();
  }, [project.id]);

  const handleAddMember = async (userId: string) => {
    const currentProject = await data.projects.getById(project.id);
    if (!currentProject) return;

    const newTeamIds = [...currentProject.teamIds, userId];
    await data.projects.update(project.id, { teamIds: newTeamIds });
    
    await loadTeam();
    setIsAddMemberModalOpen(false);
    setMemberSearchTerm('');
  };

  const handleRemoveMember = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this member from the project?")) return;
    
    const currentProject = await data.projects.getById(project.id);
    if (!currentProject) return;

    const newTeamIds = currentProject.teamIds.filter(id => id !== userId);
    await data.projects.update(project.id, { teamIds: newTeamIds });
    
    await loadTeam();
  };

  const getStatusStyle = (status: ProjectStatus) => {
    switch(status) {
      case ProjectStatus.ACTIVE: return 'bg-emerald-500 text-white';
      case ProjectStatus.PLANNING: return 'bg-blue-500 text-white';
      case ProjectStatus.DELAYED: return 'bg-red-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const availableUsers = allUsers.filter(u => 
    !teamMembers.some(m => m.id === u.id) && 
    (u.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) || u.role.toLowerCase().includes(memberSearchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in space-y-6">
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 -mr-32 -mt-32 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-6">
            <button 
              onClick={onBack} 
              className="p-3 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-2xl text-slate-500 transition-all shadow-sm"
            >
               <ArrowLeft size={20} />
            </button>
            <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-xl shadow-blue-600/20">
               <Building2 size={40} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.name}</h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusStyle(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin size={16} className="text-blue-500" /> {project.location}</span>
                <span className="flex items-center gap-1.5"><Calendar size={16} className="text-blue-500" /> Starts: {project.startDate}</span>
                <span className="bg-slate-900 text-white px-3 py-0.5 rounded-lg font-mono text-xs uppercase tracking-widest">{project.code}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <PortalButton active={tab === 'client'} onClick={() => setTab('client')} icon={<UserCircle size={14}/>} label="المالك" color="bg-indigo-600" />
            <PortalButton active={tab === 'consultant'} onClick={() => setTab('consultant')} icon={<ShieldCheck size={14}/>} label="الاستشاري" color="bg-blue-600" />
            <PortalButton active={tab === 'sub'} onClick={() => setTab('sub')} icon={<Briefcase size={14}/>} label="المقاولين" color="bg-slate-900" />
            <PortalButton active={tab === 'regulatory'} onClick={() => setTab('regulatory')} icon={<Landmark size={14}/>} label="الامتثال" color="bg-orange-600" />
            <PortalButton active={tab === 'finance'} onClick={() => setTab('finance')} icon={<Shield size={14}/>} label="الضمانات" color="bg-emerald-600" />
          </div>
        </div>
      </div>

      <div className="bg-white/50 p-1.5 rounded-3xl border border-slate-200 flex w-full md:w-fit self-center lg:self-start overflow-x-auto no-scrollbar shrink-0">
         {[
           { id: 'overview', label: 'Overview', icon: ShieldCheck },
           { id: 'blueprint', label: 'Digital Twin', icon: MapIcon }, // New
           { id: 'workitems', label: 'Operations', icon: Settings },
           { id: 'logs', label: 'Daily Logs', icon: FileText },
           { id: 'docs', label: 'Documents', icon: Building2 },
           { id: 'assets', label: 'Assets', icon: Building2 },
           { id: 'team', label: 'Team', icon: Users },
         ].map((t) => (
           <button
             key={t.id}
             onClick={() => setTab(t.id as any)}
             className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${
               tab === t.id ? 'bg-white text-blue-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-800'
             }`}
           >
             {t.label}
           </button>
         ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
        {tab === 'overview' && (
          <ProjectOverview 
            project={project} 
            items={items} 
            onItemClick={onItemClick}
            onSwitchTab={setTab as any}
            onManageTeam={() => setTab('team')}
          />
        )}
        {tab === 'blueprint' && (
           <BlueprintCenter 
             project={project} 
             onPinClick={(id) => {
                const item = items.find(i => i.id === id);
                if (item) onItemClick(item);
             }}
           />
        )}
        {tab === 'workitems' && <WorkItemList items={items} onItemClick={onItemClick} />}
        {tab === 'logs' && <DailyLogView project={project} />}
        {tab === 'docs' && <ProjectDocuments project={project} />}
        {tab === 'assets' && <ProjectAssets />}
        {tab === 'settings' && <ProjectSettings project={project} onUpdate={loadTeam} />}
        {tab === 'client' && <ClientPortalView project={project} onBack={() => setTab('overview')} />}
        {tab === 'consultant' && <ConsultantPortalView project={project} onBack={() => setTab('overview')} />}
        {tab === 'sub' && <SubcontractorPortalView project={project} onBack={() => setTab('overview')} />}
        {tab === 'regulatory' && <RegulatoryComplianceView project={project} />}
        {tab === 'finance' && <BondsAndInsuranceView project={project} />}
        {tab === 'team' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-xl font-black text-slate-900">Project Staffing</h3>
                <p className="text-sm text-slate-500">Manage who has access to this project.</p>
              </div>
              <button 
                onClick={() => setIsAddMemberModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                 <Plus size={18} /> Add Member
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {teamMembers.map(member => (
                 <div key={member.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex items-start justify-between mb-4">
                       <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                       </div>
                       <button 
                         onClick={() => handleRemoveMember(member.id)}
                         className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                       >
                          <Trash2 size={18} />
                       </button>
                    </div>
                    <div className="space-y-1">
                       <h4 className="text-lg font-black text-slate-900">{member.name}</h4>
                       <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{member.role}</p>
                       <p className="text-xs font-bold text-slate-400">{member.department}</p>
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-50 flex flex-col gap-3">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Mail size={14} className="text-slate-400" /> {member.email}
                       </div>
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Phone size={14} className="text-slate-400" /> {member.phone}
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>

      {isAddMemberModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsAddMemberModalOpen(false)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl flex flex-col animate-scale-in max-h-[80vh]" onClick={e => e.stopPropagation()}>
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900">Add Team Member</h3>
                <button onClick={() => setIsAddMemberModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
             </div>
             
             <div className="p-6 pb-0">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search by name or role..."
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                   value={memberSearchTerm}
                   onChange={e => setMemberSearchTerm(e.target.value)}
                   autoFocus
                 />
               </div>
             </div>

             <div className="p-6 overflow-y-auto space-y-3">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Available Personnel</p>
               {availableUsers.map(user => (
                 <div 
                   key={user.id} 
                   onClick={() => handleAddMember(user.id)}
                   className="flex items-center justify-between p-3 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 cursor-pointer transition-all group"
                 >
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100">
                        <img src={user.avatar} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{user.role}</p>
                      </div>
                   </div>
                   <div className="p-2 rounded-lg bg-blue-100 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Check size={16} />
                   </div>
                 </div>
               ))}
               {availableUsers.length === 0 && (
                 <div className="text-center py-10">
                   <Users className="mx-auto text-slate-200 mb-2" size={40} />
                   <p className="text-sm text-slate-400 font-bold">No users found</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PortalButton = ({ active, onClick, icon, label, color }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] transition-all whitespace-nowrap shadow-sm border ${
      active ? `${color} text-white border-transparent` : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
    }`}
  >
    {icon} {label}
  </button>
);

export default ProjectDetail;
