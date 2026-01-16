
import React, { useState, useEffect, useMemo } from 'react';
import { Project, LetterOfGuarantee } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { 
  Building2, ShieldCheck, Wallet, DollarSign, 
  Calendar, CheckCircle2, Clock, Landmark,
  TrendingUp, ArrowRight, Loader2, Sparkles, AlertCircle
} from 'lucide-react';

interface BondsAndInsuranceViewProps {
  project: Project;
}

const BondsAndInsuranceView: React.FC<BondsAndInsuranceViewProps> = ({ project }) => {
  const data = useData();
  const [lgs, setLgs] = useState<LetterOfGuarantee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLGData(); }, [project.id]);

  const loadLGData = async () => {
    setLoading(true);
    try {
      const results = await data.stakeholders.getLGs(project.id);
      setLgs(results);
    } finally { setLoading(false); }
  };

  const totalBondValue = useMemo(() => lgs.reduce((acc, l) => acc + l.amount, 0), [lgs]);

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={32}/></div>;

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      <div className="bg-indigo-600 p-8 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-xl shadow-indigo-200">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex items-center gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
               <ShieldCheck size={32} />
            </div>
            <div>
               <h3 className="text-2xl font-black">الضمانات البنكية والتأمين</h3>
               <p className="text-sm font-bold text-indigo-100 opacity-80 mt-1">تتبع خطابات الضمان (LG) والمبالغ المحتجزة (Retention) وبوالص التأمين.</p>
            </div>
         </div>
         <div className="relative z-10 text-center bg-white/10 px-8 py-4 rounded-3xl border border-white/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">إجمالي الضمانات</p>
            <p className="text-3xl font-black text-white">${(totalBondValue/1000000).toFixed(2)}M</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {lgs.map(lg => (
               <div key={lg.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 bg-indigo-600 h-full"></div>
                  <div className="flex justify-between items-start mb-6">
                     <div className="p-4 bg-slate-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all"><Landmark size={24}/></div>
                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                        lg.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'
                     }`}>{lg.status}</span>
                  </div>
                  <div className="mb-6">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lg.bankName}</p>
                     <h4 className="text-xl font-black text-slate-900 mt-1">{lg.type}</h4>
                     <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">رقم الضمان: {lg.id}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50 mb-4">
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">قيمة الضمان</p>
                        <p className="text-lg font-black text-slate-900">${lg.amount.toLocaleString()}</p>
                     </div>
                     <div className="text-left">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">تاريخ الصلاحية</p>
                        <p className="text-sm font-black text-slate-800">{lg.expiryDate}</p>
                     </div>
                  </div>
                  <button className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black hover:bg-indigo-50 hover:text-indigo-600 transition-colors uppercase">طلب تمديد أو إفراج</button>
               </div>
            ))}
         </div>

         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
               <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2"><DollarSign size={18} className="text-emerald-600"/> المحتجزات النقدية</h4>
               <div className="text-center py-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المحتجز (10%)</p>
                  <p className="text-4xl font-black text-slate-900">$240,000</p>
                  <p className="text-[10px] font-bold text-emerald-600 mt-2">مستحقة الصرف: 2024-12-30</p>
               </div>
               <button className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-emerald-100">تحميل شهادة الاستحقاق</button>
            </div>

            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><ShieldCheck size={80}/></div>
               <h4 className="text-lg font-black mb-2 relative z-10">بوليصة التأمين</h4>
               <p className="text-xs font-bold text-slate-400 leading-relaxed mb-6 relative z-10">تأمين شامل ضد مخاطر الحريق، السطو، والإصابات المهنية ساري المفعول.</p>
               <button className="w-full py-4 bg-white/10 text-white rounded-2xl font-black text-xs relative z-10 border border-white/20 hover:bg-white/20 transition-all">مشاهدة البوليصة</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BondsAndInsuranceView;
