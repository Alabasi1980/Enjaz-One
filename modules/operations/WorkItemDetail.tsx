
import React, { useState, useEffect } from 'react';
import { WorkItem, Priority, Status, Project, User, ApprovalDecision, Comment, Subtask } from '../../types';
import { workItemsRepo } from '../../services/workItemsRepo';
import { X, Clock, User as UserIcon, MapPin, EyeOff, Lock, RefreshCcw, Briefcase } from 'lucide-react';

// Sub-components
import ApprovalChain from './components/ApprovalChain';
import SubtaskList from './components/SubtaskList';
import CommentSection from './components/CommentSection';
import AiAnalysisCard from './components/AiAnalysisCard';

interface WorkItemDetailProps {
  item: WorkItem;
  project?: Project;
  assignee?: User;
  currentUser?: User | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: Status) => void;
  onRefresh: () => void;
}

const WorkItemDetail: React.FC<WorkItemDetailProps> = ({ item, project, assignee, currentUser, onClose, onUpdateStatus, onRefresh }) => {
  const [submitting, setSubmitting] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>(item.subtasks || []);
  
  const isAnonymous = item.creatorId === 'ANONYMOUS' || item.tags?.includes('Anonymous');

  useEffect(() => {
    setSubtasks(item.subtasks || []);
  }, [item.id, item.subtasks]);

  const handleApprovalDecision = async (stepId: string, decision: ApprovalDecision, comment: string) => {
    if(!comment && decision === ApprovalDecision.REJECTED) {
      alert("يرجى ذكر سبب الرفض في التعليقات لضمان توثيق الحالة.");
      return;
    }
    setSubmitting(true);
    try {
      await workItemsRepo.submitApprovalDecision(item.id, stepId, decision, comment);
      onRefresh(); 
      onClose(); 
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء معالجة الطلب.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    if (!item.approvalChain) return;
    setSubmitting(true);
    try {
       const resetChain = item.approvalChain.map(step => ({
           ...step,
           decision: ApprovalDecision.PENDING,
           comments: '',
           decisionDate: undefined
       }));
       await workItemsRepo.update(item.id, {
           status: Status.PENDING_APPROVAL,
           approvalChain: resetChain
       });
       onRefresh();
       onClose();
    } catch(e) { console.error(e); } finally { setSubmitting(false); }
  };

  const handlePostComment = async (text: string) => {
    if (!currentUser) return;
    const comment: Comment = {
      id: `c-${Date.now()}`,
      text,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      timestamp: new Date().toISOString()
    };
    await workItemsRepo.addComment(item.id, comment);
    onRefresh();
  };

  const handleUpdateSubtasks = async (newSubtasks: Subtask[]) => {
    setSubtasks(newSubtasks);
    await workItemsRepo.update(item.id, { subtasks: newSubtasks });
    onRefresh();
  };

  const getPriorityColor = (p: Priority) => {
    switch(p) {
      case Priority.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
      case Priority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
      case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/60 backdrop-blur-sm transition-all" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50 shrink-0">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest">{item.id}</span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-white border border-slate-200 text-slate-500">
                {item.type}
              </span>
              {isAnonymous && (
                 <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-slate-900 text-white flex items-center gap-1 uppercase tracking-widest shadow-sm">
                   <EyeOff size={10} /> Confidential
                 </span>
              )}
            </div>
            <h2 className="text-3xl font-black text-slate-900 leading-tight">{item.title}</h2>
          </div>
          <button onClick={onClose} className="p-2.5 bg-white hover:bg-slate-100 rounded-2xl text-slate-400 shadow-sm transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
          
          {/* Main Status Actions */}
          <div className="flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Current Status</p>
              <p className={`text-xl font-black ${item.status === Status.REJECTED ? 'text-rose-600' : 'text-blue-600'}`}>
                {item.status}
              </p>
            </div>
            
            <div className="flex gap-2">
              {item.status === Status.REJECTED && (
                  <button 
                    onClick={handleResubmit}
                    disabled={submitting}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-2xl shadow-lg transition-all flex items-center gap-2"
                  >
                    <RefreshCcw size={16} /> Resubmit
                  </button>
              )}

              {(!item.approvalChain || item.approvalChain.length === 0) && item.status !== Status.DONE && item.status !== Status.REJECTED && (
                 <button 
                    onClick={() => onUpdateStatus(item.id, Status.DONE)}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-200 transition-all"
                  >
                    Mark as Resolved
                  </button>
              )}
            </div>
          </div>

          {/* Workflow Visualization */}
          <ApprovalChain 
            item={item} 
            currentUserID={currentUser?.id} 
            onDecision={handleApprovalDecision} 
            isSubmitting={submitting} 
          />

          {/* Description & Core Fields */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600"><Briefcase size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Project</p>
                  <p className="text-sm font-black text-slate-800 truncate max-w-[150px]">{project?.name || 'Global HQ'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600"><UserIcon size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Assignee</p>
                  <p className="text-sm font-black text-slate-800">{assignee?.name || 'Unassigned'}</p>
                </div>
              </div>
            </div>

            {isAnonymous && (
              <div className="bg-slate-900 p-5 rounded-[1.5rem] border border-slate-800 flex items-center gap-4 text-white shadow-xl shadow-slate-200">
                 <div className="p-2 bg-slate-800 rounded-lg text-amber-500"><Lock size={20} /></div>
                 <p className="text-xs font-bold leading-relaxed">
                   Identity Protected: This report was submitted through the confidential channel. The author's name is only visible to senior HR management.
                 </p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Description & Findings</h3>
              <p className="text-slate-600 leading-relaxed font-bold bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm whitespace-pre-wrap">
                {item.description}
              </p>
            </div>
          </div>

          <SubtaskList 
            subtasks={subtasks}
            onAdd={(title) => handleUpdateSubtasks([...subtasks, { id: `st-${Date.now()}`, title, isCompleted: false }])}
            onToggle={(id) => handleUpdateSubtasks(subtasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))}
            onDelete={(id) => handleUpdateSubtasks(subtasks.filter(t => t.id !== id))}
          />

          <CommentSection 
            comments={item.comments} 
            currentUser={currentUser || null} 
            onPostComment={handlePostComment} 
          />

          <AiAnalysisCard item={item} />
        </div>
      </div>
    </div>
  );
};

export default WorkItemDetail;
