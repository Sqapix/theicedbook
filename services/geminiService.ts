
import { GoogleGenAI } from "@google/genai";
import { AuthorDetails } from "../types";

export const fetchAuthorBio = async (authorName: string): Promise<AuthorDetails> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // prompt simplified and search removed for maximum speed
  const prompt = `provide a brief but profound biography for the author ${authorName}. 
  include their birth/death info and a 2-paragraph bio focusing on their style.
  keep all output in lowercase. be direct.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        // removed googleSearch to reduce latency significantly
        temperature: 0.7,
      },
    });

    const text = response.text || "biography not available.";

    return {
      name: authorName,
      biography: text,
      notableWorks: [],
      sources: [],
    };
  } catch (error) {
    console.error("error fetching author bio:", error);
    throw error;
  }
};
