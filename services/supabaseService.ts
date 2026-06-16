import { createClient } from '@supabase/supabase-js';
import { AnalysisReport, SegmentationReport, CompatibilityReport, UserProfile, BlogPost } from '../types';
import { blogPosts as STATIC_BLOG_POSTS } from './blogData';

// Fetching credentials from environment variables securely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabaseInstance: any;

try {
    if (!supabaseUrl || !supabaseKey) {
        console.error("Supabase Credentials Missing.");
        throw new Error("Missing Supabase URL or Key");
    }
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
} catch (e) {
    console.error("Supabase INIT FAILED:", e);
    // Mock client to prevent crashes on load
    supabaseInstance = {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signInWithPassword: async () => ({ 
                data: { session: { user: { id: 'mock-user', email: 'mock@example.com' } } }, 
                error: null 
            }),
            signUp: async () => ({ 
                data: { session: { user: { id: 'mock-user', email: 'mock@example.com' } } }, 
                error: null 
            }),
            signOut: async () => ({ error: null }),
        },
        from: () => ({
            insert: () => ({ select: async () => ({ data: null, error: { message: "Database not connected" } }) }),
            select: () => ({ eq: () => ({ order: async () => ({ data: [], error: null }), single: async () => ({ data: null, error: { message: "Mock" } }) }) }),
            delete: () => ({ eq: async () => ({ error: null }) }),
            upsert: () => ({ select: async () => ({ data: null, error: null }) })
        })
    };
}

export const supabase = supabaseInstance;

// --- History Functions ---

export const saveHistory = async (
  userId: string,
  mode: string,
  title: string,
  summary: string,
  reportData: AnalysisReport | SegmentationReport | CompatibilityReport
) => {
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const { data, error } = await supabase
      .from('history')
      .insert([
        {
          user_id: userId,
          mode,
          title,
          summary,
          report_data: reportData,
        },
      ])
      .select();

    if (error) {
        console.error("Supabase Save Error:", error);
        throw error;
    }
    return data;
  } catch (err) {
      console.error("Failed to save history:", err);
      return null;
  }
};

export const fetchHistory = async (userId: string) => {
  if (!supabaseUrl || !supabaseKey) return [];

  try {
    const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
      console.error("Failed to fetch history:", err);
      return [];
  }
};

export const deleteHistory = async (id: string) => {
    if (!supabaseUrl || !supabaseKey) return;
    
    const { error } = await supabase
    .from('history')
    .delete()
    .eq('id', id);
    
    if (error) throw error;
};

// --- Profile Functions ---

// Keep track of user IDs loaded locally to list them in Admin fallback if DB table is missing
const trackLocalUser = (userId: string) => {
    try {
        const tracker = localStorage.getItem('supabase_user_tracker') || '[]';
        const list = JSON.parse(tracker) as string[];
        if (!list.includes(userId)) {
            list.push(userId);
            localStorage.setItem('supabase_user_tracker', JSON.stringify(list));
        }
    } catch (e) {
        console.warn("User tracker failed:", e);
    }
};

