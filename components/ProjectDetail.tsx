import React, { useState, useEffect } from 'react';
import { Project, WorkItem, Status, Document } from '../types';
import WorkItemList from '../modules/operations/WorkItemList';
import { documentsRepo } from '../services/documentsRepo';
import { usersRepo } from '../services/usersRepo';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Building2, MapPin, FileText, Settings, ArrowLeft, MoreHorizontal, Hammer, Truck, Upload, Trash2, File, Download, X } from 'lucide-react';

interface ProjectDetailProps {
  project: Project;
  items: WorkItem[];
  onBack: () => void;
  onItemClick: (item: WorkItem) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, items, onBack, onItemClick }) => {
  const [tab, setTab] = useState<'overview' | 'workitems' | 'docs' | 'assets'>('overview');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<Document['category']>('Other');

  // Load Documents when tab changes to docs
  useEffect(() => {
    if (tab === 'docs') {
      loadDocuments();
    }
  }, [tab, project.id]);

  const loadDocuments = async () => {
    const docs = await documentsRepo.getByProjectId(project.id);
    setDocuments(docs);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      const currentUser = await usersRepo.getCurrentUser();
      
      try {
        const url = URL.createObjectURL(file);
        
        await documentsRepo.upload({
           title: file.name,
           projectId: project.id,
           url: url,
           category: uploadCategory,
           size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
           type: file.type,
           uploaderId: currentUser.id,
           uploaderName: currentUser.name
        });
        
        await loadDocuments();
      } catch (err) {
        console.error("Upload failed", err);
        alert("Upload failed");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      await documentsRepo.delete(id);
      await loadDocuments();
    }
  };

  const stats = {
    total: items.length,
    completed: items.filter(i => i.status === Status.DONE).length,
    open: items.filter(i => i.status !== Status.DONE && i.status !== Status.APPROVED).length,
  };
  
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  
  const data = [
    { name: 'Completed', value: stats.completed },
    { name: 'Open', value: stats.open },
  ];
  const COLORS = ['#10b981', '#cbd5e1'];

  const getDocIcon = (category: string) => {
    switch (category) {
      case 'Blueprint': return <MapPin size={24} className="text-blue-600" />;
      case 'Contract': return <FileText size={24} className="text-purple-600" />;
      case 'Invoice': return <FileText size={24} className="text-green-600" />;
      default: return <File size={24} className="text-slate-500" />;
    }
  };

  const getDocColor = (category: string) => {
    switch (category) {
      case 'Blueprint': return 'bg-blue-50';
      case 'Contract': return 'bg-purple-50';
      case 'Invoice': return 'bg-green-50';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Project Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <button onClick={onBack} className="mt-1 p-2 hover:bg-slate-100 rounded-full text-slate-500">
             <ArrowLeft size={20} />
          </button>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
             <Building2 size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1"><MapPin size={14} /> {project.location}</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs border border-slate-200">{project.code}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50">Edit Project</button>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800">Add Phase</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-6 overflow-x-auto">
         {['overview', 'workitems', 'docs', 'assets'].map((t) => (
           <button
             key={t}
             onClick={() => setTab(t as any)}
             className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 whitespace-nowrap ${
               tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
             }`}
           >
             {t === 'workitems' ? 'Work Items' : t === 'docs' ? 'Documents' : t}
           </button>
         ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pr-2">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Project Progress</h3>
                <div className="flex items-center gap-4">
                   <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                     <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                   </div>
                   <span className="font-bold text-slate-900">{completionRate}%</span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                   <div className="p-4 bg-slate-50 rounded-lg">
                     <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                     <div className="text-xs text-slate-500 uppercase font-semibold">Total Items</div>
                   </div>
                   <div className="p-4 bg-green-50 rounded-lg text-green-700">
                     <div className="text-2xl font-bold">{stats.completed}</div>
                     <div className="text-xs opacity-70 uppercase font-semibold">Completed</div>
                   </div>
                   <div className="p-4 bg-orange-50 rounded-lg text-orange-700">
                     <div className="text-2xl font-bold">{stats.open}</div>
                     <div className="text-xs opacity-70 uppercase font-semibold">Open Issues</div>
                   </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {items.slice(0, 3).map(item => (
                    <div key={item.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                         <FileText size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">Updated: {item.title}</p>
                        <p className="text-xs text-slate-500">{item.status} - {item.dueDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-lg font-bold text-slate-800 mb-2">Health Status</h3>
                 <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="text-center">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">On Track</span>
                 </div>
               </div>
            </div>
          </div>
        )}

        {tab === 'workitems' && (
          <WorkItemList items={items} onItemClick={onItemClick} />
        )}

        {tab === 'docs' && (
           <div className="space-y-6">
             {/* Upload Area */}
             <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
               <input 
                 type="file" 
                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                 onChange={handleFileUpload}
                 disabled={isUploading}
               />
               
               <div className="mb-4 flex gap-4 z-20 relative pointer-events-none">
                 <div className={`p-4 rounded-full bg-blue-50 text-blue-600 ${isUploading ? 'animate-bounce' : ''}`}>
                   <Upload size={32} />
                 </div>
               </div>
               
               <h3 className="text-lg font-bold text-slate-800">
                 {isUploading ? 'Uploading...' : 'Upload Project Document'}
               </h3>
               <p className="text-sm text-slate-500 mb-4 max-w-sm">
                 Drag & drop files here or click to browse. Supports PDF, Images, Excel, CAD.
               </p>

               <div className="flex items-center gap-2 z-20 relative">
                  <span className="text-xs font-bold text-slate-600 uppercase">Category:</span>
                  <select 
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="p-1 border border-slate-200 rounded text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    onClick={(e) => e.stopPropagation()} // Prevent triggering file upload
                  >
                    <option value="Blueprint">Blueprint</option>
                    <option value="Contract">Contract</option>
                    <option value="Permit">Permit</option>
                    <option value="Report">Report</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Other">Other</option>
                  </select>
               </div>
             </div>

             {/* Documents List */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {documents.length === 0 ? (
                 <div className="col-span-full text-center py-10 text-slate-400">
                   No documents uploaded yet.
                 </div>
               ) : (
                 documents.map(doc => (
                   <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 group hover:shadow-md transition-all relative">
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`p-3 rounded-lg ${getDocColor(doc.category)}`}>
                          {getDocIcon(doc.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate" title={doc.title}>{doc.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                             <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded">{doc.category}</span>
                             <span>• {doc.size}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-3">
                         <div className="flex items-center gap-1">
                            <span>By {doc.uploaderName}</span>
                         </div>
                         <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      </div>

                      {/* Actions */}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                         <a href={doc.url} download={doc.title} className="p-1.5 hover:bg-slate-100 rounded text-blue-600" title="Download">
                            <Download size={16} />
                         </a>
                         <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 hover:bg-slate-100 rounded text-red-600" title="Delete">
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>
                 ))
               )}
             </div>
           </div>
        )}

        {tab === 'assets' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AssetCard name="Excavator CAT-320" id="EQ-2023-001" status="Active" icon={<Truck />} />
              <AssetCard name="Generator 500kVA" id="EQ-2023-055" status="Maintenance" icon={<Settings />} />
              <AssetCard name="Total Station Leica" id="EQ-2022-102" status="Active" icon={<Hammer />} />
           </div>
        )}
      </div>
    </div>
  );
};

const AssetCard = ({ name, id, status, icon }: any) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
    <div className="p-3 bg-slate-100 text-slate-600 rounded-lg">
      {icon}
    </div>
    <div className="flex-1">
      <h4 className="font-semibold text-slate-800">{name}</h4>
      <p className="text-xs font-mono text-slate-500">{id}</p>
    </div>
    <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
      {status}
    </span>
  </div>
);

export default ProjectDetail;
