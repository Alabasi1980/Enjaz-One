
import React, { useState, useMemo } from 'react';
import { WorkItem, ApprovalDecision, User } from '../../types';
import { ClipboardCheck, History, Inbox, Search, SlidersHorizontal, CheckCircle2, Clock } from 'lucide-react';
import ApprovalDecisionCard from './components/ApprovalDecisionCard';

interface ApprovalsViewProps {
  items: WorkItem[];
  currentUser: User | null;
  onItemClick: (item: WorkItem) => void;
}

const ApprovalsView: React.FC<ApprovalsViewProps> = ({ items, currentUser, onItemClick }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    if (!currentUser) return [];

    // Filter by User in Chain
    const myApprovals = items.filter(i => 
      i.approvalChain?.some(step => step.approverId === currentUser.id)
    );

    // Split into Pending and History
    const result = myApprovals.filter(item => {
      const myStep = item.approvalChain?.find(s => s.approverId === currentUser.id);
      const isDecisionPending = myStep?.decision === ApprovalDecision.PENDING;
      
      // If pending tab, show only pending. If history, show anything I've decided.
      const matchesTab = activeTab === 'pending' ? isDecisionPending : !isDecisionPending;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesTab && matchesSearch;
    });

    return result;
  }, [items, currentUser, activeTab, searchTerm]);

  const pendingCount = items.filter(i => 
    i.approvalChain?.some(s => s.approverId === currentUser?.id && s.decision === ApprovalDecision.PENDING)
  ).length;

  return (
    <div className="space-y-6 animate-fade-in pb-10 h-full flex flex-col">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
             <ClipboardCheck className="text-indigo-600" /> Approval Center
          </h2>
          <p className="text-slate-500 text-sm">Review and authorize site requests and operations.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                 <Clock size={16} />
              </div>
              <div>
                 <p className="text-lg font-bold text-slate-800 leading-none">{pendingCount}</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Me</p>
              </div>
           </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex w-full md:w-fit">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Inbox size={18} /> Needs Action
          {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full ml-1">{pendingCount}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex-1 md:flex-none flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <History size={18} /> My Decision History
        </button>
      </div>

      {/* Toolbar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search requests by name or ID..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Requests Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
        {filteredData.length === 0 ? (
          <div className="h-64 bg-slate-100/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-3">
             <div className="p-4 bg-white rounded-full shadow-sm">
                {activeTab === 'pending' ? <CheckCircle2 size={40} className="text-green-500" /> : <Inbox size={40} />}
             </div>
             <p className="font-bold">{activeTab === 'pending' ? 'All caught up!' : 'No decision history found.'}</p>
             <p className="text-xs">No {activeTab} requests to display at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredData.map(item => (
              <ApprovalDecisionCard 
                key={item.id} 
                item={item} 
                currentUserId={currentUser?.id || ''} 
                onClick={onItemClick} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalsView;
