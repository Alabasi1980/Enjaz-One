
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Article } from '../../../types';
import { Sparkles, Send, X, Bot, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiWikiAssistantProps {
  articles: Article[];
}

const AiWikiAssistant: React.FC<AiWikiAssistantProps> = ({ articles }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setResponse(null);

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Constructing context from local knowledge base
    const context = articles.map(a => `Title: ${a.title}\nContent: ${a.content}`).join('\n\n---\n\n');
    
    const prompt = `You are Enjaz AI, the intelligent assistant for Enjaz One construction platform.
    Use the following internal Knowledge Base articles to answer the user's question accurately.
    
    Knowledge Base:
    ${context}
    
    Question: ${query}
    
    If the answer is not in the knowledge base, state that you don't have this information internally but provide a general professional advice based on international construction standards.
    Answer in professional Arabic language. Use Markdown for formatting.`;

    try {
      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setResponse(result.text || "عذراً، لم أتمكن من استخراج إجابة.");
    } catch (error) {
      setResponse("حدث خطأ أثناء الاتصال بمركز المعلومات الذكي.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center gap-3 group"
        >
          <div className="relative">
             <Bot size={28} />
             <Sparkles className="absolute -top-1 -right-1 text-blue-400 animate-pulse" size={12} />
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">اسأل المساعد الذكي</span>
        </button>
      ) : (
        <div className="bg-white rounded-[2.5rem] w-[450px] shadow-2xl border border-slate-200 flex flex-col animate-scale-in overflow-hidden max-h-[600px]">
           <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-600 rounded-xl"><Bot size={20} /></div>
                 <div>
                    <h3 className="text-sm font-black">Enjaz AI Assistant</h3>
                    <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Internal Knowledge Brain</p>
                 </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
           </div>

           <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 no-scrollbar">
              {!response && !isLoading && (
                 <div className="text-center py-10 space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
                       <BookOpen size={32} />
                    </div>
                    <p className="text-sm font-bold text-slate-500 px-6">اطرح أي سؤال حول إجراءات الشركة، معايير السلامة، أو السياسات الداخلية.</p>
                 </div>
              )}

              {isLoading && (
                 <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-xs font-black text-slate-400 animate-pulse">جاري تحليل الوثائق الداخلية...</p>
                 </div>
              )}

              {response && (
                 <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm prose prose-sm prose-slate max-w-none text-right" dir="rtl">
                    <ReactMarkdown>{response}</ReactMarkdown>
                 </div>
              )}
           </div>

           <form onSubmit={handleAsk} className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                 <input 
                   type="text" 
                   className="w-full pl-4 pr-12 py-3 bg-slate-100 border border-transparent focus:border-blue-500 rounded-2xl text-sm font-bold outline-none transition-all"
                   placeholder="كيف يمكنني طلب إجازة؟"
                   value={query}
                   onChange={e => setQuery(e.target.value)}
                   dir="rtl"
                 />
                 <button 
                   type="submit"
                   disabled={isLoading || !query.trim()}
                   className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                 >
                    <Send size={16} className="rotate-180" />
                 </button>
              </div>
              <p className="text-[9px] text-center text-slate-400 mt-3 font-bold uppercase flex items-center justify-center gap-1">
                 <AlertCircle size={10} /> البيانات مستخرجة من قاعدة المعرفة الخاصة بـ Enjaz One
              </p>
           </form>
        </div>
      )}
    </div>
  );
};

export default AiWikiAssistant;
