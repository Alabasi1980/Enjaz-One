
import { GoogleGenAI } from "@google/genai";
import { WorkItem } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("Critical: API_KEY is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes a construction work item to provide risks and recommendations.
 */
export const analyzeWorkItem = async (item: WorkItem): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Service Unavailable: Missing API Key.";

  const prompt = `
    You are an expert Senior Operations Manager for Enjaz One, a top-tier construction firm.
    Provide a detailed analysis for the following Work Item.
    
    Work Item Context:
    - ID: ${item.id}
    - Title: ${item.title}
    - Type: ${item.type}
    - Priority: ${item.priority}
    - Status: ${item.status}
    - Details: ${item.description}
    
    Required Analysis (in professional Arabic):
    1. **Summary**: Concise explanation of the core problem or requirement.
    2. **Risk Impact**: Evaluate risks on Budget, Safety, and Timeline if delayed.
    3. **Strategy**: Immediate 3 steps to resolve this.
    4. **Routing**: If currently unassigned, suggest the most qualified role to handle this.

    Tone: Authoritative, professional, and field-oriented.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High-quality reasoning for operational decisions
      contents: prompt,
    });
    return response.text || "لم نتمكن من تحليل البيانات.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "نعتذر، حدث خطأ أثناء الاتصال بمركز الذكاء الاصطناعي.";
  }
};

/**
 * Quick priority suggestion based on title/description.
 */
export const suggestWorkItemPriority = async (title: string, description: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Medium";

  const prompt = `
    Based on this construction task, suggest a priority (Low, Medium, High, Critical). 
    Title: ${title}
    Desc: ${description}
    Only return the single word.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Fast & cheap for simple tasks
      contents: prompt,
    });
    return response.text?.trim() || "Medium";
  } catch (error) {
    return "Medium";
  }
};
