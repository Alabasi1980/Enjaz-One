
import React, { useState, useEffect, useMemo } from 'react';
import { PayrollRecord } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  CreditCard, DollarSign, Download, CheckCircle2, 
  Clock, AlertCircle, RefreshCcw, Loader2, Sparkles,
  ArrowRight, FileText, Wallet, Calendar, Filter
} from 'lucide-react';

const PayrollView: React.FC = () => {
  const data = useData();
  const { showToast } = useToast();
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('October');
  const [year, setYear] = useState(2023);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { loadPayroll(); }, [month, year]);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const dataSet = await data.payroll.getMonthlyRecords(month, year);
      setRecords(dataSet);
    } finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    showToast("جاري مطابقة سجلات الحضور الميدانية مع معدلات الأجور...", "loading");
    try {
      const generated = await data.payroll.generatePayroll(month, year);
      setRecords(generated);
      showToast("تم توليد مسير الرواتب بناءً على بيانات الميدان.", "success");
    } catch (e) {
      showToast("فشل توليد المسير.", "error");
    } finally { setIsGenerating(false); }
  };

  const handleApproveAll = async () => {
    showToast("جاري اعتماد كافة السجلات المراجعة...", "loading");
    for (const r of records) {
       if (r.status === 'Draft') await data.payroll.approveRecord(r.id);
    }
    loadPayroll();
    showToast("تم اعتماد المسير بنجاح.", "success");
  };

  const totalNetPay = useMemo(() => records.reduce((acc, r) => acc + r.netPay, 0), [records]);

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 -ml-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
               <Wallet className="text-emerald-600" size={32} /> مسيرات الرواتب والمستحقات
            </h3>
            <p className="text-sm font-bold text-slate-500 mt-2">احتساب تلقائي للأجور بناءً على ساعات العمل الفعلية المسجلة ميدانياً.</p>
         </div>
         <div className="relative z-10 flex gap-3 w-full lg:w-auto">
            <select className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none" value={month} onChange={e => setMonth(e.target.value)}>
               {['September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center gap-2 shadow-xl hover:scale-105 transition-all disabled:opacity-50"
            >
               {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <RefreshCcw size={18}/>}
               توليد المسير
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي المستحقات</p>
            <p className="text-3xl font-black text-slate-900">${totalNetPay.toLocaleString()}</p>
            <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 w-[65%]"></div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">إجمالي الساعات</p>
            <p className="text-3xl font-black text-slate-900">{records.reduce((acc, r) => acc + r.workedHours, 0)}h</p>
            <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1"><Clock size={12}/> تم سحبها من 42 سجل موقع</p>
         </div>
         <div className="bg-emerald-50 p-6 rounded-[2.5rem] border border-emerald-100 border-dashed lg:col-span-2 flex items-center justify-between">
            <div>
               <h4 className="font-black text-emerald-900">جاهز للتحويل</h4>
               <p className="text-xs font-bold text-emerald-700 mt-1">يوجد {records.filter(r => r.status === 'Approved').length} سجل معتمد بانتظار الصرف.</p>
            </div>
            <button onClick={handleApproveAll} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg">اعتماد الكل</button>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
         <div className="overflow-x-auto">
            <table className="w-full text-right">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">الموظف</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ساعات (أساسي)</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">إضافي</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الصافي</th>
                     <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الحالة</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">إجراء</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan={6} className="py-20 text-center font-black text-slate-300"><Loader2 className="animate-spin mx-auto mb-2"/> جاري تحميل البيانات...</td></tr>
                  ) : records.map(record => (
                     <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs">{record.employeeName.charAt(0)}</div>
                              <div>
                                 <p className="font-black text-slate-800 text-sm">{record.employeeName}</p>
                                 <p className="text-[10px] font-bold text-slate-400">{record.employeeId}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-center font-black text-slate-700">{record.workedHours}h</td>
                        <td className="px-6 py-5 text-center font-black text-emerald-600">+{record.overtimeHours}h</td>
                        <td className="px-6 py-5 text-center font-black text-slate-900">${record.netPay.toLocaleString()}</td>
                        <td className="px-6 py-5">
                           <div className="flex justify-center">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                                 record.status === 'Draft' ? 'bg-slate-50 text-slate-400 border-slate-100' :
                                 record.status === 'Approved' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              }`}>
                                 {record.status === 'Draft' ? 'مسودة' : record.status === 'Approved' ? 'معتمد' : 'تم الصرف'}
                              </span>
                           </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                           <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><FileText size={16}/></button>
                        </td>
                     </tr>
                  ))}
                  {records.length === 0 && !loading && (
                    <tr><td colSpan={6} className="py-20 text-center font-bold text-slate-400 italic">لا توجد بيانات لهذا الشهر. اضغط على "توليد" للبدء.</td></tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default PayrollView;
