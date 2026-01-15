
import React from 'react';
import { Document } from '../../../types';
import { FileText, Download, Trash2, Sparkles, MapPin, ShieldCheck, FileSpreadsheet, FileCode, MoreVertical } from 'lucide-react';

interface DocumentCardProps {
  doc: Document;
  projectName: string;
  onDelete: (id: string) => void;
  onAiAnalyze: (doc: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, projectName, onDelete, onAiAnalyze }) => {
  const getDocIcon = (category: string) => {
    switch (category) {
      case 'Blueprint': return <MapPin className="text-blue-600" size={24} />;
      case 'Contract': return <ShieldCheck className="text-purple-600" size={24} />;
      case 'Invoice': return <FileSpreadsheet className="text-emerald-600" size={24} />;
      case 'Technical': return <FileCode className="text-amber-600" size={24} />;
      default: return <FileText className="text-slate-500" size={24} />;
    }
  };

  const getDocBg = (category: string) => {
    switch (category) {
      case 'Blueprint': return 'bg-blue-50/50 border-blue-100';
      case 'Contract': return 'bg-purple-50/50 border-purple-100';
      case 'Invoice': return 'bg-emerald-50/50 border-emerald-100';
      default: return 'bg-white border-slate-200';
    }
  };

  return (
    <div className={`group relative rounded-[2rem] p-5 border shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all animate-scale-in ${getDocBg(doc.category)}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white rounded-2xl shadow-sm">
          {getDocIcon(doc.category)}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onAiAnalyze(doc)}
            className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:scale-110 transition-transform"
            title="Summarize with AI"
          >
            <Sparkles size={16} />
          </button>
          <a 
            href={doc.url} 
            download 
            className="p-2 bg-white text-slate-600 rounded-xl border border-slate-100 shadow-sm hover:text-blue-600"
          >
            <Download size={16} />
          </a>
          <button 
            onClick={() => onDelete(doc.id)}
            className="p-2 bg-white text-slate-400 rounded-xl border border-slate-100 shadow-sm hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-1 mb-4">
        <h4 className="text-sm font-black text-slate-900 truncate" title={doc.title}>{doc.title}</h4>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
          {projectName}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-500">{doc.size}</span>
          <span className="text-[9px] font-bold text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
        </div>
        <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-600 uppercase tracking-wider">
          {doc.category}
        </span>
      </div>
    </div>
  );
};

export default DocumentCard;
