import React, { useState, useEffect, useCallback } from 'react';
import { WorkItem, WorkItemType, Priority, Status, Project } from '../../../shared/types';
import { fieldOpsRepo } from '../services/fieldOpsRepo';
import { GoogleGenAI } from "@google/genai";
import { 
  Camera, MapPin, AlertTriangle, Eye, Wrench, Send, 
  Signal, SignalLow, X, Loader2, Mic, MicOff, 
  AlertOctagon, ChevronLeft, RefreshCw, Sparkles
} from 'lucide-react';

interface FieldOpsProps {
  projects: Project[];
  onSubmit: (item: Partial<WorkItem>) => void;
}

const FieldOps: React.FC<FieldOpsProps> = ({ projects, onSubmit }) => {
  const [mode, setMode] = useState<'menu' | 'form' | 'drafts'>('menu');
  const [formType, setFormType] = useState<WorkItemType>(WorkItemType.INCIDENT);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [drafts, setDrafts] = useState<Partial<WorkItem>[]>(fieldOpsRepo.getDrafts());
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleSOS = () => {
    if (window.confirm("🚨 هل تريد إرسال بلاغ طوارئ فوري؟ سيتم إرسال موقعك الحالي فوراً!")) {
      const sosItem: Partial<WorkItem> = {
        title: "🆘 نداء طوارئ فوري (SOS)",
        description: "تم تفعيل بلاغ الطوارئ من الميدان بشكل يدوي.",
        type: WorkItemType.INCIDENT,
        priority: Priority.CRITICAL,
        status: Status.OPEN,
        projectId: projectId || 'General',
        createdAt: new Date().toISOString()
      };
      onSubmit(sosItem);
      alert("تم إرسال نداء الاستغاثة لغرفة العمليات.");
    }
  };

  const handleVoiceInput = async () => {
    setIsListening(true);
    setTimeout(async () => {
      setIsListening(false);
      setAiAnalyzing(true);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a field assistant. A construction worker said: 
      "لقد لاحظت تسرب مياه كبير في القبو الثاني بجانب المولد الكهربائي، الوضع خطر ويحتاج صيانة فورية"
      Extract: 1. Title (Short) 2. Description (Detailed) 3. Suggested WorkItemType.
      Output as JSON: {title: string, description: string, type: string} in Arabic.`;

      try {
        const result = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        const text = result.text || "{}";
        const cleanJson = text.replace(/```json|```/g, '');
        const data = JSON.parse(cleanJson);
        setTitle(data.title);
        setDescription(data.description);
        setFormType(data.type as any);
      } catch (e) {
        alert("عذراً، لم أتمكن من تحليل الصوت حالياً.");
      } finally {
        setAiAnalyzing(false);
      }
    }, 2000);
  };

  const handleSubmit = () => {
    const newItem: Partial<WorkItem> = {
      title: title || `${formType} Report`,
      description,
      type: formType,
      priority: formType === WorkItemType.INCIDENT ? Priority.HIGH : Priority.MEDIUM,
      status: Status.OPEN,
      projectId,
      createdAt: new Date().toISOString(),
      location: location || undefined,
      attachments
    };

    if (!isOnline) {
      const updated = fieldOpsRepo.saveDraft(newItem);
      setDrafts(updated);
      alert("تم الحفظ كمسودة (أنت غير متصل بالإنترنت)");
    } else {
      onSubmit(newItem);
      alert("تم رفع البلاغ بنجاح!");
    }
    setMode('menu');
  };

  const syncAll = useCallback(() => {
    if (drafts.length === 0) return;
    drafts.forEach(d => onSubmit(d));
    fieldOpsRepo.clearDrafts();
    setDrafts([]);
    alert(`تمت مزامنة ${drafts.length} بلاغات بنجاح.`);
  }, [drafts, onSubmit]);

  if (mode === 'menu') {
    return (
      <div className="max-w-md mx-auto h-full flex flex-col p-4 space-y-6 animate-fade-in">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-black">إنجاز ميدان</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Field Operations Console</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
            {isOnline ? <Signal size={12} /> : <SignalLow size={12} />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        <button 
          onClick={handleSOS}
          className="w-full bg-rose-600 p-6 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-rose-900/20 active:scale-95 transition-all"
        >
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/20 rounded-2xl animate-pulse"><AlertOctagon size={24} /></div>
             <div className="text-right">
                <p className="text-lg font-black leading-none">بلاغ طوارئ SOS</p>
                <p className="text-[10px] font-bold opacity-70 mt-1">تنبيه فوري لغرفة العمليات</p>
             </div>
          </div>
          <ChevronLeft size={20} className="opacity-50 rotate-180" />
        </button>

        <div className="grid grid-cols-2 gap-4">
          <MenuButton icon={<AlertTriangle size={32}/>} label="بلاغ حادث" color="bg-orange-600" onClick={() => {setFormType(WorkItemType.INCIDENT); setMode('form');}} />
          <MenuButton icon={<Eye size={32}/>} label="ملاحظة سلامة" color="bg-emerald-600" onClick={() => {setFormType(WorkItemType.OBSERVATION); setMode('form');}} />
          <MenuButton icon={<Wrench size={32}/>} label="طلب صيانة" color="bg-blue-600" onClick={() => {setFormType(WorkItemType.SERVICE_REQUEST); setMode('form');}} />
          <MenuButton icon={<RefreshCw size={32}/>} label="سجل يومي" color="bg-slate-800" onClick={() => {}} />
        </div>

        {drafts.length > 0 && (
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
               <div>
                  <h3 className="text-sm font-black text-slate-800">بلاغات بانتظار الرفع</h3>
                  <p className="text-[10px] font-bold text-slate-400">{drafts.length} مسودة محفوظة</p>
               </div>
               <button 
                onClick={syncAll}
                disabled={!isOnline}
                className="p-3 bg-blue-600 text-white rounded-2xl disabled:bg-slate-200 transition-all shadow-lg shadow-blue-200"
               >
                 <RefreshCw size={20} className={!isOnline ? '' : 'animate-spin-slow'} />
               </button>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
               {drafts.map((d, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[150px]">{d.title}</span>
                    <button onClick={() => setDrafts(fieldOpsRepo.removeDraft(d.id!))} className="text-rose-500"><X size={14}/></button>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col bg-white animate-slide-in-up">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <button onClick={() => setMode('menu')} className="p-2 bg-white rounded-xl shadow-sm text-slate-400"><ChevronLeft size={20} /></button>
        <div className="text-center">
          <h3 className="font-black text-slate-900">إنشاء {formType}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase">تعبئة بلاغ ميداني</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-32">
        <button 
          onClick={handleVoiceInput}
          disabled={aiAnalyzing}
          className={`w-full p-4 rounded-3xl flex items-center justify-center gap-3 transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}
        >
          {aiAnalyzing ? <Loader2 className="animate-spin" size={20} /> : isListening ? <MicOff size={20} /> : <Mic size={20} />}
          <span className="text-sm font-black">{aiAnalyzing ? 'جاري التحليل الذكي...' : isListening ? 'جاري الاستماع...' : 'تعبئة بالصوت (AI Assistant)'}</span>
          {!isListening && !aiAnalyzing && <Sparkles size={16} className="text-indigo-400" />}
        </button>

        <div className="space-y-4">
           <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المشروع / الموقع</label>
             <select className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500" value={projectId} onChange={e => setProjectId(e.target.value)}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>

           <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">العنوان</label>
             <input 
               type="text" 
               className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="وصف مختصر للحدث"
               value={title}
               onChange={e => setTitle(e.target.value)}
             />
           </div>

           <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">التفاصيل</label>
             <textarea 
               className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold h-32 resize-none outline-none focus:ring-2 focus:ring-blue-500"
               placeholder="اشرح ما حدث بالتفصيل..."
               value={description}
               onChange={e => setDescription(e.target.value)}
             />
           </div>

           <div className="grid grid-cols-2 gap-4 pt-2">
              <button 
                onClick={() => {
                  setIsLocating(true);
                  navigator.geolocation.getCurrentPosition(p => {
                    setLocation({lat: p.coords.latitude, lng: p.coords.longitude});
                    setIsLocating(false);
                  }, () => setIsLocating(false));
                }}
                className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 transition-all ${location ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
              >
                {isLocating ? <Loader2 className="animate-spin" /> : <MapPin size={24} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{location ? 'تم تحديد الموقع' : 'تحديد GPS'}</span>
              </button>

              <label className="p-4 rounded-2xl border-2 border-dashed bg-slate-50 border-slate-200 text-slate-500 flex flex-col items-center gap-2 cursor-pointer active:bg-slate-100">
                <Camera size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest">إرفاق صورة</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => {
                  if(e.target.files?.[0]) setAttachments([...attachments, URL.createObjectURL(e.target.files[0])]);
                }} />
              </label>
           </div>

           {attachments.length > 0 && (
             <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
                {attachments.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 shrink-0">
                    <img src={url} className="w-full h-full object-cover rounded-xl" />
                    <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1 shadow-md"><X size={12}/></button>
                  </div>
                ))}
             </div>
           )}
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md fixed bottom-0 left-0 right-0 max-w-md mx-auto z-10">
        <button 
          onClick={handleSubmit}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Send size={20} />
          {isOnline ? 'رفع البلاغ الآن' : 'حفظ كمسودة للرفع لاحقاً'}
        </button>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ icon: any, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`${color} text-white p-8 rounded-[2.5rem] shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex flex-col items-center justify-center gap-4 h-48`}
  >
    <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md">
      {icon}
    </div>
    <span className="font-black text-sm tracking-tight">{label}</span>
  </button>
);

export default FieldOps;