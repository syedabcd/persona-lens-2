import React from 'react';
import { ArrowRight, Brain, MessageSquare, ShieldAlert, Sparkles, Lock, CheckCircle, Zap, Heart, Search, FileText, Upload } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="flex flex-col items-center w-full">
      
      {/* --- HERO SECTION --- */}
      <section className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4 w-full max-w-5xl mx-auto pt-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 shadow-sm mb-8 animate-fade-in hover:scale-105 transition-transform cursor-default">
            <Sparkles size={14} className="text-violet-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-300">
              AI Psychology Engine
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-8 leading-[1.05] animate-slide-up">
            Understand <br />
            <span className="bg-gradient-to-r from-violet-500 via-indigo-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-sm">
              People Better.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed animate-slide-up delay-100 font-medium">
            Don't guess what they mean. Upload your chat screenshots or paste texts, and our AI will explain their personality, hidden feelings, and tell you exactly what to say next.
          </p>

          <div className="animate-slide-up delay-200 relative group z-10">
            <div className="absolute inset-0 bg-violet-600 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
            <button
              onClick={onGetStarted}
              className="relative bg-white text-slate-900 px-12 py-6 rounded-full font-black text-xl shadow-2xl flex items-center gap-4 hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 group-hover:pr-14 duration-300"
            >
              Start Analysis Now
              <span className="absolute right-5 opacity-0 group-hover:opacity-100 group-hover:right-6 transition-all duration-300">
                 <ArrowRight size={24} />
              </span>
            </button>
            <p className="text-xs text-slate-500 mt-4 font-medium tracking-wide">No credit card required to start</p>
          </div>
      </section>

      {/* --- HOW IT WORKS (The 3 Steps) --- */}
      <section className="w-full py-20 bg-slate-900/30 border-y border-white/5 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How It Works</h2>
                  <p className="text-slate-400 text-lg">It is very simple. You get answers in seconds.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 relative">
                  {/* Connecting Line (Desktop) */}
                  <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-violet-500/0 via-violet-500/50 to-violet-500/0"></div>

                  {/* Step 1 */}
                  <div className="flex flex-col items-center text-center relative z-10">
                      <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-700 shadow-xl mb-6 group hover:-translate-y-2 transition-transform duration-300">
                          <Upload size={32} className="text-violet-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">1. Upload Evidence</h3>
                      <p className="text-slate-400 leading-relaxed px-4">
                          Take screenshots of your chat (WhatsApp, Instagram, etc.) or paste text. You can also add notes.
                      </p>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center text-center relative z-10">
                      <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-700 shadow-xl mb-6 group hover:-translate-y-2 transition-transform duration-300">
                          <Brain size={32} className="text-fuchsia-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">2. AI Analysis</h3>
                      <p className="text-slate-400 leading-relaxed px-4">
                          Our advanced AI reads between the lines. It looks for patterns, mood, and hidden meanings.
                      </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center text-center relative z-10">
                      <div className="w-24 h-24 bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-700 shadow-xl mb-6 group hover:-translate-y-2 transition-transform duration-300">
                          <FileText size={32} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">3. Get Full Report</h3>
                      <p className="text-slate-400 leading-relaxed px-4">
                          See their personality traits, red flags, and get a step-by-step plan on how to talk to them.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* --- DETAILED FEATURES --- */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 space-y-24">
          
          {/* Feature 1: Relationships */}
          <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 order-2 md:order-1">
                  <div className="inline-flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider mb-4">
                      <Heart size={16} /> Relationships & Dating
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-6">Is this person right for you?</h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                      Dating is confusing. People say one thing but mean another. Use PersonaLens to check:
                  </p>
                  <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                          <div className="bg-rose-500/10 p-1 rounded-full text-rose-500 mt-1"><CheckCircle size={16} /></div>
                          <span className="text-slate-300"><strong>Red Flags:</strong> Spot narcissism, lying, or anger issues early.</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <div className="bg-rose-500/10 p-1 rounded-full text-rose-500 mt-1"><CheckCircle size={16} /></div>
                          <span className="text-slate-300"><strong>Compatibility:</strong> See if your personalities actually match long-term.</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <div className="bg-rose-500/10 p-1 rounded-full text-rose-500 mt-1"><CheckCircle size={16} /></div>
                          <span className="text-slate-300"><strong>Interest Level:</strong> Are they actually interested, or just being polite?</span>
                      </li>
                  </ul>
              </div>
              <div className="flex-1 order-1 md:order-2 bg-gradient-to-br from-rose-900/20 to-slate-900 border border-rose-500/10 rounded-[2rem] p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                   {/* Visual Representation */}
                   <div className="space-y-4">
                      <div className="bg-slate-800/80 p-4 rounded-xl rounded-tl-none border border-slate-700 max-w-[80%]">
                          <p className="text-slate-400 text-xs mb-1">Target</p>
                          <p className="text-sm text-white">I'm just really busy right now, maybe next week?</p>
                      </div>
                      <div className="flex items-center gap-2 text-rose-400 text-sm font-bold animate-pulse">
                          <ShieldAlert size={16} />
                          <span>AI Detected: Avoidant Behavior</span>
                      </div>
                      <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/20">
                          <p className="text-emerald-400 text-xs font-bold mb-1">AI Advice:</p>
                          <p className="text-sm text-emerald-100">Do not chase. Give them space. Reply casually.</p>
                      </div>
                   </div>
              </div>
          </div>

          {/* Feature 2: Business */}
          <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/10 rounded-[2rem] p-8 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-16 -mt-16"></div>
                   {/* Visual Representation */}
                   <div className="space-y-4">
                      <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                          <p className="text-slate-400 text-xs mb-1">Client Email</p>
                          <p className="text-sm text-white">The price seems a bit high given the market conditions...</p>
                      </div>
                      <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
                          <p className="text-blue-400 text-xs font-bold mb-1">AI Insight:</p>
                          <p className="text-sm text-blue-100">They want to buy, but need safety. Focus on ROI and guarantees, not discounts.</p>
                      </div>
                   </div>
              </div>
              <div className="flex-1">
                  <div className="inline-flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider mb-4">
                      <Zap size={16} /> Business & Sales
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-6">Close more deals.</h2>
                  <p className="text-slate-400 text-lg leading-relaxed mb-8">
                      Understand your clients before you even meet them. Analyze their emails or LinkedIn profiles to know exactly how to sell to them.
                  </p>
                  <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                          <div className="bg-blue-500/10 p-1 rounded-full text-blue-500 mt-1"><CheckCircle size={16} /></div>
                          <span className="text-slate-300"><strong>Negotiation Style:</strong> Are they aggressive or logical?</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <div className="bg-blue-500/10 p-1 rounded-full text-blue-500 mt-1"><CheckCircle size={16} /></div>
                          <span className="text-slate-300"><strong>Buying Triggers:</strong> Find out what specific words make them say "Yes".</span>
                      </li>
                      <li className="flex items-start gap-3">
                          <div className="bg-blue-500/10 p-1 rounded-full text-blue-500 mt-1"><CheckCircle size={16} /></div>
                          <span className="text-slate-300"><strong>Segmentation:</strong> Group your leads by psychology, not just location.</span>
                      </li>
                  </ul>
              </div>
          </div>

      </section>

      {/* --- PRIVACY SECTION --- */}
      <section className="w-full py-20 bg-slate-800/20">
          <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-full mb-6">
                  <Lock size={32} className="text-slate-300" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Your Secrets are Safe</h2>
              <p className="text-slate-400 text-lg mb-8">
                  We know these chats are private. We do not store your uploaded screenshots or text permanently. 
                  Everything is processed securely by AI and then forgotten.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                  <div className="bg-slate-900 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" /> No Human Sees Your Data
                  </div>
                  <div className="bg-slate-900 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 flex items-center gap-2">
                      <CheckCircle size={16} className="text-emerald-500" /> Encrypted Connection
                  </div>
              </div>
          </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="w-full py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto relative">
              <div className="absolute inset-0 bg-violet-600 rounded-full blur-[100px] opacity-20 animate-pulse pointer-events-none"></div>
              
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">
                  Ready to see the truth?
              </h2>
              <p className="text-xl text-slate-400 mb-10 relative z-10">
                  Stop guessing. Start understanding. It takes less than 1 minute.
              </p>
              
              <button
                onClick={onGetStarted}
                className="relative z-10 bg-white text-slate-900 px-12 py-5 rounded-full font-bold text-xl shadow-xl flex items-center gap-3 hover:scale-105 transition-transform mx-auto hover:bg-violet-50"
              >
                Analyze My Chats
                <ArrowRight size={24} />
              </button>
          </div>
      </section>
      
    </div>
  );
};

export default LandingPage;