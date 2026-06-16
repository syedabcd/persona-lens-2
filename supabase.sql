-- ============================================================
-- SUPABASE COMPLETE DATABASE SETUP SCRIPT
-- Copy and paste this entirely into your Supabase SQL Editor.
-- ============================================================

-- 1. Create or extend the Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    username text,
    subscription_tier text DEFAULT 'Free',
    credits integer DEFAULT 5,
    avatar_url text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure the columns exist if the table was already created before
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits integer DEFAULT 5;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'Free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Temporarily disable Row Level Security (RLS) on profiles
-- This allows your Admin Panel and client updates to change credits without complex policies.
-- If you need strict security later, you can ENABLE ROW LEVEL SECURITY and write policies.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;


-- 2. Create the History table (for storing user reports)
CREATE TABLE IF NOT EXISTS public.history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    mode text NOT NULL,
    title text NOT NULL,
    summary text,
    report_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS on History table for easy reads/writes from the client
ALTER TABLE public.history DISABLE ROW LEVEL SECURITY;


-- 3. Create the Posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    slug text UNIQUE NOT NULL,
    excerpt text,
    content text NOT NULL,
    image_url text,
    author text,
    meta_description text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable RLS on Posts table so the Admin Panel can create/edit posts
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;


-- 4. Set up Auth Trigger to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, credits, subscription_tier)
  VALUES (
      new.id,
      new.email,
      split_part(new.email, '@', 1),
      5, -- Default starting credits
      'Free' -- Default tier
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it to avoid duplication
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Done!
