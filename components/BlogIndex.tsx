import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import { fetchBlogPosts } from '../services/supabaseService';
import { Loader2, ArrowRight, Calendar, User } from 'lucide-react';

interface BlogIndexProps {
  onReadPost: (slug: string) => void;
}

const BlogIndex: React.FC<BlogIndexProps> = ({ onReadPost }) => {
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
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="text-violet-500 animate-spin mb-4" />
        <p className="text-slate-400">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pb-20 animate-slide-up">
      <title>Mindlyt Blog | Personality Analysis Insights</title>
      <meta name="description" content="Explore articles on digital psychology, personality analysis, and communication strategies using AI." />

      {/* Header */}
      <div className="text-center mb-16 pt-8">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Mindlyt <span className="text-violet-500">Insights</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Deep dives into psychology, AI analysis, and the art of digital communication.
        </p>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article 
            key={post.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-900/20 transition-all duration-300 group flex flex-col h-full"
          >
            {/* Image */}
            <div className="h-48 overflow-hidden relative">
              <div className="absolute inset-0 bg-violet-900/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 font-medium">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-violet-300 transition-colors">
                {post.title}
              </h2>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                {post.excerpt}
              </p>

              <button 
                onClick={() => onReadPost(post.slug)}
                className="flex items-center gap-2 text-sm font-bold text-violet-400 hover:text-white transition-colors mt-auto"
              >
                Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogIndex;