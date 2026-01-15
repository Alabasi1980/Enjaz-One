import React, { useEffect, useState } from 'react';
import { User, Asset, WorkItem, Status } from '../types';
import { assetsRepo } from '../services/assetsRepo';
import { workItemsRepo } from '../services/workItemsRepo';
import { UserCircle, Box, CheckSquare, Clock, MapPin, Phone, Mail, Shield, AlertCircle } from 'lucide-react';

interface ProfileViewProps {
  user: User;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState({
    completedTasks: 0,
    openTasks: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    loadProfileData();
  }, [user.id]);

  const loadProfileData = async () => {
    // Load Assets
    const allAssets = await assetsRepo.getAll();
    const mine = allAssets.filter(a => a.assignedToUserId === user.id);
    setMyAssets(mine);

    // Load Stats
    const allItems = await workItemsRepo.getAll();
    const myItems = allItems.filter(i => i.assigneeId === user.id);
    
    setStats({
      completedTasks: myItems.filter(i => i.status === Status.DONE).length,
      openTasks: myItems.filter(i => i.status === Status.OPEN || i.status === Status.IN_PROGRESS).length,
      pendingApprovals: allItems.filter(i => 
        i.approvalChain?.some(step => step.approverId === user.id && step.decision === 'Pending')
      ).length
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 space-y-6 overflow-y-auto">
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
         
         <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-slate-200">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 text-center">
               <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
               <p className="text-slate-500 font-medium">{user.role}</p>
               <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                 Active Employee
               </span>
            </div>
         </div>

         <div className="relative z-10 flex-1 pt-4 md:pt-16 w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                   <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                      <CheckSquare size={24} />
                   </div>
                   <div>
                      <p className="text-2xl font-bold text-slate-800">{stats.completedTasks}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">Tasks Completed</p>
                   </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                   <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                      <Clock size={24} />
                   </div>
                   <div>
                      <p className="text-2xl font-bold text-slate-800">{stats.openTasks}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">Active Tasks</p>
                   </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                   <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                      <Shield size={24} />
                   </div>
                   <div>
                      <p className="text-2xl font-bold text-slate-800">{stats.pendingApprovals}</p>
                      <p className="text-xs text-slate-500 font-bold uppercase">Pending Approvals</p>
                   </div>
                </div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row gap-6 text-sm text-slate-500 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                   <Mail size={16} /> <span>{user.name.split(' ')[0].toLowerCase()}@enjaz-one.com</span>
                </div>
                <div className="flex items-center gap-2">
                   <Phone size={16} /> <span>+966 5X XXX XXXX</span>
                </div>
                <div className="flex items-center gap-2">
                   <MapPin size={16} /> <span>Riyadh HQ, Floor 4</span>
                </div>
            </div>
         </div>
      </div>

      {/* My Custody Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
         <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
             <Box className="text-blue-600" />
             My Custody (Assets in my possession)
           </h3>
           <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
             {myAssets.length} Items
           </span>
         </div>

         {myAssets.length === 0 ? (
           <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
             <Box size={48} className="mx-auto text-slate-300 mb-4" />
             <p className="text-slate-500 font-medium">You have no assets assigned to you.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myAssets.map(asset => (
                <div key={asset.id} className="border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition-colors bg-slate-50/50">
                   <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-bold uppercase bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                        {asset.category}
                      </span>
                      <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                   </div>
                   <h4 className="font-bold text-slate-800 mb-1">{asset.name}</h4>
                   <p className="text-xs font-mono text-slate-500 mb-4">{asset.serialNumber}</p>
                   
                   <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600">
                        View Details
                      </button>
                      <button className="px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-red-600 hover:bg-red-100" title="Report Issue">
                        <AlertCircle size={16} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
         )}
      </div>

    </div>
  );
};

export default ProfileView;
