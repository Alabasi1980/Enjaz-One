
import React, { useState, useEffect } from 'react';
import { Project, Permit } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { 
  Globe, ShieldCheck, Clock, AlertTriangle, 
  Calendar, FileText, CheckCircle2, Loader2,
  RefreshCw, Building2, Landmark, History
} from 'lucide-react';

interface RegulatoryComplianceViewProps {
  project: Project;
}

const RegulatoryComplianceView: React.FC<RegulatoryComplianceViewProps> = ({ project }) => {
  const data = useData();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPermits(); }, [project.id]);

  const loadPermits = async () => {
    setLoading(true);
    try {
      const results = await data.stakeholders.getPermits(project.id);
      setPermits(results);
    } finally { setLoading(false); }
  };

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32}/></div>;

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex items-center gap-5">
            <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl">
               <Landmark size={32} />
            </div>
            <div>
               <h3 className="text-2xl font-black text-slate-900">الامتثال الحكومي والرقابة</h3>
               <p className="text-sm font-bold text-slate-500 mt-1">إدارة التراخيص البلدية، تصاريح الدفاع المدني، والزيارات التفتيشية.</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-4">
            <h4 className="font-black text-slate-800 flex items-center gap-2 mb-4 px-2"><FileText size={18} className="text-blue-600"/> سجل التراخيص الفعالة</h4>
            {permits.map(p => (
               <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-all">
                  <div className="flex items-center gap-5">
                     <div className={`p-4 rounded-2xl ${
                        p.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 
                        p.status === 'Renewal' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                     }`}><Globe size={24}/></div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.authority}</span>
                           <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                              p.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                           }`}>{p.status}</span>
                        </div>
                        <h5 className="font-black text-slate-800">{p.title}</h5>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">رقم الترخيص: {p.id}</p>
                     </div>
                  </div>
                  <div className="text-left">
                     <p className="text-[9px] font-black text-slate-400 uppercase mb-1">تاريخ الانتهاء</p>
                     <p className={`text-sm font-black ${p.status === 'Renewal' ? 'text-amber-600 animate-pulse' : 'text-slate-800'}`}>{p.expiryDate}</p>
                  </div>
               </div>
            ))}
         </div>

         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
               <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2"><History size={18} className="text-blue-600"/> التفتيش الدوري</h4>
               <div className="space-y-4">
                  <InspectionLog date="2023-11-05" authority="بلدية الرياض" result="مقبول مع ملاحظات" />
                  <InspectionLog date="2023-10-20" authority="الدفاع المدني" result="مطابق للمعايير" />
                  <InspectionLog date="2023-09-12" authority="وزارة العمل" result="مكتمل" />
               </div>
               <button className="w-full mt-6 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-100">جدولة موعد تفتيش</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const InspectionLog = ({ date, authority, result }: any) => (
   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
      <div className="absolute right-0 top-0 h-full w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{date}</p>
      <p className="text-sm font-black text-slate-800">{authority}</p>
      <p className="text-[10px] font-bold text-emerald-600 mt-1">{result}</p>
   </div>
);

export default RegulatoryComplianceView;
