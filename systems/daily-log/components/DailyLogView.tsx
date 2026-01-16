
import React, { useState, useEffect } from 'react';
import { DailyLog, Project, WorkItem, Status, Asset, AssetCategory, Material } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  FileText, Sparkles, Calendar, CheckCircle2, 
  Clock, Plus, ShieldAlert, Loader2, ChevronRight, 
  CloudRain, Users, HardHat, Construction, Wrench, 
  Droplets, Fuel, Activity, LayoutList
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DailyLogViewProps {
  project: Project;
}

const DailyLogView: React.FC<DailyLogViewProps> = ({ project }) => {
  const data = useData();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLog, setSelectedLog] = useState<DailyLog | null>(null);

  useEffect(() => { loadLogs(); }, [project.id]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const all = await data.dailyLogs.getAll(project.id);
      setLogs(all.sort((a, b) => b.date.localeCompare(a.date)));
    } finally { setLoading(false); }
  };

  const handleGenerateLog = async () => {
    setIsGenerating(true);
    showToast("جاري تحليل بيانات الميدان، استهلاك المواد، وساعات المعدات عبر AI...", "loading");
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const items = await data.workItems.getAll();
      const projectItems = items.filter(i => i.projectId === project.id && i.createdAt.startsWith(today));
      const materials = await data.materials.getAll();
      
      // Simulate Detailed Data Extraction
      const labor = [
        { trade: 'مهندس موقع', count: 2, hours: 10 },
        { trade: 'فني كهرباء', count: 5, hours: 8 },
        { trade: 'عمالة عامة', count: 12, hours: 9 }
      ];

      const machines = [
        { assetName: 'Caterpillar 320', assetId: 'AST-001', operatingHours: 7.5, fuelConsumed: 120 },
        { assetName: 'Generac 500kVA', assetId: 'AST-005', operatingHours: 12, fuelConsumed: 80 }
      ];
      
      const reportContent = await data.ai.generateDailyReport(project, projectItems, materials, labor, machines);
      
      const newLog: Partial<DailyLog> = {
        projectId: project.id,
        date: today,
        weatherStatus: "غائم جزئياً / 32°C",
        manpowerCount: 19,
        laborDetails: labor,
        equipmentDetails: machines,
        consumedMaterials: [
          { materialId: 'M1', name: 'إسمنت بورتلاندي', quantity: 45, unit: 'كيس' },
          { materialId: 'M2', name: 'حديد تسليح 12ملم', quantity: 2.5, unit: 'طن' }
        ],
        content: reportContent,
        stats: {
          tasksCompleted: projectItems.filter(i => i.status === Status.DONE).length,
          incidentsReported: projectItems.filter(i => i.type === 'Incident').length,
          materialsRequested: 3
        },
        createdBy: "Gemini AI Analytics",
        isApproved: false
      };

      const saved = await data.dailyLogs.create(newLog);
      setLogs([saved, ...logs]);
      setSelectedLog(saved);
      showToast("تم توليد السجل اليومي المتكامل بنجاح.", "success");
    } catch (e) {
      showToast("فشل تجميع البيانات.", "error");
    } finally { setIsGenerating(false); }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12" dir="rtl">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 -mr-32 -mb-32 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
               <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <FileText className="text-blue-600" size={32} /> الأرشيف التشغيلي اليومي
               </h3>
               <p className="text-sm font-bold text-slate-500 mt-2 max-w-lg">توثيق شامل للقوى العاملة، استهلاك المواد، وساعات تشغيل المعدات الميدانية.</p>
            </div>
            <button 
               onClick={handleGenerateLog}
               disabled={isGenerating}
               className="relative z-10 flex items-center gap-3 px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm shadow-2xl hover:scale-105 transition-all disabled:opacity-50"
            >
               {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <Sparkles className="text-blue-400" size={20}/>}
               توليد تقرير اليوم الذكي
            </button>
         </div>

         <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-200 flex flex-col justify-center text-center">
            <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">إجمالي السجلات</p>
            <p className="text-5xl font-black">{logs.length}</p>
            <div className="mt-4 flex items-center justify-center gap-1 text-[10px] font-black bg-white/10 py-1 rounded-full">
               <CheckCircle2 size={12}/> مزامنة 100%
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Sidebar: Log List */}
         <div className="xl:col-span-1 space-y-4 max-h-[700px] overflow-y-auto no-scrollbar pr-1">
            {loading ? (
               <div className="py-40 text-center flex flex-col items-center gap-4 text-slate-300">
                  <Loader2 size={40} className="animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest">مزامنة سجلات الميدان...</p>
               </div>
            ) : logs.map(log => (
               <div 
                  key={log.id} 
                  onClick={() => setSelectedLog(log)}
                  className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer group relative overflow-hidden ${selectedLog?.id === log.id ? 'bg-slate-900 border-slate-900 text-white shadow-2xl' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'}`}
               >
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-4 rounded-3xl ${selectedLog?.id === log.id ? 'bg-white/10' : 'bg-blue-50 text-blue-600'}`}>
                        <Calendar size={20} />
                     </div>
                     {!log.isApproved && <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase border border-amber-100">مسودة</span>}
                     {log.isApproved && <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase border border-emerald-100">معتمد</span>}
                  </div>
                  <h4 className="font-black text-xl mb-4">{log.date}</h4>
                  <div className="grid grid-cols-3 gap-2">
                     <MiniStat icon={<Users size={12}/>} value={log.manpowerCount} label="فرد" />
                     <MiniStat icon={<Wrench size={12}/>} value={log.equipmentDetails?.length || 0} label="معدة" />
                     <MiniStat icon={< Droplets size={12}/>} value={log.consumedMaterials?.length || 0} label="مواد" />
                  </div>
               </div>
            ))}
         </div>

         {/* Detail View */}
         <div className="xl:col-span-2">
            {selectedLog ? (
               <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden animate-scale-in">
                  <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                     <div className="flex items-center gap-4">
                        <div className="p-4 bg-blue-600 text-white rounded-[1.5rem] shadow-lg shadow-blue-200"><FileText size={28}/></div>
                        <div>
                           <h3 className="text-2xl font-black text-slate-900">تقرير يوم {selectedLog.date}</h3>
                           <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">المرجع: {selectedLog.id} • {selectedLog.createdBy}</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm transition-all"><ChevronRight size={24} className="rotate-180"/></button>
                     </div>
                  </div>
                  
                  <div className="p-8 space-y-10">
                     {/* Row 1: Weather & High Level Info */}
                     <div className="grid grid-cols-3 gap-6">
                        <QuickStat icon={<CloudRain className="text-blue-600"/>} label="حالة الطقس" value={selectedLog.weatherStatus || 'صافي'} bg="bg-blue-50" />
                        <QuickStat icon={<Users className="text-orange-600"/>} label="القوى العاملة" value={`${selectedLog.manpowerCount} فرد`} bg="bg-orange-50" />
                        <QuickStat icon={<Construction className="text-indigo-600"/>} label="المشاريع النشطة" value="1" bg="bg-indigo-50" />
                     </div>

                     {/* Row 2: Deep Data Tabs */}
                     <div className="space-y-6">
                        <SectionTitle icon={<Activity className="text-blue-600"/>} title="سجل الميدان (AI Analytics)" />
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-blue-100 leading-relaxed font-bold text-sm shadow-2xl relative">
                           <div className="absolute top-4 right-4"><Sparkles size={20} className="text-blue-400 opacity-50" /></div>
                           {/* Moved className to a wrapper div to fix type error */}
                           <div className="prose prose-invert max-w-none">
                              <ReactMarkdown>{selectedLog.content}</ReactMarkdown>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Labor Breakdown */}
                        <div className="space-y-4">
                           <SectionTitle icon={<HardHat className="text-orange-600"/>} title="توزيع العمالة" />
                           <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-3">
                              {selectedLog.laborDetails?.map((l, i) => (
                                 <div key={i} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                                    <span className="text-sm font-black text-slate-700">{l.trade}</span>
                                    <div className="text-left">
                                       <span className="text-sm font-black text-slate-900">{l.count} فرد</span>
                                       <p className="text-[10px] font-bold text-slate-400">{l.hours} ساعة/فرد</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Material Consumption */}
                        <div className="space-y-4">
                           <SectionTitle icon={< Droplets className="text-emerald-600"/>} title="المواد المستهلكة" />
                           <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-3">
                              {selectedLog.consumedMaterials?.map((m, i) => (
                                 <div key={i} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                                    <span className="text-sm font-black text-slate-700">{m.name}</span>
                                    <span className="text-sm font-black text-emerald-700">{m.quantity} {m.unit}</span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     {/* Equipment Section */}
                     <div className="space-y-4">
                        <SectionTitle icon={<Wrench className="text-amber-600"/>} title="سجل عمل المعدات" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {selectedLog.equipmentDetails?.map((e, i) => (
                              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-amber-400 transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Construction size={20}/></div>
                                    <div>
                                       <p className="text-sm font-black text-slate-800">{e.assetName}</p>
                                       <p className="text-[10px] font-bold text-slate-400">{e.assetId}</p>
                                    </div>
                                 </div>
                                 <div className="text-left flex gap-6">
                                    <div>
                                       <p className="text-[10px] font-black text-slate-400 uppercase">ساعات</p>
                                       <p className="text-sm font-black text-slate-800">{e.operatingHours}h</p>
                                    </div>
                                    <div>
                                       <p className="text-[10px] font-black text-slate-400 uppercase">ديزل</p>
                                       <p className="text-sm font-black text-slate-800">{e.fuelConsumed}L</p>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>

                  {!selectedLog.isApproved && (
                    <div className="p-8 bg-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                       <div className="text-center md:text-right">
                          <p className="font-black text-lg text-white">اعتماد الأداء اليومي</p>
                          <p className="text-xs text-slate-400 font-bold mt-1">توقيعك على هذا التقرير يمثل إقراراً بصحة البيانات والكميات المذكورة.</p>
                       </div>
                       <div className="flex gap-3 w-full md:w-auto">
                          <button className="flex-1 md:flex-none px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-900/20 transition-all">توقيع واعتماد السجل</button>
                          <button className="flex-1 md:flex-none px-6 py-4 bg-white/10 text-slate-300 rounded-2xl font-black text-sm hover:bg-white/20 transition-all">طلب تعديل</button>
                       </div>
                    </div>
                  )}
               </div>
            ) : (
               <div className="h-[700px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                     <FileText size={48} className="text-slate-200" />
                  </div>
                  <p className="text-xl font-black text-slate-400">حدد تقريراً من القائمة الجانبية للعرض <br/> أو اضغط على "توليد تقرير" للبدء.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

const QuickStat = ({ icon, label, value, bg }: any) => (
  <div className={`${bg} p-6 rounded-3xl border border-white text-center shadow-sm`}>
     <div className="mx-auto mb-2 flex justify-center">{icon}</div>
     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
     <p className="text-lg font-black text-slate-800">{value}</p>
  </div>
);

const MiniStat = ({ icon, value, label }: any) => (
  <div className="flex flex-col items-center p-2 rounded-xl bg-black/5">
     <div className="opacity-40 mb-1">{icon}</div>
     <p className="text-xs font-black">{value}</p>
     <p className="text-[8px] font-bold text-slate-400 uppercase">{label}</p>
  </div>
);

const SectionTitle = ({ icon, title }: any) => (
   <div className="flex items-center gap-3 border-r-4 border-slate-900 pr-3">
      {icon}
      <h4 className="text-lg font-black text-slate-900">{title}</h4>
   </div>
);

export default DailyLogView;
