import React from 'react';
import { blogPosts } from '../src/data/blogData';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const BlogIndex: React.FC = () => {
  const posts = blogPosts;

  return (
    <div className="w-full max-w-6xl mx-auto px-6 pb-20 animate-slide-up">
      <Helmet>
        <title>Mindlyt Blog | Psychology & AI Insights</title>
        <meta name="description" content="In-depth articles on digital body language, detecting narcissism in texts, B2B sales psychology, and AI-powered communication strategies." />
        <link rel="canonical" href="https://mindlyt.app/blog" />
      </Helmet>

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
            {/* Image Placeholder - Using a generic gradient or Unsplash placeholder since we don't have images in data yet. 
                In a real app, map slugs to images or add image field to data. 
                Using a gradient div for now to look good without external deps. */}
            <div className="h-48 overflow-hidden relative bg-slate-800">
               <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 to-indigo-900/50 z-0"></div>
               <div className="absolute inset-0 flex items-center justify-center text-violet-500/20">
                   <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
               </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 font-medium">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.publishDate).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><User size={12} /> Mindlyt Team</span>
              </div>
              
              <h2 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-violet-300 transition-colors">
                {post.title}
              </h2>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                {post.summary}
              </p>

              <Link 
                to={`/blog/${post.slug}`}
                className="flex items-center gap-2 text-sm font-bold text-violet-400 hover:text-white transition-colors mt-auto"
              >
                Read Article <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogIndex;