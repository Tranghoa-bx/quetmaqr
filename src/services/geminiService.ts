import { GoogleGenAI } from "@google/genai";

export async function callGeminiAI(prompt: string, model: string = "gemini-1.5-flash", apiKey?: string) {
  try {
    // Priority: 1. Passed apiKey, 2. localStorage
    const key = apiKey || JSON.parse(localStorage.getItem('qr_grade_pro_data') || '{}')?.settings?.apiKey;

    if (!key) {
      throw new Error("Vui lòng cấu hình API Key trong phần Cài đặt");
    }

    const ai = new GoogleGenAI({
      apiKey: key,
    });
    
    // Note: @google/genai uses generateContent
    // Some versions might differ, but based on server.ts usage:
    const modelInstance = ai.models.get({ model: model });
    const response = await modelInstance.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    
    return response.text || "";
  } catch (error: any) {
    console.error("Gemini Client Service Error:", error);
    throw error;
  }
}
