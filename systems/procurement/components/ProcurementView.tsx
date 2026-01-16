
import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseOrder, Vendor, Contract, Project, VendorCategory, PettyCashRecord } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  ShoppingCart, Truck, FileText, UserCheck, 
  Search, Plus, Filter, MoreVertical, CreditCard,
  Building2, CheckCircle2, Clock, AlertTriangle, Loader2, Sparkles,
  ArrowRight, Handshake, Wallet, Receipt, TrendingUp
} from 'lucide-react';

const ProcurementView: React.FC = () => {
  const data = useData();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'pos' | 'vendors' | 'cash' | 'contracts'>('pos');
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [cashRecords, setCashRecords] = useState<PettyCashRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSupplyInsight, setAiSupplyInsight] = useState<string | null>(null);

  useEffect(() => { loadAllProcurementData(); }, []);

  const loadAllProcurementData = async () => {
    setLoading(true);
    try {
      const [poData, vendorData, contractData, projData] = await Promise.all([
        data.procurement.getPurchaseOrders(),
        data.vendors.getAll(),
        data.procurement.getContracts(),
        data.projects.getAll()
      ]);
      setPos(poData);
      setVendors(vendorData);
      setContracts(contractData);
      setProjects(projData);

      if (projData.length > 0) {
        const cash = await data.procurement.getPettyCashRecords(projData[0].id);
        setCashRecords(cash);
      }
    } finally { setLoading(false); }
  };

  const handleAiAnalyze = async () => {
    setIsAiLoading(true);
    showToast("جاري تحليل فوارق الأسعار وسلوك التوريد...", "loading");
    try {
      const context = `Vendors: ${vendors.length}, POs: ${pos.length}, Projects: ${projects.length}`;
      const response = await data.ai.askWiki(context, "بصفتك محلل مشتريات، هل هناك مخاطر في تأخر توريد المواد بناءً على تصنيف الموردين الحالي؟ وما هي نصيحتك لتحسين التدفق النقدي؟");
      setAiSupplyInsight(response);
    } catch (e) {
      showToast("فشل التحليل الذكي.", "error");
    } finally { setIsAiLoading(false); }
  };

  const stats = useMemo(() => ({
    totalPOValue: pos.reduce((acc, p) => acc + p.grandTotal, 0),
    agreementCount: vendors.filter(v => v.category === VendorCategory.AGREEMENT).length,
    pendingPOs: pos.filter(p => p.status !== 'Received' && p.status !== 'Cancelled').length,
    cashSpending: cashRecords.reduce((acc, r) => acc + r.amount, 0)
  }), [pos, vendors, cashRecords]);

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Header Info */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 -ml-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
               <ShoppingCart className="text-blue-600" size={32} /> مركز التموين والمشتريات
            </h3>
            <p className="text-sm font-bold text-slate-500 mt-2 pr-2">نظام موحد لإدارة اتفاقيات الموردين، مشتريات الذمم، والنثريات النقدية للمشاريع.</p>
         </div>
         <div className="relative z-10 flex gap-4 w-full md:w-auto">
            <button onClick={handleAiAnalyze} disabled={isAiLoading} className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
               {isAiLoading ? <Loader2 className="animate-spin" size={20}/> : <Sparkles size={20}/>}
            </button>
            <button className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-3 hover:scale-105 transition-all">
               <Plus size={20}/> طلب مواد ميداني
            </button>
         </div>
      </div>

      {aiSupplyInsight && (
         <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden animate-slide-in-down">
            <div className="absolute top-0 left-0 p-10 opacity-5"><Sparkles size={80}/></div>
            <div className="relative z-10">
               <h4 className="text-lg font-black mb-4 flex items-center gap-2 text-blue-400">
                  <Sparkles size={18}/> تحليل سلاسل الإمداد (AI)
               </h4>
               <div className="text-sm font-bold text-blue-100 leading-relaxed max-w-4xl">
                  {aiSupplyInsight}
               </div>
               <button onClick={() => setAiSupplyInsight(null)} className="mt-6 text-[10px] font-black text-slate-500 hover:text-white">إخفاء التحليل</button>
            </div>
         </div>
      )}

      {/* Main Procurement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <ProcStat label="إجمالي التعميدات" value={`$${(stats.totalPOValue/1000).toFixed(1)}k`} icon={<CreditCard/>} color="text-slate-900" bg="bg-white" />
         <ProcStat label="أوامر شراء معلقة" value={stats.pendingPOs} icon={<Clock/>} color="text-blue-600" bg="bg-blue-50" />
         <ProcStat label="الموردين الاستراتيجيين" value={stats.agreementCount} icon={<Handshake/>} color="text-indigo-600" bg="bg-indigo-50" />
         <ProcStat label="صرف نقدي (Petty)" value={`$${stats.cashSpending.toLocaleString()}`} icon={<Wallet/>} color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 bg-white p-2 rounded-[2.5rem] border border-slate-200 shadow-sm w-full md:w-fit overflow-x-auto no-scrollbar">
         <button onClick={() => setActiveTab('pos')} className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'pos' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
            <ShoppingCart size={18}/> أوامر الشراء
         </button>
         <button onClick={() => setActiveTab('vendors')} className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'vendors' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
            <UserCheck size={18}/> الموردين المعتمدين
         </button>
         <button onClick={() => setActiveTab('cash')} className={`px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'cash' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Receipt size={18}/> المشتريات النقدية (الميدان)
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Main Listing Area */}
         <div className="lg:col-span-3 space-y-6">
            <div className="relative">
               <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input 
                  type="text" 
                  placeholder="بحث في السجلات والطلبات..." 
                  className="w-full pr-14 pl-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
               {activeTab === 'pos' && (
                  <div className="overflow-x-auto">
                     <table className="w-full text-right">
                        <thead>
                           <tr className="bg-slate-50 border-b border-slate-100">
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">رقم الأمر</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">المورد</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">التصنيف</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">المبلغ</th>
                              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">إجراء</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {pos.map(po => (
                              <tr key={po.id} className="hover:bg-slate-50/50 transition-colors group">
                                 <td className="px-8 py-5 font-black text-blue-600">{po.poNumber}</td>
                                 <td className="px-6 py-5">
                                    <p className="font-bold text-slate-800 text-sm">{po.vendorName}</p>
                                    <p className="text-[10px] text-slate-400 font-bold">{po.projectName}</p>
                                 </td>
                                 <td className="px-6 py-5 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                                       po.vendorCategory === VendorCategory.AGREEMENT ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                                    }`}>{po.vendorCategory}</span>
                                 </td>
                                 <td className="px-6 py-5 text-center font-black text-slate-900">${po.grandTotal.toLocaleString()}</td>
                                 <td className="px-6 py-5">
                                    <div className="flex justify-center">
                                       <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                          po.status === 'Received' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                       }`}>{po.status}</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-5 text-center">
                                    <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><FileText size={16}/></button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}

               {activeTab === 'vendors' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-8">
                     {vendors.map(v => (
                        <div key={v.id} className="p-6 rounded-[2.5rem] border border-slate-100 hover:border-indigo-300 transition-all group bg-slate-50/50 hover:bg-white relative overflow-hidden">
                           <div className="flex justify-between items-start mb-6 relative z-10">
                              <div className="w-14 h-14 bg-white rounded-3xl shadow-sm flex items-center justify-center font-black text-indigo-600 text-xl border border-slate-100">{v.name.charAt(0)}</div>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                                 v.category === VendorCategory.AGREEMENT ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200'
                              }`}>{v.category}</span>
                           </div>
                           <h4 className="text-lg font-black text-slate-900 mb-1 relative z-10">{v.name}</h4>
                           <p className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest relative z-10">{v.trade}</p>
                           <div className="pt-6 border-t border-slate-100 flex justify-between items-center relative z-10">
                              <div className="flex items-center gap-1 text-amber-500 font-black text-sm">⭐ {v.rating}</div>
                              <button className="p-3 bg-slate-900 text-white rounded-xl shadow-lg group-hover:scale-110 transition-transform"><ArrowRight size={16} className="rotate-180" /></button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}

               {activeTab === 'cash' && (
                  <div className="p-8">
                     <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 border-dashed flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                           <div className="p-4 bg-white rounded-3xl text-emerald-600 shadow-sm"><Wallet size={28}/></div>
                           <div>
                              <h4 className="text-lg font-black text-emerald-900">سجل عهدة محاسب الموقع</h4>
                              <p className="text-sm font-bold text-emerald-700">تسجيل فوري للمشتريات النقدية (Cash On Spot).</p>
                           </div>
                        </div>
                        <button className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 flex items-center gap-2">
                           <Plus size={18}/> إضافة فاتورة نقدية
                        </button>
                     </div>
                     <div className="space-y-4">
                        {cashRecords.map(r => (
                           <div key={r.id} className="p-5 rounded-3xl border border-slate-100 bg-white hover:border-emerald-300 transition-all flex items-center justify-between group">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors"><Receipt size={20}/></div>
                                 <div>
                                    <h5 className="font-black text-slate-800 text-sm">{r.vendorName}</h5>
                                    <p className="text-xs font-bold text-slate-400 mt-0.5">{r.description}</p>
                                 </div>
                              </div>
                              <div className="text-left flex items-center gap-8">
                                 <div className="text-left">
                                    <p className="text-lg font-black text-slate-900">${r.amount.toLocaleString()}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">{r.date}</p>
                                 </div>
                                 <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><FileText size={18}/></button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Supply Chain Sidebar */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform"><Truck size={100}/></div>
               <h4 className="text-xl font-black mb-6 relative z-10 flex items-center gap-2">
                  <TrendingUp className="text-emerald-400" size={20}/> تقييم التوريد
               </h4>
               <div className="space-y-6 relative z-10">
                  <SupplyKPI label="دقة مواعيد التسليم" percentage={88} color="bg-emerald-500" />
                  <SupplyKPI label="مطابقة الجودة الفنية" percentage={95} color="bg-blue-500" />
                  <SupplyKPI label="استجابة موردو النقدي" percentage={72} color="bg-orange-500" />
               </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
               <h4 className="text-lg font-black mb-2">تنبيهات الدفع</h4>
               <p className="text-xs font-bold text-indigo-100 leading-relaxed mb-6">يوجد 5 شيكات لموردين "الذمم" تستحق الصرف الأسبوع القادم.</p>
               <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs hover:scale-105 transition-transform">عرض جدول الشيكات</button>
            </div>
         </div>
      </div>
    </div>
  );
};

const ProcStat = ({ label, value, icon, color, bg }: any) => (
  <div className={`${bg} p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 group hover:shadow-md transition-all`}>
    <div className={`p-4 rounded-3xl group-hover:scale-110 transition-transform bg-white shadow-sm ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

const SupplyKPI = ({ label, percentage, color }: any) => (
   <div className="space-y-2">
      <div className="flex justify-between items-end px-1">
         <span className="text-[10px] font-black text-slate-400 uppercase">{label}</span>
         <span className="text-xs font-black text-white">{percentage}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
         <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{width: `${percentage}%`}}></div>
      </div>
   </div>
);

export default ProcurementView;
