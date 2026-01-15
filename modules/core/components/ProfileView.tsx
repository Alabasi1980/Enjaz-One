
import React, { useEffect, useState } from 'react';
import { User, Asset, Status, WorkItem } from '../../../types';
import { assetsRepo } from '../../../services/assetsRepo';
import { workItemsRepo } from '../../../services/workItemsRepo';
import { 
  Box, CheckSquare, Clock, MapPin, Phone, Mail, 
  Shield, Calendar, Zap, TrendingUp, 
  Award, ChevronRight, Activity, Settings
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onNavigate: (view: any) => void;
  onItemClick: (item: WorkItem) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onNavigate, onItemClick }) => {
  const [myAssets, setMyAssets] = useState<Asset[]>([]);
  const [recentActions, setRecentActions] = useState<WorkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    completedTasks: 0,
    openTasks: 0,
    pendingApprovals: 0,
    efficiencyScore: 85
  });

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      try {
        const [allAssets, allItems] = await Promise.all([
          assetsRepo.getAll(),
          workItemsRepo.getAll()
        ]);

        const mine = allAssets.filter(a => a.assignedToUserId === user.id);
        setMyAssets(mine);

        const myItems = allItems.filter(i => i.assigneeId === user.id);
        const latest = [...allItems]
          .filter(i => i.assigneeId === user.id || i.creatorId === user.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        
        setRecentActions(latest);

        setStats({
          completedTasks: myItems.filter(i => i.status === Status.DONE || i.status === Status.APPROVED).length,
          openTasks: myItems.filter(i => i.status === Status.OPEN || i.status === Status.IN_PROGRESS).length,
          pendingApprovals: allItems.filter(i => 
            i.approvalChain?.some(step => step.approverId === user.id && step.decision === 'Pending')
          ).length,
          efficiencyScore: myItems.length > 0 ? Math.round((myItems.filter(i => i.status === Status.DONE).length / myItems.length) * 100) : 100
        });
      } catch (err) {
        console.error("Failed to load profile details", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 lg:p-8 space-y-8 overflow-y-auto no-scrollbar">
      {/* 1. Hero Profile Header */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900"></div>
        <div className="px-8 pb-8 flex flex-col md:flex-row items-end gap-6 -mt-12">
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full shadow-lg" title="Online"></div>
          </div>
          
          <div className="flex-1 space-y-1 mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900">{user.name}</h1>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100 flex items-center gap-1">
                <Award size={12} /> Elite Personnel
              </span>
            </div>
            <p className="text-slate-500 font-medium text-lg">{user.role} • {user.department}</p>
          </div>

          <div className="flex gap-2 mb-2">
            <button 
              onClick={() => onNavigate('settings')}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/20 hover:scale-105 transition-transform flex items-center gap-2"
            >
              <Settings size={16} /> Edit Settings
            </button>
          </div>
        </div>

        <div className="px-8 py-6 border-t border-slate-50 flex flex-wrap gap-6 text-sm text-slate-500 bg-slate-50/50">
          <div className="flex items-center gap-2"><Mail size={16} className="text-slate-400" /> {user.email}</div>
          <div className="flex items-center gap-2"><Phone size={16} className="text-slate-400" /> {user.phone}</div>
          <div className="flex items-center gap-2"><Calendar size={16} className="text-slate-400" /> Joined {user.joinDate}</div>
          <div className="flex items-center gap-2"><MapPin size={16} className="text-slate-400" /> Site HQ, Zone A</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPIBox icon={<Zap className="text-amber-500" />} label="Efficiency" value={`${stats.efficiencyScore}%`} sub="Vs Team Average" color="bg-amber-50" />
            <KPIBox icon={<CheckSquare className="text-emerald-500" />} label="Resolved" value={stats.completedTasks} sub="Tasks Closed" color="bg-emerald-50" />
            <KPIBox icon={<Clock className="text-blue-500" />} label="Active" value={stats.openTasks} sub="In Progress" color="bg-blue-50" />
            <KPIBox icon={<Shield className="text-purple-500" />} label="Authority" value={stats.pendingApprovals} sub="Pending Dec." color="bg-purple-50" />
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="text-blue-600" /> Recent Contributions
            </h3>
            <div className="space-y-4">
              {recentActions.map(action => (
                <div 
                  key={action.id} 
                  onClick={() => onItemClick(action)}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{action.title}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{action.id} • {action.status}</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                </div>
              ))}
              {recentActions.length === 0 && (
                <p className="text-center py-10 text-slate-400 text-sm">No recent activity found.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Box className="text-blue-600" /> My Custody
              </h3>
              <span className="px-2.5 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg">{myAssets.length}</span>
            </div>

            <div className="flex-1 space-y-4">
              {myAssets.map(asset => (
                <div key={asset.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 relative group overflow-hidden">
                  <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">{asset.category}</p>
                  <h4 className="font-bold text-slate-800 text-sm truncate">{asset.name}</h4>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{asset.serialNumber}</span>
                    <button 
                      onClick={() => onNavigate('field-ops')}
                      className="text-[10px] font-bold text-red-600 hover:underline"
                    >
                      Report Fault
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => onNavigate('field-ops')}
              className="w-full py-3 mt-6 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
            >
              <Award size={14} /> Request Equipment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPIBox = ({ icon, label, value, sub, color }: any) => (
  <div className={`p-5 rounded-3xl border border-slate-100 shadow-sm ${color} transition-transform hover:scale-105`}>
    <div className="p-2.5 bg-white rounded-xl w-fit shadow-sm mb-4">{icon}</div>
    <p className="text-2xl font-black text-slate-900">{value}</p>
    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    <p className="text-[9px] text-slate-400 mt-0.5">{sub}</p>
  </div>
);

export default ProfileView;
