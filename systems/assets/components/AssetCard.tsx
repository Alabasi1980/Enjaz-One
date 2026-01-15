import React from 'react';
import { Asset, AssetStatus, AssetCategory } from '../../../shared/types';
import { Truck, Monitor, Wrench, Box, MapPin, User, Sparkles, MoreVertical } from 'lucide-react';

interface AssetCardProps {
  asset: Asset;
  onClick: (asset: Asset) => void;
  onAnalyze: (asset: Asset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick, onAnalyze }) => {
  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case AssetCategory.HEAVY_EQUIPMENT: return <Truck size={24} />;
      case AssetCategory.IT: return <Monitor size={24} />;
      case AssetCategory.VEHICLE: return <Truck size={24} />;
      case AssetCategory.TOOLS: return <Wrench size={24} />;
      default: return <Box size={24} />;
    }
  };

  const getStatusConfig = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.AVAILABLE: return { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'جاهز للاستخدام' };
      case AssetStatus.IN_USE: return { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', label: 'قيد التشغيل' };
      case AssetStatus.MAINTENANCE: return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'في الصيانة' };
      case AssetStatus.LOST: return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'مفقود' };
      default: return { color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', label: 'متقاعد' };
    }
  };

  const status = getStatusConfig(asset.status);
  const healthScore = asset.status === AssetStatus.MAINTENANCE ? 45 : 92;

  return (
    <div 
      className="group bg-white rounded-[2.5rem] p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
      onClick={() => onClick(asset)}
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        {getCategoryIcon(asset.category)}
      </div>

      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-3xl transition-colors group-hover:bg-slate-900 group-hover:text-white ${status.bg} ${status.color}`}>
          {getCategoryIcon(asset.category)}
        </div>
        <div className="flex gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onAnalyze(asset); }}
            className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
            title="AI Health Check"
          >
            <Sparkles size={16} />
          </button>
          <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-1 mb-6">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{asset.serialNumber}</span>
           <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase border ${status.bg} ${status.color} ${status.border}`}>
             {status.label}
           </span>
        </div>
        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
          {asset.name}
        </h3>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 pt-2">
           <MapPin size={14} className="text-slate-300" /> {asset.location}
        </div>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-end">
           <span className="text-[9px] font-black text-slate-400 uppercase">الحالة الفنية (Health)</span>
           <span className={`text-[10px] font-black ${healthScore < 50 ? 'text-red-500' : 'text-emerald-500'}`}>{healthScore}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
           <div 
             className={`h-full rounded-full transition-all duration-1000 ${healthScore < 50 ? 'bg-red-500' : 'bg-emerald-500'}`} 
             style={{ width: `${healthScore}%` }}
           />
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
            {asset.assignedToUserId ? (
              <img src={`https://picsum.photos/seed/${asset.assignedToUserId}/100/100`} className="w-full h-full object-cover" alt="user" />
            ) : (
              <User size={14} className="text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase leading-none">العهدة الحالية</p>
            <p className="text-xs font-black text-slate-700 truncate">{asset.assignedToUserName || 'المستودع المركزي'}</p>
          </div>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-black text-slate-400 uppercase leading-none">القيمة</p>
           <p className="text-xs font-black text-slate-900">${asset.value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;