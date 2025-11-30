import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisReport, AnalysisMode, FileData } from "../types";

// Initialize the client
// The API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const REPORT_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A brief summary of the person's character." },
    traits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the trait (e.g., Openness, Neuroticism)" },
          score: { type: Type.NUMBER, description: "Score from 1 to 10" },
          description: { type: Type.STRING, description: "Brief explanation of this score for this person" }
        }
      }
    },
    communicationStrategies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Bullet points on how to talk to them effectively."
    },
    datingMessage: { type: Type.STRING, description: "A drafted message or 'sales pitch' for a dating context." },
    redFlags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential warning signs." },
    greenFlags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Positive signs." },
    trustBuilding: { type: Type.STRING, description: "How to win their trust." },
    psychologicalProfile: { type: Type.STRING, description: "Deep psychological analysis paragraph." }
  },
  required: ["summary", "traits", "communicationStrategies", "datingMessage", "redFlags", "greenFlags", "trustBuilding", "psychologicalProfile"]
};

export const analyzePersona = async (
  context: string,
  files: FileData[],
  usernames: Record<string, string>,
  relationship: string,
  purpose: string,
  mode: AnalysisMode
): Promise<AnalysisReport> => {
  
  // Correct model names based on SDK guidelines
  const modelName = mode === AnalysisMode.DEEP 
    ? "gemini-3-pro-preview" 
    : "gemini-flash-lite-latest";

  // If Deep mode, we use thinking.
  const thinkingBudget = mode === AnalysisMode.DEEP ? 16384 : 0;

  const prompt = `
    Analyze the following person based on the provided text chats, social media context, and screenshots.
    
    Context:
    - Relationship to User: ${relationship}
    - User's Purpose: ${purpose}
    - Instagram: ${usernames.instagram || 'N/A'}
    - TikTok: ${usernames.tiktok || 'N/A'}
    - Twitter: ${usernames.twitter || 'N/A'}
    
    Additional Text Context:
    ${context}

    Task:
    Provide a psychological analysis. Identify personality traits (Big 5), communication style, red/green flags, and specific advice on how to interact with them for the stated purpose.
    Be insightful, direct, and practical.
  `;

  const parts: any[] = [{ text: prompt }];
  
  // Add images if any
  files.forEach(file => {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data
      }
    });
  });

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: REPORT_SCHEMA,
  };

  // Add thinking config only if budget > 0
  if (thinkingBudget > 0) {
    config.thinkingConfig = { thinkingBudget };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: config
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisReport;
    } else {
      throw new Error("No response generated.");
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const chatWithPersonaBot = async (
  history: { role: string; text: string }[],
  newMessage: string,
  reportContext: AnalysisReport
) => {
  
  // We use Flash for the chat for speed
  const model = "gemini-2.5-flash";

  const systemInstruction = `
    You are 'PersonaLens AI', a psychological assistant. 
    You have just analyzed a person with the following profile:
    ${JSON.stringify(reportContext)}
    
    The user is asking follow-up questions about this report and how to interact with the target person.
    Answer based on the report data. Be helpful, empathetic, but realistic.
    Keep answers concise unless asked for detail.
  `;

  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction,
    },
    // Map history to the correct format: { role, parts: [{ text }] }
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessageStream({ message: newMessage });
  return result;
};