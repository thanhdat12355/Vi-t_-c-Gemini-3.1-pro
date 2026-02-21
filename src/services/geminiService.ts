import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface TranslationResult {
  translation: string;
  explanation: string;
}

export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<TranslationResult> {
  if (!text.trim()) return { translation: "", explanation: "" };
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: text,
      config: {
        systemInstruction: `You are a professional translator and language tutor. Translate the given text from ${sourceLang} to ${targetLang}. 
Also provide a helpful explanation. If the input is a single word with multiple meanings (like German 'morgen'), explain the different contexts and nuances (e.g., noun vs adverb, capitalization rules). If it's a sentence, briefly explain key vocabulary or grammar points. Provide the explanation in Vietnamese.`,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            translation: {
              type: Type.STRING,
              description: "The direct translation of the text."
            },
            explanation: {
              type: Type.STRING,
              description: "Explanation of nuances, context, grammar, or multiple meanings (in Vietnamese)."
            }
          },
          required: ["translation", "explanation"]
        }
      }
    });
    
    const result = JSON.parse(response.text || "{}");
    return {
      translation: result.translation || "",
      explanation: result.explanation || ""
    };
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Lỗi dịch thuật. Vui lòng thử lại. / Übersetzungsfehler. Bitte versuchen Sie es erneut.");
  }
}
