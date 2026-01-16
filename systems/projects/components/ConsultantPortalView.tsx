
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Rfi, MaterialSubmittal } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  ShieldCheck, FileText, ClipboardList, PackageCheck, 
  MessageSquare, CheckCircle2, XCircle, AlertCircle, 
  Sparkles, Loader2, Search, ArrowLeft, ChevronDown, 
  Clock, MapPin, Construction
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ConsultantPortalViewProps {
  project: Project;
  onBack: () => void;
}

const ConsultantPortalView: React.FC<ConsultantPortalViewProps> = ({ project, onBack }) => {
  const data = useData();
  const { showToast } = useToast();
  
  const [rfis, setRfis] = useState<Rfi[]>([]);
  const [submittals, setSubmittals] = useState<MaterialSubmittal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rfi' | 'submittals'>('rfi');
  
  const [aiAuditing, setAiAuditing] = useState<string | null>(null);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => { loadTechnicalData(); }, [project.id]);

  const loadTechnicalData = async () => {
    setLoading(true);
    try {
      const [rfiData, subData] = await Promise.all([
        data.stakeholders.getRfIs(project.id),
        data.stakeholders.getMaterialSubmittals(project.id)
      ]);
      setRfis(rfiData);
      setSubmittals(subData);
    } finally { setLoading(false); }
  };

  const handleAiAudit = async (subject: string, desc: string) => {
    setIsAiProcessing(true);
    showToast("جاري التدقيق الفني ومطابقة الأكواد عبر Gemini...", "loading");
    try {
      const context = `Subject: ${subject}, Description: ${desc}, Project: ${project.name}`;
      const response = await data.ai.askWiki(context, "بصفتك مدقق فني، هل الوصف واضح تقنياً؟ وهل هناك أي مخاطر هندسية واضحة؟ رد باختصار.");
      setAiAuditing(response);
    } catch (e) {
      showToast("المساعد الذكي غير متاح حالياً.", "error");
    } finally { setIsAiProcessing(false); }
  };

  const pendingCount = rfis.filter(r => r.status === 'Pending').length + submittals.filter(s => s.status === 'Pending').length;

  if (loading) return <div className="h-full flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-slate-900" size={48}/><p className="font-black text-slate-400">جاري فتح الأرشيف الفني...</p></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-slate-900 p-8 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 -mr-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="flex items-center gap-6 relative z-10">
            <button onClick={onBack} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all"><ArrowLeft size={24} className="rotate-180"/></button>
            <div className="p-5 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20">
               <ShieldCheck size={32} />
            </div>
            <div>
               <h3 className="text-2xl font-black leading-tight">بوابة الاستشاري الفنية</h3>
               <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{project.name}</p>
            </div>
         </div>
         <div className="relative z-10 flex gap-4 w-full md:w-auto">
            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center">
               <p className="text-[10px] font-black text-slate-500 uppercase">طلبات بانتظار الرد</p>
               <p className="text-2xl font-black text-blue-400">{pendingCount}</p>
            </div>
         </div>
      </div>

      {aiAuditing && (
         <div className="bg-blue-50 p-6 rounded-[2.5rem] border border-blue-100 flex gap-4 animate-slide-in-down">
            <div className="p-3 bg-blue-600 text-white rounded-2xl h-fit shadow-lg"><Sparkles size={20}/></div>
            <div className="flex-1">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black text-blue-900">ملاحظات التدقيق الفني (AI Audit)</h4>
                  <button onClick={() => setAiAuditing(null)} className="text-xs font-black text-blue-400 hover:text-blue-600">إخفاء</button>
               </div>
               <div className="text-sm font-bold text-blue-800/80 leading-relaxed">
                  <ReactMarkdown>{aiAuditing}</ReactMarkdown>
               </div>
            </div>
         </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-sm w-full md:w-fit">
         <button 
            onClick={() => setActiveTab('rfi')} 
            className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'rfi' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
         >
            <ClipboardList size={18}/> طلبات الفحص (RFI)
         </button>
         <button 
            onClick={() => setActiveTab('submittals')} 
            className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'submittals' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}
         >
            <PackageCheck size={18}/> اعتمادات المواد
         </button>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            {activeTab === 'rfi' && rfis.map(r => (
               <div key={r.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-blue-300 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-lg text-[10px] font-black font-mono">{r.rfiNo}</span>
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${
                           r.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>{r.status}</span>
                     </div>
                     <span className="text-[10px] font-black text-slate-400">{r.createdAt}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{r.subject}</h4>
                  <p className="text-sm font-bold text-slate-500 mb-6 leading-relaxed">{r.description}</p>
                  
                  <div className="flex flex-wrap gap-4 py-4 border-y border-slate-50 mb-6">
                     <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><MapPin size={14}/> {r.location}</div>
                     {r.drawingRef && <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><FileText size={14}/> {r.drawingRef}</div>}
                  </div>

                  <div className="flex gap-2">
                     <button onClick={() => handleAiAudit(r.subject, r.description)} className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                        {isAiProcessing ? <Loader2 size={14} className="animate-spin"/> : <Sparkles size={14}/>} تدقيق ذكي
                     </button>
                     {r.status === 'Pending' && (
                        <button className="mr-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-blue-600 transition-colors">إرسال الرد</button>
                     )}
                  </div>
               </div>
            ))}

            {activeTab === 'submittals' && submittals.map(s => (
               <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                     <div className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"><Construction size={24}/></div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.submittalNo}</span>
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              s.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                           }`}>{s.status}</span>
                        </div>
                        <h5 className="font-black text-slate-800">{s.materialName}</h5>
                        <p className="text-xs font-bold text-slate-400">{s.manufacturer}</p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><FileText size={18}/></button>
                     {s.status === 'Pending' && <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black">اعتماد</button>}
                  </div>
               </div>
            ))}
         </div>

         {/* Sidebar stats & actions */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
               <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">سجل الاعتمادات</h4>
               <div className="space-y-4">
                  <SubmissionMetric label="متوسط وقت الرد" value="1.4 يوم" icon={<Clock/>} color="text-blue-600" />
                  <SubmissionMetric label="نسبة القبول الفني" value="88%" icon={<CheckCircle2/>} color="text-emerald-600" />
                  <SubmissionMetric label="طلبات مرفوضة" value="12" icon={<XCircle/>} color="text-rose-600" />
               </div>
            </div>

            <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-200 relative overflow-hidden group">
               <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><Sparkles size={100}/></div>
               <h4 className="text-lg font-black mb-2 relative z-10">المكتب الفني</h4>
               <p className="text-xs font-bold text-blue-100 leading-relaxed mb-6 relative z-10">يمكنك طلب مساعدة Gemini لتلخيص الملاحظات الفنية المعقدة وتحويلها لخطوات تنفيذية.</p>
               <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs relative z-10 hover:scale-105 transition-transform">تفعيل المساعد الفني</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const SubmissionMetric = ({ label, value, icon, color }: any) => (
   <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-3">
         <div className={`p-2 rounded-lg bg-white shadow-sm ${color}`}>{icon}</div>
         <span className="text-xs font-black text-slate-500">{label}</span>
      </div>
      <span className={`text-lg font-black ${color}`}>{value}</span>
   </div>
);

export default ConsultantPortalView;
