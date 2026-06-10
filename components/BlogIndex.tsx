import React, { useEffect, useState } from 'react';
import { fetchBlogPosts } from '../services/supabaseService';
import { BlogPost } from '../types';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User, Tag, Loader2, Sparkles } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const BlogIndex: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
        const data = await fetchBlogPosts();
        setPosts(data);
        setLoading(false);
    };
    loadPosts();
  }, []);

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center pt-20">
              <Loader2 className="animate-spin text-violet-500" size={40} />
          </div>
      );
  }

  return (
    <div className="w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
      <Helmet>
        <title>Mindlyt Blog | Psychology & AI Insights</title>
        <meta name="description" content="Read the latest insights on digital psychology, texting red flags, and how AI is changing modern relationships." />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles size={12} />
                Psychology Decoded
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                The Mindlyt <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Journal</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Deep dives into digital body language, the psychology of ghosting, and how to navigate modern relationships with clarity.
            </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up delay-100">
            {posts.map((post) => (
                <Link 
                    to={`/blog/${post.slug}`} 
                    key={post.id}
                    className="group bg-slate-900 border border-slate-800 hover:border-violet-500/30 rounded-[2rem] overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-900/20"
                >
                    {/* Image */}
                    <div className="h-48 overflow-hidden relative">
                        <div className="absolute inset-0 bg-slate-800 animate-pulse" /> {/* Placeholder */}
                        <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onLoad={(e) => (e.currentTarget.previousSibling as HTMLElement).style.display = 'none'}
                        />
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {post.category}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.publishDate || Date.now()).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><User size={12} /> {post.author || 'Team'}</span>
                        </div>
                        
                        <h2 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-violet-300 transition-colors">
                            {post.title}
                        </h2>
                        
                        <p className="text-sm text-slate-400 leading-relaxed mb-6 line-clamp-3 flex-1">
                            {post.summary || post.excerpt}
                        </p>

                        <div className="flex items-center gap-2 text-sm font-bold text-violet-500 group-hover:translate-x-1 transition-transform mt-auto">
                            Read Article <ArrowRight size={16} />
                        </div>
                    </div>
                </Link>
            ))}
        </div>

      </div>
    </div>
  );
};

export default BlogIndex;