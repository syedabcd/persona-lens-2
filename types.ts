export enum AnalysisMode {
  FAST = 'FAST',
  DEEP = 'DEEP',
  B2B = 'B2B'
}

export interface PersonalityTrait {
  name: string;
  score: number; // 1-10
  description: string;
}

export interface AnalysisReport {
  summary: string;
  traits: PersonalityTrait[];
  communicationStrategies: string[];
  datingMessage: string;
  redFlags: string[];
  greenFlags: string[];
  trustBuilding: string;
  psychologicalProfile: string;
}

export interface ClientGroup {
  groupName: string;
  description: string;
  buyingTriggers: string[];
  negotiationStyle: string;
  salesStrategy: string;
  clientNames: string[];
}

export interface SegmentationReport {
  overview: string;
  groups: ClientGroup[];
  marketTrends: string[];
}

export interface FormData {
  tikTokUsername: string;
  instagramUsername: string;
  twitterUsername: string;
  relationship: string;
  purpose: string; // e.g., Dating, Friendship, Business
  textContext: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface FileData {
  mimeType: string;
  data: string; // Base64
}

export interface ProtocolTask {
  day: number;
  focus: string;
  action: string;
  tip: string;
}

export interface ProtocolPlan {
  goal: string;
  tasks: ProtocolTask[];
}