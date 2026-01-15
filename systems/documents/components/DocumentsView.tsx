import React, { useState, useEffect, useMemo } from 'react';
import { Document, Project } from '../../../shared/types';
import { documentsRepo } from '../../../shared/services/documentsRepo';
import { GoogleGenAI } from "@google/genai";
import DocumentCard from './DocumentCard';
import { Search, FolderOpen, Grid, List, Sparkles, X, Loader2, Database, ShieldCheck, FileText, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DocumentsViewProps {
  projects: Project[];
}

const DocumentsView: React.FC<DocumentsViewProps> = ({ projects }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterProject, setFilterProject] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [aiSummary, setAiSummary] = useState<{title: string, content: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    const docs = await documentsRepo.getAll();
    setDocuments(docs);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this archive?")) {
      await documentsRepo.delete(id);
      loadDocuments();
    }
  };

  const handleAiSummarize = async (doc: Document) => {
    setIsAiLoading(true);
    setAiSummary({ title: doc.title, content: '' });
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a professional construction project assistant. 
    Analyze the document metadata: 
    Title: ${doc.title}
    Category: ${doc.category}
    Project Context: ${projects.find(p => p.id === doc.projectId)?.name || 'General'}
    
    Based on the file name and category, provide:
    1. A likely summary of what this document contains.
    2. 3 actionable points or things the project manager should check in this document.
    3. Potential risks related to this type of document in construction.
    
    Output in professional Arabic language. Keep it concise.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiSummary({ title: doc.title, content: response.text || "Could not generate summary." });
    } catch (error) {
      console.error(error);
      setAiSummary({ title: doc.title, content: "Error communicating with AI service." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;
      const matchesProject = filterProject === 'All' || doc.projectId === filterProject;
      return matchesSearch && matchesCategory && matchesProject;
    });
  }, [documents, searchTerm, filterCategory, filterProject]);

  const stats = useMemo(() => {
    const totalSize = documents.reduce((acc, d) => acc + parseFloat(d.size), 0);
    return {
      total: documents.length,
      blueprints: documents.filter(d => d.category === 'Blueprint').length,
      contracts: documents.filter(d => d.category === 'Contract').length,
      size: totalSize.toFixed(1) + ' GB'
    };
  }, [documents]);

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in pb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatItem label="Central Repository" value={stats.total} icon={<Database />} color="text-blue-600" bg="bg-blue-50" />
        <StatItem label="Engineered Blueprints" value={stats.blueprints} icon={<FileText />} color="text-indigo-600" bg="bg-indigo-50" />
        <StatItem label="Legal Contracts" value={stats.contracts} icon={<ShieldCheck />} color="text-purple-600" bg="bg-purple-50" />
        <StatItem label="Storage Used" value={stats.size} icon={<Database />} color="text-slate-900" bg="bg-slate-100" />
      </div>

      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by file name or extension..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
             className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 outline-none"
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
           >
             <option value="All">All Categories</option>
             {['Blueprint', 'Contract', 'Permit', 'Report', 'Invoice', 'Technical'].map(c => <option key={c} value={c}>{c}</option>)}
           </select>

           <select 
             className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 outline-none"
             value={filterProject}
             onChange={(e) => setFilterProject(e.target.value)}
           >
             <option value="All">All Projects</option>
             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>

           <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>

           <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><Grid size={18}/></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List size={18}/></button>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="font-bold">Syncing repository...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-slate-300 gap-4">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100"><FolderOpen size={48} /></div>
             <p className="font-black text-slate-400">No documents found matching your criteria.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-3"}>
            {filteredDocs.map(doc => (
              <DocumentCard 
                key={doc.id}
                doc={doc}
                projectName={projects.find(p => p.id === doc.projectId)?.name || 'General'}
                onDelete={handleDelete}
                onAiAnalyze={handleAiSummarize}
              />
            ))}
          </div>
        )}
      </div>

      {aiSummary && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setAiSummary(null)}>
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col animate-scale-in relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -mr-32 -mt-32 rounded-full blur-3xl"></div>
              
              <div className="p-8 border-b border-slate-100 flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200">
                      <Sparkles size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">Smart Summary</h3>
                     <p className="text-xs font-bold text-slate-400 truncate max-w-sm">{aiSummary.title}</p>
                   </div>
                 </div>
                 <button onClick={() => setAiSummary(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[60vh] relative z-10">
                 {isAiLoading ? (
                   <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="relative">
                        <Loader2 className="animate-spin text-indigo-600" size={48} />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={20} />
                      </div>
                      <p className="text-sm font-black text-slate-600 animate-pulse">Gemini is analyzing document structure...</p>
                   </div>
                 ) : (
                   <div className="prose prose-slate prose-indigo max-w-none prose-sm font-bold text-slate-700 leading-relaxed">
                      <ReactMarkdown>{aiSummary.content}</ReactMarkdown>
                   </div>
                 )}
              </div>

              {!isAiLoading && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <AlertCircle size={14} /> AI content is generated for quick reference only.
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, value, icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5">
    <div className={`p-4 rounded-3xl ${bg} ${color}`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none mb-1">{value}</p>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    </div>
  </div>
);

export default DocumentsView;