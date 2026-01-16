
import React, { useState, useEffect, useMemo } from 'react';
import { Project, ChangeOrder, Client, Milestone } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  Building2, Camera, Clock, DollarSign, FileCheck, 
  TrendingUp, ArrowLeft, CheckCircle2, AlertCircle, 
  Sparkles, MessageSquare, ChevronRight, Loader2, RefreshCw
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ClientPortalViewProps {
  project: Project;
  onBack: () => void;
}

const ClientPortalView: React.FC<ClientPortalViewProps> = ({ project, onBack }) => {
  const data = useData();
  const { showToast } = useToast();
  
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLiaisonActive, setAiLiaisonActive] = useState(false);
  const [aiExecutiveBrief, setAiExecutiveBrief] = useState<string | null>(null);

  useEffect(() => { loadPortalData(); }, [project.id]);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const [coData, clientData] = await Promise.all([
        data.stakeholders.getChangeOrders(project.id),
        project.clientId ? data.stakeholders.getClientById(project.clientId) : Promise.resolve(null)
      ]);
      setChangeOrders(coData);
      setClient(clientData || null);
    } finally { setLoading(false); }
  };

  const stats = useMemo(() => {
    const totalCO = changeOrders.filter(co => co.status === 'Approved').reduce((acc, co) => acc + co.impactOnBudget, 0);
    const progress = project.milestones ? Math.round(project.milestones.reduce((acc, m) => acc + m.progress, 0) / project.milestones.length) : 0;
    return {
      totalBudget: project.budget + totalCO,
      actualProgress: progress,
      approvedChanges: changeOrders.filter(co => co.status === 'Approved').length,
      pendingChanges: changeOrders.filter(co => co.status === 'Sent').length
    };
  }, [project, changeOrders]);

  const handleAiConsult = async () => {
    setAiLiaisonActive(true);
    showToast("جاري معالجة التقارير الفنية وتبسيطها للمالك...", "loading");
    try {
      const context = `Project: ${project.name}, Progress: ${stats.actualProgress}%, Current Health: ${project.health}, Pending COs: ${stats.pendingChanges}`;
      const response = await data.ai.askWiki(context, "بصفتك مستشار العميل، لخص وضع المشروع بوضوح (إنجاز، مالية، جدول زمني) واقترح ما يجب التركيز عليه.");
      setAiExecutiveBrief(response);
    } catch (e) {
      showToast("عذراً، المستشار الذكي مشغول حالياً.", "error");
    } finally { setAiLiaisonActive(false); }
  };

  if (loading) return <div className="h-full flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-blue-600" size={48}/><p className="font-black text-slate-400">جاري تحميل البوابة...</p></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Client Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -mr-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="flex items-center gap-6 relative z-10">
            <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400"><ArrowLeft size={24} className="rotate-180"/></button>
            <div className="w-20 h-20 rounded-3xl overflow-hidden border-4 border-slate-50 shadow-md">
               <img src={client?.avatar || 'https://picsum.photos/seed/client/100/100'} className="w-full h-full object-cover" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-slate-900 leading-tight">مرحباً، {client?.name || 'حضرة المالك'}</h3>
               <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{client?.company || 'بوابة المالك'}</p>
            </div>
         </div>
         <div className="relative z-10 flex gap-3 w-full md:w-auto">
            <button onClick={handleAiConsult} disabled={aiLiaisonActive} className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 hover:scale-105 transition-all">
               {aiLiaisonActive ? <Loader2 className="animate-spin" size={20}/> : <Sparkles className="text-blue-400" size={20}/>}
               ملخص تنفيذي ذكي
            </button>
         </div>
      </div>

      {aiExecutiveBrief && (
         <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-slide-in-up">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-blue-600 rounded-2xl"><Sparkles size={24}/></div>
                     <h4 className="text-xl font-black italic">AI Client Liaison Summary</h4>
                  </div>
                  <button onClick={() => setAiExecutiveBrief(null)} className="text-xs font-black text-slate-500 hover:text-white transition-colors">إخلاق</button>
               </div>
               <div className="prose prose-invert prose-sm max-w-none text-blue-100 font-bold leading-relaxed">
                  <ReactMarkdown>{aiExecutiveBrief}</ReactMarkdown>
               </div>
            </div>
         </div>
      )}

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <PortalStat label="نسبة الإنجاز الفعلي" value={`${stats.actualProgress}%`} icon={<TrendingUp/>} color="text-emerald-600" bg="bg-emerald-50" trend="+2% هذا الأسبوع" />
         <PortalStat label="الميزانية المعدلة" value={`$${(stats.totalBudget/1000).toFixed(1)}k`} icon={<DollarSign/>} color="text-slate-900" bg="bg-white" />
         <PortalStat label="أوامر تغيير معلقة" value={stats.pendingChanges} icon={<FileCheck/>} color="text-blue-600" bg="bg-blue-50" />
         <PortalStat label="أيام التشغيل" value="124 يوم" icon={<Clock/>} color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Site Gallery Preview */}
         <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Camera className="text-blue-600" size={24}/> التطور البصري للموقع
               </h4>
               <button className="text-sm font-black text-blue-600 hover:underline">مشاهدة الكل</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {[1,2,3].map(i => (
                  <div key={i} className="aspect-square rounded-[2rem] bg-slate-100 overflow-hidden relative group cursor-pointer">
                     <img src={`https://picsum.photos/seed/site${i}/300/300`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <p className="text-white text-[10px] font-black">اليوم - صب القواعد</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Change Orders Side Panel */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-full">
               <div className="flex justify-between items-center mb-8">
                  <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                     <FileCheck className="text-amber-600" size={24}/> طلبات التغيير
                  </h4>
                  <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">{changeOrders.length}</span>
               </div>
               
               <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar max-h-[500px]">
                  {changeOrders.map(co => (
                     <div key={co.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-start mb-3">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                              co.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                              co.status === 'Rejected' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                           }`}>{co.status}</span>
                           <span className="text-[10px] font-black text-slate-400">{co.createdAt}</span>
                        </div>
                        <h5 className="font-black text-slate-800 text-sm mb-1">{co.title}</h5>
                        <p className="text-xs font-bold text-slate-500 line-clamp-2 leading-relaxed mb-4">{co.description}</p>
                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                           <div className="flex items-center gap-1 text-emerald-600 font-black text-xs">
                              <DollarSign size={14}/> +{co.impactOnBudget.toLocaleString()}
                           </div>
                           {co.status === 'Sent' && (
                              <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-blue-600 transition-colors">مراجعة</button>
                           )}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Client Project Team */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
         <h4 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
            <Building2 className="text-blue-600" size={24}/> الفريق الهندسي المسند للمشروع
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {project.teamIds.slice(0,3).map(tid => (
               <div key={tid} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden">
                     <img src={`https://picsum.photos/seed/${tid}/100/100`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                     <p className="text-sm font-black text-slate-800">المهندس المسؤول</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase">قسم إدارة المشاريع</p>
                  </div>
                  <button className="mr-auto p-2 text-blue-600 hover:bg-white rounded-xl transition-colors"><MessageSquare size={18}/></button>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const PortalStat = ({ label, value, icon, color, bg, trend }: any) => (
  <div className={`${bg} p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-44 group hover:scale-[1.03] transition-all`}>
     <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-white shadow-sm ${color}`}>{icon}</div>
        {trend && <span className="text-[9px] font-black text-emerald-600">{trend}</span>}
     </div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

export default ClientPortalView;
