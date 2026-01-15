
import React, { useState, useEffect, useMemo } from 'react';
import { Article } from '../../../types';
import { knowledgeRepo } from '../../../services/knowledgeRepo';
import { Search, BookOpen, ChevronRight, X, Hash, Clock, User, Share2, Bookmark, Sparkles, ShieldCheck, HeartPulse, Hammer, Monitor, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import AiWikiAssistant from './AiWikiAssistant';

const KnowledgeBase: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    const data = await knowledgeRepo.getAll();
    setArticles(data);
    setIsLoading(false);
  };

  const categories = [
    { id: 'All', label: 'All Resources', icon: BookOpen, color: 'text-slate-600' },
    { id: 'Safety', label: 'Safety & HSE', icon: HeartPulse, color: 'text-red-600' },
    { id: 'HR', label: 'HR & Policies', icon: ShieldCheck, color: 'text-purple-600' },
    { id: 'Technical', label: 'Technical SOPs', icon: Hammer, color: 'text-amber-600' },
    { id: 'IT', label: 'IT & Digital', icon: Monitor, color: 'text-blue-600' },
    { id: 'General', label: 'General', icon: Info, color: 'text-slate-600' }
  ];

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            article.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, selectedCategory]);

  return (
    <div className="flex h-full bg-slate-50 relative overflow-hidden animate-fade-in">
      {/* 1. Sidebar Category Navigation */}
      <div className="w-72 border-r border-slate-200 bg-white p-8 hidden lg:block overflow-y-auto no-scrollbar">
        <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
           Enjaz Wiki
        </h3>
        
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Knowledge Domains</p>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${
                selectedCategory === cat.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                 <cat.icon size={18} className={selectedCategory === cat.id ? 'text-blue-400' : cat.color} />
                 {cat.label}
              </div>
              {selectedCategory === cat.id && <ChevronRight size={14} />}
            </button>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-blue-200">
           <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={64} /></div>
           <h4 className="text-sm font-black mb-2 relative z-10">Contribute</h4>
           <p className="text-[10px] font-bold text-blue-100 leading-relaxed mb-4 relative z-10">Help improve our database by suggesting a new procedure or updating an existing one.</p>
           <button className="w-full py-2.5 bg-white text-blue-600 text-[10px] font-black rounded-xl shadow-sm hover:scale-105 transition-all relative z-10">
             SUBMIT ARTICLE
           </button>
        </div>
      </div>

      {/* 2. Main Knowledge Explorer */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-8 border-b border-slate-200 bg-white">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-4">
             <div className="relative flex-1 w-full">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input 
                 type="text"
                 placeholder="Search by procedure name, keyword or #tag..."
                 className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 lg:hidden">
                {/* Mobile Category Toggle could go here */}
                <select 
                  className="bg-transparent text-xs font-bold text-slate-600 px-4 py-2 outline-none"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                   {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
           {isLoading ? (
             <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-sm font-black text-slate-400">Syncing with Central Repository...</p>
             </div>
           ) : filteredArticles.length === 0 ? (
             <div className="text-center py-40 space-y-4">
               <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <BookOpen size={48} />
               </div>
               <p className="text-slate-400 font-black">No resources found matching your search.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
               {filteredArticles.map(article => (
                 <div 
                   key={article.id}
                   onClick={() => setReadingArticle(article)}
                   className="group bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer flex flex-col h-full"
                 >
                   <div className="flex justify-between items-start mb-4">
                     <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                       article.category === 'Safety' ? 'bg-red-50 text-red-600' :
                       article.category === 'HR' ? 'bg-purple-50 text-purple-600' :
                       'bg-blue-50 text-blue-600'
                     }`}>
                       {article.category}
                     </span>
                     <div className="p-2 bg-slate-50 rounded-xl text-slate-300 group-hover:text-blue-600 transition-colors">
                        <Hash size={16} />
                     </div>
                   </div>
                   
                   <h3 className="text-xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                     {article.title}
                   </h3>
                   
                   <div className="flex flex-wrap items-center gap-2 mb-6 flex-1">
                     {article.tags.map(tag => (
                       <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">#{tag}</span>
                     ))}
                   </div>

                   <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-500">
                            {article.authorName.charAt(0)}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-800 truncate">{article.authorName}</p>
                            <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
                               <Clock size={10} /> {new Date(article.lastUpdated).toLocaleDateString()}
                            </p>
                         </div>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                         <ChevronRight size={20} />
                      </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* 3. Smart Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-slate-900/60 backdrop-blur-sm" onClick={() => setReadingArticle(null)}>
           <div 
             className="w-full max-w-4xl bg-white h-full shadow-2xl overflow-y-auto animate-slide-in-right relative"
             onClick={(e) => e.stopPropagation()}
           >
              {/* Header Floating Toolbar */}
              <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-10 py-6 border-b border-slate-100 flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <button onClick={() => setReadingArticle(null)} className="p-2 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl text-slate-500 transition-all">
                       <X size={20} />
                    </button>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{readingArticle.category} Archive</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <button className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all"><Share2 size={18} /></button>
                    <button className="p-3 bg-slate-50 text-slate-500 rounded-2xl hover:bg-amber-50 hover:text-amber-600 transition-all"><Bookmark size={18} /></button>
                 </div>
              </div>

              <div className="px-10 py-12 max-w-3xl mx-auto">
                 <div className="mb-12">
                    <h1 className="text-5xl font-black text-slate-900 mb-8 leading-[1.1]">{readingArticle.title}</h1>
                    
                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                       <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-blue-600">
                          {readingArticle.authorName.charAt(0)}
                       </div>
                       <div className="flex-1">
                          <p className="text-sm font-black text-slate-900">{readingArticle.authorName}</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Article Publisher • Internal SOP</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Revision</p>
                          <p className="text-xs font-black text-slate-900">{new Date(readingArticle.lastUpdated).toLocaleDateString()}</p>
                       </div>
                    </div>
                 </div>

                 <div className="prose prose-slate lg:prose-xl max-w-none prose-headings:font-black prose-p:font-bold prose-p:text-slate-600 prose-p:leading-relaxed">
                    <ReactMarkdown>{readingArticle.content}</ReactMarkdown>
                 </div>

                 <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Sparkles size={20} /></div>
                       <p className="text-xs font-black text-slate-500">Suggested improvements or corrections? <span className="text-blue-600 hover:underline cursor-pointer">Contact Author</span></p>
                    </div>
                    <div className="flex gap-2">
                       {readingArticle.tags.map(t => (
                         <span key={t} className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">#{t}</span>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* 4. AI Wiki Floating Assistant */}
      <AiWikiAssistant articles={articles} />
    </div>
  );
};

export default KnowledgeBase;
