import { PlatformResult, ScrapeStatus } from "../types";

// NOTE: In a production environment, this service should run on a Node.js server 
// or Edge Function to protect the API key and avoid CORS issues.
// For this prototype, it is implemented here to demonstrate the logic.

const API_KEY = process.env.SCRAPECREATORS_API_KEY || 'MqJhUz7YKzfl0WoUZlgd0UrTLLl2';

// Point to the local proxy defined in vite.config.ts to avoid CORS
// Since the proxy now targets the root domain, we must include the version path in the endpoints
const BASE_URL = "/api/scrape";

// 4) Network & timing: 15s timeout
const REQUEST_TIMEOUT = 15000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 2) Input sanitization
export const sanitizeUsername = (input: string): string => {
    if (!input) return "";
    let clean = input.trim();

    // Attempt to extract username from URL if user pasted a link
    if (clean.includes('http') || clean.includes('www.') || clean.includes('.com') || clean.includes('/')) {
        try {
            // Handle cases where user pastes a url without protocol
            const urlStr = clean.startsWith('http') ? clean : `https://${clean}`;
            const url = new URL(urlStr);
            const pathParts = url.pathname.split('/').filter(p => p.length > 0);
            
            // Logic for different platforms
            if (url.hostname.includes('tiktok') || url.hostname.includes('youtube')) {
                // TikTok/YouTube: often /@username
                const userPart = pathParts.find(p => p.startsWith('@'));
                if (userPart) clean = userPart;
                else if (pathParts.length > 0) clean = pathParts[0];
            } else {
                // Instagram, Twitter, Snapchat, Facebook: usually the first path segment
                // e.g. instagram.com/username
                if (pathParts.length > 0) {
                    clean = pathParts[0];
                }
            }
        } catch (e) {
            console.warn("URL parsing failed, using raw input", e);
        }
    }

    // Clean up characters
    // Remove leading '@'
    clean = clean.replace(/^@/, '');
    // Remove trailing slash
    clean = clean.replace(/\/$/, '');
    // Remove query parameters if they stuck around (though URL parsing handles this)
    clean = clean.split('?')[0];

    return clean;
};

// 6) Cleaning the scraped text
const cleanScrapedText = (text: string): string => {
    if (!text) return "";
    let cleaned = text;

    // Strip HTML tags
    cleaned = cleaned.replace(/<[^>]*>?/gm, ' ');

    // Remove emojis (simple range replacement)
    cleaned = cleaned.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '');

    // Remove stray URLs
    cleaned = cleaned.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');

    // Normalize whitespace:
    // 1. Split into lines to handle structure
    // 2. Trim each line (remove leading/trailing whitespace)
    // 3. Filter empty lines (collapse multiple newlines)
    // 4. Join with single newline
    return cleaned
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
};

// Endpoint Configuration Map
// UPDATED: Only Profile Endpoints, using username query param
const PLATFORM_ENDPOINTS: Record<string, { profile: (u: string) => string }> = {
    instagram: {
        profile: (u) => `${BASE_URL}/v1/instagram/profile?username=${encodeURIComponent(u)}`,
    },
    twitter: {
        profile: (u) => `${BASE_URL}/v1/twitter/user?username=${encodeURIComponent(u)}`,
    },
    tiktok: {
        profile: (u) => `${BASE_URL}/v1/tiktok/profile?username=${encodeURIComponent(u)}`,
    },
    snapchat: {
        profile: (u) => `${BASE_URL}/v1/snapchat/profile?username=${encodeURIComponent(u)}`,
    }
};

// 3) Endpoint & headers + 4) Retry Logic
const fetchWithRetry = async (url: string, attempts: number = 3): Promise<Response> => {
    console.log(`[Scraper] Requesting: ${url}`); // Log actual URL

    for (let i = 0; i < attempts; i++) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'x-api-key': API_KEY,
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            clearTimeout(id);

            // If success or hard 404, return response immediately
            if (response.ok || response.status === 404) {
                return response;
            }

            // If 429 or 5xx, retry with backoff
            if (response.status === 429 || response.status >= 500) {
                const waitTime = Math.pow(2, i) * 1000; // 1s, 2s, 4s
                console.log(`[Scraper] Retry ${i + 1}/${attempts} for ${url} after ${waitTime}ms`);
                await delay(waitTime);
                continue;
            }

            return response;
        } catch (error) {
            const waitTime = Math.pow(2, i) * 1000;
            console.warn(`[Scraper] Network error on attempt ${i + 1}`, error);
            if (i === attempts - 1) throw error;
            await delay(waitTime);
        }
    }
    throw new Error('Max retries exceeded');
};

