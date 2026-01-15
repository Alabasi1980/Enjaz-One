import React from 'react';
import { Truck, Settings, Hammer } from 'lucide-react';

const ProjectAssets: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AssetCard name="Excavator CAT-320" id="EQ-2023-001" status="Active" icon={<Truck />} />
      <AssetCard name="Generator 500kVA" id="EQ-2023-055" status="Maintenance" icon={<Settings />} />
      <AssetCard name="Total Station Leica" id="EQ-2022-102" status="Active" icon={<Hammer />} />
    </div>
  );
};

const AssetCard = ({ name, id, status, icon }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
    <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">{icon}</div>
    <div className="flex-1">
      <h4 className="font-semibold text-slate-800">{name}</h4>
      <p className="text-xs font-mono text-slate-500">{id}</p>
    </div>
    <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{status}</span>
  </div>
);

export default ProjectAssets;
