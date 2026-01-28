import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pt-32 pb-20 px-6 max-w-3xl mx-auto w-full animate-slide-up">
        
        <h1 className="text-4xl md:text-5xl font-black text-white mb-8">The Science Behind the Screen.</h1>
        
        <div className="prose prose-invert prose-lg">
            <p className="text-xl text-slate-300 leading-relaxed">
                Mindlyt is not just a chatbot. It is a sophisticated psychological inference engine designed to bridge the gap between digital text and human intent.
            </p>

            <h3 className="text-violet-400 font-bold mt-12 mb-4 text-xl">How it Works</h3>
            <p className="text-slate-300 leading-relaxed mb-6">
                We utilize Google's Gemini 3 Pro Large Language Model, fine-tuned with prompts based on the <strong>Big Five Personality Traits (OCEAN)</strong> model. By analyzing syntax, word choice, emoji usage, and response latency in your uploaded chats, Mindlyt constructs a probabilistic profile of the speaker.
            </p>

            <h3 className="text-violet-400 font-bold mt-12 mb-4 text-xl">Data Privacy & Ethics</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
                Your trust is paramount. Mindlyt operates on a "Zero-Retention" policy for sensitive uploads.
            </p>
            <ul className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 my-8 text-slate-300">
                <li className="flex gap-3"><span className="text-emerald-500 font-bold">✓</span> Chat logs are processed in memory and never saved to a database.</li>
                <li className="flex gap-3"><span className="text-emerald-500 font-bold">✓</span> Analysis reports are stored securely only for your history.</li>
                <li className="flex gap-3"><span className="text-emerald-500 font-bold">✓</span> We do not sell user data to third parties.</li>
            </ul>

            <h3 className="text-violet-400 font-bold mt-12 mb-4 text-xl">Disclaimer</h3>
            <p className="text-sm text-slate-400">
                Mindlyt provides educational insights based on linguistic patterns. It is NOT a substitute for professional psychological or medical advice.
            </p>
        </div>

      </main>

      <footer className="border-t border-slate-800 bg-slate-950 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="text-slate-500 text-sm">© 2024 Mindlyt. All rights reserved.</span>
            <div className="flex flex-col md:flex-row gap-6 text-sm text-slate-400 font-medium">
                <Link to="/about" className="hover:text-white transition-colors">About</Link>
                <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                <Link to="/app" className="hover:text-white transition-colors">Log In</Link>
                <a href="#" className="hover:text-white transition-colors cursor-not-allowed opacity-70">Disclaimer</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;