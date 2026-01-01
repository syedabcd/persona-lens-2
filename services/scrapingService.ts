import { SocialProfile } from "../types";

const API_KEY = 'MqJhUz7YKzfl0WoUZlgd0UrTLLl2';
const BASE_URL = "https://api.scrapecreators.com/v1";
// Use a CORS proxy to allow browser-based requests to the third-party API
const PROXY_URL = "https://corsproxy.io/?"; 

interface ScrapeResult {
  success: boolean;
  data?: SocialProfile;
  error?: string;
  raw?: any;
}

// Helper: Clean username input
export const sanitizeUsername = (input: string): string => {
    if (!input) return "";
    let clean = input.trim();
    
    // Handle full URLs
    try {
        if (clean.includes('http') || clean.includes('www.') || clean.includes('/')) {
            // Add protocol if missing for URL parsing
            const urlStr = clean.startsWith('http') ? clean : `https://${clean}`;
            const url = new URL(urlStr);
            const pathSegments = url.pathname.split('/').filter(p => p && p.trim() !== "");
            // Usually the username is the last segment, e.g. instagram.com/username
            // But sometimes instagram.com/username/
            clean = pathSegments.pop() || "";
        }
    } catch (e) {
        // Fallback for simple string manipulation if URL parsing fails
         if (clean.includes('/')) {
            const parts = clean.split('/').filter(p => p.trim() !== "");
            clean = parts.pop() || "";
        }
    }
    
    // Remove query params if they survived
    clean = clean.split('?')[0];
    // Remove @
    clean = clean.replace(/^@/, '');
    
    return clean;
};

// Helper: Normalize Data Schema
const normalizeProfileData = (platform: string, raw: any): SocialProfile => {
    const profile: SocialProfile = {
        platform,
        username: '',
        display_name: '',
        bio: '',
        followers: 0,
        following: 0,
        posts_count: 0,
        profile_image: '',
        external_links: [],
        is_verified: false,
        raw_posts_text: '',
        scrape_timestamp: new Date().toISOString()
    };

    try {
        if (platform === 'instagram') {
            profile.username = raw.username || '';
            profile.display_name = raw.full_name || '';
            profile.bio = raw.biography || '';
            profile.followers = raw.follower_count || 0;
            profile.following = raw.following_count || 0;
            profile.posts_count = raw.media_count || 0;
            profile.profile_image = raw.profile_pic_url || '';
            profile.is_verified = raw.is_verified || false;
            
            // Extract posts captions if available
            if (raw.edge_owner_to_timeline_media?.edges) {
                 profile.raw_posts_text = raw.edge_owner_to_timeline_media.edges
                    .map((edge: any) => edge.node?.edge_media_to_caption?.edges[0]?.node?.text || '')
                    .join('\n\n');
            }
        } 
        else if (platform === 'twitter' || platform === 'x') {
            const user = raw.data?.user?.result?.legacy || raw.legacy || raw;
            profile.username = user.screen_name || '';
            profile.display_name = user.name || '';
            profile.bio = user.description || '';
            profile.followers = user.followers_count || 0;
            profile.following = user.friends_count || 0;
            profile.posts_count = user.statuses_count || 0;
            profile.profile_image = user.profile_image_url_https || '';
            profile.is_verified = user.verified || false;
            if (user.entities?.url?.urls) {
                profile.external_links = user.entities.url.urls.map((u: any) => u.expanded_url);
            }
            // Twitter scrape might return tweets separately or typically just profile info in basic endpoint
            // If tweets are included in a separate 'tweets' array in raw response
            if (raw.tweets && Array.isArray(raw.tweets)) {
                profile.raw_posts_text = raw.tweets.map((t: any) => t.text || t.full_text).join('\n\n');
            }
        }
        else if (platform === 'tiktok') {
            profile.username = raw.uniqueId || raw.user?.uniqueId || '';
            profile.display_name = raw.nickname || raw.user?.nickname || '';
            profile.bio = raw.signature || raw.user?.signature || '';
            profile.followers = raw.stats?.followerCount || raw.userInfo?.stats?.followerCount || 0;
            profile.following = raw.stats?.followingCount || raw.userInfo?.stats?.followingCount || 0;
            profile.posts_count = raw.stats?.videoCount || raw.userInfo?.stats?.videoCount || 0;
            profile.profile_image = raw.avatarLarger || raw.user?.avatarLarger || '';
            profile.is_verified = raw.verified || raw.user?.verified || false;
        }
        else if (platform === 'linkedin') {
            profile.username = raw.public_identifier || '';
            profile.display_name = `${raw.first_name || ''} ${raw.last_name || ''}`.trim();
            profile.bio = raw.headline || raw.summary || '';
            profile.profile_image = raw.profile_picture || '';
            // LinkedIn structure varies heavily by scraper version
            if (raw.experiences) {
                profile.raw_posts_text = raw.experiences.map((exp: any) => `${exp.title} at ${exp.company}`).join('\n');
            }
        }
    } catch (e) {
        console.warn("Normalization warning:", e);
    }

    return profile;
};

