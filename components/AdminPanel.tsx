import React, { useState, useEffect } from 'react';
import { BlogPost, UserProfile } from '../types';
import { fetchBlogPosts, upsertBlogPost, deleteBlogPost, getAllUserProfiles, adminUpdateUserProfile } from '../services/supabaseService';
import { getStoredKeys, updateKeys } from '../services/configManager';
import { Lock, Settings, Plus, Edit2, Trash2, Save, X, LogOut, Image, Key, AlertTriangle, Users, Award, Zap } from 'lucide-react';

interface AdminPanelProps {
    onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'blog' | 'users' | 'settings'>('blog');
    
    // Blog State
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Users & Credits State
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [editCredits, setEditCredits] = useState<number>(0);
    const [editTier, setEditTier] = useState<string>('Free');

    // Settings State
    const [apiKeys, setApiKeys] = useState({ gemini: '', scrape: '' });

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        setIsLoading(true);
        const fetchedPosts = await fetchBlogPosts();
        setPosts(fetchedPosts);
        
        try {
            const fetchedUsers = await getAllUserProfiles();
            setUsers(fetchedUsers);
        } catch (e) {
            console.error("Failed to fetch user profiles:", e);
        }
        
        const keys = getStoredKeys();
        setApiKeys(keys);
        
        setIsLoading(false);
    };

    const handleSaveUserCredits = async () => {
        if (!editingUser) return;
        setIsLoading(true);
        try {
            const updatedProfile = {
                ...editingUser,
                credits: editCredits,
                subscription_tier: editTier as 'Free' | 'Pro' | 'Enterprise'
            };
            await adminUpdateUserProfile(updatedProfile);
            
            // Sync current localStorage copy in case we are editing current user
            const cachedKey = `supabase_profile_${editingUser.id}`;
            localStorage.setItem(cachedKey, JSON.stringify(updatedProfile));
            
            alert(`Updated ${editingUser.email} credits to ${editCredits}!`);
            setEditingUser(null);
            await loadData();
        } catch (e: any) {
            console.error(e);
            alert("Failed to update user. " + (e.message || ""));
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'admin' && password === 'admin') {
            setIsAuthenticated(true);
        } else {
            alert('Invalid credentials');
        }
    };

    const handleSavePost = async () => {
        if (!editingPost?.title || !editingPost?.slug) {
            alert("Title and Slug are required");
            return;
        }

        // Validation for Image URL length (Prevent Base64 paste)
        if (editingPost.image_url && editingPost.image_url.length > 2000) {
            alert("The Image URL is too long! It looks like you pasted raw image data (Base64). Please paste a direct link (URL) to an image hosted on the web (e.g., from Unsplash, Imgur, or your website).");
            return;
        }

        setIsLoading(true);
        try {
            const postToSave = {
                ...editingPost,
                // Ensure required fields for new posts
                author: editingPost.author || 'Mindlyt Admin',
                image_url: editingPost.image_url || 'https://via.placeholder.com/800x400',
                content: editingPost.content || '',
                excerpt: editingPost.excerpt || '',
                meta_description: editingPost.meta_description || ''
            };
            
            const result = await upsertBlogPost(postToSave);
            
            // Check if result returned error-like object if service didn't throw
            if (result && (result as any).error) {
                throw new Error((result as any).error.message);
            }

            await loadData(); // Refresh list
            setEditingPost(null);
        } catch (e: any) {
            console.error(e);
            alert(`Failed to save post: Supabase Row-Level Security (RLS) is blocking the save. \n\nSince the Admin Panel uses a custom login, Supabase sees this as an anonymous request.\n\nTo fix this: Go to your Supabase Dashboard -> SQL Editor and run:\nALTER TABLE posts DISABLE ROW LEVEL SECURITY;\n\n(Error details: ${e.message})`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePost = async (id: string) => {
        if (!window.confirm("Delete this post?")) return;
        setIsLoading(true);
        try {
            await deleteBlogPost(id);
            await loadData();
        } catch (e) {
            alert("Failed to delete post");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = () => {
        updateKeys(apiKeys.gemini, apiKeys.scrape);
        alert("API Keys Updated in Session Storage");
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="w-full max-w-md p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-violet-500/10 rounded-full text-violet-400">
                            <Lock size={32} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Username</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:border-violet-500 outline-none"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                            <input 
                                type="password" 
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 focus:border-violet-500 outline-none"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                        <button className="w-full bg-violet-600 hover:bg-violet-500 py-3 rounded-xl font-bold transition-colors mt-4">
                            Enter Panel
                        </button>
                        <button type="button" onClick={onLogout} className="w-full text-slate-500 text-sm hover:text-white mt-2">
                            Return to App
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            {/* Admin Nav */}
            <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-violet-400">
                        <Lock size={16} /> Admin Panel
                    </div>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setActiveTab('blog')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'blog' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Blog Posts
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Users & Credits
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            Settings
                        </button>
                        <button onClick={onLogout} className="p-2 text-rose-500 hover:bg-rose-900/20 rounded-lg ml-4">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                
                {/* BLOG EDITOR TAB */}
                {activeTab === 'blog' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Manage Posts</h2>
                            <button 
                                onClick={() => setEditingPost({})}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                            >
                                <Plus size={16} /> New Post
                            </button>
                        </div>

                        {/* Edit Form Modal Overlay */}
                        {editingPost && (
                            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                                <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-slide-up">
                                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                                        <h3 className="font-bold text-lg">{editingPost.id ? 'Edit Post' : 'New Post'}</h3>
                                        <button onClick={() => setEditingPost(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                                    </div>
                                    <div className="p-6 overflow-y-auto space-y-4">
                                        
                                        {/* Main Fields */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Title *</label>
                                                <input 
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-violet-500 outline-none"
                                                    value={editingPost.title || ''}
                                                    onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                                                    placeholder="Enter post title"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Slug (URL) *</label>
                                                <input 
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-violet-500 outline-none"
                                                    value={editingPost.slug || ''}
                                                    onChange={e => setEditingPost({...editingPost, slug: e.target.value})}
                                                    placeholder="post-url-slug"
                                                />
                                            </div>
                                        </div>

                                        {/* Image Section */}
                                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                            <label className="text-xs text-slate-500 font-bold uppercase mb-2 flex items-center gap-2">
                                                <Image size={12}/> Image URL Link
                                            </label>
                                            
                                            <div className="flex gap-2">
                                                <input 
                                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-blue-300 focus:border-blue-500 outline-none"
                                                    value={editingPost.image_url || ''}
                                                    onChange={e => setEditingPost({...editingPost, image_url: e.target.value})}
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                            <div className="flex items-start gap-2 mt-2 text-[10px] text-slate-500">
                                                <AlertTriangle size={12} className="text-amber-500 mt-0.5" />
                                                <span>Paste a direct <b>LINK</b> (URL) to an image. <b>Do not paste raw image data</b> (Base64) or the save will fail.</span>
                                            </div>

                                            {/* Preview */}
                                            {editingPost.image_url && editingPost.image_url.length < 2000 && (
                                                <div className="mt-3 relative h-32 w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                                                    <img 
                                                        src={editingPost.image_url} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity"
                                                        onError={(e) => (e.currentTarget.style.display = 'none')}
                                                    />
                                                    <span className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-[10px] text-white">Preview</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Fields */}
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Excerpt</label>
                                            <textarea 
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm h-20 focus:border-violet-500 outline-none"
                                                value={editingPost.excerpt || ''}
                                                onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Content (HTML Support)</label>
                                            <textarea 
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono h-40 focus:border-violet-500 outline-none"
                                                value={editingPost.content || ''}
                                                onChange={e => setEditingPost({...editingPost, content: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Author</label>
                                                <input 
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-violet-500 outline-none"
                                                    value={editingPost.author || ''}
                                                    onChange={e => setEditingPost({...editingPost, author: e.target.value})}
                                                />
                                             </div>
                                             <div>
                                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Meta Description</label>
                                                <input 
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-violet-500 outline-none"
                                                    value={editingPost.meta_description || ''}
                                                    onChange={e => setEditingPost({...editingPost, meta_description: e.target.value})}
                                                />
                                             </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                                        <button onClick={() => setEditingPost(null)} className="px-4 py-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">Cancel</button>
                                        <button onClick={handleSavePost} disabled={isLoading} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                            {isLoading ? 'Saving...' : 'Save Post'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {posts.length === 0 && (
                                <div className="text-center py-10 text-slate-500">
                                    No posts found. Create one to get started.
                                </div>
                            )}
                            {posts.map(post => (
                                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:border-violet-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-12 rounded-lg bg-slate-800 overflow-hidden relative">
                                             <img src={post.image_url} className="w-full h-full object-cover" alt="" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Img'} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white group-hover:text-violet-300 transition-colors">{post.title}</h4>
                                            <p className="text-xs text-slate-500 font-mono">/{post.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => setEditingPost(post)} 
                                            className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition-colors"
                                            title="Edit Post"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeletePost(post.id)} 
                                            className="p-2 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                                            title="Delete Post"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* USERS & CREDITS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Users className="text-violet-400" size={24} /> Manage Users & Credits
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    Track account active states, assign database credits, and adjust subscription profiles.
                                </p>
                            </div>
                        </div>

                        {/* Quick Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                                <div className="p-3 bg-violet-600/10 text-violet-400 rounded-xl">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Accounts</p>
                                    <p className="text-xl font-bold text-white mt-1">{users.length}</p>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                                <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-xl">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Allocated Credits</p>
                                    <p className="text-xl font-bold text-white mt-1">
                                        {users.reduce((acc, curr) => acc + (curr.credits !== undefined ? curr.credits : 5), 0)}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                                <div className="p-3 bg-amber-600/10 text-amber-400 rounded-xl">
                                    <Award size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Premium Partners</p>
                                    <p className="text-xl font-bold text-white mt-1">
                                        {users.filter(u => u.subscription_tier !== 'Free').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Editing User Modal Overflow */}
                        {editingUser && (
                            <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                                <div className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <Edit2 size={18} className="text-violet-400" /> Edit User Account
                                        </h3>
                                        <button onClick={() => setEditingUser(null)} className="text-slate-500 hover:text-white">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1 block">Email (ReadOnly)</label>
                                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-400 text-sm font-mono flex items-center justify-between">
                                                <span>{editingUser.email}</span>
                                                <Lock size={12} className="text-slate-600" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1 block">Username</label>
                                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-400 text-sm font-mono">
                                                {editingUser.username || "N/A"}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">Credits Balance</label>
                                            <div className="flex gap-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEditCredits(prev => Math.max(0, prev - 1))}
                                                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                                                >
                                                    -
                                                </button>
                                                <input 
                                                    type="number"
                                                    value={editCredits}
                                                    onChange={e => setEditCredits(Math.max(0, parseInt(e.target.value) || 0))}
                                                    className="flex-1 bg-slate-950 border border-slate-700 text-center rounded-xl font-bold font-mono text-lg text-white outline-none focus:border-violet-500"
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEditCredits(prev => prev + 1)}
                                                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                <button 
                                                    type="button"
                                                    onClick={() => setEditCredits(prev => prev + 5)}
                                                    className="flex-1 py-1.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg text-xs text-slate-300 font-bold"
                                                >
                                                    +5 Credits
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setEditCredits(prev => prev + 10)}
                                                    className="flex-1 py-1.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg text-xs text-slate-300 font-bold"
                                                >
                                                    +10 Credits
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => setEditCredits(5)}
                                                    className="flex-1 py-1.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg text-xs text-rose-300 font-bold"
                                                >
                                                    Reset to 5
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1 block">Account Tier</label>
                                            <select 
                                                value={editTier}
                                                onChange={e => setEditTier(e.target.value)}
                                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-violet-500"
                                            >
                                                <option value="Free">Free Account (Standard)</option>
                                                <option value="Pro">Pro Membership</option>
                                                <option value="Enterprise">Enterprise Workspace</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-950 border-t border-slate-800 flex gap-3">
                                        <button 
                                            type="button" 
                                            onClick={() => setEditingUser(null)} 
                                            className="flex-1 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 py-3 rounded-xl font-bold transition-all text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={handleSaveUserCredits} 
                                            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-3 rounded-xl font-bold transition-all text-sm shadow-lg shadow-violet-900/30"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Users List Container */}
                        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
                            {users.length === 0 ? (
                                <div className="text-center py-20 text-slate-500 font-mono text-sm">
                                    No user profiles loaded yet.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {users.map(u => (
                                        <div 
                                            key={u.id}
                                            className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-center text-violet-400">
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors">
                                                            {u.username || u.email.split('@')[0]}
                                                        </h3>
                                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                                                            u.subscription_tier === 'Enterprise' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' :
                                                            u.subscription_tier === 'Pro' ? 'bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/30' :
                                                            'bg-slate-800 text-slate-400 border border-slate-700'
                                                        }`}>
                                                            {u.subscription_tier}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-400 mt-0.5 font-mono">{u.email}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {u.id}</p>
                                                </div>
                                            </div>

                                            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-slate-800/40 pt-3 md:pt-0">
                                                <div className="text-left md:text-right">
                                                    <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Remaining Credits</p>
                                                    <div className="flex items-center gap-1.5 mt-1">
                                                        <Zap size={16} className={`${(u.credits !== undefined ? u.credits : 5) > 0 ? "text-amber-400 fill-amber-400 animate-pulse" : "text-slate-500"}`} />
                                                        <span className="text-xl font-bold font-mono text-white">
                                                            {u.credits !== undefined ? u.credits : 5}
                                                        </span>
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => {
                                                        setEditingUser(u);
                                                        setEditCredits(u.credits !== undefined ? u.credits : 5);
                                                        setEditTier(u.subscription_tier || 'Free');
                                                    }}
                                                    className="px-4 py-2 bg-slate-950 border border-slate-800 hover:bg-violet-700/20 hover:border-violet-500/30 text-slate-300 hover:text-white rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all"
                                                >
                                                    <Edit2 size={13} /> Edit Account
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2">API Configuration</h2>
                            <p className="text-slate-400 text-sm">Update the API keys used by the application. These overrides are stored locally for this session.</p>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-violet-400 mb-2 uppercase tracking-wide">
                                    <Key size={14} /> Gemini API Key
                                </label>
                                <input 
                                    type="password"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm focus:border-violet-500 outline-none"
                                    placeholder="Enter AI Studio Key..."
                                    value={apiKeys.gemini}
                                    onChange={e => setApiKeys({...apiKeys, gemini: e.target.value})}
                                />
                                <p className="text-xs text-slate-500 mt-2">Required for analysis and chat features.</p>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wide">
                                    <Key size={14} /> ScrapeCreators API Key
                                </label>
                                <input 
                                    type="password"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white font-mono text-sm focus:border-emerald-500 outline-none"
                                    placeholder="Enter ScrapeCreators Key..."
                                    value={apiKeys.scrape}
                                    onChange={e => setApiKeys({...apiKeys, scrape: e.target.value})}
                                />
                                <p className="text-xs text-slate-500 mt-2">Required for social profile imports.</p>
                            </div>

                            <button 
                                onClick={handleSaveSettings}
                                className="w-full bg-violet-600 hover:bg-violet-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
                            >
                                <Save size={18} /> Save Configurations
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminPanel;