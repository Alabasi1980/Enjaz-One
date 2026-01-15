import React, { useState, useEffect } from 'react';
import { Project, Document } from '../../../types';
import { documentsRepo } from '../../../services/documentsRepo';
import { usersRepo } from '../../../services/usersRepo';
import { MapPin, FileText, Upload, Trash2, File, Download } from 'lucide-react';

interface ProjectDocumentsProps {
  project: Project;
}

const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ project }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<Document['category']>('Other');

  useEffect(() => {
    loadDocuments();
  }, [project.id]);

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
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm("Are you sure?")) {
      await documentsRepo.delete(id);
      await loadDocuments();
    }
  };

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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative">
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileUpload}
          disabled={isUploading}
        />
        <div className={`p-4 rounded-full bg-blue-50 text-blue-600 mb-4 ${isUploading ? 'animate-bounce' : ''}`}>
          <Upload size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">{isUploading ? 'Uploading...' : 'Upload Project Document'}</h3>
        <p className="text-sm text-slate-500 mb-4 max-w-sm">Drag & drop files here or click to browse.</p>
        <div className="flex items-center gap-2 z-20 relative">
          <span className="text-xs font-bold text-slate-600 uppercase">Category:</span>
          <select 
            value={uploadCategory}
            onChange={(e) => setUploadCategory(e.target.value as any)}
            className="p-1 border border-slate-200 rounded text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            onClick={(e) => e.stopPropagation()}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map(doc => (
          <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 group hover:shadow-md transition-all relative">
            <div className="flex items-start gap-4 mb-3">
              <div className={`p-3 rounded-lg ${getDocColor(doc.category)}`}>{getDocIcon(doc.category)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800 truncate">{doc.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="font-medium bg-slate-100 px-1.5 py-0.5 rounded">{doc.category}</span>
                  <span>• {doc.size}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 pt-3">
              <span>By {doc.uploaderName}</span>
              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
              <a href={doc.url} download className="p-1.5 hover:bg-slate-100 rounded text-blue-600"><Download size={16} /></a>
              <button onClick={() => handleDeleteDocument(doc.id)} className="p-1.5 hover:bg-slate-100 rounded text-red-600"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDocuments;
