import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import { fetchPostBySlug } from '../services/supabaseService';
import { Loader2, ArrowLeft, Calendar, User, Share2 } from 'lucide-react';

interface BlogPostProps {
  slug: string;
  onBack: () => void;
}

const BlogPostView: React.FC<BlogPostProps> = ({ slug, onBack }) => {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      const data = await fetchPostBySlug(slug);
      setPost(data);
      setLoading(false);
    };
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="text-violet-500 animate-spin mb-4" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
        <button onClick={onBack} className="text-violet-400 hover:text-white">Back to Blog</button>
      </div>
    );
  }

  // Construct JSON-LD Structure
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [post.image_url],
    "datePublished": post.created_at,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "description": post.meta_description,
    "publisher": {
      "@type": "Organization",
      "name": "Mindlyt",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mindlyt.app/logo.png" // Placeholder
      }
    }
  };

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-20 animate-fade-in">
      <title>{post.title} | Mindlyt</title>
      <meta name="description" content={post.meta_description} />
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>

      {/* Nav Back */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
      >
        <div className="p-2 rounded-full bg-slate-800 group-hover:bg-slate-700">
           <ArrowLeft size={16} />
        </div>
        <span className="text-sm font-medium">Back to Blog</span>
      </button>

      {/* Hero Image */}
      <div className="rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl shadow-violet-900/20 aspect-video relative">
        <img 
          src={post.image_url} 
          alt={post.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
      </div>

      {/* Header */}
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-4 text-sm text-violet-400 font-medium mb-4 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.created_at).toLocaleDateString()}</span>
          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
          <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
          {post.title}
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          {post.excerpt}
        </p>
      </header>

      {/* Content */}
      <div 
        className="prose prose-invert prose-lg max-w-none 
        prose-headings:font-bold prose-headings:text-white 
        prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-violet-100
        prose-p:text-slate-300 prose-p:leading-8 prose-p:mb-6
        prose-strong:text-white prose-strong:font-bold
        prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-4 prose-blockquote:border-violet-500 prose-blockquote:bg-slate-900/50 prose-blockquote:p-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
        prose-li:text-slate-300 prose-ul:list-disc prose-ul:ml-4
        "
        dangerouslySetInnerHTML={{ __html: post.content }}
      >
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-slate-800 flex justify-between items-center">
        <div className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Mindlyt Analysis
        </div>
        <button className="flex items-center gap-2 text-violet-400 hover:text-white transition-colors text-sm font-bold">
          <Share2 size={16} /> Share Article
        </button>
      </footer>

    </article>
  );
};

export default BlogPostView;