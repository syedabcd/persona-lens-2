import React from 'react';
import { ArrowRight, Brain, MessageSquare, ShieldAlert, Sparkles, Lock } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-sm mb-8 animate-fade-in hover:scale-105 transition-transform cursor-default">
        <Sparkles size={14} className="text-violet-600 dark:text-violet-400 animate-pulse" />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-800 dark:text-violet-300">
          AI-Powered Psychology Engine
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 leading-[1.1] animate-slide-up">
        Decode the <br />
        <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-500 dark:from-violet-400 dark:via-indigo-400 dark:to-fuchsia-400 bg-clip-text text-transparent drop-shadow-sm">
          Human Psyche.
        </span>
      </h1>

      {/* Subtext */}
      <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up delay-100 font-medium">
        Uncover hidden personality traits, spot red flags, and get tailored communication strategies from chat logs and profiles.
      </p>

      {/* CTA Button */}
      <div className="animate-slide-up delay-200 relative group">
        <div className="absolute inset-0 bg-violet-600 rounded-full blur-xl opacity-30 dark:opacity-50 group-hover:opacity-50 dark:group-hover:opacity-70 transition-opacity duration-500 animate-pulse"></div>
        <button
          onClick={onGetStarted}
          className="relative bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-10 py-5 rounded-full font-bold text-lg shadow-2xl flex items-center gap-4 hover:bg-black dark:hover:bg-gray-100 transition-all hover:scale-105 hover:shadow-indigo-500/50 active:scale-95 group-hover:pr-12 duration-300"
        >
          Get Started
          <span className="absolute right-4 opacity-0 group-hover:opacity-100 group-hover:right-5 transition-all duration-300">
             <ArrowRight size={20} />
          </span>
        </button>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-20 w-full max-w-4xl text-left">
        
        <div className="glass-card p-6 rounded-3xl hover:-translate-y-2 transition-transform duration-300 animate-slide-up delay-300">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400 shadow-sm">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">Text Analysis</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Upload screenshots or paste chats. Our AI reads between the lines to find subtext.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl hover:-translate-y-2 transition-transform duration-300 animate-slide-up delay-500">
          <div className="w-12 h-12 bg-fuchsia-50 dark:bg-fuchsia-900/30 rounded-2xl flex items-center justify-center mb-4 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm">
            <Brain size={24} />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">Deep Profiling</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Construct a Big 5 personality model based on linguistic patterns and behavior.
          </p>
        </div>

        <div className="glass-card p-6 rounded-3xl hover:-translate-y-2 transition-transform duration-300 animate-slide-up delay-700">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 shadow-sm">
            <ShieldAlert size={24} />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">Flag Detection</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Instantly spot red flags, narcissism, or manipulation tactics before you commit.
          </p>
        </div>

      </div>

      {/* Trust Badge */}
      <div className="mt-16 animate-fade-in delay-700 flex items-center gap-2 opacity-50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
        <Lock size={12} />
        <span>Private & Encrypted Analysis</span>
      </div>
      
    </div>
  );
};

export default LandingPage;
