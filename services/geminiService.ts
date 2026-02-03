
import { GoogleGenAI } from "@google/genai";

// Always use the recommended initialization with named apiKey parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const optimizeText = async (text: string, context: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Agisci come un esperto HR italiano. Ottimizza il seguente testo per un Curriculum Vitae professionale in Italia. 
      Contesto: ${context}. 
      Testo originale: "${text}". 
      Rispondi solo con il testo ottimizzato in italiano formale.`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text;
  }
};

export const translateToItalian = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Traduci professionalmente in italiano per un CV: "${text}". Rispondi solo con la traduzione.`,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text;
  }
};
