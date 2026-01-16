import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isUpward: boolean;
  };
  colorClass: string;
  bgClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, colorClass, bgClass }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 opacity-50"></div>
    <div className="relative z-10 flex flex-col h-full justify-between">
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-2xl ${bgClass} ${colorClass} shadow-sm group-hover:scale-110 transition-transform duration-500`}>
          {/* Fix: use any casting on cloneElement to allow injecting the size prop and ensure icon is a valid element */}
          {React.isValidElement(icon) && React.cloneElement(icon as any, { size: 24 })}
        </div>
        {trend && (
          <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 ${trend.isUpward ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend.isUpward ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
      <div className="mt-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
      </div>
    </div>
  </div>
);

export default StatCard;