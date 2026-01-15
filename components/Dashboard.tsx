import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { WorkItem, Status, Priority } from '../types';
import { AlertCircle, CheckCircle, Clock, FileText, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  items: WorkItem[];
}

const Dashboard: React.FC<DashboardProps> = ({ items }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const stats = {
    total: items.length,
    pending: items.filter(i => i.status === Status.PENDING_APPROVAL).length,
    open: items.filter(i => i.status === Status.OPEN || i.status === Status.IN_PROGRESS).length,
    critical: items.filter(i => i.priority === Priority.CRITICAL || i.priority === Priority.HIGH).length,
    overdue: items.filter(i => i.status !== Status.DONE && i.status !== Status.APPROVED && i.status !== Status.REJECTED && i.dueDate < today).length
  };

  const statusData = [
    { name: 'Open', value: items.filter(i => i.status === Status.OPEN).length, color: '#3b82f6' },
    { name: 'In Progress', value: items.filter(i => i.status === Status.IN_PROGRESS).length, color: '#f59e0b' },
    { name: 'Approval', value: items.filter(i => i.status === Status.PENDING_APPROVAL).length, color: '#8b5cf6' },
    { name: 'Done', value: items.filter(i => i.status === Status.DONE).length, color: '#10b981' },
  ];

  const typeData = items.reduce((acc: any[], item) => {
    const existing = acc.find(x => x.name === item.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: item.type, value: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Work Items" 
          value={stats.total} 
          icon={<FileText className="text-blue-600" size={24} />} 
          bg="bg-blue-50"
          border="border-blue-200"
        />
        <StatCard 
          title="Overdue Items" 
          value={stats.overdue} 
          icon={<AlertTriangle className="text-red-600" size={24} />} 
          bg="bg-red-50"
          border="border-red-200"
        />
        <StatCard 
          title="Pending Approval" 
          value={stats.pending} 
          icon={<AlertCircle className="text-purple-600" size={24} />} 
          bg="bg-purple-50"
          border="border-purple-200"
        />
        <StatCard 
          title="Active Operations" 
          value={stats.open} 
          icon={<Clock className="text-orange-600" size={24} />} 
          bg="bg-orange-50"
          border="border-orange-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Work Items by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribution by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; bg: string; border: string }> = ({ title, value, icon, bg, border }) => (
  <div className={`p-5 rounded-xl border ${border} ${bg} flex items-center justify-between`}>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
    <div className="p-3 bg-white rounded-lg shadow-sm">
      {icon}
    </div>
  </div>
);

export default Dashboard;
