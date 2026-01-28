import { GoogleGenAI, Type } from "@google/genai";
import { CityStats } from "../types";

/**
 * Strips markdown code blocks from a string to ensure valid JSON parsing.
 */
function cleanJsonResponse(text: string): string {
  if (!text) return "";
  // Removes ```json and ``` markers that models often wrap responses in
  return text.replace(/```json\n?|```/g, "").trim();
}

/**
 * Fetches context for a city (weather, festivals, industrial activity) 
 */
export async function getCityContext(city: string, date: string, days: number): Promise<CityStats> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze water demand context for ${city}, Mumbai for the ${days}-DAY period starting ${date}. Include local festivals and industrial activity levels.`,
      config: {
        systemInstruction: "You are a senior urban infrastructure analyst for the BMC. You MUST output ONLY valid JSON that matches the requested schema. Do not include any conversational text.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            avgMonthlyTemp: { type: Type.NUMBER },
            industrialZoneActivity: { type: Type.STRING, enum: ["low", "normal", "high"] },
            festivals: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  date: { type: Type.STRING, description: "YYYY-MM-DD" },
                  impactLevel: { type: Type.STRING, enum: ["low", "medium", "high"] },
                  description: { type: Type.STRING }
                }
              }
            }
          },
          required: ["city", "avgMonthlyTemp", "festivals", "industrialZoneActivity"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("API returned no content. Please check your API key quota or safety filters.");
    }

    const jsonStr = cleanJsonResponse(text);
    const data = JSON.parse(jsonStr);
    
    return {
      ...data,
      population: 1500000 
    };
  } catch (error: any) {
    console.error("Gemini context error:", error);
    if (error.message?.includes("429")) {
      throw new Error("QUOTA_EXHAUSTED: Rate limit reached. Please wait 60 seconds.");
    }
    throw new Error(`AI_CONTEXT_ERROR: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Generates expert strategy and reasoning
 */
export async function getAIReasoning(
  city: string, 
  date: string, 
  stats: CityStats, 
  prediction: number,
  days: number
): Promise<{ reasoning: string, recommendations: string[] }> {
  // Using Flash instead of Pro to prevent 429 quota issues
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide water management strategy for ${city} starting ${date}. 
      Total demand predicted: ${prediction} liters over ${days} days. 
      Factors: ${stats.festivals.length} festivals, ${stats.industrialZoneActivity} industrial load.`,
      config: {
        systemInstruction: "You are the Chief Water Engineer for Mumbai. Provide a concise professional reasoning and actionable recommendations in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["reasoning", "recommendations"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("API reasoning failed. Check safety filter settings or model availability.");
    }

    const jsonStr = cleanJsonResponse(text);
    return JSON.parse(jsonStr);
  } catch (error: any) {
    console.error("Gemini reasoning error:", error);
    if (error.message?.includes("429")) {
      throw new Error("QUOTA_EXHAUSTED: Rate limit reached. Please wait 60 seconds.");
    }
    throw new Error(`AI_REASONING_ERROR: ${error.message || 'Unknown error'}`);
  }
}