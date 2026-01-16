
import React, { useState, useEffect } from 'react';
import { Material, WorkItem, WorkItemType, Priority, Status, StockMovement, StockMovementType } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useToast } from '../../../shared/ui/ToastProvider';
import { 
  Package, Search, Plus, AlertTriangle, ArrowDown, 
  ArrowUp, History, Filter, Boxes, MoreVertical, 
  ShoppingCart, RefreshCw, Loader2, Sparkles, X, TrendingUp, TrendingDown, Clock,
  CheckCircle // Added missing import
} from 'lucide-react';

const InventoryView: React.FC = () => {
  const data = useData();
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'Inbound' | 'Outbound'>('Inbound');
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');

  useEffect(() => { loadMaterials(); }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const all = await data.materials.getAll();
      setMaterials(all);
    } finally { setLoading(false); }
  };

  const handleOpenMovements = async (m: Material) => {
    setSelectedMaterial(m);
    const movs = await data.materials.getMovements(m.id);
    setMovements(movs.sort((a,b) => b.createdAt.localeCompare(a.createdAt)));
  };

  const handleMovementSubmit = async () => {
    if (!selectedMaterial) return;
    try {
      await data.materials.updateStock(selectedMaterial.id, qty, modalMode, note);
      showToast(`تم تسجيل ${modalMode === 'Inbound' ? 'توريد' : 'صرف'} بنجاح.`, "success");
      setIsModalOpen(false);
      loadMaterials();
      handleOpenMovements(selectedMaterial); // Refresh history
      setQty(1); setNote('');
    } catch (e) {
      showToast("خطأ في تحديث المخزون.", "error");
    }
  };

  const filtered = materials.filter(m => 
    (activeCategory === 'All' || m.category === activeCategory) &&
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20" dir="rtl">
      {/* Header Info */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 -ml-32 -mt-32 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
               <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <Boxes className="text-blue-600" size={32} /> المستودع الرقمي والتموين
               </h3>
               <p className="text-sm font-bold text-slate-500 mt-2">إدارة شاملة لكافة المواد الإنشائية وسلاسل الإمداد للمشاريع.</p>
            </div>
            <div className="flex gap-4">
               <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2">
                  <Plus size={18}/> إضافة صنف جديد
               </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters & Stats */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                 <Filter size={18} className="text-blue-600" /> التصنيفات
              </h4>
              <div className="space-y-2">
                 {['All', 'مواد أساسية', 'مواد كهرباء', 'مواد سباكة', 'تشطيبات'].map(cat => (
                    <button 
                       key={cat}
                       onClick={() => setActiveCategory(cat)}
                       className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeCategory === cat ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                       {cat === 'All' ? 'كافة الأصناف' : cat}
                    </button>
                 ))}
              </div>
           </div>

           <div className="bg-rose-50 p-6 rounded-[2.5rem] border-2 border-rose-100 border-dashed">
              <div className="flex items-center gap-2 text-rose-700 mb-4">
                 <AlertTriangle size={20} />
                 <h4 className="font-black text-sm">نقص حرج</h4>
              </div>
              <div className="space-y-3">
                 {materials.filter(m => m.currentStock <= m.minThreshold).map(m => (
                    <div key={m.id} className="bg-white p-3 rounded-xl border border-rose-200 flex items-center justify-between">
                       <span className="text-xs font-black text-slate-700">{m.name}</span>
                       <span className="text-[10px] font-black text-rose-600 underline">اطلب الآن</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
           <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                 type="text" 
                 placeholder="ابحث عن مادة (إسمنت، كابلات، حديد...)" 
                 className="w-full pr-12 pl-4 py-4 bg-white border border-slate-200 rounded-3xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                 <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-300">
                    <Loader2 size={48} className="animate-spin" />
                    <p className="font-black">جاري مزامنة بيانات المستودع...</p>
                 </div>
              ) : filtered.map(m => (
                 <div key={m.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="flex justify-between items-start mb-6">
                       <div className={`p-4 rounded-3xl ${m.currentStock <= m.minThreshold ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>
                          <Package size={24} />
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => { setSelectedMaterial(m); setModalMode('Inbound'); setIsModalOpen(true); }} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><ArrowUp size={16} /></button>
                          <button onClick={() => { setSelectedMaterial(m); setModalMode('Outbound'); setIsModalOpen(true); }} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><ArrowDown size={16} /></button>
                          <button onClick={() => handleOpenMovements(m)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><History size={16} /></button>
                       </div>
                    </div>
                    
                    <div className="mb-6">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.category}</p>
                       <h4 className="text-xl font-black text-slate-800 mt-1">{m.name}</h4>
                       <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-1"><Clock size={12}/> آخر حركة: منذ ساعتين</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-50">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الرصيد الحالي</p>
                          <p className={`text-2xl font-black ${m.currentStock <= m.minThreshold ? 'text-rose-600' : 'text-slate-900'}`}>{m.currentStock} <span className="text-[10px] text-slate-400 font-bold">{m.unit}</span></p>
                       </div>
                       <div className="text-left">
                          <p className="text-[9px] font-black text-slate-400 uppercase mb-1">القيمة التقريبية</p>
                          <p className="text-2xl font-black text-slate-900">${(m.currentStock * m.unitPrice).toLocaleString()}</p>
                       </div>
                    </div>
                    
                    {/* Visual Stock Bar */}
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                          className={`h-full transition-all duration-1000 ${m.currentStock <= m.minThreshold ? 'bg-rose-500' : 'bg-blue-600'}`} 
                          style={{ width: `${Math.min(100, (m.currentStock / (m.minThreshold * 4)) * 100)}%` }}
                       />
                    </div>
                 </div>
              ))}
           </div>
        </div>
      </div>

      {/* Movement History Slider (Bottom or Side) */}
      {selectedMaterial && movements.length > 0 && !isModalOpen && (
         <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl animate-slide-in-up">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-xl font-black flex items-center gap-3"><History className="text-blue-400" /> سجل حركة: {selectedMaterial.name}</h3>
               <button onClick={() => setSelectedMaterial(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={20}/></button>
            </div>
            <div className="space-y-4 overflow-x-auto no-scrollbar pb-4 flex gap-4">
               {movements.map(mov => (
                  <div key={mov.id} className="min-w-[300px] bg-white/5 border border-white/10 p-5 rounded-3xl space-y-4 relative">
                     <div className={`absolute top-4 left-4 p-2 rounded-xl ${mov.type === 'Inbound' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {mov.type === 'Inbound' ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                     </div>
                     <p className="text-[10px] font-black text-slate-500 uppercase">{new Date(mov.createdAt).toLocaleString('ar-SA')}</p>
                     <div className="flex items-end gap-2">
                        <p className="text-3xl font-black">{mov.type === 'Inbound' ? '+' : '-'}{mov.quantity}</p>
                        <p className="text-xs font-bold text-slate-400 mb-1">{selectedMaterial.unit}</p>
                     </div>
                     <p className="text-sm font-bold text-slate-300 line-clamp-1">{mov.note}</p>
                     <div className="pt-4 border-t border-white/5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-black">A</div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mov.performedBy}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Transaction Modal */}
      {isModalOpen && selectedMaterial && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsModalOpen(false)}>
            <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
               <div className={`p-8 ${modalMode === 'Inbound' ? 'bg-emerald-600' : 'bg-rose-600'} text-white flex justify-between items-center`}>
                  <div>
                     <h3 className="text-2xl font-black flex items-center gap-2">
                        {modalMode === 'Inbound' ? <ArrowUp size={24}/> : <ArrowDown size={24}/>}
                        {modalMode === 'Inbound' ? 'أمر توريد مخزني' : 'أمر صرف مخزني'}
                     </h3>
                     <p className="text-white/80 font-bold mt-1">{selectedMaterial.name}</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white/20 rounded-full hover:bg-white/30"><X size={24}/></button>
               </div>

               <div className="p-8 space-y-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">الكمية ({selectedMaterial.unit})</label>
                     <input 
                        type="number" 
                        className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] text-4xl font-black text-center outline-none focus:ring-4 focus:ring-blue-100"
                        value={qty}
                        onChange={e => setQty(Number(e.target.value))}
                        min="1"
                     />
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">البيان / السبب</label>
                     <textarea 
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold h-24 resize-none outline-none"
                        placeholder="مثال: توريد دفعة حديد جديدة، أو صرف للموقع أ..."
                        value={note}
                        onChange={e => setNote(e.target.value)}
                     />
                  </div>

                  <button 
                     onClick={handleMovementSubmit}
                     className={`w-full py-5 rounded-[2rem] text-white font-black shadow-xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] ${modalMode === 'Inbound' ? 'bg-emerald-600 shadow-emerald-200' : 'bg-rose-600 shadow-rose-200'}`}
                  >
                     {modalMode === 'Inbound' ? <CheckCircle size={20}/> : <ShoppingCart size={20}/>}
                     تأكيد العملية وتسجيلها
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default InventoryView;
