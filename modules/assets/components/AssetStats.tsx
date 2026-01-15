
import React from 'react';
import { Asset, AssetStatus } from '../../../types';
// Fixed: Removed 'Tool' as it is not a valid export from lucide-react and is unused in this component.
import { Database, Activity, DollarSign, AlertCircle } from 'lucide-react';

interface AssetStatsProps {
  assets: Asset[];
}

const AssetStats: React.FC<AssetStatsProps> = ({ assets }) => {
  const totalValue = assets.reduce((acc, curr) => acc + curr.value, 0);
  const maintenanceCount = assets.filter(a => a.status === AssetStatus.MAINTENANCE).length;
  const inUseCount = assets.filter(a => a.status === AssetStatus.IN_USE).length;
  const availability = Math.round(((assets.length - maintenanceCount) / assets.length) * 100);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatItem 
        label="إجمالي قيمة الأصول" 
        value={`$${(totalValue / 1000000).toFixed(2)}M`} 
        icon={<DollarSign />} 
        color="text-slate-900" 
        bg="bg-slate-100" 
      />
      <StatItem 
        label="نسبة الجاهزية" 
        value={`${availability}%`} 
        icon={<Activity />} 
        color="text-emerald-600" 
        bg="bg-emerald-50" 
      />
      <StatItem 
        label="تحت الصيانة" 
        value={maintenanceCount} 
        icon={<AlertCircle />} 
        color="text-amber-600" 
        bg="bg-amber-50" 
      />
      <StatItem 
        label="قيد الاستخدام" 
        value={inUseCount} 
        icon={<Database />} 
        color="text-blue-600" 
        bg="bg-blue-50" 
      />
    </div>
  );
};

const StatItem = ({ label, value, icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all">
    <div className={`p-4 rounded-3xl group-hover:scale-110 transition-transform ${bg} ${color}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

export default AssetStats;
