import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisReport, AnalysisMode, FileData, ProtocolPlan, SegmentationReport, CompatibilityReport, SimulationFeedback } from "../types";

// Initialize the client
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

const SIMULATION_FEEDBACK_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: "Score from 0-100 based on how well the user achieved the goal" },
    outcome: { type: Type.STRING, description: "One word: Success, Failure, or Stalemate" },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What the user did well" },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "What the user did poorly" },
    tacticalAdvice: { type: Type.STRING, description: "Specific advice for next time" }
  },
  required: ["score", "outcome", "strengths", "weaknesses", "tacticalAdvice"]
};

// --- MAIN ANALYSIS FUNCTIONS ---

export const analyzePersona = async (
  context: string, // Manual text context
  files: FileData[], // Images (Screenshots)
  relationship: string,
  purpose: string,
  mode: AnalysisMode,
  uploadedContent: string = ""
): Promise<AnalysisReport> => {
  
  const fullContext = `
    --- UPLOADED TEXT FILES / CHAT LOGS ---
    ${uploadedContent}

    --- MANUAL USER CONTEXT ---
    ${context}
  `;

  const modelName = "gemini-3-flash-preview";
  const thinkingBudget = mode === AnalysisMode.DEEP ? 10240 : 0;

  const prompt = `
    Analyze the following person based on the provided aggregated data (chat logs, screenshots, and notes).
    
    Context:
    - Relationship to User: ${relationship}
    - User's Purpose: ${purpose}
    
    Data Source:
    ${fullContext}

    Task:
    Provide a psychological analysis. Identify personality traits (Big 5), communication style, red/green flags, and specific advice on how to interact with them for the stated purpose.
    Be insightful, direct, and practical.
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

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: REPORT_SCHEMA,
  };

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
  const modelName = "gemini-3-flash-preview";
  
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
  const modelName = "gemini-3-flash-preview";
  
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
  const modelName = "gemini-3-flash-preview";

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
  const model = "gemini-3-flash-preview";
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
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessageStream({ message: newMessage });
  return result;
};

export const createSimulationChat = (
  reportContext: AnalysisReport,
  goal: string
) => {
  const model = "gemini-3-flash-preview";
  const contextStr = JSON.stringify(reportContext);

  const systemInstruction = `
    ROLEPLAY SIMULATION ACTIVATED.
    
    You are NOT an AI assistant. You are now roleplaying as the Target Person described in the profile below.
    
    Target Profile:
    ${contextStr}
    
    User's Goal in this conversation: "${goal}"
    
    INSTRUCTIONS:
    1. Stay completely in character. Adopt their tone, vocabulary, and defense mechanisms.
    2. If the profile is "Avoidant", be evasive. If "Aggressive", be confrontational. If "Analytical", be cold and logical.
    3. React naturally to the user. If they say something that would trigger a red flag for this specific personality, react negatively.
    4. Do not break character. Do not offer advice. Just BE the person.
    5. Keep responses relatively short, like a real chat or spoken conversation.
  `;

  return ai.chats.create({
    model: model,
    config: {
      systemInstruction,
    },
    history: []
  });
};

export const evaluateSimulation = async (
  history: { role: string; text: string }[],
  goal: string,
  reportContext: AnalysisReport
): Promise<SimulationFeedback> => {
  const modelName = "gemini-3-flash-preview";

  const prompt = `
    Analyze the following roleplay transcript between the User and the Target.
    
    User's Goal: "${goal}"
    
    Target Profile Used: ${JSON.stringify(reportContext.summary)}
    Target Traits: ${reportContext.traits.map(t => t.name).join(', ')}
    
    Transcript:
    ${history.map(h => `${h.role === 'user' ? 'User' : 'Target'}: ${h.text}`).join('\n')}
    
    Task:
    Evaluate the User's performance.
    1. Did they achieve their goal?
    2. Did they navigate the Target's personality traits effectively?
    3. Did they trigger any psychological defense mechanisms?
    
    Provide a score (0-100), outcome, strengths, weaknesses, and tactical advice.
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: SIMULATION_FEEDBACK_SCHEMA,
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as SimulationFeedback;
  } else {
    throw new Error("Failed to evaluate simulation.");
  }
};