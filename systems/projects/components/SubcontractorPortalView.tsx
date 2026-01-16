
import React, { useState, useEffect, useMemo } from 'react';
import { Project, Subcontractor, PaymentCertificate, Ncr } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  Briefcase, Wallet, ShieldAlert, CheckCircle2, 
  Clock, TrendingUp, ArrowLeft, Loader2, Sparkles,
  MessageSquare, UserCheck, FileWarning, Search, Plus,
  ChevronRight, DollarSign, Activity
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SubcontractorPortalViewProps {
  project: Project;
  onBack: () => void;
}

const SubcontractorPortalView: React.FC<SubcontractorPortalViewProps> = ({ project, onBack }) => {
  const data = useData();
  const { showToast } = useToast();
  
  const [subs, setSubs] = useState<Subcontractor[]>([]);
  const [certs, setCerts] = useState<PaymentCertificate[]>([]);
  const [ncrs, setNcrs] = useState<Ncr[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'subs' | 'certs' | 'ncrs'>('subs');
  
  const [disputeResolver, setDisputeResolver] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => { loadSubData(); }, [project.id]);

  const loadSubData = async () => {
    setLoading(true);
    try {
      const [sData, cData, nData] = await Promise.all([
        data.stakeholders.getSubcontractors(project.id),
        data.stakeholders.getPaymentCertificates(project.id),
        data.stakeholders.getNcrs(project.id)
      ]);
      setSubs(sData);
      setCerts(cData);
      setNcrs(nData);
    } finally { setLoading(false); }
  };

  const handleAiResolve = async (certId: string) => {
    setIsAiLoading(true);
    showToast("جاري تحليل بيانات المستخلص ومقارنتها بسجلات الموقع والعقد...", "loading");
    try {
      const cert = certs.find(c => c.id === certId);
      const subNcrs = ncrs.filter(n => n.subcontractorId === cert?.subcontractorId && n.status === 'Open');
      const context = `Subcontractor: ${cert?.subcontractorName}, Claimed: ${cert?.claimedPercentage}%, Open NCRs: ${subNcrs.length}, Project: ${project.name}`;
      const response = await data.ai.askWiki(context, "بصفتك محكم هندسي، هل تنصح باعتماد هذه النسبة؟ وما هي التبريرات بناءً على معايير الجودة؟");
      setDisputeResolver(response);
    } catch (e) {
      showToast("المحكم الذكي غير متاح.", "error");
    } finally { setIsAiLoading(false); }
  };

  if (loading) return <div className="h-full flex flex-col items-center justify-center gap-4"><Loader2 className="animate-spin text-indigo-600" size={48}/><p className="font-black text-slate-400">جاري تحميل سجلات التعاقدات...</p></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -mr-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="flex items-center gap-6 relative z-10">
            <button onClick={onBack} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all"><ArrowLeft size={24} className="rotate-180"/></button>
            <div className="p-5 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-600/20">
               <Briefcase size={32} />
            </div>
            <div>
               <h3 className="text-2xl font-black leading-tight text-slate-900">إدارة مقاولي الباطن</h3>
               <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{project.name}</p>
            </div>
         </div>
         <div className="relative z-10 flex gap-4 w-full md:w-auto">
            <div className="bg-slate-900 px-6 py-3 rounded-2xl text-center text-white">
               <p className="text-[10px] font-black text-slate-500 uppercase">المقاولين النشطين</p>
               <p className="text-2xl font-black">{subs.length}</p>
            </div>
         </div>
      </div>

      {disputeResolver && (
         <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-slide-in-down border-b-8 border-indigo-600">
            <div className="absolute top-0 left-0 p-10 opacity-5"><Sparkles size={100}/></div>
            <div className="relative z-10">
               <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                     <div className="p-3 bg-blue-600 rounded-2xl shadow-lg"><Sparkles size={24}/></div>
                     <h4 className="text-xl font-black italic">AI Dispute Resolver Panel</h4>
                  </div>
                  <button onClick={() => setDisputeResolver(null)} className="text-xs font-black text-slate-500 hover:text-white transition-colors">إغلاق التحقيق</button>
               </div>
               <div className="prose prose-invert prose-sm max-w-none text-blue-100 font-bold leading-relaxed">
                  <ReactMarkdown>{disputeResolver}</ReactMarkdown>
               </div>
            </div>
         </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-sm w-full md:w-fit">
         <button onClick={() => setActiveTab('subs')} className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'subs' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
            <UserCheck size={18}/> السجل العام
         </button>
         <button onClick={() => setActiveTab('certs')} className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'certs' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Wallet size={18}/> المستخلصات المالية
         </button>
         <button onClick={() => setActiveTab('ncrs')} className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'ncrs' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
            <ShieldAlert size={18}/> ملاحظات الجودة (NCR)
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            {activeTab === 'subs' && subs.map(s => (
               <div key={s.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
                  <div className="flex justify-between items-start mb-6">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center font-black text-indigo-600 text-xl group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">{s.name.charAt(0)}</div>
                        <div>
                           <h4 className="text-xl font-black text-slate-900 leading-tight">{s.name}</h4>
                           <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">{s.trade}</p>
                        </div>
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">تقييم الأداء</p>
                        <p className={`text-xl font-black ${s.performanceScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{s.performanceScore}%</p>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
                     <SubMetric label="إجمالي العقد" value={`$${(s.totalContractValue/1000000).toFixed(2)}M`} icon={<DollarSign size={14}/>} />
                     <SubMetric label="المبلغ المصروف" value={`$${(s.paidAmount/1000000).toFixed(2)}M`} icon={<CheckCircle2 size={14} className="text-emerald-500"/>} />
                  </div>
                  <div className="pt-6 flex justify-between items-center">
                     <div className="flex -space-x-2">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden"><img src={`https://picsum.photos/seed/sub${s.id}${i}/50/50`} className="w-full h-full object-cover"/></div>)}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600">+12</div>
                     </div>
                     <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-600 transition-colors">إصدار تكليف</button>
                  </div>
               </div>
            ))}

            {activeTab === 'certs' && certs.map(c => (
               <div key={c.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-5">
                     <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"><Wallet size={24}/></div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.period}</span>
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              c.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                           }`}>{c.status}</span>
                        </div>
                        <h5 className="font-black text-slate-800">{c.subcontractorName}</h5>
                        <p className="text-xs font-bold text-slate-400">الكمية المزعومة: {c.claimedPercentage}% | المعتمدة: <span className="text-blue-600">{c.approvedPercentage}%</span></p>
                     </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleAiResolve(c.id)} className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Sparkles size={18}/></button>
                     <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black group-hover:bg-blue-600">اعتماد مالي</button>
                  </div>
               </div>
            ))}

            {activeTab === 'ncrs' && ncrs.map(n => (
               <div key={n.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-rose-300 transition-all">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${n.severity === 'Critical' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}><FileWarning size={20}/></div>
                        <div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{n.id}</span>
                           <h5 className="font-black text-slate-800">{n.title}</h5>
                        </div>
                     </div>
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${n.status === 'Open' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>{n.status}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mb-6 leading-relaxed pr-12">{n.description}</p>
                  <div className="flex justify-between items-center pr-12">
                     <p className="text-[10px] font-black text-slate-400">جهة الإصدار: {n.issuedBy} | {n.createdAt}</p>
                     <button className="px-5 py-2 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black hover:bg-slate-900 hover:text-white transition-all">متابعة الإغلاق</button>
                  </div>
               </div>
            ))}
         </div>

         {/* Sidebar Performance & Metrics */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 -mr-12 -mt-12 rounded-full blur-2xl"></div>
               <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2"><Activity className="text-emerald-600" size={20}/> جودة التنفيذ (Quality KPI)</h4>
               <div className="space-y-6">
                  <KPIProgress label="سرعة معالجة NCR" percentage={78} color="bg-emerald-500" />
                  <KPIProgress label="دقة حصر الكميات" percentage={92} color="bg-indigo-500" />
                  <KPIProgress label="الالتزام ببروتوكول السلامة" percentage={65} color="bg-amber-500" />
               </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl shadow-indigo-200 relative group overflow-hidden">
               <div className="absolute bottom-0 right-0 p-4 opacity-10 group-hover:rotate-45 transition-transform"><Briefcase size={80}/></div>
               <h4 className="text-lg font-black mb-2 relative z-10">توزيع المستحقات</h4>
               <p className="text-xs font-bold text-indigo-100 leading-relaxed mb-6 relative z-10">يمكنك مشاهدة توزيع الميزانية بين مقاولي الباطن لضمان التوازن المالي للمشروع.</p>
               <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs relative z-10 hover:scale-105 transition-transform">عرض الخريطة المالية</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const SubMetric = ({ label, value, icon }: any) => (
   <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">{icon}</div>
      <div>
         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
         <p className="text-sm font-black text-slate-800">{value}</p>
      </div>
   </div>
);

const KPIProgress = ({ label, percentage, color }: any) => (
   <div className="space-y-2">
      <div className="flex justify-between items-end px-1">
         <span className="text-[10px] font-black text-slate-500 uppercase">{label}</span>
         <span className="text-xs font-black text-slate-900">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
         <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{width: `${percentage}%`}}></div>
      </div>
   </div>
);

export default SubcontractorPortalView;
