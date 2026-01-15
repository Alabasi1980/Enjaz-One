
import React from 'react';
import { Project, ProjectHealth, ProjectStatus } from '../../../types';
import { Building2, MapPin, Calendar, Users, TrendingUp, MoreVertical, DollarSign } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  workItemCount: number;
  onClick: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, workItemCount, onClick }) => {
  const progress = Math.min(100, Math.max(0, project.milestones ? 
    Math.round(project.milestones.reduce((acc, m) => acc + m.progress, 0) / project.milestones.length) : 0));
  
  const budgetUsage = Math.round((project.spent / project.budget) * 100);

  const healthColors = {
    [ProjectHealth.GOOD]: 'bg-emerald-500 shadow-emerald-200 text-emerald-600 bg-emerald-50',
    [ProjectHealth.AT_RISK]: 'bg-amber-500 shadow-amber-200 text-amber-600 bg-amber-50',
    [ProjectHealth.CRITICAL]: 'bg-red-500 shadow-red-200 text-red-600 bg-red-50',
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
    >
      {/* Top Section: Icon & Meta */}
      <div className="flex justify-between items-start mb-6">
        <div className="relative">
          <div className={`p-4 rounded-3xl transition-colors group-hover:bg-blue-600 group-hover:text-white ${healthColors[project.health].split(' ')[2]} ${healthColors[project.health].split(' ')[3]}`}>
            <Building2 size={28} />
          </div>
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${healthColors[project.health].split(' ')[0]}`}></div>
        </div>
        <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Info Section */}
      <div className="flex-1 space-y-2 mb-6">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{project.code}</span>
           <span className="w-1 h-1 rounded-full bg-slate-300"></span>
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{project.status}</span>
        </div>
        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
          {project.name}
        </h3>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
           <MapPin size={14} className="text-slate-300" /> {project.location}
        </div>
      </div>

      {/* Progress Section */}
      <div className="space-y-3 pt-4 border-t border-slate-50">
        <div className="flex justify-between items-end">
           <span className="text-[10px] font-black text-slate-400 uppercase">Execution Progress</span>
           <span className="text-sm font-black text-slate-900">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
           <div 
             className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
             style={{ width: `${progress}%` }}
           />
        </div>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400"><TrendingUp size={14} /></div>
           <div className="min-w-0">
             <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Ops Items</p>
             <p className="text-xs font-black text-slate-700">{workItemCount}</p>
           </div>
        </div>
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400"><DollarSign size={14} /></div>
           <div className="min-w-0">
             <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Budget</p>
             <p className="text-xs font-black text-slate-700">{budgetUsage}%</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