// MAIN FUNCTION: Scrape Public Profile
export const scrapePublicProfile = async (platform: string, profileUrlOrUser: string): Promise<ScrapeResult> => {
    const username = sanitizeUsername(profileUrlOrUser);
    
    if (!username) {
        return { success: false, error: "Invalid username format." };
    }

    // Map platform to ScrapeCreators Endpoint
    let endpoint = "";
    switch (platform.toLowerCase()) {
        case 'instagram': endpoint = `/instagram/profile?username=${username}`; break;
        case 'twitter': 
        case 'x': endpoint = `/twitter/user/info?username=${username}`; break;
        case 'tiktok': endpoint = `/tiktok/profile?handle=${username}`; break; // TikTok requires 'handle' param
        case 'linkedin': endpoint = `/linkedin/profile?username=${username}`; break;
        case 'facebook': endpoint = `/facebook/profile?username=${username}`; break; 
        case 'snapchat': endpoint = `/snapchat/profile?username=${username}`; break;
        default: return { success: false, error: "Unsupported platform" };
    }

    // Construct the URL. 
    // We add the API key as a query parameter as a fallback because some CORS proxies strip custom headers.
    const targetUrl = new URL(`${BASE_URL}${endpoint}`);
    targetUrl.searchParams.append("api_key", API_KEY);

    // We wrap the target URL with the proxy
    const finalUrl = `${PROXY_URL}${encodeURIComponent(targetUrl.toString())}`;

    try {
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'x-api-key': API_KEY, // Primary method
                'Accept': 'application/json'
            }
        });

        if (response.status === 404) {
            return { success: false, error: "Profile not found or private (404)." };
        }

        if (response.status === 429) {
            return { success: false, error: "Rate limit exceeded. Please try again later (429)." };
        }

        if (response.status === 401 || response.status === 403) {
             return { success: false, error: "API Authorization failed. Check API Key (401/403)." };
        }

        if (!response.ok) {
            // Attempt to parse the error message from the provider
            let errorMsg = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg = errorData.message;
                else if (errorData.error) errorMsg = errorData.error;
            } catch (e) {
                // Keep default error message if JSON parsing fails
            }
            return { success: false, error: errorMsg };
        }

        const data = await response.json();
        
        // Handle API specific wrappers (sometimes data is inside 'data' or 'response')
        const payload = data.data || data.response || data;

        // Extra check for null payload
        if (!payload) {
             return { success: false, error: "Empty response from provider." };
        }

        const normalized = normalizeProfileData(platform, payload);

        // Validation: If no username found, likely a failed scrape disguised as 200
        if (!normalized.username && !normalized.display_name) {
             console.warn("Raw payload:", payload);
             return { success: false, error: "Could not parse profile data. Profile might be private or layout changed." };
        }

        return {
            success: true,
            data: normalized,
            raw: payload
        };

    } catch (error: any) {
        console.error("Scraping error:", error);
        return { success: false, error: error.message || "Network error. Possible CORS issue." };
    }
};