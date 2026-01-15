
import React, { useState } from 'react';
import { Project, ProjectStatus, ProjectHealth } from '../../../types';
import { projectsRepo } from '../../../services/projectsRepo';
import { Save, AlertTriangle, Archive, Trash2, Calendar, DollarSign, Info, MapPin } from 'lucide-react';

interface ProjectSettingsProps {
  project: Project;
  onUpdate: () => void;
}

const ProjectSettings: React.FC<ProjectSettingsProps> = ({ project, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: project.name,
    code: project.code,
    location: project.location,
    status: project.status,
    budget: project.budget,
    health: project.health,
    startDate: project.startDate,
    endDate: project.endDate
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await projectsRepo.update(project.id, formData);
      onUpdate();
      alert("Project settings updated successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
           <Info className="text-blue-600" /> Project Identity & Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Name</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Code</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.code}
              onChange={e => setFormData({...formData, code: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Site Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
             <Calendar className="text-emerald-600" /> Timeline & Status
          </h3>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Project Status</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as ProjectStatus})}
              >
                {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
             <DollarSign className="text-amber-600" /> Financial Settings
          </h3>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Approved Budget ($)</label>
              <input 
                type="number" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={formData.budget}
                onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})}
              />
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
               <AlertTriangle className="text-amber-600 shrink-0" size={20} />
               <div>
                  <p className="text-xs font-black text-amber-900 mb-1">Budget Alert Threshold</p>
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed">System will trigger warnings to Finance when actual expenditure reaches 85% of set budget.</p>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 rounded-[2.5rem] p-8 border border-red-100 shadow-sm">
        <h3 className="text-xl font-black text-red-900 mb-6 flex items-center gap-3">
           <Trash2 className="text-red-600" /> Danger Zone
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
           <button className="flex-1 px-8 py-4 bg-white border border-red-200 text-red-600 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3">
              <Archive size={18} /> Archive Project
           </button>
           <button className="flex-1 px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-red-600/20">
              <Trash2 size={18} /> Delete Project Permanently
           </button>
        </div>
      </div>

      <div className="sticky bottom-8 left-0 right-0 flex justify-center z-20">
         <button 
           onClick={handleSave}
           disabled={isSaving}
           className="px-12 py-4 bg-slate-900 text-white rounded-full font-black text-sm hover:scale-105 transition-all shadow-2xl flex items-center gap-3 disabled:opacity-50"
         >
           {isSaving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Save size={20} />}
           Save All Project Changes
         </button>
      </div>
    </div>
  );
};

export default ProjectSettings;