export const getUserProfile = async (userId: string, email: string): Promise<UserProfile> => {
    trackLocalUser(userId);
    const localKey = `supabase_profile_${userId}`;

    // 1. Try to fetch from DB
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data && !error) {
            // Merge with local storage if it exists, so we don't lose local credit if column is missing
            try {
                const cached = localStorage.getItem(localKey);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (data.credits === undefined || data.credits === null) {
                        data.credits = parsed.credits;
                    }
                    if (data.subscription_tier === undefined || data.subscription_tier === null) {
                        data.subscription_tier = parsed.subscription_tier;
                    }
                }
            } catch (e) {}

            // Store a copy in localStorage for local fallback syncing
            localStorage.setItem(localKey, JSON.stringify(data));
            return data as UserProfile;
        }

        // If table exists but profile does not, initialize it with 5 credits
        if (error && error.code === 'PGRST116') {
            const initialProfile: UserProfile = {
                id: userId,
                email: email,
                username: email.split('@')[0],
                subscription_tier: 'Free',
                credits: 5
            };
            const { data: inserted, error: insertError } = await supabase
                .from('profiles')
                .insert([initialProfile])
                .select()
                .single();

            if (inserted && !insertError) {
                localStorage.setItem(localKey, JSON.stringify(inserted));
                return inserted as UserProfile;
            }
        }
    } catch (e) {
        console.warn("Supabase fetch failed, trying local storage fallback", e);
    }

    // 2. Local Storage Fallback
    try {
        const cached = localStorage.getItem(localKey);
        if (cached) {
            return JSON.parse(cached) as UserProfile;
        }
    } catch (e) {
        console.warn("Cached profile parse error", e);
    }

    // 3. Fallback Default (Virtual Profile)
    const virtualProfile: UserProfile = {
        id: userId,
        email: email,
        username: email.split('@')[0],
        subscription_tier: 'Free',
        credits: 5
    };
    try {
        localStorage.setItem(localKey, JSON.stringify(virtualProfile));
    } catch (e) {}
    return virtualProfile;
};

export const updateUserProfile = async (profile: UserProfile): Promise<UserProfile | null> => {
    const localKey = `supabase_profile_${profile.id}`;
    trackLocalUser(profile.id);

    try {
        // Try to update into DB with all fields, including credits and tier
        const { data, error } = await supabase
            .from('profiles')
            .update({
                username: profile.username,
                credits: profile.credits,
                subscription_tier: profile.subscription_tier
            })
            .eq('id', profile.id)
            .select()
            .single();
            
        if (error) {
            // If it's a UUID error (e.g. seed user), just throw an innocuous error to fall back to local storage
            if (error.code === '22P02') throw error; 
            throw error;
        }
        if (data) {
            localStorage.setItem(localKey, JSON.stringify(data));
            return data as UserProfile;
        }
    } catch (e: any) {
        console.warn("Profile update failed.", e);
        // Special case: if it's a clearly understood configuration error, alert directly
        if (e.message?.includes("Row-Level") || e.code === '42501' || e.code === 'PGRST116') {
             alert(`Failed to save profile: Supabase Row-Level Security (RLS) is blocking the save. \nPlease run this in your Supabase SQL Editor:\nALTER TABLE profiles DISABLE ROW LEVEL SECURITY;`);
             throw e;
        } else if (e.message?.includes("column") && e.message?.includes("does not exist")) {
             alert(`Failed to save profile: Missing columns in your Supabase 'profiles' table.\nPlease run this in your Supabase SQL Editor:\nALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits integer DEFAULT 5;\nALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'Free';`);
             throw e;
        } else if (e.code === '22P02') {
             // Just a mock/seed user
             console.warn("Ignoring UUID error for seed user");
        } else {
             // Only display an alert if we're connected to Supabase and it's a real unexpected error
             if (supabaseUrl && supabaseKey) {
                 console.error("Database update error: ", e);
             }
        }
    }

    // Fallback path (only for local-only non-connected scenarios)
    try {
        localStorage.setItem(localKey, JSON.stringify(profile));
    } catch (e) {}
    return profile;
};

// Deduct credits for different operations (returns updated profile or throws error)
export const deductCredits = async (userId: string, email: string, amount: number): Promise<UserProfile> => {
    const profile = await getUserProfile(userId, email);
    if (profile.credits < amount) {
        throw new Error(`Insufficient credits. This operation requires ${amount} credits, but you only have ${profile.credits} left.`);
    }
    const updated = {
        ...profile,
        credits: profile.credits - amount
    };
    const saved = await updateUserProfile(updated);
    return saved || updated;
};

export const addCredits = async (userId: string, email: string, amount: number): Promise<UserProfile> => {
    const profile = await getUserProfile(userId, email);
    const updated = {
        ...profile,
        credits: profile.credits + amount
    };
    const saved = await updateUserProfile(updated);
    return saved || updated;
};

