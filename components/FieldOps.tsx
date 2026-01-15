import React, { useState, useEffect } from 'react';
import { WorkItem, WorkItemType, Priority, Status, Project } from '../types';
import { Camera, MapPin, AlertTriangle, Eye, Wrench, Send, Signal, SignalLow, X, Loader2, Trash2 } from 'lucide-react';

interface FieldOpsProps {
  projects: Project[];
  onSubmit: (item: Partial<WorkItem>) => void;
}

const FieldOps: React.FC<FieldOpsProps> = ({ projects, onSubmit }) => {
  const [mode, setMode] = useState<'menu' | 'form'>('menu');
  const [formType, setFormType] = useState<WorkItemType>(WorkItemType.INCIDENT);
  const [isOffline, setIsOffline] = useState(false);
  const [drafts, setDrafts] = useState<Partial<WorkItem>[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);

  // Load drafts on mount
  useEffect(() => {
    const savedDrafts = localStorage.getItem('enjaz_drafts');
    if (savedDrafts) {
        try {
            setDrafts(JSON.parse(savedDrafts));
        } catch(e) { console.error("Error loading drafts", e); }
    }
  }, []);

  // Save drafts when changed
  useEffect(() => {
    localStorage.setItem('enjaz_drafts', JSON.stringify(drafts));
  }, [drafts]);

  const startForm = (type: WorkItemType) => {
    setFormType(type);
    setMode('form');
    // Reset form
    setTitle('');
    setDescription('');
    setLocation(null);
    setAttachments([]);
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Geo error:", error);
          alert("Could not get location. Ensure permissions are granted.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation not supported");
      setIsLocating(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Simulate upload by creating a fake local URL
      const url = URL.createObjectURL(e.target.files[0]);
      setAttachments(prev => [...prev, url]);
    }
  };

  const handleSubmit = () => {
    const newItem: Partial<WorkItem> = {
      title: title || `${formType} Report`,
      description,
      type: formType,
      priority: formType === WorkItemType.INCIDENT ? Priority.HIGH : Priority.MEDIUM,
      status: Status.OPEN,
      projectId,
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // +1 day
      location: location || undefined,
      attachments
    };

    if (isOffline) {
      setDrafts(prev => [...prev, newItem]);
      alert("Saved to drafts (Offline Mode)");
    } else {
      onSubmit(newItem);
      alert("Report submitted successfully!");
    }
    setMode('menu');
  };

  const handleSync = () => {
    if (drafts.length === 0) return;
    drafts.forEach(d => onSubmit(d));
    setDrafts([]);
    alert("Synced " + drafts.length + " items.");
  };

  const handleClearDrafts = () => {
      if(window.confirm("Delete all offline drafts?")) {
          setDrafts([]);
      }
  };

  if (mode === 'menu') {
    return (
      <div className="max-w-md mx-auto h-full flex flex-col p-4 space-y-6">
        <div className="flex justify-between items-center bg-slate-800 text-white p-4 rounded-xl shadow-lg">
          <div>
            <h2 className="text-lg font-bold">Field Ops</h2>
            <p className="text-xs text-slate-400">Enjaz One Mobile</p>
          </div>
          <button 
            onClick={() => setIsOffline(!isOffline)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-colors ${isOffline ? 'bg-red-500/20 text-red-300 border border-red-500/50' : 'bg-green-500/20 text-green-300 border border-green-500/50'}`}
          >
            {isOffline ? <SignalLow size={14} /> : <Signal size={14} />}
            {isOffline ? 'Offline' : 'Online'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 flex-1 content-start">
          <ActionButton 
            icon={<AlertTriangle size={32} />} 
            label="Report Incident" 
            color="bg-red-600" 
            onClick={() => startForm(WorkItemType.INCIDENT)} 
          />
          <ActionButton 
            icon={<Eye size={32} />} 
            label="Safety Observation" 
            color="bg-orange-500" 
            onClick={() => startForm(WorkItemType.OBSERVATION)} 
          />
          <ActionButton 
            icon={<Wrench size={32} />} 
            label="Service Request" 
            color="bg-blue-600" 
            onClick={() => startForm(WorkItemType.SERVICE_REQUEST)} 
          />
        </div>

        {drafts.length > 0 && (
          <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-slate-700">{drafts.length} Pending Reports</span>
              <div className="flex gap-2">
                  {!isOffline && (
                    <button onClick={handleSync} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
                      Sync
                    </button>
                  )}
                   <button onClick={handleClearDrafts} className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full">
                      Clear
                    </button>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {drafts.map((d, i) => (
                <div key={i} className="text-xs bg-white p-2 rounded shadow-sm text-slate-500 truncate border-l-4 border-slate-400">
                  <span className="font-bold">{d.type}:</span> {d.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col bg-white md:rounded-xl md:shadow-sm md:border md:border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">New {formType}</h3>
        <button onClick={() => setMode('menu')} className="p-2 hover:bg-slate-200 rounded-full">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* Project Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">PROJECT / SITE</label>
          <select 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} - {p.code}</option>
            ))}
          </select>
        </div>

        {/* Basic Info */}
        <div>
           <label className="block text-xs font-semibold text-slate-500 mb-1">TITLE</label>
           <input 
             type="text" 
             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
             placeholder="Short description of issue"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
           />
        </div>

        <div>
           <label className="block text-xs font-semibold text-slate-500 mb-1">DETAILS</label>
           <textarea 
             className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
             placeholder="Describe what happened or what is needed..."
             value={description}
             onChange={(e) => setDescription(e.target.value)}
           />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">LOCATION</label>
          <div className="flex gap-2">
             <button 
               onClick={handleGetLocation}
               disabled={isLocating}
               className={`flex-1 py-3 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-50 transition-colors ${location ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
             >
               {isLocating ? <Loader2 className="animate-spin" size={18} /> : <MapPin size={18} />}
               <span className="text-sm font-medium">
                 {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Tag GPS Location'}
               </span>
             </button>
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">EVIDENCE / PHOTOS</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <label className="flex-shrink-0 w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50">
               <Camera size={24} />
               <span className="text-[10px] mt-1">Add</span>
               <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
            </label>
            {attachments.map((url, idx) => (
              <div key={idx} className="flex-shrink-0 w-20 h-20 rounded-lg bg-slate-100 overflow-hidden relative border border-slate-200">
                <img src={url} alt="evidence" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={handleSubmit}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Send size={20} />
          {isOffline ? 'Save to Drafts' : 'Submit Report'}
        </button>
      </div>
    </div>
  );
};

const ActionButton: React.FC<{ icon: any, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`${color} text-white p-6 rounded-2xl shadow-lg shadow-slate-200 hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-3 h-40`}
  >
    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
      {icon}
    </div>
    <span className="font-bold text-center leading-tight">{label}</span>
  </button>
);

export default FieldOps;