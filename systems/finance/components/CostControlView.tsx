
import React, { useState, useEffect, useMemo } from 'react';
import { Project, DailyLog, Material, Status } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  Wallet, DollarSign, TrendingUp, TrendingDown, PieChart, 
  BarChart3, ArrowRight, Loader2, Sparkles, AlertCircle, 
  ChevronDown, Filter, Receipt, Scale
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart as RePie, Pie 
} from 'recharts';
import ReactMarkdown from 'react-markdown';

const CostControlView: React.FC = () => {
  const data = useData();
  const { showToast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setLoading(true);
    const projs = await data.projects.getAll();
    setProjects(projs);
    if (projs.length > 0) setSelectedProjectId(projs[0].id);
    setLoading(false);
  };

  useEffect(() => {
    if (selectedProjectId) loadProjectFinance();
  }, [selectedProjectId]);

  const loadProjectFinance = async () => {
    const projectLogs = await data.dailyLogs.getAll(selectedProjectId);
    setLogs(projectLogs);
    setAiInsight(null);
  };

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId), 
  [projects, selectedProjectId]);

  // Aggregated Cost Calculation Logic
  const financialData = useMemo(() => {
    if (!logs.length) return { labor: 0, materials: 0, equipment: 0, total: 0 };
    
    let labor = 0;
    let materials = 0;
    let equipment = 0;

    logs.forEach(log => {
      // Labor: count * hours * avgRate (simulated rate of $25/hr if not set)
      log.laborDetails?.forEach(l => labor += (l.count * l.hours * (l.estimatedRate || 25)));
      
      // Materials: from consumedMaterials
      log.consumedMaterials?.forEach(m => materials += (m.quantity * (m.unitCost || 50)));

      // Equipment: hours * avgRate
      log.equipmentDetails?.forEach(e => equipment += (e.operatingHours * (e.hourlyRate || 100)));
    });

    return { labor, materials, equipment, total: labor + materials + equipment };
  }, [logs]);

  const chartData = [
    { name: 'العمالة', value: financialData.labor, fill: '#3b82f6' },
    { name: 'المواد', value: financialData.materials, fill: '#10b981' },
    { name: 'المعدات', value: financialData.equipment, fill: '#f59e0b' },
  ];

  const handleGenerateAiFinance = async () => {
    if (!selectedProject) return;
    setIsAiLoading(true);
    showToast("جاري تحليل التباين المالي وتوقع التدفقات النقدية...", "loading");
    try {
      const insight = await data.ai.generateFinancialInsight(selectedProject, financialData);
      setAiInsight(insight);
    } catch (e) {
      showToast("فشل التحليل المالي.", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-300">
         <Loader2 className="animate-spin" size={48} />
         <p className="font-black">مزامنة السجلات المالية...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Financial Selector Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 -ml-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
               <Scale className="text-emerald-600" size={32} /> مركز الرقابة المالية
            </h3>
            <p className="text-sm font-bold text-slate-500 mt-1">تتبع التكاليف الحقيقية ومقارنتها بالميزانيات المعتمدة لحظة بلحظة.</p>
         </div>
         <div className="relative z-10 flex gap-4 w-full md:w-auto">
            <select 
               className="flex-1 md:w-64 p-4 bg-slate-900 text-white rounded-2xl font-black text-sm outline-none shadow-xl"
               value={selectedProjectId}
               onChange={(e) => setSelectedProjectId(e.target.value)}
            >
               {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
            </select>
            <button 
               onClick={handleGenerateAiFinance}
               disabled={isAiLoading}
               className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
            >
               {isAiLoading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
            </button>
         </div>
      </div>

      {/* Primary Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <FinanceCard label="الميزانية الإجمالية" value={`$${selectedProject?.budget.toLocaleString()}`} icon={<Wallet/>} color="text-slate-900" bg="bg-white" />
         <FinanceCard label="المصروف الفعلي (المحقق)" value={`$${financialData.total.toLocaleString()}`} icon={<Receipt/>} color="text-blue-600" bg="bg-blue-50" />
         <FinanceCard label="الوفورات / العجز" value={`$${((selectedProject?.budget || 0) - financialData.total).toLocaleString()}`} icon={<Scale/>} color="text-emerald-600" bg="bg-emerald-50" />
         <FinanceCard label="نسبة الاستهلاك" value={`${Math.round((financialData.total / (selectedProject?.budget || 1)) * 100)}%`} icon={<TrendingUp/>} color="text-orange-600" bg="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Visual Analytics */}
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
               <h4 className="font-black text-slate-800 mb-8 flex items-center gap-2 border-r-4 border-emerald-500 pr-3">توزيع التكاليف التشغيلية</h4>
               <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontFamily: 'inherit', fontWeight: 'bold', fontSize: 14}} />
                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="value" radius={[0, 20, 20, 0]} barSize={40}>
                           {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* AI Insights Panel */}
            {aiInsight && (
               <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-slide-in-up">
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-600 rounded-2xl"><Sparkles size={24}/></div>
                        <h4 className="text-xl font-black italic">Financial AI Intelligence</h4>
                     </div>
                     <div className="prose prose-invert prose-sm max-w-none text-blue-100 font-bold leading-relaxed">
                        <ReactMarkdown>{aiInsight}</ReactMarkdown>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Detailed Ledger Sidebar */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full">
               <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2">آخر العمليات المالية</h4>
               <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar max-h-[500px]">
                  {logs.slice(0, 10).map(log => (
                     <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-black text-slate-400 uppercase">{log.date}</span>
                           <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">موثق</span>
                        </div>
                        <p className="text-sm font-black text-slate-800 truncate">سجل الموقع - {log.id}</p>
                        <div className="mt-3 flex justify-between items-end border-t border-slate-200 pt-3">
                           <div className="flex gap-2">
                              <span title="مواد" className="text-[9px] font-bold px-1.5 py-0.5 bg-white rounded border border-slate-200">M</span>
                              <span title="عمالة" className="text-[9px] font-bold px-1.5 py-0.5 bg-white rounded border border-slate-200">L</span>
                           </div>
                           <p className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">$2,450</p>
                        </div>
                     </div>
                  ))}
                  {logs.length === 0 && <p className="text-center py-20 text-slate-400 font-bold text-xs uppercase tracking-widest">لا توجد سجلات مالية بعد.</p>}
               </div>
               <button className="mt-6 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                  تحميل تقرير مالي كامل (PDF) <ArrowRight size={14} className="rotate-180"/>
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const FinanceCard = ({ label, value, icon, color, bg }: any) => (
  <div className={`${bg} p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-between h-44 hover:scale-[1.03] transition-transform`}>
     <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-white shadow-sm ${color}`}>{icon}</div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
     </div>
  </div>
);

export default CostControlView;
