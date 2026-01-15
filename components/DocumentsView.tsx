import React, { useState, useEffect } from 'react';
import { Document, Project } from '../types';
import { documentsRepo } from '../services/documentsRepo';
import { Search, Filter, FileText, MapPin, File, Download, FolderOpen, Building2 } from 'lucide-react';

interface DocumentsViewProps {
  projects: Project[];
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ projects }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const docs = await documentsRepo.getAll();
    setDocuments(docs);
    setLoading(false);
  };

  const getProjectName = (id: string) => {
    return projects.find(p => p.id === id)?.name || 'Unknown Project';
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
    const matchesProject = filterProject === 'All' || doc.projectId === filterProject;
    return matchesSearch && matchesCategory && matchesProject;
  });

  const getDocIcon = (category: string) => {
    switch (category) {
      case 'Blueprint': return <MapPin size={20} className="text-blue-600" />;
      case 'Contract': return <FileText size={20} className="text-purple-600" />;
      case 'Invoice': return <FileText size={20} className="text-green-600" />;
      default: return <File size={20} className="text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <FolderOpen className="text-blue-600" />
             Central Document Library
           </h2>
           <p className="text-slate-500 text-sm mt-1">Archive of all project files, blueprints, and contracts.</p>
        </div>
        <div className="text-right">
           <span className="text-3xl font-bold text-slate-800">{documents.length}</span>
           <span className="text-xs text-slate-500 block uppercase font-semibold tracking-wider">Total Files</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by file name..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <select 
             className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
           >
             <option value="All">All Categories</option>
             <option value="Blueprint">Blueprint</option>
             <option value="Contract">Contract</option>
             <option value="Permit">Permit</option>
             <option value="Report">Report</option>
             <option value="Invoice">Invoice</option>
             <option value="Other">Other</option>
           </select>

           <select 
             className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none"
             value={filterProject}
             onChange={(e) => setFilterProject(e.target.value)}
           >
             <option value="All">All Projects</option>
             {projects.map(p => (
               <option key={p.id} value={p.id}>{p.name}</option>
             ))}
           </select>
        </div>
      </div>

      {/* Files Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400">Loading...</div>
        ) : filteredDocs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
             <FolderOpen size={48} className="mb-4 opacity-50" />
             <p>No documents found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocs.map(doc => (
              <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all group">
                 <div className="flex justify-between items-start mb-3">
                   <div className="p-2 bg-slate-50 rounded-lg">{getDocIcon(doc.category)}</div>
                   <div className="bg-slate-100 px-2 py-1 rounded text-[10px] uppercase font-bold text-slate-500">{doc.type.split('/')[1] || 'FILE'}</div>
                 </div>
                 
                 <h4 className="font-semibold text-slate-800 truncate mb-1" title={doc.title}>{doc.title}</h4>
                 
                 <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                   <Building2 size={12} />
                   <span className="truncate max-w-[150px]">{getProjectName(doc.projectId)}</span>
                 </div>

                 <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                    <div className="text-[10px] text-slate-400">
                       <p>{doc.size}</p>
                       <p>{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <a 
                      href={doc.url} 
                      download={doc.title}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-100"
                    >
                      <Download size={16} />
                    </a>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsView;
