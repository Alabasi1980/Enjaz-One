
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import { 
  Crown, Sparkles, TrendingUp, ShieldCheck, 
  Users, Building2, Wallet, ShoppingCart, 
  Landmark, FileCheck, AlertTriangle, ArrowUpRight,
  ArrowDownRight, Loader2, Zap, LayoutGrid, BarChart3,
  Globe, Briefcase, Activity
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts';
import ReactMarkdown from 'react-markdown';

const CeoDashboard: React.FC = () => {
  const data = useData();
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // State for aggregated data
  const [globalStats, setGlobalStats] = useState({
    projectsCount: 0,
    totalBudget: 0,
    totalSpent: 0,
    staffCount: 0,
    vendorCount: 0,
    openNCRs: 0,
    pendingRFIs: 0,
    activeBonds: 0,
    expiringPermits: 0
  });

  useEffect(() => {
    loadGlobalData();
  }, []);

  const loadGlobalData = async () => {
    setLoading(true);
    try {
      const [projs, users, vendors, items] = await Promise.all([
        data.projects.getAll(),
        data.users.getAll(),
        data.vendors.getAll(),
        data.workItems.getAll()
      ]);

      const budget = projs.reduce((acc, p) => acc + p.budget, 0);
      const spent = projs.reduce((acc, p) => acc + p.spent, 0);

      setGlobalStats({
        projectsCount: projs.length,
        totalBudget: budget,
        totalSpent: spent,
        staffCount: users.length,
        vendorCount: vendors.length,
        openNCRs: items.filter(i => i.type === 'Safety Observation' && i.status === 'Open').length,
        pendingRFIs: items.filter(i => i.type === 'Approval Case' && i.status === 'Pending Approval').length,
        activeBonds: 4, // Mock
        expiringPermits: 2 // Mock
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAiStrategy = async () => {
    setIsAiLoading(true);
    try {
      const context = JSON.stringify(globalStats);
      const response = await data.ai.askWiki(context, "أنت الآن المدير التنفيذي لشركة مقاولات كبرى. بناءً على هذه الأرقام، قدم تحليل 'عين الصقر' للمخاطر المالية والتشغيلية، واقترح 3 قرارات استراتيجية عاجلة لتحسين التدفق النقدي وتقليل الانكشاف القانوني.");
      setAiInsight(response);
    } catch (e) {
      setAiInsight("فشل المستشار الذكي في الوصول للبيانات الحالية.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) return <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={48}/><p className="mt-4 font-black text-slate-400">جاري تجميع البيانات الاستراتيجية...</p></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* CEO Welcome & AI Trigger */}
      <div className="bg-slate-900 p-10 rounded-[4rem] text-white flex flex-col lg:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
         <div className="relative z-10 flex items-center gap-8">
            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] shadow-2xl shadow-blue-500/20">
               <Crown size={48} className="text-white" />
            </div>
            <div>
               <h2 className="text-4xl font-black tracking-tight mb-2">لوحة التحكم التنفيذية</h2>
               <p className="text-blue-200/60 font-bold text-lg">نظرة شاملة على الأداء الاستراتيجي للمؤسسة والأطراف السبعة.</p>
            </div>
         </div>
         <button 
           onClick={handleAiStrategy}
           disabled={isAiLoading}
           className="relative z-10 px-10 py-5 bg-white text-slate-900 rounded-[2rem] font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
         >
            {isAiLoading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles className="text-blue-600" size={20}/>}
            استشارة المستشار الذكي (Gemini Pro)
         </button>
      </div>

      {aiInsight && (
         <div className="bg-white p-8 rounded-[3rem] border-2 border-indigo-100 shadow-2xl relative overflow-hidden animate-slide-in-up">
            <div className="absolute top-0 left-0 p-10 opacity-5"><Crown size={120} className="text-indigo-600" /></div>
            <div className="relative z-10">
               <h4 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-3">
                  <Zap className="text-amber-500" fill="currentColor"/> الرؤية الاستراتيجية الموصى بها
               </h4>
               <div className="prose prose-indigo max-w-none font-bold text-slate-700 leading-relaxed">
                  <ReactMarkdown>{aiInsight}</ReactMarkdown>
               </div>
               <button onClick={() => setAiInsight(null)} className="mt-8 text-xs font-black text-slate-400 hover:text-rose-600 transition-colors">إغلاق التقرير التنفيذي</button>
            </div>
         </div>
      )}

      {/* The 7 Stakeholders Pulse Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
         <StakeholderPulse icon={<Building2/>} label="العملاء" status="Good" value="92%" sub="رضا العميل" color="text-indigo-600" bg="bg-indigo-50" />
         <StakeholderPulse icon={<ShieldCheck/>} label="الاستشاريون" status="Risk" value="1.4d" sub="تأخير الرد" color="text-blue-600" bg="bg-blue-50" />
         <StakeholderPulse icon={<Briefcase/>} label="المقاولون" status="Good" value="$12M" sub="عقود باطن" color="text-slate-900" bg="bg-slate-100" />
         <StakeholderPulse icon={<ShoppingCart/>} label="الموردون" status="Critical" value="4" sub="تأخر توريد" color="text-orange-600" bg="bg-orange-50" />
         <StakeholderPulse icon={<Landmark/>} label="الجهات الحكومية" status="Risk" value="2" sub="تراخيص منتهية" color="text-amber-600" bg="bg-amber-50" />
         <StakeholderPulse icon={<Users/>} label="الكادر الداخلي" status="Good" value="100%" sub="تغطية الميدان" color="text-emerald-600" bg="bg-emerald-50" />
         <StakeholderPulse icon={<Wallet/>} label="البنوك" status="Good" value="$4.5M" sub="ضمانات بنكية" color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Consolidated Financial Overview */}
         <div className="lg:col-span-2 bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                     <BarChart3 className="text-blue-600" /> الانكشاف المالي العام
                  </h3>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">تجميع لـ {globalStats.projectsCount} مشاريع نشطة</p>
               </div>
               <div className="text-left">
                  <p className="text-4xl font-black text-slate-900">${(globalStats.totalBudget/1000000).toFixed(1)}M</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase">إجمالي الميزانية المعتمدة</p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               <FinancialMiniCard label="المصروف الفعلي" value={`$${(globalStats.totalSpent/1000).toFixed(0)}k`} icon={<Activity size={14}/>} color="text-blue-600" />
               <FinancialMiniCard label="المحتجزات النقدية" value="$2.1M" icon={<Landmark size={14}/>} color="text-amber-600" />
               <FinancialMiniCard label="الهامش المتوقع" value="18%" icon={<TrendingUp size={14}/>} color="text-emerald-600" />
            </div>

            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                     { name: 'Jan', budget: 4000, spent: 2400 },
                     { name: 'Feb', budget: 3000, spent: 1398 },
                     { name: 'Mar', budget: 2000, spent: 9800 },
                     { name: 'Apr', budget: 2780, spent: 3908 },
                     { name: 'May', budget: 1890, spent: 4800 },
                     { name: 'Jun', budget: 2390, spent: 3800 },
                  ]}>
                     <defs>
                        <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                     <YAxis hide />
                     <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                     <Area type="monotone" dataKey="spent" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSpent)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Risks & Vital Signs */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[3.5rem] text-white shadow-2xl">
               <h4 className="text-xl font-black mb-8 flex items-center gap-3">
                  <Activity className="text-blue-400" /> العلامات الحيوية
               </h4>
               <div className="space-y-8">
                  <VitalSign label="نسبة سيولة الضمانات" value="84%" color="bg-emerald-500" />
                  <VitalSign label="معدل إغلاق الـ NCR" value="62%" color="bg-blue-500" />
                  <VitalSign label="تغطية عمالة الميدان" value="98%" color="bg-indigo-500" />
                  <VitalSign label="استهلاك ميزانية الطوارئ" value="15%" color="bg-amber-500" />
               </div>
            </div>

            <div className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm">
               <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                  <Globe size={18} className="text-blue-600"/> التوسع الجغرافي
               </h4>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
                  <span className="text-sm font-black text-slate-700">مشاريع الرياض</span>
                  <span className="text-sm font-black text-blue-600">8 مشاريع</span>
               </div>
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-sm font-black text-slate-700">مشاريع جدة</span>
                  <span className="text-sm font-black text-blue-600">3 مشاريع</span>
               </div>
               <button className="w-full mt-6 py-4 bg-slate-50 text-slate-500 rounded-2xl text-[10px] font-black hover:bg-slate-100 transition-all uppercase tracking-widest">عرض خريطة العمليات</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const StakeholderPulse = ({ icon, label, value, sub, color, bg, status }: any) => (
  <div className={`bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-44 transition-all hover:shadow-lg relative overflow-hidden group`}>
     <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-white shadow-sm ${color} border border-slate-50`}>{icon}</div>
        <div className={`w-2 h-2 rounded-full animate-ping ${
           status === 'Good' ? 'bg-emerald-500' : 
           status === 'Risk' ? 'bg-amber-500' : 'bg-rose-500'
        }`}></div>
     </div>
     <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1 truncate">{label}</p>
        <p className={`text-xl font-black ${color}`}>{value}</p>
        <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{sub}</p>
     </div>
  </div>
);

const FinancialMiniCard = ({ label, value, icon, color }: any) => (
   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
      <div className="flex items-center gap-3">
         <div className={`p-2 bg-white rounded-lg shadow-sm ${color}`}>{icon}</div>
         <span className="text-[10px] font-black text-slate-500 uppercase">{label}</span>
      </div>
      <span className="text-sm font-black text-slate-900">{value}</span>
   </div>
);

const VitalSign = ({ label, value, color }: any) => (
   <div className="space-y-2">
      <div className="flex justify-between items-end px-1">
         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
         <span className="text-xs font-black text-white">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
         <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{width: value}}></div>
      </div>
   </div>
);

export default CeoDashboard;