const extractTextFromData = (data: any, platform: string): string => {
    if (!data) return "";
    
    let textParts: string[] = [];

    // Helper to push valid strings
    const add = (str: any) => {
        if (typeof str === 'string' && str.trim().length > 0) {
            textParts.push(str.trim());
        }
    };

    // --- Profile Info Extraction ---
    
    // Generic fields found across platforms
    add(data.biography);
    add(data.bio);
    add(data.description);
    add(data.about);
    
    // Snapchat specific
    add(data.displayName);
    add(data.title);
    
    // Instagram specific
    add(data.full_name);
    add(data.user_info?.biography);
    
    // TikTok specific
    add(data.signature);
    add(data.user?.signature);
    add(data.bio_description);
    add(data.nickname);
    
    // Twitter specific
    // Sometimes twitter data is nested in a 'data' object
    add(data.data?.description);
    add(data.data?.name);
    add(data.name);
    
    // Check user_metadata for Twitter or generic metadata fields
    if (data.user_metadata) {
        add(data.user_metadata.description);
        add(data.user_metadata.bio);
    }
    
    // Content extraction removed as per requirements

    const rawText = textParts.join('\n');
    return cleanScrapedText(rawText);
};

export const scrapeSocialProfile = async (platform: string, rawUsername: string): Promise<PlatformResult> => {
    const username = sanitizeUsername(rawUsername);

    // 2) Skip if empty
    if (!username) {
        return {
            platform,
            username: rawUsername,
            status: 'skipped',
            text: '',
            chars: 0
        };
    }

    // UNSUPPORTED PLATFORMS
    if (platform === 'facebook' || platform === 'threads') {
         return {
            platform,
            username,
            status: 'error',
            error: 'Platform not supported by current API plan',
            text: '',
            chars: 0
        };
    }

    const result: PlatformResult = {
        platform,
        username,
        status: 'loading',
        text: '',
        chars: 0
    };

    try {
        const endpoints = PLATFORM_ENDPOINTS[platform];
        if (!endpoints) {
             throw new Error(`Configuration missing for ${platform}`);
        }

        // 5) First Attempt: Profile Endpoint
        let url = endpoints.profile(username);
        let response = await fetchWithRetry(url);

        result.httpStatus = response.status;

        if (response.status === 404) {
            result.status = 'error'; 
            result.error = '404 Profile not found';
            return result;
        }

        if (response.status === 401) {
             result.status = 'error';
             result.error = 'API Key Invalid (401)';
             return result;
        }

        if (!response.ok) {
             result.status = 'error';
             result.error = `API Error (${response.status})`;
             console.warn(`Profile endpoint failed (${response.status})`);
        } else {
             const data = await response.json();
             result.text = extractTextFromData(data, platform);
        }

        // Removed logic for content scraping fallback

        // Final clean ensures nice formatting
        result.text = cleanScrapedText(result.text);

        if (result.text.length > 0) {
            result.status = 'success';
            result.chars = result.text.length;
        } else {
            // Only set no_content if it wasn't an API error
            if (result.status !== 'error') {
                result.status = 'no_content';
                result.error = 'No public bio text found';
            }
        }

    } catch (error: any) {
        console.error(`[Scraper] Fatal error for ${platform}:`, error);
        result.status = 'error';
        result.error = error.message || 'Timeout / Network Error';
    }

    // 11) Logging & Telemetry
    console.log(`[Scraper Telemetry] Platform: ${platform}, User: ${username}, Status: ${result.status}, Chars: ${result.chars}`);
    
    return result;
};

// 12) Test Harness
export const runTestHarness = async () => {
    const testCases = [
        { platform: 'instagram', username: 'instagram' },
        { platform: 'twitter', username: 'twitter' },
        { platform: 'tiktok', username: 'tiktok' },
        { platform: 'snapchat', username: 'snapchat' }
    ];

    console.log("--- STARTING SCRAPER TEST HARNESS ---");
    const results = await Promise.all(testCases.map(tc => scrapeSocialProfile(tc.platform, tc.username)));
    console.log("--- TEST RESULTS ---");
    results.forEach(r => console.log(`${r.platform}: ${r.status} (${r.chars} chars) - ${r.error || 'OK'}`));
    return results;
};
