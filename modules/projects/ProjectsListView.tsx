
import React, { useState, useMemo } from 'react';
import { Project, WorkItem, ProjectStatus, ProjectHealth } from '../../types';
import ProjectCard from './components/ProjectCard';
import { Search, SlidersHorizontal, Plus, Building2, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

interface ProjectsListViewProps {
  projects: Project[];
  workItems: WorkItem[];
  onSelectProject: (p: Project) => void;
  onCreateProject: () => void;
}

const ProjectsListView: React.FC<ProjectsListViewProps> = ({ projects, workItems, onSelectProject, onCreateProject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // Stats
  const stats = useMemo(() => {
    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    const activeProjects = projects.filter(p => p.status === ProjectStatus.ACTIVE).length;
    const atRiskProjects = projects.filter(p => p.health !== ProjectHealth.GOOD).length;
    
    return {
      total: projects.length,
      active: activeProjects,
      atRisk: atRiskProjects,
      budget: (totalBudget / 1000000).toFixed(1) + 'M'
    };
  }, [projects]);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* 1. Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Projects" value={stats.total} icon={<Building2 />} color="text-blue-600" bg="bg-blue-50" />
        <SummaryCard label="Active Projects" value={stats.active} icon={<CheckCircle2 />} color="text-emerald-600" bg="bg-emerald-50" />
        <SummaryCard label="At Risk" value={stats.atRisk} icon={<AlertCircle />} color="text-amber-600" bg="bg-amber-50" />
        <SummaryCard label="Capital Budget" value={`$${stats.budget}`} icon={<DollarSign />} color="text-slate-900" bg="bg-slate-100" />
      </div>

      {/* 2. Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search projects by name, code or location..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
             {['All', ProjectStatus.ACTIVE, ProjectStatus.PLANNING, ProjectStatus.DELAYED].map(s => (
               <button
                 key={s}
                 onClick={() => setFilterStatus(s)}
                 className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${filterStatus === s ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {s}
               </button>
             ))}
          </div>
          <button 
            onClick={onCreateProject}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:scale-105 transition-transform shadow-lg shadow-slate-900/20"
          >
            <Plus size={18} /> New Project
          </button>
        </div>
      </div>

      {/* 3. Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map(p => (
          <ProjectCard 
            key={p.id} 
            project={p} 
            workItemCount={workItems.filter(wi => wi.projectId === p.id).length}
            onClick={() => onSelectProject(p)}
          />
        ))}
        {filteredProjects.length === 0 && (
           <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                 <Building2 size={40} />
              </div>
              <p className="text-slate-400 font-bold">No projects found matching your filters.</p>
           </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5">
    <div className={`p-4 rounded-3xl ${bg} ${color}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

export default ProjectsListView;
