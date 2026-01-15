
import React from 'react';
import { WorkItem, ApprovalDecision, Priority, User } from '../../../types';
import { Clock, User as UserIcon, Building2, ChevronRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ApprovalDecisionCardProps {
  item: WorkItem;
  currentUserId: string;
  onClick: (item: WorkItem) => void;
}

const ApprovalDecisionCard: React.FC<ApprovalDecisionCardProps> = ({ item, currentUserId, onClick }) => {
  const myStep = item.approvalChain?.find(s => s.approverId === currentUserId);
  const isPending = myStep?.decision === ApprovalDecision.PENDING;
  
  // Calculate how many days ago it was created
  const createdDate = new Date(item.createdAt);
  const diffTime = Math.abs(new Date().getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getPriorityBadge = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-red-100 text-red-700 border-red-200';
      case Priority.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div 
      onClick={() => onClick(item)}
      className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
    >
      {isPending && diffDays > 3 && (
        <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 animate-pulse">
          <AlertCircle size={10} /> Delayed Request
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${isPending ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
            <Building2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.id}</span>
            <h4 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.title}</h4>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityBadge(item.priority)}`}>
          {item.priority}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <UserIcon size={14} className="text-slate-300" />
          <span className="truncate">Requester: <b className="text-slate-700">{item.creatorId === 'ANONYMOUS' ? 'Confidential' : 'Site Office'}</b></span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock size={14} className="text-slate-300" />
          <span>Waiting for: <b className={diffDays > 3 ? 'text-red-600' : 'text-slate-700'}>{diffDays} Days</b></span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex -space-x-2">
           {/* Visual representation of other approvers */}
           {item.approvalChain?.map((step, idx) => (
             <div 
               key={idx} 
               title={`${step.role}: ${step.decision}`}
               className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white
                 ${step.decision === ApprovalDecision.APPROVED ? 'bg-green-500' : 
                   step.decision === ApprovalDecision.REJECTED ? 'bg-red-500' : 'bg-slate-300'}`}
             >
               {step.role.charAt(0)}
             </div>
           ))}
        </div>
        
        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs group-hover:translate-x-1 transition-transform">
          {isPending ? 'Review & Decide' : 'View Details'} <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

export default ApprovalDecisionCard;
