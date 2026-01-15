
import React, { useState, useEffect, useMemo } from 'react';
import { Asset, AssetStatus, AssetCategory } from '../../../types';
import { assetsRepo } from '../../../services/assetsRepo';
import { GoogleGenAI } from "@google/genai";
import AssetCard from './AssetCard';
import AssetStats from './AssetStats';
import { Search, Plus, Filter, SlidersHorizontal, Sparkles, X, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const AssetsView: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // AI State
  const [aiInsight, setAiInsight] = useState<{asset: Asset, content: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    setLoading(true);
    const data = await assetsRepo.getAll();
    setAssets(data);
    setLoading(false);
  };

  const handleAiHealthCheck = async (asset: Asset) => {
    setIsAiLoading(true);
    setAiInsight({ asset, content: '' });

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `You are a heavy machinery expert. Analyze this asset:
    Name: ${asset.name}
    Category: ${asset.category}
    Serial: ${asset.serialNumber}
    Value: $${asset.value}
    Status: ${asset.status}
    Last Maintenance: ${asset.lastMaintenance || 'No record'}
    
    Provide:
    1. A technical health assessment.
    2. Recommended maintenance checklist for next 3 months.
    3. Estimated lifespan and replacement risk.
    
    Answer in professional Arabic. Keep it structured and concise.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiInsight({ asset, content: response.text || "لم يتمكن المساعد من تحليل البيانات حالياً." });
    } catch (err) {
      setAiInsight({ asset, content: "حدث خطأ أثناء الاتصال بخادم الذكاء الاصطناعي." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || a.category === filterCategory;
      const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [assets, searchTerm, filterCategory, filterStatus]);

  return (
    <div className="flex flex-col h-full space-y-8 animate-fade-in pb-10 overflow-hidden">
      {/* 1. KPI Dashboard */}
      {!loading && <AssetStats assets={assets} />}

      {/* 2. Control Bar */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="البحث باسم المعدة أو الرقم التسلسلي..." 
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
             <option value="All">جميع الفئات</option>
             {Object.values(AssetCategory).map(c => <option key={c} value={c}>{c}</option>)}
           </select>

           <select 
             className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black text-slate-600 outline-none"
             value={filterStatus}
             onChange={(e) => setFilterStatus(e.target.value)}
           >
             <option value="All">جميع الحالات</option>
             {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s}</option>)}
           </select>

           <div className="h-10 w-px bg-slate-100 hidden lg:block"></div>

           <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black hover:scale-105 transition-transform shadow-lg shadow-slate-900/20">
             <Plus size={18} /> إضافة أصل جديد
           </button>
        </div>
      </div>

      {/* 3. Assets Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
             <Loader2 className="animate-spin text-blue-600" size={48} />
             <p className="font-black text-slate-400">جاري تحميل سجل الأصول...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200">
             <AlertTriangle size={64} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-black">لم يتم العثور على أصول تطابق البحث.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredAssets.map(asset => (
              <AssetCard 
                key={asset.id} 
                asset={asset} 
                onClick={() => {}} 
                onAnalyze={handleAiHealthCheck}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Insight Overlay */}
      {aiInsight && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setAiInsight(null)}>
           <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl flex flex-col animate-scale-in relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 -mr-32 -mt-32 rounded-full blur-3xl"></div>
              
              <div className="p-8 border-b border-slate-100 flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200">
                      <Sparkles size={24} />
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-slate-900">تحليل الحالة الذكي</h3>
                     <p className="text-xs font-bold text-slate-400">{aiInsight.asset.name}</p>
                   </div>
                 </div>
                 <button onClick={() => setAiInsight(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={24}/></button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[60vh] relative z-10">
                 {isAiLoading ? (
                   <div className="flex flex-col items-center justify-center py-20 gap-4 text-right" dir="rtl">
                      <Loader2 className="animate-spin text-indigo-600" size={48} />
                      <p className="text-sm font-black text-slate-600 animate-pulse">يقوم Gemini بتحليل السجل الفني وتاريخ الصيانة...</p>
                   </div>
                 ) : (
                   <div className="prose prose-indigo max-w-none text-right" dir="rtl">
                      <ReactMarkdown>{aiInsight.content}</ReactMarkdown>
                   </div>
                 )}
              </div>

              {!isAiLoading && (
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-center">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <CheckCircle2 size={14} className="text-emerald-500" /> التقرير مُولد بناءً على البيانات الفنية المتوفرة في النظام.
                   </div>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default AssetsView;
