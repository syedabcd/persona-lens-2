export enum AnalysisMode {
  FAST = 'FAST',
  DEEP = 'DEEP',
  B2B = 'B2B',
  COMPATIBILITY = 'COMPATIBILITY'
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

export interface CompatibilityReport {
  overallScore: number; // 0-100
  scoreLabel: string; // e.g., "High Voltage", "Toxic Match"
  synergy: string[];
  conflicts: string[];
  longTermPrediction: string;
  advice: string;
}

export interface FormData {
  relationship: string;
  purpose: string; // e.g., Dating, Friendship, Business
  textContext: string;
  userContext?: string; // For compatibility mode
  uploadedContent: string; // Content from text files
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

export interface SimulationFeedback {
  score: number; // 0-100
  outcome: string; // "Success", "Failure", "Stalemate"
  strengths: string[];
  weaknesses: string[];
  tacticalAdvice: string;
}

export interface MonitoredProfile {
  id: string;
  name: string;
  status: string;
  lastScan: string;
  changeDetected: boolean;
}

export type ScrapeStatus = 'success' | 'loading' | 'error' | 'skipped' | 'no_content';

export interface PlatformResult {
  platform: string;
  username: string;
  status: ScrapeStatus;
  text: string;
  chars: number;
  error?: string;
  httpStatus?: number;
}