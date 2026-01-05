import React, { useState, useEffect } from 'react';
import { BlogPost } from '../types';
import { fetchBlogPosts, upsertBlogPost, deleteBlogPost } from '../services/supabaseService';
import { getStoredKeys, updateKeys } from '../services/configManager';
import { Lock, Settings, FileText, Plus, Edit2, Trash2, Save, X, LogOut, Image, Key } from 'lucide-react';

interface AdminPanelProps {
    onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState<'blog' | 'settings'>('blog');
    
    // Blog State
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

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
        
        const keys = getStoredKeys();
        setApiKeys(keys);
        
        setIsLoading(false);
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
            
            await upsertBlogPost(postToSave);
            await loadData(); // Refresh list
            setEditingPost(null);
        } catch (e) {
            alert("Failed to save post");
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
                            <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
                                <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                                        <h3 className="font-bold text-lg">{editingPost.id ? 'Edit Post' : 'New Post'}</h3>
                                        <button onClick={() => setEditingPost(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                                    </div>
                                    <div className="p-6 overflow-y-auto space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Title</label>
                                                <input 
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm"
                                                    value={editingPost.title || ''}
                                                    onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Slug (URL)</label>
                                                <input 
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm"
                                                    value={editingPost.slug || ''}
                                                    onChange={e => setEditingPost({...editingPost, slug: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold uppercase block mb-1 flex items-center gap-2"><Image size={12}/> Image URL</label>
                                            <input 
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-blue-300"
                                                value={editingPost.image_url || ''}
                                                onChange={e => setEditingPost({...editingPost, image_url: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Excerpt</label>
                                            <textarea 
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm h-20"
                                                value={editingPost.excerpt || ''}
                                                onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Content (HTML Support)</label>
                                            <textarea 
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm font-mono h-40"
                                                value={editingPost.content || ''}
                                                onChange={e => setEditingPost({...editingPost, content: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Author</label>
                                                <input 
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm"
                                                    value={editingPost.author || ''}
                                                    onChange={e => setEditingPost({...editingPost, author: e.target.value})}
                                                />
                                             </div>
                                             <div>
                                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Meta Description</label>
                                                <input 
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm"
                                                    value={editingPost.meta_description || ''}
                                                    onChange={e => setEditingPost({...editingPost, meta_description: e.target.value})}
                                                />
                                             </div>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
                                        <button onClick={() => setEditingPost(null)} className="px-4 py-2 rounded-lg hover:bg-slate-800">Cancel</button>
                                        <button onClick={handleSavePost} disabled={isLoading} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold">
                                            {isLoading ? 'Saving...' : 'Save Post'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {posts.map(post => (
                                <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:border-violet-500/30 transition-all">
                                    <div className="flex items-center gap-4">
                                        <img src={post.image_url} className="w-16 h-12 object-cover rounded-lg bg-slate-800" alt="" />
                                        <div>
                                            <h4 className="font-bold text-white">{post.title}</h4>
                                            <p className="text-xs text-slate-500 font-mono">/{post.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-50 group-hover:opacity-100">
                                        <button onClick={() => setEditingPost(post)} className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDeletePost(post.id)} className="p-2 bg-slate-800 hover:bg-rose-600 hover:text-white rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
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