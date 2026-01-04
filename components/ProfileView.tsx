import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types';
import { getUserProfile, updateUserProfile, signOut } from '../services/supabaseService';
import { User, Mail, Zap, CreditCard, Edit2, Check, LogOut, Loader2, Crown, Sparkles, AlertCircle, X } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

interface ProfileViewProps {
  session: Session;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ session, onLogout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Memoize loadProfile to prevent unnecessary re-creations
  const loadProfile = useCallback(async () => {
    if (!session.user) return;
    try {
        // Optimistic / Fast load could go here if we cached data
        const data = await getUserProfile(session.user.id, session.user.email || '');
        setProfile(data);
        setEditUsername(data.username);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }, [session.user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const validateUsername = (name: string): string | null => {
      const trimmed = name.trim();
      if (trimmed.length < 3) return "Username must be at least 3 characters";
      if (trimmed.length > 20) return "Username must be under 20 characters";
      // Allow letters, numbers, underscores, and hyphens
      const validRegex = /^[a-zA-Z0-9_-]+$/;
      if (!validRegex.test(trimmed)) return "Only letters, numbers, underscores, and hyphens allowed";
      return null;
  };

  const handleSave = async () => {
    if (!profile) return;
    
    // Clear previous errors
    setUsernameError(null);

    // Validate
    const error = validateUsername(editUsername);
    if (error) {
        setUsernameError(error);
        return;
    }

    setSaving(true);
    try {
        const updated = { ...profile, username: editUsername.trim() };
        const result = await updateUserProfile(updated);
        if (result) {
            setProfile(result);
            setIsEditing(false);
        }
    } catch (e) {
        alert("Failed to update profile");
    } finally {
        setSaving(false);
    }
  };

  const handleCancelEdit = () => {
      setIsEditing(false);
      setEditUsername(profile?.username || '');
      setUsernameError(null);
  };

  const handleLogout = async () => {
      await signOut();
      onLogout();
  };

  if (loading) {
      return (
          <div className="flex flex-col justify-center items-center h-[50vh] animate-pulse">
              <Loader2 size={40} className="animate-spin text-violet-500 mb-4" />
              <p className="text-slate-500 text-sm font-medium">Loading Profile...</p>
          </div>
      );
  }

  if (!profile) return null;

  const isPro = profile.subscription_tier !== 'Free';

  return (
    <div className="w-full max-w-xl mx-auto pb-40 animate-slide-up will-change-transform">
        
        {/* Profile Card */}
        <div className="relative overflow-hidden bg-slate-900 dark:bg-black rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-slate-800 transition-all duration-300 hover:shadow-indigo-500/20">
            
            {/* Header / Banner */}
            <div className="h-32 bg-gradient-to-r from-violet-600 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-fuchsia-500 rounded-full blur-[60px] opacity-50 animate-pulse"></div>
            </div>

            {/* Avatar & Content */}
            <div className="px-8 pb-8 relative">
                
                {/* Avatar */}
                <div className="absolute -top-12 left-8">
                    <div className="w-24 h-24 rounded-3xl bg-slate-900 p-1.5 shadow-xl ring-4 ring-slate-900">
                        <div className="w-full h-full bg-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={40} className="text-slate-400" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        {isPro && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-300 to-orange-500 text-white p-1.5 rounded-full shadow-lg border-2 border-slate-900 z-10">
                                <Crown size={14} fill="currentColor" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Top Right */}
                <div className="flex justify-end pt-4 gap-2">
                    <button 
                        onClick={handleLogout}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors active:scale-95"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="mt-14 space-y-6">
                    
                    {/* User Info Fields */}
                    <div className="space-y-4">
                        
                        {/* Username */}
                        <div className="group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">Username</label>
                            <div className="flex flex-col gap-2">
                                {isEditing ? (
                                    <div className="animate-fade-in">
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                value={editUsername}
                                                onChange={(e) => {
                                                    setEditUsername(e.target.value);
                                                    if (usernameError) setUsernameError(null);
                                                }}
                                                className={`flex-1 bg-slate-800 border text-white rounded-xl px-4 py-3 outline-none transition-colors ${usernameError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700 focus:border-violet-500'}`}
                                                autoFocus
                                                placeholder="Enter username"
                                            />
                                            <button 
                                                onClick={handleSave}
                                                disabled={saving}
                                                className="bg-violet-600 hover:bg-violet-500 text-white px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center min-w-[50px]"
                                            >
                                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                            </button>
                                            <button 
                                                onClick={handleCancelEdit}
                                                disabled={saving}
                                                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white px-4 rounded-xl transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        {usernameError && (
                                            <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-xs font-medium animate-slide-up">
                                                <AlertCircle size={12} />
                                                {usernameError}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-slate-800/50 border border-slate-800 rounded-xl px-4 py-3 group-hover:border-slate-700 transition-colors">
                                        <span className="font-medium text-white text-lg tracking-tight">{profile.username}</span>
                                        <button 
                                            onClick={() => setIsEditing(true)}
                                            className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg active:scale-95"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Email (Read Only) */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">Email Address</label>
                            <div className="bg-slate-800/30 border border-slate-800/50 rounded-xl px-4 py-3 flex items-center gap-3 text-slate-400 cursor-not-allowed select-none">
                                <Mail size={16} />
                                <span className="truncate">{profile.email}</span>
                            </div>
                        </div>

                    </div>

                    <div className="w-full h-px bg-slate-800/80"></div>

                    {/* Subscription & Credits */}
                    <div className="grid grid-cols-2 gap-4">
                        
                        {/* Subscription Tier */}
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CreditCard size={40} />
                            </div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Plan</h4>
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-black ${isPro ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500' : 'text-white'}`}>
                                    {profile.subscription_tier}
                                </span>
                                {isPro && <Sparkles size={14} className="text-amber-400 animate-pulse" />}
                            </div>
                            {!isPro && (
                                <button className="mt-3 text-[10px] font-bold bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-500 transition-colors w-full shadow-lg shadow-violet-900/20 active:translate-y-0.5">
                                    Upgrade to Pro
                                </button>
                            )}
                        </div>

                        {/* Credits */}
                        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-colors">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap size={40} />
                            </div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Credits</h4>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-white">{profile.credits}</span>
                                <span className="text-xs text-slate-400 font-medium">left</span>
                            </div>
                            <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                <div 
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(profile.credits * 10, 100)}%` }}
                                ></div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};

export default ProfileView;