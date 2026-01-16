
import { GoogleGenAI, Type } from "@google/genai";
import { WorkItem, Project } from "../shared/types";
import { IAiService } from "../data/contracts";

export class GeminiAiService implements IAiService {
  constructor() {}

  async analyzeWorkItem(item: WorkItem): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `قم بتحليل المهمة التالية من منظور مهندس سلامة ومشاريع خبير:
        العنوان: ${item.title}
        الوصف: ${item.description}
        النوع: ${item.type}
        الأولوية: ${item.priority}
        المشروع: ${item.projectId}
        
        المطلوب:
        1. تقييم المخاطر المحتملة.
        2. الإجراءات الموصى بها لتسريع الإنجاز.
        3. قائمة فحص (Checklist) مقترحة للسلامة.`,
        config: {
          systemInstruction: "أنت مساعد تقني خبير في قطاع المقاولات السعودي. رد باللغة العربية بأسلوب مهني ومباشر باستخدام Markdown."
        }
      });
      return response.text || "فشل الحصول على تحليل دقيق حالياً.";
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("فشل الاتصال بمحرك الذكاء الاصطناعي.");
    }
  }

  async generateDailyReport(project: Project, items: WorkItem[], materials: any[], labor?: any[], machines?: any[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const today = new Date().toLocaleDateString('ar-SA');
    
    const context = `
    مشروع: ${project.name}
    التاريخ: ${today}
    العمليات المنجزة: ${items.map(i => i.title).join(' | ')}
    المواد المستهلكة: ${materials.length} صنف
    العمالة: ${labor?.length || 0} فئة
    المعدات: ${machines?.length || 0} آلية
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `صغ تقريراً يومياً احترافياً بناءً على هذه البيانات: ${context}. تضمن ملخصاً تشغيلياً وتوقعات لليوم التالي.`,
        config: {
          systemInstruction: "أنت مهندس موقع خبير (Site Engineer). رد باللغة العربية بأسلوب فني دقيق."
        }
      });
      return response.text || "لم نتمكن من صياغة التقرير.";
    } catch (error) {
      return "خطأ في معالجة التقرير.";
    }
  }

  async generateFinancialInsight(project: Project, actualCosts: any): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `قم بتحليل الوضع المالي للمشروع التالي:
        المشروع: ${project.name}
        الميزانية الكلية: ${project.budget}
        المصروف الكلي: ${project.spent}
        تفصيل المصاريف الحالية: مواد (${actualCosts.materials}), عمالة (${actualCosts.labor}), معدات (${actualCosts.equipment})
        
        المطلوب:
        1. تحليل الانحراف المالي.
        2. التنبؤ بالمخاطر المالية المستقبلية.
        3. توصيتين لضغط التكاليف دون التأثير على الجودة.`,
        config: {
          systemInstruction: "أنت مراقب مالي (Financial Controller) خبير في قطاع الإنشاءات. رد باللغة العربية بأسلوب تنفيذي مختصر."
        }
      });
      return response.text || "لا توجد توصيات مالية حالياً.";
    } catch (error) {
      return "فشل تحليل البيانات المالية.";
    }
  }

  async suggestPriority(title: string, description: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `اقترح أولوية: ${title} - ${description}`,
        config: {
          systemInstruction: "أنت منسق مشاريع خبير. رد فقط بكلمة واحدة تمثل الأولوية بالإنجليزية."
        }
      });
      return response.text?.trim() || "Medium";
    } catch (error) {
      return "Medium";
    }
  }

  async askWiki(context: string, query: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `سياق: ${context}\nسؤال: ${query}`,
        config: {
          systemInstruction: "أنت خبير سياسات الموارد البشرية والتشغيل في شركة إنجاز."
        }
      });
      return response.text || "لم أجد إجابة دقيقة.";
    } catch (error) {
      return "مشكلة في قراءة قاعدة المعرفة.";
    }
  }

  async generateExecutiveBrief(stats: any): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `ملخص تنفيذي لبيانات الأداء: ${JSON.stringify(stats)}`,
      });
      return response.text || "البيانات غير كافية.";
    } catch (error) {
      return "فشل إنشاء التقرير التنفيذي.";
    }
  }

  async analyzeNotification(title: string, message: string): Promise<{ priority: string; category: string; summary?: string }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `تحليل تنبيه: ${title} - ${message}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              priority: { type: Type.STRING },
              category: { type: Type.STRING },
              summary: { type: Type.STRING }
            },
            required: ["priority", "category"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      return { priority: "normal", category: "system" };
    }
  }
}

export const geminiService = new GeminiAiService();
