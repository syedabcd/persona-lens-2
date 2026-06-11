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

export const getUserProfile = async (userId: string, email: string): Promise<UserProfile> => {
    // 1. Try to fetch from DB
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (data && !error) {
            return data as UserProfile;
        }
    } catch (e) {
        // Ignore DB errors, fall through to default
    }

    // 2. Fallback Default (Virtual Profile)
    // If we can't fetch from DB (table missing or error), return a virtual profile
    return {
        id: userId,
        email: email,
        username: email.split('@')[0], // Default username from email
        subscription_tier: 'Free',
        credits: 5
    };
};

export const updateUserProfile = async (profile: UserProfile): Promise<UserProfile | null> => {
    try {
        // Try to update/insert into DB
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: profile.id,
                username: profile.username,
                email: profile.email,
                // We usually don't update credits/tier from client side in real app, but for demo:
            })
            .select()
            .single();
            
        if (error) throw error;
        return data ? { ...data, subscription_tier: 'Free', credits: 5 } : profile; // Merge with defaults if schema incomplete
    } catch (e) {
        console.warn("Profile update simulated (DB might be missing profiles table).");
        return profile; // Return the modified object to simulate success
    }
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
    // Check static first for instant load/fallback
    const staticPost = STATIC_BLOG_POSTS.find(p => p.slug === slug);

    try {
        if (!supabaseUrl || !supabaseKey) return staticPost || null;

        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .ilike('slug', slug)
            .limit(1);

        if (error || !data || data.length === 0) {
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