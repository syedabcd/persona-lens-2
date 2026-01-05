import { supabase } from './supabaseService';

const KEYS = {
    GEMINI: 'GEMINI_API_KEY_OVERRIDE',
    SCRAPE: 'SCRAPE_API_KEY_OVERRIDE'
};

export const getGeminiKey = (): string => {
    // 1. Check LocalStorage (Admin Override)
    const local = localStorage.getItem(KEYS.GEMINI);
    if (local) return local;

    // 2. Check Environment
    return process.env.API_KEY || '';
};

export const getScrapeKey = (): string => {
    const local = localStorage.getItem(KEYS.SCRAPE);
    if (local) return local;

    return 'MqJhUz7YKzfl0WoUZlgd0UrTLLl2'; // Default
};

export const updateKeys = (geminiKey: string, scrapeKey: string) => {
    if (geminiKey) localStorage.setItem(KEYS.GEMINI, geminiKey);
    if (scrapeKey) localStorage.setItem(KEYS.SCRAPE, scrapeKey);
    
    // Optionally save to Supabase if you have a config table
    // saveToSupabase(geminiKey, scrapeKey);
};

export const getStoredKeys = () => {
    return {
        gemini: localStorage.getItem(KEYS.GEMINI) || '',
        scrape: localStorage.getItem(KEYS.SCRAPE) || ''
    };
};