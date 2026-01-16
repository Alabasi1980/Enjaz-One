
import React, { useState, useEffect, useRef } from 'react';
import { Project, Blueprint, TaskPin, WorkItem, Status, Priority } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { 
  Map as MapIcon, Pin, Plus, Search, 
  Layers, Maximize2, ZoomIn, ZoomOut, 
  Loader2, Info, Navigation, Activity, X
} from 'lucide-react';

interface BlueprintCenterProps {
  project: Project;
  onPinClick: (itemId: string) => void;
}

const BlueprintCenter: React.FC<BlueprintCenterProps> = ({ project, onPinClick }) => {
  const data = useData();
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [activeBlueprint, setActiveBlueprint] = useState<Blueprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadBlueprints(); }, [project.id]);

  const loadBlueprints = async () => {
    setLoading(true);
    try {
      const results = await data.documents.getBlueprints(project.id);
      setBlueprints(results);
      if (results.length > 0) setActiveBlueprint(results[0]);
    } finally { setLoading(false); }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (!activeBlueprint || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    console.log(`Pin suggested at X: ${x.toFixed(2)}%, Y: ${y.toFixed(2)}%`);
    // Future: Open "Create Task at this location" modal
  };

  const getPinColor = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-rose-500 shadow-rose-200';
      case Priority.HIGH: return 'bg-orange-500 shadow-orange-200';
      default: return 'bg-blue-500 shadow-blue-200';
    }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32}/></div>;

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-250px)] gap-6 animate-fade-in" dir="rtl">
      {/* Sidebar: Layers & Drawings */}
      <div className="w-full lg:w-80 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
         <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
               <Layers size={18} className="text-blue-600"/> طبقات المخططات
            </h3>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {blueprints.map(b => (
               <button 
                  key={b.id}
                  onClick={() => setActiveBlueprint(b)}
                  className={`w-full p-4 rounded-2xl text-right transition-all border ${
                     activeBlueprint?.id === b.id ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                  }`}
               >
                  <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">الإصدار: {b.version}</p>
                  <p className="text-sm font-black">{b.title}</p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-bold">
                     <Pin size={10}/> {b.pins.length} نقطة تفتيش نشطة
                  </div>
               </button>
            ))}
            <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-black hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
               <Plus size={16}/> رفع مخطط هندسي
            </button>
         </div>
         <div className="p-6 bg-blue-50 border-t border-blue-100">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-blue-600 text-white rounded-lg shadow-md"><Activity size={16}/></div>
               <div>
                  <p className="text-[10px] font-black text-blue-900">حالة الربط الميداني</p>
                  <p className="text-[9px] font-bold text-blue-600">GPS Active • 12 Workers Online</p>
               </div>
            </div>
         </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 bg-slate-900 rounded-[3rem] shadow-2xl relative overflow-hidden flex items-center justify-center border-4 border-white">
         {/* Background Grid */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
         
         {/* Drawing Viewer */}
         <div 
            ref={mapRef}
            onClick={handleMapClick}
            className="relative cursor-crosshair transition-transform duration-300 shadow-2xl"
            style={{ 
               transform: `scale(${zoom})`,
               width: '90%',
               height: '90%',
               backgroundImage: `url(${activeBlueprint?.imageUrl})`,
               backgroundSize: 'contain',
               backgroundRepeat: 'no-repeat',
               backgroundPosition: 'center'
            }}
         >
            {/* Action Pins */}
            {activeBlueprint?.pins.map(pin => (
               <button
                  key={pin.id}
                  onClick={(e) => { e.stopPropagation(); onPinClick(pin.workItemId); }}
                  className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white flex items-center justify-center transition-all hover:scale-150 z-20 shadow-lg ${getPinColor(pin.priority)} animate-bounce-slow`}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  title={pin.workItemId}
               >
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
               </button>
            ))}
         </div>

         {/* Controls Overlay */}
         <div className="absolute bottom-8 left-8 flex gap-2">
            <ControlBtn onClick={() => setZoom(prev => Math.min(3, prev + 0.2))} icon={<ZoomIn size={20}/>} />
            <ControlBtn onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))} icon={<ZoomOut size={20}/>} />
            <ControlBtn onClick={() => setZoom(1)} icon={<Maximize2 size={20}/>} />
         </div>

         <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 text-white">
            <div className="flex items-center gap-3">
               <Navigation size={18} className="text-blue-400" />
               <div>
                  <p className="text-xs font-black">وضع الملاحة الموقع</p>
                  <p className="text-[10px] font-bold opacity-60 uppercase">Digital Twin Live</p>
               </div>
            </div>
         </div>

         <div className="absolute top-8 right-8 flex gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 backdrop-blur-md rounded-xl border border-rose-500/30 text-rose-200">
               <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
               <span className="text-[10px] font-black">2 حوادث نشطة</span>
            </div>
         </div>
      </div>
    </div>
  );
};

const ControlBtn = ({ onClick, icon }: any) => (
   <button onClick={onClick} className="p-4 bg-white/10 backdrop-blur-lg border border-white/20 text-white rounded-2xl hover:bg-white hover:text-slate-900 transition-all shadow-xl">
      {icon}
   </button>
);

export default BlueprintCenter;
