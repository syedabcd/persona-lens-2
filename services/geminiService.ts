import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisReport, AnalysisMode, FileData, ProtocolPlan, SegmentationReport, CompatibilityReport } from "../types";

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

const PROTOCOL_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    goal: { type: Type.STRING },
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          focus: { type: Type.STRING, description: "The thematic focus of the day" },
          action: { type: Type.STRING, description: "The specific action to take" },
          tip: { type: Type.STRING, description: "Psychological tip for execution" }
        }
      }
    }
  },
  required: ["goal", "tasks"]
};

const SEGMENTATION_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overview: { type: Type.STRING, description: "High level summary of the client base analyzed." },
    groups: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          groupName: { type: Type.STRING, description: "Creative name for this client segment (e.g. 'The Skeptics')" },
          description: { type: Type.STRING, description: "Who they are and how they think." },
          buyingTriggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What makes them buy." },
          negotiationStyle: { type: Type.STRING, description: "How they negotiate." },
          salesStrategy: { type: Type.STRING, description: "Specific tactic to close deals with this group." },
          clientNames: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of names/identifiers from input that fit this group." }
        }
      }
    },
    marketTrends: { type: Type.ARRAY, items: { type: Type.STRING }, description: "General patterns observed across all clients." }
  },
  required: ["overview", "groups", "marketTrends"]
};

const COMPATIBILITY_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: "Compatibility score from 0 to 100" },
    scoreLabel: { type: Type.STRING, description: "A creative 2-3 word label for this match (e.g. 'Volatile Genius', 'Soulmates')" },
    synergy: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of areas where the two personalities align well." },
    conflicts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of potential friction points." },
    longTermPrediction: { type: Type.STRING, description: "Prediction of how the relationship evolves over time." },
    advice: { type: Type.STRING, description: "Strategic advice to make it work." }
  },
  required: ["overallScore", "scoreLabel", "synergy", "conflicts", "longTermPrediction", "advice"]
};

export const analyzePersona = async (
  context: string,
  files: FileData[],
  usernames: Record<string, string>,
  relationship: string,
  purpose: string,
  mode: AnalysisMode
): Promise<AnalysisReport> => {
  
  // Use gemini-2.5-flash for both modes to prevent timeouts with the heavier 3-pro model
  // This resolves the 500 XHR error by ensuring lower latency responses.
  const modelName = "gemini-2.5-flash";

  // If Deep mode, we use thinking.
  // Budget reduced to 10240 to ensure the thinking process completes before browser/proxy timeouts.
  const thinkingBudget = mode === AnalysisMode.DEEP ? 10240 : 0;

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

export const analyzeClientSegmentation = async (
  context: string,
  files: FileData[],
  industry: string,
  objective: string
): Promise<SegmentationReport> => {
  const modelName = "gemini-2.5-flash";
  
  const prompt = `
    You are an expert sales psychologist and B2B strategist.
    
    Context:
    - Industry: ${industry}
    - Sales Objective: ${objective}
    
    Data Source:
    The user has provided text/screenshots containing notes, emails, or interactions with multiple potential clients or leads.
    
    Task:
    1. Identify distinct individuals or client entities within the provided data.
    2. Analyze their language, concerns, and objections.
    3. Segment them into psychological groups based on their negotiation style and buying triggers.
    4. Provide actionable sales strategies for each group.
    
    Input Data:
    ${context}
  `;

  const parts: any[] = [{ text: prompt }];
  
  files.forEach(file => {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data
      }
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: SEGMENTATION_SCHEMA,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SegmentationReport;
    } else {
      throw new Error("No response generated.");
    }
  } catch (error) {
    console.error("Segmentation failed:", error);
    throw error;
  }
};

export const analyzeCompatibility = async (
  targetData: string,
  userData: string,
  files: FileData[],
  relationshipType: string
): Promise<CompatibilityReport> => {
  const modelName = "gemini-2.5-flash";
  
  const prompt = `
    You are a relationship psychologist and compatibility expert.
    
    Task:
    Compare the personality of "The User" (Person A) with "The Target" (Person B) based on the provided data.
    Determine their compatibility score, synergy areas, and friction points.
    
    User Context (Person A - The User):
    ${userData}
    
    Target Context (Person B - The Target):
    ${targetData}
    
    Relationship Type: ${relationshipType}
  `;

  const parts: any[] = [{ text: prompt }];
  
  files.forEach(file => {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data
      }
    });
  });

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: COMPATIBILITY_SCHEMA,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as CompatibilityReport;
    } else {
      throw new Error("No response generated.");
    }
  } catch (error) {
    console.error("Compatibility Analysis failed:", error);
    throw error;
  }
};

export const generateActionPlan = async (
  report: AnalysisReport,
  goal: string
): Promise<ProtocolPlan> => {
  const modelName = "gemini-2.5-flash";

  const prompt = `
    Based on the following psychological analysis of a person, create a 7-day action plan (The Daily Protocol) to achieve the specific goal: "${goal}".
    
    Target Profile Summary: ${report.summary}
    Target Traits: ${report.traits.map(t => `${t.name} (${t.score}/10)`).join(', ')}
    Communication Style: ${report.communicationStrategies.join('; ')}
    
    The plan should be practical, subtle, and psychologically calibrated to this specific person.
    For each day, provide:
    - Focus: A 2-3 word theme.
    - Action: A specific thing to do or say.
    - Tip: A psychological nuance to keep in mind.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: PROTOCOL_SCHEMA,
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as ProtocolPlan;
  } else {
    throw new Error("Failed to generate protocol.");
  }
};

export const chatWithPersonaBot = async (
  history: { role: string; text: string }[],
  newMessage: string,
  reportContext: AnalysisReport | null
) => {
  
  // We use Flash for the chat for speed
  const model = "gemini-2.5-flash";

  const contextStr = reportContext ? JSON.stringify(reportContext) : "No specific profile loaded. Ask general strategic advice.";

  const systemInstruction = `
    You are 'The Strategist', an elite communication expert and conflict negotiator.
    
    Target Profile Context:
    ${contextStr}
    
    Your Goal: Provide real-time, high-stakes tactical advice to the user.
    - Do not be generic. Be precise, strategic, and Machiavellian if necessary (but ethical).
    - If the user asks what to say, draft specific messages.
    - If the user asks about a behavior, explain the hidden psychological motive.
    - Keep responses concise, actionable, and confident.
    
    The user is treating you as a high-end consultant for this relationship.
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