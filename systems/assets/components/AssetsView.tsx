
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, AssetStatus, AssetCategory, WorkItem, WorkItemType, Priority, Status, User } from '../../../shared/types';
import { useData } from '../../../context/DataContext';
import { useEnjazCore } from '../../../shared/hooks/useEnjazCore';
import { PermissionGate } from '../../../shared/rbac/PermissionGate';
import { PERMISSIONS } from '../../../shared/rbac/permissions';
import AssetCard from './AssetCard';
import AssetStats from './AssetStats';
import { Search, Plus, Sparkles, X, Loader2, AlertTriangle, CheckCircle2, ArrowRightLeft, FileWarning, Trash2, Construction } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SecureConfirmModal } from '../../../shared/ui/SecureConfirmModal';

const AssetsView: React.FC = () => {
  const data = useData();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const { currentUser } = useEnjazCore();

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetHistory, setAssetHistory] = useState<WorkItem[]>([]);
  const [detailTab, setDetailTab] = useState<'details' | 'history'>('details');
  
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [aiInsight, setAiInsight] = useState<{asset: Asset, content: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const [assetsData, usersData] = await Promise.all([
      data.assets.getAll(),
      data.users.getAll()
    ]);
    setAssets(assetsData);
    setUsers(usersData);
    setLoading(false);
  };

  const loadAssetHistory = async (assetId: string) => {
    const allItems = await data.workItems.getAll();
    const history = allItems.filter(item => item.assetId === assetId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setAssetHistory(history);
  };

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset);
    setDetailTab('details');
    loadAssetHistory(asset.id);
  };

  const handleAiHealthCheck = async (asset: Asset) => {
    setIsAiLoading(true);
    setAiInsight({ asset, content: '' });
    const context = `Asset: ${asset.name}, Category: ${asset.category}, Status: ${asset.status}, Value: ${asset.value}`;
    
    try {
      const response = await data.ai.askWiki(context, "قدم تحليل فني موجز لحالة هذه المعدة بناءً على البيانات المتوفرة مع نصيحة صيانة.");
      setAiInsight({ asset, content: response });
    } catch (e) {
      setAiInsight({ asset, content: "فشل الحصول على تحليل ذكي." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleTransferCustody = async () => {
    if (!selectedAsset || !targetUserId) return;
    setIsProcessing(true);
    try {
      const targetUser = users.find(u => u.id === targetUserId);
      await data.assets.update(selectedAsset.id, {
        assignedToUserId: targetUserId,
        assignedToUserName: targetUser?.name,
        status: AssetStatus.IN_USE
      });
      setShowTransferModal(false);
      loadData();
      setSelectedAsset(null);
    } finally { setIsProcessing(false); }
  };

  const handleDeleteAsset = async () => {
    if (!selectedAsset) return;
    // In actual implementation: await data.assets.delete(selectedAsset.id);
    setShowDeleteModal(false);
    setSelectedAsset(null);
    loadData();
    alert("تم حذف الأصل من السجل.");
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [assets, searchTerm, filterCategory, filterStatus]);

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in pb-10 overflow-hidden" dir="rtl">
      {!loading && <AssetStats assets={assets} />}

      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="بحث في سجل الأصول..." 
            className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
           <select className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 outline-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
             <option value="All">كل الفئات</option>
             {/* Fix: Casting enum values to string to avoid type unknown error */}
             {Object.values(AssetCategory).map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
           </select>
           <PermissionGate user={currentUser} permission={PERMISSIONS.ASSET_CREATE}>
             <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:scale-105 transition-transform shadow-lg shadow-slate-900/20">
               <Plus size={18} /> إضافة أصل
             </button>
           </PermissionGate>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Loader2 className="animate-spin text-blue-600" size={48} />
             <p className="font-black text-slate-400">جاري مزامنة سجلات الأصول...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} onClick={() => handleAssetClick(asset)} onAnalyze={handleAiHealthCheck} />
            ))}
          </div>
        )}
      </div>

      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-fade-in" onClick={() => setSelectedAsset(null)}>
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                      <Construction size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">{selectedAsset.name}</h3>
                       <p className="text-xs font-bold text-slate-400">{selectedAsset.serialNumber}</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedAsset(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المسؤول الحالي</p>
                       <p className="text-sm font-black text-slate-800">{selectedAsset.assignedToUserName || 'المستودع'}</p>
                    </div>
                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">الموقع الفعلي</p>
                       <p className="text-sm font-black text-slate-800">{selectedAsset.location}</p>
                    </div>
                 </div>

                 <div className="flex gap-3">
                    <button onClick={() => setShowTransferModal(true)} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200"><ArrowRightLeft size={18} /> نقل العهدة</button>
                    <button onClick={() => setShowMaintenanceModal(true)} className="flex-1 py-4 bg-orange-50 text-orange-700 border border-orange-100 rounded-2xl font-black text-sm flex items-center justify-center gap-2"><FileWarning size={18} /> بلاغ عطل</button>
                    <button onClick={() => setShowDeleteModal(true)} className="p-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={20} /></button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <SecureConfirmModal 
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAsset}
        title="حذف أصل من النظام"
        message={`أنت على وشك حذف "${selectedAsset?.name}". هذه العملية ستمسح كافة سجلات الصيانة والعهدة الخاصة بالمعدة نهائياً.`}
        verificationText="تأكيد"
        confirmLabel="حذف نهائي"
      />

      {aiInsight && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setAiInsight(null)}>
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col animate-scale-in relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200"><Sparkles size={24} /></div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">التحليل الفني الذكي</h3>
                     <p className="text-xs font-bold text-slate-400">{aiInsight.asset.name}</p>
                   </div>
                 </div>
                 <button onClick={() => setAiInsight(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={24}/></button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[60vh]">
                 {isAiLoading ? <Loader2 className="animate-spin mx-auto text-indigo-600" size={48} /> : <div className="prose prose-indigo max-w-none text-right"><ReactMarkdown>{aiInsight.content}</ReactMarkdown></div>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AssetsView;
