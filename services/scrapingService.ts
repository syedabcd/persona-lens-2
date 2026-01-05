import { SocialProfile } from "../types";
import { getScrapeKey } from "./configManager";

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

// Helper: Safely access nested properties
const safeGet = (obj: any, path: string, defaultValue: any = undefined) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
};

// Helper: Normalize Data Schema based on ScrapeCreators Docs structure
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
        scrape_timestamp: new Date().toISOString(),
        location: '',
        email: '',
        is_business_account: false,
        business_category: '',
        work_history: [],
        education: []
    };

    try {
        if (platform === 'instagram') {
            // ScrapeCreators usually returns the full 'user' object from Instagram's graphQL
            const data = raw.user || raw;

            profile.username = data.username || '';
            profile.display_name = data.full_name || '';
            profile.bio = data.biography || '';
            profile.followers = data.follower_count || safeGet(data, 'edge_followed_by.count') || 0;
            profile.following = data.following_count || safeGet(data, 'edge_follow.count') || 0;
            profile.posts_count = data.media_count || safeGet(data, 'edge_owner_to_timeline_media.count') || 0;
            profile.profile_image = data.profile_pic_url_hd || data.profile_pic_url || '';
            profile.is_verified = data.is_verified || false;
            
            // Deep Data
            profile.is_business_account = data.is_business_account || false;
            profile.business_category = data.category_name || data.business_category_name || '';
            profile.email = data.business_email || '';
            if (data.external_url) profile.external_links.push(data.external_url);

            // Rich Post Extraction (Captions + Engagement metrics)
            const edges = safeGet(data, 'edge_owner_to_timeline_media.edges', []);
            const postsData = edges.map((edge: any) => {
                const node = edge.node;
                const caption = safeGet(node, 'edge_media_to_caption.edges.0.node.text', '');
                const likes = safeGet(node, 'edge_liked_by.count', 0);
                const comments = safeGet(node, 'edge_media_to_comment.count', 0);
                const date = node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000).toLocaleDateString() : '';
                
                return `[Post ${date}] (Likes: ${likes}, Comments: ${comments}): ${caption}`;
            });
            
            profile.raw_posts_text = postsData.join('\n\n');
        } 
        else if (platform === 'twitter' || platform === 'x') {
            const data = raw.data?.user?.result?.legacy || raw.legacy || raw.user || raw;
            const restIdData = raw.data?.user?.result || {};

            profile.username = data.screen_name || data.username || '';
            profile.display_name = data.name || '';
            profile.bio = data.description || '';
            profile.location = data.location || '';
            profile.followers = data.followers_count || 0;
            profile.following = data.friends_count || data.following_count || 0;
            profile.posts_count = data.statuses_count || data.tweet_count || 0;
            profile.profile_image = (data.profile_image_url_https || data.profile_image_url || '').replace('_normal', '');
            profile.is_verified = data.verified || restIdData.is_blue_verified || false;
            profile.is_business_account = restIdData.professional?.professional_type === 'Business';
            
            if (data.entities?.url?.urls) {
                profile.external_links = data.entities.url.urls.map((u: any) => u.expanded_url);
            }
            
            // Collect Tweets
            let tweetsArr: any[] = [];
            if (raw.tweets && Array.isArray(raw.tweets)) tweetsArr = raw.tweets;
            else if (raw.data?.user?.result?.timeline_response?.instructions) {
                 // Try to dig into graphQL timeline instructions if present
                 // (This is complex and varies, simplified fallback)
            }

            if (tweetsArr.length > 0) {
                 profile.raw_posts_text = tweetsArr.map((t: any) => {
                    const text = t.text || t.full_text || '';
                    const stats = t.public_metrics || {};
                    return `[Tweet] (Retweets: ${stats.retweet_count || 0}, Likes: ${stats.like_count || 0}): ${text}`;
                 }).join('\n\n');
            } else {
                 profile.raw_posts_text = "No recent tweets found in payload.";
            }
        }
        else if (platform === 'tiktok') {
            const data = raw.userInfo || raw.user || raw;
            const stats = raw.stats || raw.userInfo?.stats || data.stats || {};
            
            profile.username = data.uniqueId || data.username || '';
            profile.display_name = data.nickname || '';
            profile.bio = data.signature || '';
            profile.followers = stats.followerCount || 0;
            profile.following = stats.followingCount || 0;
            profile.posts_count = stats.videoCount || 0;
            profile.profile_image = data.avatarLarger || data.avatarMedium || '';
            profile.is_verified = data.verified || false;
            
            // Extended stats
            const totalHearts = stats.heartCount || stats.diggCount || 0;
            profile.raw_posts_text = `[Account Stats]\nTotal Hearts/Likes: ${totalHearts}\nTotal Videos: ${stats.videoCount}\nVerified: ${profile.is_verified}\nBio: ${profile.bio}`;
        }
        else if (platform === 'linkedin') {
            const data = raw.user || raw;
            const person = data.profile || data;

            profile.username = person.public_identifier || person.username || '';
            profile.display_name = `${person.first_name || ''} ${person.last_name || ''}`.trim();
            profile.bio = person.headline || person.summary || '';
            profile.profile_image = person.profile_picture || '';
            profile.location = person.location || '';
            
            // Experience
            if (person.experiences && Array.isArray(person.experiences)) {
                profile.work_history = person.experiences.map((exp: any) => {
                    const start = exp.starts_at ? `${exp.starts_at.month}/${exp.starts_at.year}` : 'Unknown';
                    const end = exp.ends_at ? `${exp.ends_at.month}/${exp.ends_at.year}` : 'Present';
                    return `${exp.title} at ${exp.company} (${start} - ${end}): ${exp.description || ''}`;
                });
            }

            // Education
            if (person.education && Array.isArray(person.education)) {
                profile.education = person.education.map((edu: any) => {
                     const start = edu.starts_at ? `${edu.starts_at.year}` : '';
                     const end = edu.ends_at ? `${edu.ends_at.year}` : '';
                     return `${edu.school} - ${edu.degree_name} (${start}-${end})`;
                });
            }

            // Construct rich text for AI
            let richText = `--- LINKEDIN PROFESSIONAL SUMMARY ---\n\nHEADLINE: ${profile.bio}\n\n`;
            if (profile.work_history && profile.work_history.length > 0) {
                richText += `EXPERIENCE:\n${profile.work_history.join('\n\n')}\n\n`;
            }
            if (profile.education && profile.education.length > 0) {
                 richText += `EDUCATION:\n${profile.education.join('\n')}\n\n`;
            }
            if (person.skills) {
                richText += `SKILLS: ${Array.isArray(person.skills) ? person.skills.join(', ') : person.skills}\n`;
            }

            profile.raw_posts_text = richText;
        }
        else if (platform === 'snapchat') {
            const data = raw.userProfile || raw;
            profile.username = data.username || data.snapcode || '';
            profile.display_name = data.title || data.displayName || '';
            profile.bio = data.bio || data.description || '';
            profile.profile_image = data.bitmoji3d || data.snapcodeImageUrl || '';
            profile.followers = data.subscriberCount || 0;
            profile.location = data.address || '';
            
            profile.raw_posts_text = `Snapchat Profile:\nTitle: ${profile.display_name}\nBio: ${profile.bio}\nSubscribers: ${profile.followers}`;
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

    // Get API Key via Manager
    const apiKey = getScrapeKey();

    // Map platform to ScrapeCreators Endpoint
    let endpoint = "";
    switch (platform.toLowerCase()) {
        case 'instagram': endpoint = `/instagram/profile?handle=${username}`; break; 
        case 'twitter': 
        case 'x': endpoint = `/twitter/profile?handle=${username}`; break; 
        case 'tiktok': endpoint = `/tiktok/profile?handle=${username}`; break; 
        case 'linkedin': endpoint = `/linkedin/profile?username=${username}`; break;
        case 'facebook': endpoint = `/facebook/profile?username=${username}`; break; 
        case 'snapchat': endpoint = `/snapchat/profile?handle=${username}`; break; 
        default: return { success: false, error: "Unsupported platform" };
    }

    const targetUrl = new URL(`${BASE_URL}${endpoint}`);
    targetUrl.searchParams.append("api_key", apiKey);

    // Using Proxy to bypass CORS in browser environment
    const finalUrl = `${PROXY_URL}${encodeURIComponent(targetUrl.toString())}`;

    try {
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey, // Redundant but good practice
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
            let errorMsg = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg = errorData.message;
                else if (errorData.error) errorMsg = errorData.error;
            } catch (e) { }
            return { success: false, error: errorMsg };
        }

        const data = await response.json();
        
        // Handle API specific wrappers. ScrapeCreators sometimes wraps in 'data', sometimes returns direct.
        const payload = data.data || data.response || data;

        if (!payload) {
             return { success: false, error: "Empty response from provider." };
        }

        const normalized = normalizeProfileData(platform, payload);

        if (!normalized.username && !normalized.display_name) {
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