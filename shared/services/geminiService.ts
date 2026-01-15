
import { GoogleGenAI } from "@google/genai";
import { WorkItem, NotificationPriority, NotificationCategory } from "../types";

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

/**
 * Generates a high-level executive dashboard briefing.
 */
export const generateExecutiveBrief = async (
  stats: {
    totalProjects: number,
    totalBudget: number,
    spentBudget: number,
    criticalIssues: number,
    delayedTasks: number,
    teamSize: number
  }
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI unavailable.";

  const prompt = `
    As a Strategic Construction Consultant, review this dashboard data for Enjaz One:
    
    - Active Projects: ${stats.totalProjects}
    - Financials: Spent $${(stats.spentBudget/1000000).toFixed(1)}M of $${(stats.totalBudget/1000000).toFixed(1)}M Budget
    - Critical Incidents: ${stats.criticalIssues}
    - Delayed Tasks: ${stats.delayedTasks}
    - Workforce: ${stats.teamSize} active users

    Provide a "Morning Executive Brief" in Arabic.
    Structure:
    1. **Overall Health Score**: (0-100%) with a short justification.
    2. **Critical Focus**: One specific area requiring immediate CEO attention (Financials, Safety, or Timeline).
    3. **Efficiency Tip**: One actionable advice to improve team velocity based on the delayed tasks count.
    
    Keep it concise, professional, and visually structured (use bullet points).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    return "Error generating brief.";
  }
};

/**
 * Analyzes notification content to determine priority and category.
 */
export const analyzeNotification = async (
  title: string, 
  message: string
): Promise<{ priority: NotificationPriority, category: NotificationCategory, summary?: string }> => {
  const ai = getAiClient();
  // Default values if AI fails or key missing
  const defaultResult: { priority: NotificationPriority, category: NotificationCategory } = { 
    priority: 'normal', 
    category: 'system' 
  };

  if (!ai) return defaultResult;

  const prompt = `
    Analyze this notification for a construction management app.
    Title: "${title}"
    Message: "${message}"

    Determine:
    1. Priority: (critical, high, normal, low) based on urgency/safety/budget keywords.
    2. Category: (approval, task, security, mention, system).
    3. Summary: A very short 5-word summary (Arabic).

    Output JSON only: {"priority": "...", "category": "...", "summary": "..."}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text;
    if (!text) return defaultResult;
    
    const data = JSON.parse(text);
    return {
      priority: (data.priority || 'normal').toLowerCase(),
      category: (data.category || 'system').toLowerCase(),
      summary: data.summary
    };
  } catch (error) {
    console.warn("AI Notification Analysis Failed:", error);
    return defaultResult;
  }
};
