import React, { useState, useEffect } from 'react';
import { Asset, AssetStatus, AssetCategory, WorkItem, WorkItemType, Priority, Status, User } from '../types';
import { assetsRepo } from '../services/assetsRepo';
import { workItemsRepo } from '../services/workItemsRepo';
import { usersRepo } from '../services/usersRepo';
import { Search, Filter, Truck, Monitor, Wrench, PenTool, Box, AlertTriangle, CheckCircle2, User as UserIcon, Calendar, MapPin, X, History, ArrowRightLeft, FileWarning } from 'lucide-react';

const AssetsView: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  
  // Selection & Modal States
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetHistory, setAssetHistory] = useState<WorkItem[]>([]);
  const [detailTab, setDetailTab] = useState<'details' | 'history'>('details');
  
  // Action States
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [targetUserId, setTargetUserId] = useState('');
  const [maintenanceNote, setMaintenanceNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [assetsData, usersData] = await Promise.all([
      assetsRepo.getAll(),
      usersRepo.getAll()
    ]);
    setAssets(assetsData);
    setUsers(usersData);
    setLoading(false);
  };

  const loadAssetHistory = async (assetId: string) => {
    const allItems = await workItemsRepo.getAll();
    // Filter items related to this asset (Custody or Incidents linked to asset)
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

  const handleTransferCustody = async () => {
    if (!selectedAsset || !targetUserId) return;
    setIsProcessing(true);
    try {
      const targetUser = users.find(u => u.id === targetUserId);
      
      // 1. Update Asset
      await assetsRepo.update(selectedAsset.id, {
        assignedToUserId: targetUserId,
        assignedToUserName: targetUser?.name,
        status: AssetStatus.IN_USE,
        location: 'With Employee' 
      });

      // 2. Create Custody Work Item (Audit Trail)
      await workItemsRepo.create({
        type: WorkItemType.CUSTODY,
        title: `Custody Transfer: ${selectedAsset.name}`,
        description: `Asset transferred from ${selectedAsset.assignedToUserName || 'Storage'} to ${targetUser?.name}`,
        priority: Priority.LOW,
        status: Status.DONE, // Auto-completed record
        assetId: selectedAsset.id,
        employeeId: targetUserId,
        projectId: 'General' // Or derive from user
      });

      alert("Custody transferred successfully.");
      setShowTransferModal(false);
      setTargetUserId('');
      loadData(); // Refresh list
      setSelectedAsset(null); // Close modal
    } catch (error) {
      console.error(error);
      alert("Failed to transfer custody.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReportMaintenance = async () => {
    if (!selectedAsset || !maintenanceNote) return;
    setIsProcessing(true);
    try {
      // 1. Update Asset Status
      await assetsRepo.update(selectedAsset.id, {
        status: AssetStatus.MAINTENANCE
      });

      // 2. Create Incident Ticket
      await workItemsRepo.create({
        type: WorkItemType.INCIDENT,
        title: `Maintenance: ${selectedAsset.name}`,
        description: maintenanceNote,
        priority: Priority.HIGH,
        status: Status.OPEN,
        assetId: selectedAsset.id,
        tags: ['Maintenance', selectedAsset.category],
        projectId: 'General'
      });

      alert("Maintenance ticket created.");
      setShowMaintenanceModal(false);
      setMaintenanceNote('');
      loadData();
      setSelectedAsset(null);
    } catch (error) {
      console.error(error);
      alert("Failed to report issue.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case AssetCategory.HEAVY_EQUIPMENT: return <Truck size={20} className="text-orange-600" />;
      case AssetCategory.IT: return <Monitor size={20} className="text-blue-600" />;
      case AssetCategory.VEHICLE: return <Truck size={20} className="text-green-600" />;
      case AssetCategory.TOOLS: return <Wrench size={20} className="text-slate-600" />;
      case AssetCategory.FURNITURE: return <Box size={20} className="text-purple-600" />;
      default: return <Box size={20} />;
    }
  };

  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.AVAILABLE: return 'bg-green-100 text-green-700 border-green-200';
      case AssetStatus.IN_USE: return 'bg-blue-100 text-blue-700 border-blue-200';
      case AssetStatus.MAINTENANCE: return 'bg-orange-100 text-orange-700 border-orange-200';
      case AssetStatus.RETIRED: return 'bg-slate-100 text-slate-700 border-slate-200';
      case AssetStatus.LOST: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <Box className="text-blue-600" />
             Asset Registry
           </h2>
           <p className="text-slate-500 text-sm mt-1">Track equipment, vehicles, and IT assets.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
           + Register Asset
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, serial number..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <select 
             className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
           >
             <option value="All">All Categories</option>
             {Object.values(AssetCategory).map(c => <option key={c} value={c}>{c}</option>)}
           </select>

           <select 
             className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="All">All Statuses</option>
             {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
           </select>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
           <div className="text-center py-20 text-slate-400">Loading assets...</div>
        ) : filteredAssets.length === 0 ? (
           <div className="text-center py-20 text-slate-400">No assets found.</div>
        ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAssets.map(asset => (
                 <div 
                   key={asset.id} 
                   onClick={() => handleAssetClick(asset)}
                   className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all cursor-pointer group"
                 >
                    <div className="flex justify-between items-start mb-3">
                       <div className="p-2 bg-slate-50 rounded-lg">{getCategoryIcon(asset.category)}</div>
                       <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${getStatusColor(asset.status)}`}>
                         {asset.status}
                       </span>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 truncate mb-1">{asset.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mb-4">{asset.serialNumber}</p>

                    <div className="space-y-2 text-xs text-slate-500">
                       <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span className="truncate">{asset.location}</span>
                       </div>
                       {asset.assignedToUserName && (
                         <div className="flex items-center gap-2">
                            <UserIcon size={14} />
                            <span className="truncate">Custody: {asset.assignedToUserName}</span>
                         </div>
                       )}
                       {asset.lastMaintenance && (
                         <div className="flex items-center gap-2 text-orange-600">
                            <Wrench size={14} />
                            <span>Last Maint: {asset.lastMaintenance}</span>
                         </div>
                       )}
                    </div>
                 </div>
              ))}
           </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setSelectedAsset(null)}>
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   {getCategoryIcon(selectedAsset.category)} {selectedAsset.name}
                 </h3>
                 <button onClick={() => setSelectedAsset(null)} className="p-1 hover:bg-slate-200 rounded-full"><X size={20} /></button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-100">
                 <button 
                   onClick={() => setDetailTab('details')}
                   className={`flex-1 py-3 text-sm font-medium ${detailTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                 >
                   Overview
                 </button>
                 <button 
                   onClick={() => setDetailTab('history')}
                   className={`flex-1 py-3 text-sm font-medium ${detailTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
                 >
                   History & Timeline
                 </button>
              </div>
              
              <div className="p-6 h-[400px] overflow-y-auto">
                 {detailTab === 'details' ? (
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold">Serial Number</p>
                            <p className="font-mono font-medium text-slate-800">{selectedAsset.serialNumber}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-400 uppercase font-bold">Current Value</p>
                            <p className="font-mono font-medium text-slate-800">${selectedAsset.value.toLocaleString()}</p>
                          </div>
                      </div>

                      <div>
                          <h4 className="text-sm font-bold text-slate-800 mb-2 border-b border-slate-100 pb-1">Custody & Location</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 text-xs">Assigned To</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {selectedAsset.assignedToUserName ? selectedAsset.assignedToUserName.charAt(0) : '-'}
                                  </div>
                                  <p className="font-medium">{selectedAsset.assignedToUserName || 'Unassigned (In Store)'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">Current Location</p>
                                <p className="font-medium mt-1">{selectedAsset.location}</p>
                            </div>
                          </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                          <button 
                            onClick={() => setShowTransferModal(true)}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex items-center justify-center gap-2"
                          >
                            <ArrowRightLeft size={16} /> Transfer Custody
                          </button>
                          <button 
                             onClick={() => setShowMaintenanceModal(true)}
                             className="flex-1 py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-bold hover:bg-orange-100 flex items-center justify-center gap-2"
                          >
                            <FileWarning size={16} /> Report Issue
                          </button>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {assetHistory.length === 0 ? (
                       <div className="text-center py-10 text-slate-400 text-sm">No history records found for this asset.</div>
                     ) : (
                       assetHistory.map(item => (
                         <div key={item.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                               <div className={`w-2 h-2 rounded-full mt-2 ${item.type === WorkItemType.INCIDENT ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                               <div className="w-px h-full bg-slate-100 my-1"></div>
                            </div>
                            <div className="pb-4">
                               <p className="text-xs text-slate-400">{item.createdAt}</p>
                               <p className="font-semibold text-slate-800 text-sm">{item.title}</p>
                               <p className="text-xs text-slate-500">{item.description}</p>
                               <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{item.type}</span>
                            </div>
                         </div>
                       ))
                     )}
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
             <h3 className="font-bold text-lg mb-4">Transfer Custody</h3>
             <p className="text-sm text-slate-500 mb-4">Select the employee to take responsibility for <strong>{selectedAsset?.name}</strong>.</p>
             
             <div className="mb-4">
               <label className="block text-xs font-bold text-slate-700 mb-1">New Custodian</label>
               <select 
                 className="w-full p-2 border border-slate-200 rounded-lg"
                 value={targetUserId}
                 onChange={(e) => setTargetUserId(e.target.value)}
               >
                 <option value="">Select Employee...</option>
                 {users.map(u => (
                   <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                 ))}
               </select>
             </div>

             <div className="flex justify-end gap-2">
               <button onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm">Cancel</button>
               <button 
                 onClick={handleTransferCustody}
                 disabled={!targetUserId || isProcessing}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50"
               >
                 {isProcessing ? 'Processing...' : 'Confirm Transfer'}
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-scale-in">
             <h3 className="font-bold text-lg mb-4 text-orange-700 flex items-center gap-2">
               <AlertTriangle size={20} /> Report Issue
             </h3>
             <p className="text-sm text-slate-500 mb-4">This will mark the asset as <strong>Under Maintenance</strong> and create a high priority ticket.</p>
             
             <div className="mb-4">
               <label className="block text-xs font-bold text-slate-700 mb-1">Issue Description</label>
               <textarea 
                 className="w-full p-2 border border-slate-200 rounded-lg h-24 text-sm"
                 placeholder="Describe the breakdown or damage..."
                 value={maintenanceNote}
                 onChange={(e) => setMaintenanceNote(e.target.value)}
               />
             </div>

             <div className="flex justify-end gap-2">
               <button onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm">Cancel</button>
               <button 
                 onClick={handleReportMaintenance}
                 disabled={!maintenanceNote || isProcessing}
                 className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 disabled:opacity-50"
               >
                 {isProcessing ? 'Reporting...' : 'Submit Report'}
               </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssetsView;
