import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { WorkItem, Status, Priority } from '../../../shared/types';
import { FileText, AlertTriangle, Clock, ShieldCheck } from 'lucide-react';
import StatCard from '../../../shared/ui/StatCard';

interface DashboardProps {
  items: WorkItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const stats = useMemo(() => {
    const overdue = items.filter(i => 
      i.status !== Status.DONE && 
      i.status !== Status.APPROVED && 
      i.dueDate < today
    ).length;

    return {
      total: items.length,
      pending: items.filter(i => i.status === Status.PENDING_APPROVAL).length,
      open: items.filter(i => i.status === Status.OPEN || i.status === Status.IN_PROGRESS).length,
      critical: items.filter(i => i.priority === Priority.CRITICAL).length,
      overdue
    };
  }, [items, today]);

  const statusData = useMemo(() => [
    { name: 'مفتوح', value: items.filter(i => i.status === Status.OPEN).length, color: '#3b82f6' },
    { name: 'قيد التنفيذ', value: items.filter(i => i.status === Status.IN_PROGRESS).length, color: '#f59e0b' },
    { name: 'بانتظار اعتماد', value: items.filter(i => i.status === Status.PENDING_APPROVAL).length, color: '#8b5cf6' },
    { name: 'مكتمل', value: items.filter(i => i.status === Status.DONE || i.status === Status.APPROVED).length, color: '#10b981' },
  ], [items]);

  return (
    <div className="space-y-8 animate-fade-in pb-10" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">نظرة عامة على العمليات</h1>
          <p className="text-slate-500 font-bold text-sm mt-1 pr-2">متابعة فورية لكافة المشاريع والاعتمادات الميدانية.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="إجمالي العمليات" value={stats.total} icon={<FileText size={22} />} colorClass="text-blue-600" bgClass="bg-blue-50" />
        <StatCard title="حالات حرجة" value={stats.critical} icon={<AlertTriangle size={22} />} colorClass="text-rose-600" bgClass="bg-rose-50" />
        <StatCard title="بانتظار موافقتك" value={stats.pending} icon={<ShieldCheck size={22} />} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
        <StatCard title="مهام متأخرة" value={stats.overdue} icon={<Clock size={22} />} colorClass="text-orange-600" bgClass="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 pr-2 border-r-4 border-blue-600">تدفق العمليات حسب الحالة</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                  {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <h3 className="text-lg font-black text-slate-900 mb-8 text-center">توزيع المهام</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
             {statusData.map((item, idx) => (
               <div key={idx} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span>{item.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;