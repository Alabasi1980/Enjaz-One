
import React, { useState, useEffect, useCallback } from 'react';
import { WorkItem, WorkItemType, Priority, Status, Project } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { storageService } from '../../../services/storageService';
import { fileToBase64, resizeImage } from '../../../shared/utils/fileUtils';
import { 
  Camera, MapPin, AlertTriangle, Eye, Wrench, Send, 
  Signal, SignalLow, X, Loader2, Mic, MicOff, 
  AlertOctagon, ChevronLeft, RefreshCw, Sparkles, CheckCircle,
  ScanLine, QrCode, HardHat, Construction
} from 'lucide-react';

interface FieldOpsProps {
  projects: Project[];
  onSubmit: (item: Partial<WorkItem>) => void;
}

const FieldOps: React.FC<FieldOpsProps> = ({ projects, onSubmit }) => {
  const data = useData();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'menu' | 'form' | 'scan'>('menu');
  const [formType, setFormType] = useState<WorkItemType>(WorkItemType.INCIDENT);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [drafts, setDrafts] = useState<any[]>([]);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const loadDrafts = async () => {
    const d = await storageService.getAll<any>('field_drafts');
    setDrafts(d);
  };

  useEffect(() => {
    loadDrafts();
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleQRScan = () => {
    setMode('scan');
    // Simulated scanning process
    setTimeout(() => {
       showToast("تم التعرف على المعدة: CAT-320 Excavator", "success");
       setFormType(WorkItemType.SERVICE_REQUEST);
       setTitle("صيانة دورية: حفار رقم 99");
       setMode('form');
    }, 2000);
  };

  const handleSOS = async () => {
    setIsProcessing(true);
    const sosItem: Partial<WorkItem> = {
      title: "🆘 نداء استغاثة SOS: حالة طارئة",
      description: "تم تفعيل بلاغ الطوارئ يدوياً من الميدان. الموقع مرفق.",
      type: WorkItemType.INCIDENT,
      priority: Priority.CRITICAL,
      status: Status.OPEN,
      projectId: projectId || projects[0]?.id || 'General',
      createdAt: new Date().toISOString()
    };
    
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
      sosItem.location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch (e) { console.warn("GPS failed for SOS"); }

    try {
      await onSubmit(sosItem);
      showToast("تم إرسال نداء الاستغاثة فوراً لغرفة العمليات.", "success");
    } catch (e) {
      showToast("فشل إرسال SOS، يرجى الاتصال المباشر!", "error");
    }
    setIsProcessing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setIsProcessing(true);
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        const compressed = await resizeImage(base64, 1000);
        setAttachments(prev => [...prev, compressed]);
        showToast("تم إرفاق الصورة وتحسين حجمها.", "success");
      } catch (err) {
        showToast("فشل معالجة الصورة.", "error");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
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
      const draft = { ...newItem, id: `draft-${Date.now()}` };
      await storageService.put('field_drafts', draft);
      await loadDrafts();
      showToast("تم الحفظ محلياً كمسودة.", "info");
    } else {
      try {
        await onSubmit(newItem);
        showToast("تم رفع البلاغ بنجاح.", "success");
      } catch (e) {
        showToast("خطأ في المزامنة، تم الحفظ كمسودة.", "error");
        await storageService.put('field_drafts', { ...newItem, id: `draft-${Date.now()}` });
        await loadDrafts();
      }
    }
    
    setIsProcessing(false);
    resetForm();
    setMode('menu');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setAttachments([]);
    setLocation(null);
  };

  if (mode === 'scan') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white p-6 animate-fade-in" dir="rtl">
        <div className="absolute top-10 right-6 z-10">
           <button onClick={() => setMode('menu')} className="p-3 bg-white/10 backdrop-blur-md rounded-2xl"><X size={24}/></button>
        </div>
        
        <div className="relative w-full max-w-xs aspect-square border-2 border-white/20 rounded-[3rem] overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-blue-500/10 animate-pulse"></div>
           <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl"></div>
           <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl"></div>
           <div className="absolute inset-0 flex items-center justify-center">
              <ScanLine size={100} className="text-blue-500 opacity-20 animate-bounce" />
           </div>
           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan-y"></div>
        </div>

        <div className="mt-12 text-center space-y-4">
           <p className="text-xl font-black">جاري المسح الضوئي...</p>
           <p className="text-sm text-slate-400 font-bold max-w-xs">وجه الكاميرا نحو ملصق QR الخاص بالمعدة أو الموقع للحصول على التفاصيل فوراً.</p>
        </div>

        <div className="mt-20 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
           <QrCode className="text-blue-400" />
           <p className="text-xs font-bold text-slate-300">يستخدم الذكاء الاصطناعي للتعرف على الرموز</p>
        </div>
      </div>
    );
  }

  if (mode === 'menu') {
    return (
      <div className="max-w-md mx-auto h-full flex flex-col p-4 space-y-6 animate-fade-in no-scrollbar pb-24" dir="rtl">
        <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <h2 className="text-xl font-black flex items-center gap-2"><Construction className="text-blue-400" size={24} /> إنجاز ميدان</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">v2.5 AI Powered Field</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${isOnline ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
            {isOnline ? <Signal size={12} /> : <SignalLow size={12} />}
            {isOnline ? 'متصل' : 'بدون إنترنت'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={handleQRScan}
            className="w-full bg-blue-600 p-8 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl shadow-blue-900/20 group hover:scale-[1.02] transition-all active:scale-95 border-b-8 border-blue-800"
          >
            <div className="flex items-center gap-5">
               <div className="p-4 bg-white/20 rounded-3xl group-hover:rotate-12 transition-transform">
                 <QrCode size={36} />
               </div>
               <div className="text-right">
                  <p className="text-2xl font-black leading-none">مسح QR</p>
                  <p className="text-xs font-bold opacity-70 mt-1">تعرف فوري على المعدات</p>
               </div>
            </div>
            <ScanLine size={24} className="opacity-50" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MenuButton icon={<AlertTriangle size={32}/>} label="بلاغ حادث" color="bg-orange-600" onClick={() => {setFormType(WorkItemType.INCIDENT); setMode('form');}} />
          <MenuButton icon={<Eye size={32}/>} label="ملاحظة سلامة" color="bg-emerald-600" onClick={() => {setFormType(WorkItemType.OBSERVATION); setMode('form');}} />
        </div>

        <button 
          onClick={handleSOS}
          disabled={isProcessing}
          className="w-full bg-rose-600 p-6 rounded-[2rem] text-white flex items-center justify-between shadow-xl active:scale-95 transition-all disabled:opacity-50 border-b-8 border-rose-800"
        >
          <div className="flex items-center gap-4">
             <div className="p-3 bg-white/20 rounded-2xl animate-pulse">
               {isProcessing ? <Loader2 className="animate-spin" /> : <AlertOctagon size={24} />}
             </div>
             <div className="text-right">
                <p className="text-lg font-black leading-none">نداء SOS طارئ</p>
                <p className="text-[10px] font-bold opacity-70 mt-1">تنبيه فوري لكل المشرفين</p>
             </div>
          </div>
          <ChevronLeft size={20} className="opacity-50 rotate-180" />
        </button>

        {drafts.length === 0 && (
           <div className="bg-white p-10 rounded-[2.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                 <HardHat size={32} />
              </div>
              <p className="text-xs font-black text-slate-400">لا يوجد بلاغات معلقة للمزامنة حالياً.</p>
           </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-full flex flex-col bg-white animate-slide-in-up pb-32" dir="rtl">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
        <button onClick={() => setMode('menu')} className="p-2 bg-white rounded-xl shadow-sm text-slate-400"><ChevronLeft size={20} className="rotate-180"/></button>
        <div className="text-center">
          <h3 className="font-black text-slate-900">إنشاء {formType}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تعبئة بلاغ ميداني آمن</p>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        <div className="space-y-4">
           <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المشروع</label>
             <select className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none" value={projectId} onChange={e => setProjectId(e.target.value)}>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
           </div>

           <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">العنوان</label>
             <input 
               type="text" 
               className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold outline-none"
               placeholder="وصف مختصر للحدث"
               value={title}
               onChange={e => setTitle(e.target.value)}
             />
           </div>

           <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">التفاصيل</label>
             <textarea 
               className="w-full mt-1.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold h-32 resize-none outline-none"
               placeholder="اشرح ما حدث..."
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
                    showToast("تم تحديد الإحداثيات.", "success");
                  }, () => {
                    setIsLocating(false);
                    showToast("فشل تحديد الموقع.", "error");
                  });
                }}
                className={`p-4 rounded-2xl border-2 border-dashed flex flex-col items-center gap-2 transition-all ${location ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
              >
                {isLocating ? <Loader2 className="animate-spin" /> : <MapPin size={24} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{location ? 'تم التحديد' : 'GPS'}</span>
              </button>

              <label className="p-4 rounded-2xl border-2 border-dashed bg-slate-50 border-slate-200 text-slate-500 flex flex-col items-center gap-2 cursor-pointer">
                {isProcessing ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
                <span className="text-[10px] font-black uppercase tracking-widest">إرفاق صورة</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} disabled={isProcessing} />
              </label>
           </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-white/80 backdrop-blur-md fixed bottom-0 left-0 right-0 max-w-md mx-auto z-10">
        <button 
          onClick={handleSubmit}
          disabled={isProcessing}
          className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : <Send size={20} className="rotate-180" />}
          رفع البلاغ الآن
        </button>
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ icon: any, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className={`${color} text-white p-6 rounded-[2.5rem] shadow-lg hover:scale-[1.03] active:scale-95 transition-all flex flex-col items-center justify-center gap-4 h-44 border-b-4 border-black/10`}
  >
    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">{icon}</div>
    <span className="font-black text-sm">{label}</span>
  </button>
);

export default FieldOps;
