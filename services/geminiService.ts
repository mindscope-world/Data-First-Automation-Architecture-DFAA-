import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAssessmentReport = async (
  answers: Record<string, number>,
  totalScore: number
): Promise<string> => {
  if (!process.env.API_KEY) {
    console.warn("No API Key found. Returning mock data for demo purposes.");
    return `**Executive Analysis (Demo)**
    
Based on your inputs, your organization is currently in the **Reactive Phase**. You have some data collection in place, but it lacks the governance and structure required for reliable AI implementation.

**Key Risks**
*   **High probability of AI hallucinations** due to inconsistent schemas and lack of a single source of truth.
*   **Manual intervention** is likely slowing down your "automated" workflows, reducing ROI.
*   **Decision latency** caused by days-old reporting instead of real-time insights.

**Recommended Roadmap**
1.  **Immediate:** Conduct a full schema audit of your primary CRM/ERP to identify "dirty data".
2.  **Short-term:** Implement a Single Source of Truth (SSOT) data warehouse (e.g., BigQuery, Snowflake).
3.  **Long-term:** Once data is validated, deploy agentic workflows for customer support using governed context.`;
  }

  try {
    const prompt = `
      You are the AI engine of Datova OS, a "Data-First Automation Architecture" platform.
      A user has completed a readiness assessment and is now looking at their interactive dashboard.
      
      Here is their scoring breakdown (0-100 scale, where 100 is perfect):
      - Total Score: ${totalScore}/100
      - Detailed Answers (Question ID -> Score 1-5): ${JSON.stringify(answers)}

      Context on Questions:
      - q1: Data Centralization
      - q2: Schema Consistency
      - q3: Governance/Documentation
      - q4: Current Automation Level
      - q5: Team Skillset

      Please generate a concise, professional executive summary (max 200 words) to display on their dashboard overview.
      Structure your response exactly as follows:
      1. A short introductory paragraph assessing their current phase. Use **bold** for the specific phase (e.g. **Chaos Phase**, **Reactive Phase**, **Defined Phase**, **Strategic Phase**).
      2. A header "**Critical Bottleneck**" followed by 1-2 sentences identifying their lowest scoring area.
      3. A header "**Recommended Actions**" followed by a list of 3 bullet points (start each with "* ") specific to the DFAA methodology.

      Do not use markdown headers (# or ##). Use **Bold** for headers instead. Keep the tone professional, technical, and constructive.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "We encountered an error analyzing your data. Please ensure your network is connected and try again.";
  }
};

export const chatWithData = async (
  message: string,
  dashboardContext: any
): Promise<string> => {
  if (!process.env.API_KEY) {
    return "I can't connect to the AI engine right now (Missing API Key). However, normally I would analyze your data metrics, such as the inventory spike in SKU-1920 or the $124,500 revenue trend.";
  }

  try {
    const prompt = `
      You are the "Datova AI Console" assistant. You are chatting with a user inside a demo dashboard of the Datova OS platform.
      
      Here is the current operational data available in the dashboard (Mock Data):
      ${JSON.stringify(dashboardContext, null, 2)}
      
      User Query: "${message}"
      
      Instructions:
      1. Answer the user's query acting as an intelligent data analyst agent.
      2. Use specific numbers from the context (e.g., revenue figures, error rates, active agents).
      3. If the user asks about something not in the data, explain that you are analyzing the connected data sources and suggest a relevant metric from the context.
      4. Keep responses concise (under 3 sentences) and conversational.
      5. Tone: Helpful, precise, and sophisticated.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I'm processing that request but received no output.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I encountered a temporary connection issue. Please try asking again.";
  }
};