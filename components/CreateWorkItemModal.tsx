import React, { useState } from 'react';
import { WorkItem, WorkItemType, Priority, Project, User, Status, ApprovalDecision } from '../types';
import { X, Upload, Calendar, AlertCircle, ShieldCheck, EyeOff, Lightbulb, MessageSquareWarning } from 'lucide-react';

interface CreateWorkItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  users: User[];
  currentUser: User | null; // Added prop
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
    // Custom Fields
    serviceType: '',
    department: '',
    assetId: '',
    employeeId: '',
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
      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), url]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { 
          ...formData,
          // If anonymous, stamp as ANONYMOUS, otherwise use current user
          creatorId: isAnonymous ? 'ANONYMOUS' : currentUser?.id,
          tags: isAnonymous ? [...(formData.tags || []), 'Anonymous'] : formData.tags
      };

      // Phase 3: Workflow Engine Initialization
      if (formData.type === WorkItemType.APPROVAL) {
        payload.status = Status.PENDING_APPROVAL;
        const approver = users.find(u => u.id === selectedApproverId) || users[0];
        
        payload.approvalChain = [
          {
            id: `step-${Date.now()}`,
            approverId: approver.id,
            approverName: approver.name,
            role: approver.role,
            decision: ApprovalDecision.PENDING,
          }
        ];
      }

      await onCreate(payload);
      onClose();
      // Reset form
      setFormData({
        type: WorkItemType.TASK,
        priority: Priority.MEDIUM,
        status: Status.OPEN,
        title: '',
        description: '',
        projectId: projects[0]?.id || '',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        attachments: []
      });
      setSelectedApproverId('');
      setIsAnonymous(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomFields = () => {
    switch (formData.type) {
      case WorkItemType.APPROVAL:
        return (
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="text-indigo-600" size={18} />
              <h4 className="text-sm font-bold text-indigo-900">Approval Workflow Setup</h4>
            </div>
            <div>
              <label className="block text-xs font-semibold text-indigo-800 mb-1">Select Approver</label>
              <select 
                className="w-full p-2 border border-indigo-200 rounded text-sm"
                value={selectedApproverId}
                onChange={(e) => setSelectedApproverId(e.target.value)}
                required={formData.type === WorkItemType.APPROVAL}
              >
                <option value="">Choose a manager...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>
        );

      case WorkItemType.SERVICE_REQUEST:
        return (
          <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
            <div>
              <label className="block text-xs font-semibold text-blue-800 mb-1">Service Category</label>
              <select 
                className="w-full p-2 border border-blue-200 rounded text-sm"
                value={formData.serviceType}
                onChange={(e) => handleChange('serviceType', e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="IT Support">IT Support</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Logistics">Logistics</option>
                <option value="HR Service">HR Service</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-800 mb-1">Target Department</label>
              <input 
                type="text"
                className="w-full p-2 border border-blue-200 rounded text-sm"
                placeholder="e.g. Finance"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
              />
            </div>
          </div>
        );
      case WorkItemType.CUSTODY:
        return (
          <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100 mb-4">
            <div>
              <label className="block text-xs font-semibold text-purple-800 mb-1">Asset ID / Serial</label>
              <input 
                type="text"
                className="w-full p-2 border border-purple-200 rounded text-sm"
                placeholder="e.g. EQ-2023-99"
                value={formData.assetId}
                onChange={(e) => handleChange('assetId', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-purple-800 mb-1">Target Employee</label>
              <select 
                className="w-full p-2 border border-purple-200 rounded text-sm"
                value={formData.employeeId}
                onChange={(e) => handleChange('employeeId', e.target.value)}
              >
                 <option value="">Select Employee</option>
                 {users.map(u => (
                   <option key={u.id} value={u.id}>{u.name}</option>
                 ))}
              </select>
            </div>
          </div>
        );
      case WorkItemType.COMPLAINT:
      case WorkItemType.SUGGESTION:
        return (
          <div className="p-4 bg-rose-50 rounded-lg border border-rose-100 mb-4">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                 {formData.type === WorkItemType.COMPLAINT ? (
                   <MessageSquareWarning className="text-rose-600" size={18} />
                 ) : (
                   <Lightbulb className="text-yellow-600" size={18} />
                 )}
                 <h4 className="text-sm font-bold text-rose-900">Confidentiality Settings</h4>
               </div>
               <div className="flex items-center gap-2">
                 <input 
                   type="checkbox" 
                   id="anon-check"
                   checked={isAnonymous}
                   onChange={(e) => setIsAnonymous(e.target.checked)}
                   className="rounded text-rose-600 focus:ring-rose-500"
                 />
                 <label htmlFor="anon-check" className="text-sm font-medium text-rose-800 cursor-pointer flex items-center gap-1">
                   <EyeOff size={14} /> Submit Anonymously
                 </label>
               </div>
            </div>
            <p className="text-xs text-rose-700 mb-3">
              {formData.type === WorkItemType.COMPLAINT 
                ? "Complaints are routed directly to HR. Selecting 'Anonymous' will hide your identity from the report."
                : "Suggestions help us improve. You can share ideas openly or anonymously."}
            </p>
            {formData.type === WorkItemType.COMPLAINT && (
               <div>
                  <label className="block text-xs font-semibold text-rose-800 mb-1">Topic</label>
                  <select 
                    className="w-full p-2 border border-rose-200 rounded text-sm"
                    value={formData.tags?.[0] || ''}
                    onChange={(e) => setFormData(prev => ({...prev, tags: [e.target.value]}))}
                  >
                     <option value="">Select Topic...</option>
                     <option value="Work Environment">Work Environment</option>
                     <option value="Management">Management</option>
                     <option value="Harassment">Harassment</option>
                     <option value="Safety Violation">Safety Violation</option>
                     <option value="Other">Other</option>
                  </select>
               </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2 className="text-lg font-bold text-slate-800">Create New Work Item</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">TYPE</label>
               <select 
                 className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                 value={formData.type}
                 onChange={(e) => handleChange('type', e.target.value)}
               >
                 {Object.values(WorkItemType).map(t => (
                   <option key={t} value={t}>{t}</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-xs font-semibold text-slate-500 mb-1">PROJECT</label>
               <select 
                 className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                 value={formData.projectId}
                 onChange={(e) => handleChange('projectId', e.target.value)}
               >
                 <option value="">Select Project</option>
                 <option value="General">General / HQ</option>
                 {projects.map(p => (
                   <option key={p.id} value={p.id}>{p.name}</option>
                 ))}
               </select>
             </div>
          </div>

          {renderCustomFields()}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">TITLE</label>
            <input 
              required
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">DESCRIPTION</label>
            <textarea 
              className="w-full p-2 border border-slate-200 rounded-lg text-sm h-24 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Provide details..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {formData.type !== WorkItemType.COMPLAINT && formData.type !== WorkItemType.SUGGESTION && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">PRIORITY</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  {Object.values(Priority).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">DUE DATE</label>
                <div className="relative">
                  <Calendar className="absolute left-2 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="date"
                    className="w-full pl-8 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">ASSIGNEE</label>
                <select 
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.assigneeId}
                  onChange={(e) => handleChange('assigneeId', e.target.value)}
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">ATTACHMENTS</label>
            <div className="relative border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors">
              <Upload size={24} className="mb-2" />
              <span className="text-xs">Click to upload files</span>
              <input type="file" multiple className="hidden" id="file-upload" onChange={handleFileChange} />
              <label htmlFor="file-upload" className="absolute inset-0 cursor-pointer"></label>
            </div>
            {formData.attachments && formData.attachments.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {formData.attachments.map((url, i) => (
                  <div key={i} className="h-16 w-16 rounded bg-slate-100 border border-slate-200 overflow-hidden relative">
                    <img src={url} alt="att" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 rounded-b-xl">
           <button 
             onClick={onClose}
             className="px-4 py-2 text-slate-600 font-medium text-sm hover:bg-slate-200 rounded-lg transition-colors"
           >
             Cancel
           </button>
           <button 
             onClick={handleSubmit}
             disabled={loading}
             className="px-6 py-2 bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
           >
             {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
             Create Work Item
           </button>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkItemModal;
