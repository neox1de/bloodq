'use client';

import { ApiKeys, LLMProvider, UserSettings, UsageLimits } from '../types';

const SETTINGS_KEY = 'bloodq_user_settings';
const USAGE_LIMITS_KEY = 'bloodq_usage_limits';

// Default settings
const defaultSettings: UserSettings = {
  apiKeys: {},
  preferredProvider: 'gemini'
};

// Default usage limits
const defaultUsageLimits: UsageLimits = {
  processedImages: {
    count: 0,
    lastResetTime: Date.now()
  }
};

// Usage limit constants
const MAX_IMAGES_PER_DAY = 2;
const HOURS_24 = 24 * 60 * 60 * 1000; // = 24 hours in milliseconds

// Save settings to localStorage
export const saveSettings = (settings: UserSettings): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }
};

// Load settings from localStorage
export const loadSettings = (): UserSettings => {
  if (typeof window !== 'undefined') {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        return JSON.parse(savedSettings) as UserSettings;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }
  return defaultSettings;
};

// Save API key for a specific provider
export const saveApiKey = (provider: LLMProvider, apiKey: string): void => {
  const settings = loadSettings();
  settings.apiKeys = {
    ...settings.apiKeys,
    [provider]: apiKey
  };
  saveSettings(settings);
};

// Get API key for a provider
export const getApiKey = (provider: LLMProvider): string | undefined => {
  const settings = loadSettings();
  return settings.apiKeys[provider];
};

// Set preferred provider
export const setPreferredProvider = (provider: LLMProvider): void => {
  const settings = loadSettings();
  settings.preferredProvider = provider;
  saveSettings(settings);
};

// Get preferred provider
export const getPreferredProvider = (): LLMProvider => {
  const settings = loadSettings();
  return settings.preferredProvider;
};

// Check if user has at least one API key
export const hasAnyApiKey = (): boolean => {
  const settings = loadSettings();
  return Object.values(settings.apiKeys).some(key => key && key.trim() !== '');
};

// Check if user has a specific API key
export const hasProviderApiKey = (provider: LLMProvider): boolean => {
  const settings = loadSettings();
  const apiKey = settings.apiKeys[provider];
  return apiKey !== undefined && apiKey.trim() !== '';
};

// Get available providers (ones with API keys)
export const getAvailableProviders = (): LLMProvider[] => {
  const settings = loadSettings();
  return Object.entries(settings.apiKeys)
    .filter(([_, value]) => value && value.trim() !== '')
    .map(([key]) => key as LLMProvider);
};

// Load usage limits from localStorage
export const loadUsageLimits = (): UsageLimits => {
  if (typeof window !== 'undefined') {
    try {
      const savedLimits = localStorage.getItem(USAGE_LIMITS_KEY);
      if (savedLimits) {
        const limits = JSON.parse(savedLimits) as UsageLimits;
        
        // Check if 24 hours have passed since last reset
        if (Date.now() - limits.processedImages.lastResetTime > HOURS_24) {
          // Reset the counter if 24 hours have passed
          const resetLimits: UsageLimits = {
            processedImages: {
              count: 0,
              lastResetTime: Date.now()
            }
          };
          saveUsageLimits(resetLimits);
          return resetLimits;
        }
        
        return limits;
      }
    } catch (error) {
      console.error('Failed to load usage limits:', error);
    }
  }
  return defaultUsageLimits;
};

// Save usage limits to localStorage
export const saveUsageLimits = (limits: UsageLimits): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(USAGE_LIMITS_KEY, JSON.stringify(limits));
    } catch (error) {
      console.error('Failed to save usage limits:', error);
    }
  }
};

// Increment the image processing count and check if limit is exceeded
// Skip limit check if user is using their own API key
export const trackImageProcessed = (provider: LLMProvider): { success: boolean; remaining: number } => {
  // If user has their own API key for the selected provider, skip limit check
  if (hasProviderApiKey(provider)) {
    return { 
      success: true, 
      remaining: MAX_IMAGES_PER_DAY // Just return max as remaining
    };
  }

  const limits = loadUsageLimits();
  
  // Check if limit is already reached
  if (limits.processedImages.count >= MAX_IMAGES_PER_DAY) {
    return { 
      success: false, 
      remaining: 0 
    };
  }
  
  // Increment the count and save
  limits.processedImages.count += 1;
  saveUsageLimits(limits);
  
  return { 
    success: true, 
    remaining: MAX_IMAGES_PER_DAY - limits.processedImages.count 
  };
};

// Get remaining image processing count
// Return max limit if user has their own API key
export const getRemainingImageCount = (provider: LLMProvider): number => {
  // If user has their own API key for the selected provider, no limit applies
  if (hasProviderApiKey(provider)) {
    return MAX_IMAGES_PER_DAY; // Return the max as "remaining" since there's no limit
  }

  const limits = loadUsageLimits();
  return Math.max(0, MAX_IMAGES_PER_DAY - limits.processedImages.count);
};

// Get when the limit will reset (in milliseconds)
export const getResetTimeRemaining = (): number => {
  const limits = loadUsageLimits();
  return Math.max(0, HOURS_24 - (Date.now() - limits.processedImages.lastResetTime));
};