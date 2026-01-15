import React, { useState } from 'react';
import { ApprovalStep, ApprovalDecision, Status, WorkItem } from '../../../types';
import { ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';

interface ApprovalChainProps {
  item: WorkItem;
  currentUserID: string | undefined;
  onDecision: (stepId: string, decision: ApprovalDecision, comment: string) => Promise<void>;
  isSubmitting: boolean;
}

const ApprovalChain: React.FC<ApprovalChainProps> = ({ item, currentUserID, onDecision, isSubmitting }) => {
  const [approvalComment, setApprovalComment] = useState('');

  if (!item.approvalChain || item.approvalChain.length === 0) return null;

  const handleApprove = (stepId: string) => onDecision(stepId, ApprovalDecision.APPROVED, approvalComment);
  const handleReject = (stepId: string) => onDecision(stepId, ApprovalDecision.REJECTED, approvalComment);

  return (
    <div className="border border-indigo-100 rounded-xl overflow-hidden mb-6">
      <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center gap-2">
        <ShieldCheck className="text-indigo-600" size={20} />
        <h3 className="font-bold text-indigo-900">Approval Workflow</h3>
      </div>
      <div className="p-4 bg-white space-y-4">
        {item.approvalChain.map((step) => {
          const isPendingMe = step.decision === ApprovalDecision.PENDING && 
                              currentUserID === step.approverId && 
                              item.status !== Status.REJECTED;
          
          return (
            <div key={step.id} className="relative pl-6 pb-2 last:pb-0 border-l-2 border-slate-100 last:border-0">
              <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center
                  ${step.decision === ApprovalDecision.APPROVED ? 'border-green-500 text-green-500' : 
                    step.decision === ApprovalDecision.REJECTED ? 'border-red-500 text-red-500' : 'border-slate-300 text-slate-300'}`}>
                  <div className={`w-2 h-2 rounded-full ${
                    step.decision === ApprovalDecision.APPROVED ? 'bg-green-500' : 
                    step.decision === ApprovalDecision.REJECTED ? 'bg-red-500' : 'bg-slate-300'
                  }`}></div>
              </div>

              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{step.role}</p>
                  <p className="text-xs text-slate-500">{step.approverName}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded capitalize
                    ${step.decision === ApprovalDecision.APPROVED ? 'bg-green-100 text-green-700' : 
                      step.decision === ApprovalDecision.REJECTED ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {step.decision}
                  </span>
                  {step.decisionDate && <p className="text-[10px] text-slate-400 mt-1">{new Date(step.decisionDate).toLocaleDateString()}</p>}
                </div>
              </div>

              {step.comments && (
                <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 italic border border-slate-100 mb-2">
                  "{step.comments}"
                </div>
              )}

              {/* Action Area for Current Approver */}
              {isPendingMe && (
                  <div className="mt-3 bg-indigo-50 p-4 rounded-lg border border-indigo-100 animate-pulse-soft">
                    <p className="text-xs font-bold text-indigo-800 mb-2">Action Required</p>
                    <textarea 
                      className="w-full p-2 border border-indigo-200 rounded text-sm mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Add a comment or reason..."
                      value={approvalComment}
                      onChange={(e) => setApprovalComment(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(step.id)}
                        disabled={isSubmitting}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} /> Approve
                      </button>
                      <button 
                        onClick={() => handleReject(step.id)}
                        disabled={isSubmitting}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </div>
                  </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ApprovalChain;
