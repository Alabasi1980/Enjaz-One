import React, { useState, useEffect } from 'react';
import { automationService } from '../services/automationService';
import { AutomationRule } from '../types';
import { Zap, Shield, ToggleLeft, ToggleRight, Info, AlertOctagon } from 'lucide-react';

const SettingsView: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>([]);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = () => {
    setRules(automationService.getRules());
  };

  const handleToggle = (id: string) => {
    const updated = automationService.toggleRule(id);
    setRules(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <SettingsIcon size={28} className="text-slate-700" /> Platform Settings
        </h2>
        <p className="text-slate-500 mt-1">Configure global behaviors and automation rules.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex justify-between items-center">
          <div>
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <Zap className="text-yellow-500 fill-yellow-500" /> Automation Engine
             </h3>
             <p className="text-sm text-slate-600 mt-1">Define "Smart Rules" that automatically route tasks and enforce policies.</p>
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 uppercase tracking-wide">
             Active
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {rules.map(rule => (
            <div key={rule.id} className="p-6 flex items-start justify-between hover:bg-slate-50 transition-colors">
               <div className="flex gap-4">
                  <div className={`mt-1 p-2 rounded-lg ${rule.isEnabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                    <Zap size={20} />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-800">{rule.name}</h4>
                     <p className="text-sm text-slate-500 mt-1 max-w-xl">{rule.description}</p>
                     <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 border border-slate-200">
                          Trigger: {rule.trigger}
                        </span>
                     </div>
                  </div>
               </div>

               <button 
                 onClick={() => handleToggle(rule.id)}
                 className={`transition-all duration-300 ${rule.isEnabled ? 'text-blue-600' : 'text-slate-300'}`}
               >
                 {rule.isEnabled ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
               </button>
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-slate-50 text-xs text-slate-500 flex items-center gap-2 justify-center">
           <Info size={14} /> Changes apply immediately to new Work Items only.
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 opacity-60">
         <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
           <Shield size={20} /> Security & Permissions
         </h3>
         <p className="text-sm text-slate-500 mb-4">RBAC Configuration (Coming Soon in V3)</p>
         <div className="p-4 border border-dashed border-slate-300 rounded-lg text-center text-slate-400">
            Advanced role management is disabled in this version.
         </div>
      </div>
    </div>
  );
};

const SettingsIcon = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);

export default SettingsView;
