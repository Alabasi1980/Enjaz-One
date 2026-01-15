import React, { useState, useRef, useEffect } from 'react';
import { WorkItem, Priority, Status, Project, User, WorkItemType, ApprovalDecision, Comment, Subtask } from '../types';
import { analyzeWorkItem } from '../services/geminiService';
import { workItemsRepo } from '../services/workItemsRepo';
import { Sparkles, X, Check, Clock, User as UserIcon, MapPin, Tag, Briefcase, Building, ShieldCheck, CheckCircle2, XCircle, ArrowRight, RefreshCcw, MessageSquare, Send, EyeOff, Lock, CheckSquare, Plus, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface WorkItemDetailProps {
  item: WorkItem;
  project?: Project;
  assignee?: User;
  currentUser?: User | null; // Passed to check permission for approval
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: Status) => void;
  onRefresh: () => void; // Callback to refresh data after decision
}

const WorkItemDetail: React.FC<WorkItemDetailProps> = ({ item, project, assignee, currentUser, onClose, onUpdateStatus, onRefresh }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  
  // Subtasks State
  const [subtasks, setSubtasks] = useState<Subtask[]>(item.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  
  // Chat State
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const isAnonymous = item.creatorId === 'ANONYMOUS' || item.tags?.includes('Anonymous');

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [item.comments]);

  // Update local state when item changes
  useEffect(() => {
    setSubtasks(item.subtasks || []);
  }, [item]);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeWorkItem(item);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handlePostComment = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setIsPostingComment(true);
    const comment: Comment = {
      id: `c-${Date.now()}`,
      text: newComment,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      timestamp: new Date().toISOString()
    };

    try {
      await workItemsRepo.addComment(item.id, comment);
      setNewComment('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleApprovalDecision = async (stepId: string, decision: ApprovalDecision) => {
    if(!approvalComment && decision === ApprovalDecision.REJECTED) {
      alert("Please provide a reason for rejection.");
      return;
    }
    setSubmittingDecision(true);
    try {
      await workItemsRepo.submitApprovalDecision(item.id, stepId, decision, approvalComment);
      onRefresh(); 
      onClose(); 
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleResubmit = async () => {
    if (!item.approvalChain) return;

    setSubmittingDecision(true);
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
    } catch(e) {
        console.error(e);
    } finally {
        setSubmittingDecision(false);
    }
  };

  // Subtask Handlers
  const addSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newTask: Subtask = {
      id: `st-${Date.now()}`,
      title: newSubtaskTitle,
      isCompleted: false
    };
    const updatedSubtasks = [...subtasks, newTask];
    setSubtasks(updatedSubtasks);
    setNewSubtaskTitle('');
    await workItemsRepo.update(item.id, { subtasks: updatedSubtasks });
  };

  const toggleSubtask = async (subtaskId: string) => {
    const updatedSubtasks = subtasks.map(t => 
      t.id === subtaskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    setSubtasks(updatedSubtasks);
    await workItemsRepo.update(item.id, { subtasks: updatedSubtasks });
  };

  const deleteSubtask = async (subtaskId: string) => {
    const updatedSubtasks = subtasks.filter(t => t.id !== subtaskId);
    setSubtasks(updatedSubtasks);
    await workItemsRepo.update(item.id, { subtasks: updatedSubtasks });
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm transition-all" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-medium text-slate-500">{item.id}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-white border border-slate-200 text-slate-600">
                {item.type}
              </span>
              {isAnonymous && (
                 <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-white flex items-center gap-1">
                   <EyeOff size={10} /> Anonymous
                 </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{item.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Status Bar */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div>
              <p className="text-xs text-slate-500 mb-1">Current Status</p>
              <p className={`font-semibold ${item.status === Status.REJECTED ? 'text-red-600' : 'text-slate-800'}`}>{item.status}</p>
            </div>
            
            {item.status === Status.REJECTED && (
                <button 
                  onClick={handleResubmit}
                  disabled={submittingDecision}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCcw size={16} /> Resubmit
                </button>
            )}

            {(!item.approvalChain || item.approvalChain.length === 0) && item.status !== Status.DONE && item.status !== Status.REJECTED && (
               <button 
                  onClick={() => onUpdateStatus(item.id, Status.DONE)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Mark Complete
                </button>
            )}
          </div>

          {/* Workflow Engine Visualization */}
          {item.approvalChain && item.approvalChain.length > 0 && (
            <div className="border border-indigo-100 rounded-xl overflow-hidden">
              <div className="bg-indigo-50 p-4 border-b border-indigo-100 flex items-center gap-2">
                <ShieldCheck className="text-indigo-600" size={20} />
                <h3 className="font-bold text-indigo-900">Approval Workflow</h3>
              </div>
              <div className="p-4 bg-white space-y-4">
                {item.approvalChain.map((step, index) => {
                  const isPendingMe = step.decision === ApprovalDecision.PENDING && currentUser?.id === step.approverId && item.status !== Status.REJECTED;
                  
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
                               onClick={() => handleApprovalDecision(step.id, ApprovalDecision.APPROVED)}
                               disabled={submittingDecision}
                               className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                             >
                               <CheckCircle2 size={16} /> Approve
                             </button>
                             <button 
                               onClick={() => handleApprovalDecision(step.id, ApprovalDecision.REJECTED)}
                               disabled={submittingDecision}
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
          )}

          {/* Description & Fields */}
          <div className="space-y-4">
             {item.type === WorkItemType.SERVICE_REQUEST && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase">Service Type</p>
                  <p className="text-sm font-medium text-slate-800">{item.serviceType || 'General'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 uppercase">Department</p>
                  <p className="text-sm font-medium text-slate-800">{item.department || 'N/A'}</p>
                </div>
              </div>
            )}

            {item.type === WorkItemType.CUSTODY && (
              <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-purple-700 uppercase">Asset ID</p>
                  <p className="text-sm font-medium text-slate-800">{item.assetId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-700 uppercase">Target Employee</p>
                  <p className="text-sm font-medium text-slate-800">{item.employeeId ? `Employee #${item.employeeId}` : 'N/A'}</p>
                </div>
              </div>
            )}

            {isAnonymous && (
              <div className="bg-slate-100 border border-slate-200 p-3 rounded-lg flex items-center gap-3">
                 <div className="p-2 bg-slate-200 rounded-full text-slate-600"><Lock size={16} /></div>
                 <p className="text-xs text-slate-500">This item was submitted anonymously. The creator's identity is hidden.</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Description</h3>
              <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">{item.description}</p>
            </div>
          </div>
          
          {/* Subtasks Section */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
               <CheckSquare size={16} /> Checklist & Subtasks
             </h3>
             
             <div className="space-y-2 mb-3">
               {subtasks.map(st => (
                 <div key={st.id} className="flex items-center gap-2 group">
                   <button 
                     onClick={() => toggleSubtask(st.id)}
                     className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${st.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-slate-300 text-transparent hover:border-blue-400'}`}
                   >
                     <Check size={14} />
                   </button>
                   <span className={`text-sm flex-1 ${st.isCompleted ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{st.title}</span>
                   <button 
                     onClick={() => deleteSubtask(st.id)}
                     className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                     <Trash2 size={14} />
                   </button>
                 </div>
               ))}
               {subtasks.length === 0 && (
                 <p className="text-xs text-slate-400 italic">No subtasks defined.</p>
               )}
             </div>

             <form onSubmit={addSubtask} className="flex gap-2">
               <input 
                 type="text"
                 placeholder="Add new subtask..."
                 className="flex-1 px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                 value={newSubtaskTitle}
                 onChange={(e) => setNewSubtaskTitle(e.target.value)}
               />
               <button 
                 type="submit" 
                 disabled={!newSubtaskTitle.trim()}
                 className="p-1.5 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 disabled:opacity-50"
               >
                 <Plus size={18} />
               </button>
             </form>
          </div>

          {/* Attachments */}
          {item.attachments && item.attachments.length > 0 && (
             <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Attachments ({item.attachments.length})</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {item.attachments.map((url, i) => (
                    <div key={i} className="aspect-square bg-slate-100 rounded-lg border border-slate-200 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <img src={url} alt={`Attachment ${i}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* Meta Data */}
          <div className="grid grid-cols-2 gap-4">
             <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                <MapPin className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-medium text-slate-500">Location / Project</p>
                  <p className="text-sm font-semibold text-slate-800">{project ? project.name : (item.projectId || 'General')}</p>
                </div>
             </div>
             <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                <UserIcon className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-medium text-slate-500">Assignee</p>
                  <p className="text-sm font-semibold text-slate-800">{assignee?.name || 'Unassigned'}</p>
                </div>
             </div>
             <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100">
                <Clock className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs font-medium text-slate-500">Due Date</p>
                  <p className="text-sm font-semibold text-slate-800">{item.dueDate}</p>
                </div>
             </div>
          </div>

          {/* Activity / Comments Section */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
              <MessageSquare size={16} /> Activity & Comments
            </h3>
            
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[150px] max-h-[300px] overflow-y-auto mb-4 space-y-4">
              {(!item.comments || item.comments.length === 0) && (
                <div className="text-center text-slate-400 text-sm py-4">No comments yet. Be the first to start the discussion.</div>
              )}
              {item.comments?.map((comment) => (
                <div key={comment.id} className={`flex gap-3 ${comment.userId === currentUser?.id ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {comment.isSystem ? (
                      <Sparkles size={12} className="text-slate-500" />
                    ) : comment.userAvatar ? (
                       <img src={comment.userAvatar} alt="u" className="w-full h-full object-cover" />
                    ) : (
                       <UserIcon className="p-1.5 text-slate-500" />
                    )}
                  </div>
                  <div className={`max-w-[80%] ${comment.userId === currentUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                     <div className={`p-3 rounded-lg text-sm ${
                        comment.isSystem ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        comment.userId === currentUser?.id ? 'bg-blue-600 text-white rounded-tr-none' : 
                        'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                     }`}>
                        {comment.text}
                     </div>
                     <span className="text-[10px] text-slate-400 mt-1">
                       {comment.isSystem ? 'System' : comment.userName} • {new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                  </div>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>

            <form onSubmit={handlePostComment} className="flex gap-2">
               <input 
                 className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                 placeholder="Type a comment..."
                 value={newComment}
                 onChange={(e) => setNewComment(e.target.value)}
               />
               <button 
                 type="submit"
                 disabled={isPostingComment || !newComment.trim()}
                 className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 transition-colors"
               >
                 <Send size={18} />
               </button>
            </form>
          </div>

          {/* AI Section */}
          <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-5 relative overflow-hidden mt-6">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles size={100} className="text-indigo-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="text-indigo-600" size={20} />
                <h3 className="text-indigo-900 font-bold">Enjaz AI Assistant</h3>
              </div>
              
              {!aiAnalysis && !isAnalyzing && (
                <div className="text-center py-4">
                  <p className="text-sm text-indigo-700 mb-3">Analyze this work item to get risk assessments and recommended actions.</p>
                  <button 
                    onClick={handleAiAnalysis}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm text-sm font-medium transition-all"
                  >
                    Analyze Work Item
                  </button>
                </div>
              )}

              {isAnalyzing && (
                <div className="flex items-center justify-center py-6 gap-3 text-indigo-700">
                   <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                   <span className="text-sm font-medium">Analyzing with Gemini...</span>
                </div>
              )}

              {aiAnalysis && (
                <div className="prose prose-sm prose-indigo bg-white/60 p-4 rounded-lg border border-indigo-100 max-w-none">
                  <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorkItemDetail;
