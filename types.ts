

export enum AnalysisMode {
  FAST = 'FAST',
  DEEP = 'DEEP',
  B2B = 'B2B',
  COMPATIBILITY = 'COMPATIBILITY'
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  subscription_tier: 'Free' | 'Pro' | 'Enterprise';
  credits: number;
  avatar_url?: string;
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
  language: 'english' | 'roman'; // Added Language Selection
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

export interface SocialProfile {
  username: string;
  display_name: string;
  bio: string;
  followers: number;
  following: number;
  posts_count: number;
  platform: string;
  profile_image: string;
  external_links: string[];
  is_verified: boolean;
  
  // Enhanced Data Points
  location?: string;
  email?: string;
  is_business_account?: boolean;
  business_category?: string;
  work_history?: string[]; // For LinkedIn
  education?: string[]; // For LinkedIn
  
  raw_posts_text: string; // Concatenated captions for analysis
  scrape_timestamp: string;
}

export interface HistoryItem {
  id: string;
  user_id: string;
  mode: string;
  title: string;
  summary: string;
  report_data: AnalysisReport | SegmentationReport | CompatibilityReport;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML or Markdown
  image_url: string;
  author: string;
  created_at: string;
  meta_description: string;
}