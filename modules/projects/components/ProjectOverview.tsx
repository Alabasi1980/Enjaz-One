
import React, { useMemo } from 'react';
import { WorkItem, Status, Project, ProjectHealth } from '../../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FileText, TrendingUp, AlertCircle, DollarSign, Calendar, Users, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

interface ProjectOverviewProps {
  project: Project;
  items: WorkItem[];
  onItemClick: (item: WorkItem) => void;
  onSwitchTab: (tab: 'workitems' | 'docs' | 'assets' | 'team') => void;
  onManageTeam: () => void;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project, items, onItemClick, onSwitchTab, onManageTeam }) => {
  const stats = useMemo(() => ({
    total: items.length,
    completed: items.filter(i => i.status === Status.DONE || i.status === Status.APPROVED).length,
    open: items.filter(i => i.status !== Status.DONE && i.status !== Status.APPROVED && i.status !== Status.REJECTED).length,
  }), [items]);
  
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const budgetUsage = Math.round((project.spent / project.budget) * 100);

  const budgetData = [
    { name: 'Spent', value: project.spent, fill: '#ef4444' },
    { name: 'Remaining', value: project.budget - project.spent, fill: '#10b981' }
  ];

  const getHealthColor = (h: ProjectHealth) => {
    switch(h) {
      case ProjectHealth.GOOD: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case ProjectHealth.AT_RISK: return 'text-amber-600 bg-amber-50 border-amber-100';
      case ProjectHealth.CRITICAL: return 'text-red-600 bg-red-50 border-red-100';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Project High-Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onSwitchTab('workitems')}>
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={20} /></span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${getHealthColor(project.health)}`}>
              {project.health} Health
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900">{completionRate}%</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Overall Progress</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><DollarSign size={20} /></span>
            <span className="text-[10px] font-bold text-slate-400">{budgetUsage}% Used</span>
          </div>
          <p className="text-2xl font-black text-slate-900">${(project.spent / 1000000).toFixed(1)}M</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Actual Expenditure</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onSwitchTab('workitems')}>
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl"><FileText size={20} /></span>
            <span className="text-[10px] font-bold text-slate-400">{stats.open} Active</span>
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.total}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Operational Items</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Calendar size={20} /></span>
            <span className="text-[10px] font-bold text-slate-400">Target: {project.endDate}</span>
          </div>
          <p className="text-2xl font-black text-slate-900">124 Days</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Remaining Time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">Milestone Timeline</h3>
              <button 
                onClick={() => onSwitchTab('workitems')}
                className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
              >
                Full List <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="space-y-4">
              {project.milestones?.map(m => (
                <div key={m.id} className="relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-3">
                      {m.status === 'Completed' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Clock size={18} className="text-slate-300" />}
                      <span className="text-sm font-bold text-slate-700">{m.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{m.dueDate}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${m.status === 'Completed' ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-slate-900">Recent Work Items</h3>
              <button onClick={() => onSwitchTab('workitems')} className="text-xs font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {items.slice(0, 4).map(item => (
                <div key={item.id} onClick={() => onItemClick(item)} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <FileText size={16} className="text-slate-400 group-hover:text-inherit" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-none mb-1">{item.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.status} • {item.dueDate}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <DollarSign className="text-emerald-500" /> Budget Utilization
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {budgetData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <Users className="text-blue-500" /> Project Team
            </h3>
            <div className="space-y-4">
               {project.teamIds.slice(0, 3).map(uid => (
                 <div key={uid} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                       <img src={`https://picsum.photos/seed/${uid}/100/100`} alt="Team Member" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-none">Team Member</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Staff</p>
                    </div>
                 </div>
               ))}
               <button 
                 onClick={onManageTeam}
                 className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors mt-2"
               >
                 Manage Team
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;
