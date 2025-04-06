// Types for the webapp

export type LLMProvider = 'gemini' | 'openai' | 'claude'; // all the 3 LLMProviders i know of

export interface ApiKeys {
  gemini?: string;
  openai?: string;
  claude?: string;
}

export interface UserSettings {
  apiKeys: ApiKeys;
  preferredProvider: LLMProvider;
}

export interface AnalysisResult {
  text: string;
  provider: LLMProvider;
  timestamp: number;
}

export interface AnalysisRequest {
  imageBase64?: string;
  contextText?: string;
  provider: LLMProvider;
}

export interface UsageLimits {
  processedImages: {
    count: number;
    lastResetTime: number;
  }
}