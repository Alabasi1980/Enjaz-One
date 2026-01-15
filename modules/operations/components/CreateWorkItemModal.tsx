import React, { useState } from 'react';
import { WorkItem, WorkItemType, Priority, Project, User, Status, ApprovalDecision } from '../../../types';
import { X, Upload, Calendar, ShieldCheck, EyeOff, Lightbulb, MessageSquareWarning } from 'lucide-react';

interface CreateWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  users: User[];
  currentUser: User | null;
  onCreate: (item: Partial<WorkItem>) => Promise<void>;
}

const CreateWorkItemModal: React.FC<CreateWorkItemModalProps> = ({ isOpen, onClose, projects, users, currentUser, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkItem>>({
    type: WorkItemType.TASK,
    priority: Priority.MEDIUM,
    status: Status.OPEN,
    title: '',
    description: '',
    projectId: projects[0]?.id || '',
    assigneeId: '',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    tags: [],
    attachments: []
  });

  const [selectedApproverId, setSelectedApproverId] = useState<string>('');

  if (!isOpen) return null;

  const handleChange = (field: keyof WorkItem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), url] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
          ...formData,
          creatorId: isAnonymous ? 'ANONYMOUS' : currentUser?.id,
          tags: isAnonymous ? [...(formData.tags || []), 'Anonymous'] : formData.tags
      };
      if (formData.type === WorkItemType.APPROVAL) {
        payload.status = Status.PENDING_APPROVAL;
        const approver = users.find(u => u.id === selectedApproverId) || users[0];
        payload.approvalChain = [{ id: `step-${Date.now()}`, approverId: approver.id, approverName: approver.name, role: approver.role, decision: ApprovalDecision.PENDING }];
      }
      await onCreate(payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2 className="text-lg font-bold">Create New Work Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">TYPE</label>
               <select className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" value={formData.type} onChange={(e) => handleChange('type', e.target.value)}>
                 {Object.values(WorkItemType).map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">PROJECT</label>
               <select className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white" value={formData.projectId} onChange={(e) => handleChange('projectId', e.target.value)}>
                 <option value="General">General / HQ</option>
                 {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
               </select>
             </div>
          </div>
          {formData.type === WorkItemType.APPROVAL && (
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
               <label className="block text-xs font-semibold text-indigo-800 mb-1">Select Approver</label>
               <select className="w-full p-2 border border-indigo-200 rounded text-sm" value={selectedApproverId} onChange={(e) => setSelectedApproverId(e.target.value)} required>
                  <option value="">Choose a manager...</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
               </select>
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">TITLE</label>
            <input required className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">DESCRIPTION</label>
            <textarea className="w-full p-2 border border-slate-200 rounded-lg text-sm h-24 resize-none" placeholder="Details..." value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
          </div>
          <div className="p-4 border border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-xl">
             <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-slate-200 rounded-lg">Cancel</button>
             <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg flex items-center gap-2 disabled:opacity-50">
               {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create Item
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: any) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default CreateWorkItemModal;