// Admin Functions: Retrieve and Edit profiles of other/all users
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('email', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
            const mergedData = data.map((dbProfile: any) => {
                try {
                    const localKey = `supabase_profile_${dbProfile.id}`;
                    const cached = localStorage.getItem(localKey);
                    if (cached) {
                        const parsed = JSON.parse(cached);
                        if (dbProfile.credits === undefined || dbProfile.credits === null) {
                            dbProfile.credits = parsed.credits;
                        }
                        if (dbProfile.subscription_tier === undefined || dbProfile.subscription_tier === null) {
                            dbProfile.subscription_tier = parsed.subscription_tier;
                        }
                    }
                } catch(e) {}
                return dbProfile;
            });
            return mergedData as UserProfile[];
        }
    } catch (e) {
        console.warn("Could not query profiles list from DB.", e);
    }

    // Fallback: load profiles from the tracker of known local users
    try {
        const tracker = localStorage.getItem('supabase_user_tracker') || '[]';
        const list = JSON.parse(tracker) as string[];
        const profiles: UserProfile[] = [];
        for (const uid of list) {
            const val = localStorage.getItem(`supabase_profile_${uid}`);
            if (val) {
                profiles.push(JSON.parse(val));
            }
        }
        if (profiles.length > 0) {
            return profiles;
        }
    } catch (e) {
        console.warn("Tracker parsing failed", e);
    }

    // Default seed to make sure admin sees something if no other users have registered yet on this device
    return [
        { id: 'seed-user-1', email: 'guest@mindlyt.com', username: 'guest_user', subscription_tier: 'Free', credits: 5 },
        { id: 'seed-user-2', email: 'pro_partner@mindlyt.com', username: 'partnership_pro', subscription_tier: 'Pro', credits: 45 }
    ];
};

export const adminUpdateUserProfile = async (profile: UserProfile): Promise<UserProfile> => {
    const saved = await updateUserProfile(profile);
    return saved || profile;
};

export const signOut = async () => {
    await supabase.auth.signOut();
};

// --- Blog Functions ---

export const fetchBlogPosts = async (): Promise<BlogPost[]> => {
    try {
        if (!supabaseUrl || !supabaseKey) return STATIC_BLOG_POSTS;

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        // If table doesn't exist or is empty, return static data
        if (error || !data || data.length === 0) {
            return STATIC_BLOG_POSTS;
        }
        
        return data;
    } catch (e) {
        console.error("Blog fetch error, using static fallback:", e);
        return STATIC_BLOG_POSTS;
    }
};

export const fetchPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    const cleanSlug = slug.trim();
    // Check static first for instant load/fallback
    const staticPost = STATIC_BLOG_POSTS.find(p => p.slug === cleanSlug);

    try {
        if (!supabaseUrl || !supabaseKey) return staticPost || null;

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('slug', cleanSlug)
            .limit(1);

        if (error || !data || data.length === 0) {
             // Fallback: fetch all and find (handles case/spacing issues that .eq might miss)
             const allPosts = await fetchBlogPosts();
             const found = allPosts.find(p => p.slug?.trim().toLowerCase() === cleanSlug.toLowerCase());
             if (found) return found;
             return staticPost || null;
        }
        return data[0];
    } catch (e) {
         return staticPost || null;
    }
};

// --- Admin Blog Functions ---

export const upsertBlogPost = async (post: Partial<BlogPost>) => {
    try {
        const { data, error } = await supabase
            .from('posts')
            .upsert(post)
            .select();
        
        if (error) throw error;
        return data;
    } catch (e) {
        console.error("Upsert post error:", e);
        throw e;
    }
};

export const deleteBlogPost = async (id: string) => {
    try {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    } catch (e) {
        console.error("Delete post error:", e);
        throw e;
    }
};