import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { WorkItem, Status, Priority, Project, User, WorkItemType } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
// Fix: Added missing Loader2 to the lucide-react import list
import { AlertTriangle, Clock, TrendingUp, DollarSign, BrainCircuit, Activity, Users, Target, Sparkles, AlertOctagon, ChevronLeft, Zap, Loader2 } from 'lucide-react';
import StatCard from '../../../shared/ui/StatCard';
import ReactMarkdown from 'react-markdown';

interface DashboardProps {
  items: WorkItem[];
  projects: Project[];
  users: User[];
}

const Dashboard: React.FC<DashboardProps> = ({ items, projects, users }) => {
  const data = useData();
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  
  const stats = useMemo(() => {
    const overdue = items.filter(i => 
      i.status !== Status.DONE && 
      i.status !== Status.APPROVED && 
      i.dueDate < today
    ).length;

    const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
    const spentBudget = projects.reduce((acc, p) => acc + p.spent, 0);

    return {
      total: items.length,
      pending: items.filter(i => i.status === Status.PENDING_APPROVAL).length,
      open: items.filter(i => i.status === Status.OPEN || i.status === Status.IN_PROGRESS).length,
      critical: items.filter(i => i.priority === Priority.CRITICAL).length,
      safetyAlerts: items.filter(i => i.type === WorkItemType.INCIDENT && i.priority === Priority.CRITICAL && i.status === Status.OPEN),
      overdue,
      totalBudget,
      spentBudget,
      projectsCount: projects.length,
      teamCount: users.length
    };
  }, [items, projects, today]);

  const handleGenerateInsight = async () => {
    setIsAiLoading(true);
    try {
      const result = await data.ai.generateExecutiveBrief({
        totalProjects: stats.projectsCount,
        totalBudget: stats.totalBudget,
        spentBudget: stats.spentBudget,
        criticalIssues: stats.critical,
        delayedTasks: stats.overdue,
        teamSize: stats.teamCount
      });
      setAiBrief(result);
    } catch (e) {
      setAiBrief("تعذر إنشاء التقرير الذكي حالياً.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20 px-2 lg:px-4" dir="rtl">
      {/* Dynamic Emergency Banner */}
      {stats.safetyAlerts.length > 0 && (
        <div className="bg-rose-600 p-5 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl shadow-rose-900/20 border-b-4 border-rose-800 animate-slide-in-up">
           <div className="flex items-center gap-5 px-4">
              <div className="p-4 bg-white/20 rounded-3xl animate-pulse"><AlertOctagon size={32} /></div>
              <div>
                 <p className="text-xl font-black leading-tight tracking-tight">إنذار ميداني حرج!</p>
                 <p className="text-xs font-bold opacity-90 mt-1">تم رصد {stats.safetyAlerts.length} حوادث سلامة مفتوحة تتطلب تدخلاً فورياً.</p>
              </div>
           </div>
           <button className="bg-white/10 hover:bg-white text-white hover:text-rose-600 px-8 py-4 rounded-[1.2rem] text-sm font-black transition-all flex items-center gap-2">
              توجيه الفرق <ChevronLeft size={16} />
           </button>
        </div>
      )}

      {/* Main Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي المشاريع" value={stats.projectsCount} icon={<Target/>} colorClass="text-blue-600" bgClass="bg-blue-50" trend={{value: '3%', isUpward: true}} />
        <StatCard title="الميزانية المستهلكة" value={`${Math.round((stats.spentBudget / stats.totalBudget) * 100)}%`} icon={<DollarSign/>} colorClass="text-emerald-600" bgClass="bg-emerald-50" />
        <StatCard title="المهام الحرجة" value={stats.critical} icon={<AlertTriangle/>} colorClass="text-rose-600" bgClass="bg-rose-50" trend={{value: '12%', isUpward: false}} />
        <StatCard title="القوى العاملة" value={stats.teamCount} icon={<Users/>} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative group">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 border-r-4 border-blue-600 pr-4">معدل الإنجاز الميداني</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">تتبع العمليات اليومية لكافة المواقع</p>
            </div>
            <button className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Activity size={20}/></button>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'أحد', val: 12 }, { name: 'اثنين', val: 25 }, { name: 'ثلاثاء', val: 18 }, { name: 'أربعاء', val: 32 }, { name: 'خميس', val: 45 },
              ]}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '900'}} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                <Area type="monotone" dataKey="val" stroke="#2563eb" strokeWidth={5} fill="url(#chartGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="lg:col-span-1 space-y-6">
           <div className={`p-8 rounded-[3rem] border shadow-2xl relative overflow-hidden transition-all duration-700 ${aiBrief ? 'bg-slate-900 text-white' : 'bg-white border-indigo-100 ai-glow'}`}>
              {!aiBrief ? (
                 <div className="text-center py-6">
                    <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 animate-float">
                       <BrainCircuit className="text-white" size={40} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 mb-2">المستشار الذكي</h4>
                    <p className="text-sm font-bold text-slate-400 mb-8 leading-relaxed">هل تريد تقريراً استراتيجياً عاجلاً يعتمد على بيانات التشغيل الحالية؟</p>
                    <button 
                      onClick={handleGenerateInsight}
                      disabled={isAiLoading}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg"
                    >
                       {isAiLoading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
                       توليد التقرير التنفيذي
                    </button>
                 </div>
              ) : (
                 <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                       <div className="flex items-center gap-2">
                          <Zap size={18} className="text-blue-400" fill="currentColor"/>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Executive Brief</span>
                       </div>
                       <button onClick={() => setAiBrief(null)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10"><AlertTriangle size={14}/></button>
                    </div>
                    <div className="prose prose-invert prose-sm font-bold text-blue-100 leading-relaxed h-[350px] overflow-y-auto no-scrollbar">
                       <ReactMarkdown>{aiBrief}</ReactMarkdown>
                    </div>
                 </div>
              )}
           </div>

           <div className="bg-blue-600 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-200 flex items-center justify-between group cursor-pointer hover:bg-blue-700 transition-all">
              <div>
                 <p className="text-xs font-black uppercase opacity-60">الجدول الزمني</p>
                 <h4 className="text-2xl font-black mt-1">مشروع الرياض A</h4>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center group-hover:translate-x-2 transition-transform">
                 <ChevronLeft size={24} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;