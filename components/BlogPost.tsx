import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogPosts, BlogPost } from '../src/data/blogData';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, User, Share2, ArrowRight } from 'lucide-react';

const BlogPostView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.slug === slug);

  // Find related posts based on relatedSlugs
  const relatedPosts = post ? blogPosts.filter(p => post.relatedSlugs.includes(p.slug)) : [];

  if (!post) {
    return (
      <div className="text-center py-20">
        <Helmet>
            <title>Post Not Found | Mindlyt</title>
            <meta name="robots" content="noindex" />
        </Helmet>
        <h2 className="text-2xl font-bold text-white mb-4">Post not found</h2>
        <Link to="/blog" className="text-violet-400 hover:text-white">Back to Blog</Link>
      </div>
    );
  }

  // Construct JSON-LD Structure
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "datePublished": post.publishDate,
    "author": {
      "@type": "Person",
      "name": "Mindlyt Team"
    },
    "description": post.summary,
    "publisher": {
      "@type": "Organization",
      "name": "Mindlyt",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mindlyt.app/logo.png"
      }
    }
  };

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 pb-20 animate-fade-in pt-32">
      <Helmet>
        <title>{post.title} | Mindlyt</title>
        <meta name="description" content={post.summary} />
        <link rel="canonical" href={`https://mindlyt.app/blog/${post.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      {/* Nav Back */}
      <Link 
        to="/blog"
        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-8 group"
      >
        <div className="p-2 rounded-full bg-slate-800 group-hover:bg-slate-700">
           <ArrowLeft size={16} />
        </div>
        <span className="text-sm font-medium">Back to Blog</span>
      </Link>

      {/* Header */}
      <header className="mb-12 text-center max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-4 text-sm text-violet-400 font-medium mb-4 uppercase tracking-wider">
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.publishDate).toLocaleDateString()}</span>
          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
          <span className="flex items-center gap-1.5"><User size={14} /> Mindlyt Team</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
          {post.title}
        </h1>
        <p className="text-lg text-slate-300 leading-relaxed">
          {post.summary}
        </p>
      </header>

      {/* Content */}
      <div 
        className="prose prose-invert prose-lg max-w-none 
        prose-headings:font-bold prose-headings:text-white 
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-white
        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-violet-100
        prose-p:text-slate-300 prose-p:leading-8 prose-p:mb-6
        prose-strong:text-white prose-strong:font-bold
        prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
        prose-li:text-slate-300 prose-ul:list-disc prose-ul:ml-4 prose-ul:mb-6
        "
        dangerouslySetInnerHTML={{ __html: post.content }}
      >
      </div>

      {/* Footer / Read Next */}
      <footer className="mt-16 pt-12 border-t border-slate-800">
        
        {relatedPosts.length > 0 && (
            <div className="mb-12">
                <h3 className="text-2xl font-bold text-white mb-6">Read Next</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {relatedPosts.map(rp => (
                        <Link key={rp.id} to={`/blog/${rp.slug}`} className="block group p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-violet-500/50 transition-colors">
                            <h4 className="font-bold text-white group-hover:text-violet-300 mb-2">{rp.title}</h4>
                            <p className="text-sm text-slate-400 line-clamp-2">{rp.summary}</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-violet-500 mt-4 uppercase tracking-wide">
                                Read Article <ArrowRight size={12} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        )}

        <div className="flex justify-between items-center">
            <div className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Mindlyt Analysis
            </div>
            <button className="flex items-center gap-2 text-violet-400 hover:text-white transition-colors text-sm font-bold">
            <Share2 size={16} /> Share Article
            </button>
        </div>
      </footer>

    </article>
  );
};

export default BlogPostView;