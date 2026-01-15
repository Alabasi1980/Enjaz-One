import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { knowledgeRepo } from '../services/knowledgeRepo';
import { Search, BookOpen, Hash, ChevronRight, X, Bookmark, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    const data = await knowledgeRepo.getAll();
    setArticles(data);
  };

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Safety', 'HR', 'Technical', 'IT', 'General'];

  return (
    <div className="flex h-full bg-slate-50 relative">
      {/* Sidebar Filters */}
      <div className="w-64 border-r border-slate-200 bg-white p-6 hidden md:block overflow-y-auto">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <BookOpen className="text-blue-600" /> Knowledge Base
        </h3>
        
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase mb-2 tracking-wider">Categories</p>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                selectedCategory === cat 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
              {cat === selectedCategory && <ChevronRight size={14} />}
            </button>
          ))}
        </div>

        <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
           <h4 className="text-sm font-bold text-slate-700 mb-2">Need Help?</h4>
           <p className="text-xs text-slate-500 mb-3">Can't find the procedure you are looking for?</p>
           <button className="w-full py-2 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-100">
             Request Article
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search Header */}
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="max-w-2xl mx-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
             <input 
               type="text"
               placeholder="Search procedures, policies, or guides..."
               className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
        </div>

        {/* Article Grid */}
        <div className="flex-1 overflow-y-auto p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
             {filteredArticles.map(article => (
               <div 
                 key={article.id}
                 onClick={() => setReadingArticle(article)}
                 className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
               >
                 <div className="flex justify-between items-start mb-3">
                   <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                     article.category === 'Safety' ? 'bg-red-50 text-red-600' :
                     article.category === 'HR' ? 'bg-purple-50 text-purple-600' :
                     'bg-blue-50 text-blue-600'
                   }`}>
                     {article.category}
                   </span>
                   <Hash size={14} className="text-slate-300" />
                 </div>
                 
                 <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                   {article.title}
                 </h3>
                 
                 <div className="flex items-center gap-2 mb-4">
                   {article.tags.map(tag => (
                     <span key={tag} className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">#{tag}</span>
                   ))}
                 </div>

                 <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <span>By {article.authorName}</span>
                    <span>{new Date(article.lastUpdated).toLocaleDateString()}</span>
                 </div>
               </div>
             ))}
           </div>
           
           {filteredArticles.length === 0 && (
             <div className="text-center py-20 text-slate-400">
               <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
               <p>No articles found.</p>
             </div>
           )}
        </div>
      </div>

      {/* Reading Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm" onClick={() => setReadingArticle(null)}>
           <div 
             className="w-full max-w-3xl bg-white h-full shadow-2xl overflow-y-auto animate-slide-in-right"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="p-8">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2 block">{readingArticle.category} SOP</span>
                      <h1 className="text-3xl font-bold text-slate-900">{readingArticle.title}</h1>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><Share2 size={20} /></button>
                       <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><Bookmark size={20} /></button>
                       <button onClick={() => setReadingArticle(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X size={20} /></button>
                    </div>
                 </div>

                 <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                          {readingArticle.authorName.charAt(0)}
                       </div>
                       <span>{readingArticle.authorName}</span>
                    </div>
                    <span>•</span>
                    <span>Last updated {new Date(readingArticle.lastUpdated).toLocaleDateString()}</span>
                 </div>

                 <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{readingArticle.content}</ReactMarkdown>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeBase;
