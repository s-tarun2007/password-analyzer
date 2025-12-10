

export interface AIAnalysisResult {
  score: number;
  crackTime: string;
  weaknesses: string[];
  strengths: string[];
  aiInsight: string;
  breachProbability: string; // "Low", "Medium", "High", "Critical"
  similarPatterns: string[];
  attackVectors: string[]; // specific attack types capable of cracking this password
}

export interface BoostResult {
  boostedPassword: string;
  explanation: string;
}

export interface BoostSuggestions {
  suggestedSymbols: string[];
  suggestedSuffixes: string[];
  leetspeak: Array<{ original: string; replacement: string }>;
}

export interface TerminalLine {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

export type InputModeType = 'text' | 'voice' | 'retina' | 'bio';

export interface SavedPasswordEntry {
  id: string;
  password: string;
  savedAt: string;
  lastAccessedAt?: string;
  score?: number;
  description?: string;
  type: InputModeType; // New field for classification
  expiresAt?: string; // ISO Date string (YYYY-MM-DD)
}

export enum AnalysisState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}