import React, { useState } from 'react';
import { WorkItem } from '../../../shared/types';
import { analyzeWorkItem } from '../../../shared/services/geminiService';
import { Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiAnalysisCardProps {
  item: WorkItem;
}

const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({ item }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeWorkItem(item);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="border border-indigo-100 bg-indigo-50/50 rounded-xl p-5 relative overflow-hidden mt-6">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={100} className="text-indigo-600" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-indigo-600" size={20} />
          <h3 className="text-indigo-900 font-bold">Enjaz AI Assistant</h3>
        </div>
        
        {!aiAnalysis && !isAnalyzing && (
          <div className="text-center py-4">
            <p className="text-sm text-indigo-700 mb-3">Analyze this work item to get risk assessments and recommended actions.</p>
            <button 
              onClick={handleAiAnalysis}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm text-sm font-medium transition-all"
            >
              Analyze Work Item
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex items-center justify-center py-6 gap-3 text-indigo-700">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Analyzing with Gemini...</span>
          </div>
        )}

        {aiAnalysis && (
          <div className="prose prose-sm prose-indigo bg-white/60 p-4 rounded-lg border border-indigo-100 max-w-none">
            <ReactMarkdown>{aiAnalysis}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAnalysisCard;