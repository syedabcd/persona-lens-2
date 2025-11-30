import React, { useEffect, useState } from 'react';
import { CompatibilityReport } from '../types';
import { Heart, AlertTriangle, Zap, TrendingUp, Sparkles, Brain, CheckCircle } from 'lucide-react';

interface CompatibilityViewProps {
  report: CompatibilityReport;
}

const CompatibilityView: React.FC<CompatibilityViewProps> = ({ report }) => {
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Animate score
    const timer = setTimeout(() => {
        setScore(report.overallScore);
    }, 300);
    return () => clearTimeout(timer);
  }, [report.overallScore]);

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (s >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-500';
  };

  const getScoreGradient = (s: number) => {
    if (s >= 80) return 'from-emerald-400 to-teal-600';
    if (s >= 50) return 'from-amber-400 to-orange-600';
    return 'from-rose-500 to-pink-600';
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-40">
      
      {/* Hero Score Section */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-black p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-indigo-500/20 dark:shadow-rose-900/30 mb-8 text-white animate-scale-in flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500 opacity-10 rounded-full -ml-10 -mb-10 blur-3xl animate-blob delay-500"></div>
        
        <div className="relative z-10 w-full">
            <div className="inline-flex items-center gap-2 text-rose-300 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 bg-rose-900/30 px-3 py-1 rounded-full border border-rose-500/20">
                <Brain size={12} />
                Compatibility Engine
            </div>

            <div className="relative w-40 h-40 mx-auto mb-6 flex items-center justify-center">
                 {/* Circular Progress (Simplified SVG) */}
                 <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#334155" strokeWidth="8" />
                    <circle 
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * score) / 100}
                        className={`transition-all duration-1000 ease-out ${getScoreColor(score)}`}
                        strokeLinecap="round"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black">{score}%</span>
                 </div>
            </div>

            <h2 className={`text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight bg-gradient-to-r ${getScoreGradient(report.overallScore)} bg-clip-text text-transparent`}>
               {report.scoreLabel}
            </h2>
            
            <p className="max-w-xl mx-auto text-slate-300 text-lg leading-relaxed font-light">
                {report.longTermPrediction}
            </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          
          {/* Synergy Card */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-emerald-500/5 dark:shadow-none border border-emerald-100 dark:border-emerald-500/10 animate-slide-up delay-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                      <Zap size={24} />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white">Synergy Points</h3>
              </div>
              
              <ul className="space-y-4 relative z-10">
                  {report.synergy.map((item, i) => (
                      <li key={i} className="flex gap-3 text-gray-600 dark:text-gray-300">
                          <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{item}</span>
                      </li>
                  ))}
              </ul>
          </div>

          {/* Friction Card */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-rose-500/5 dark:shadow-none border border-rose-100 dark:border-rose-500/10 animate-slide-up delay-200 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-rose-500/10 transition-colors"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                      <AlertTriangle size={24} />
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white">Friction Zones</h3>
              </div>
              
              <ul className="space-y-4 relative z-10">
                  {report.conflicts.map((item, i) => (
                      <li key={i} className="flex gap-3 text-gray-600 dark:text-gray-300">
                          <div className="mt-2 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></div>
                          <span className="leading-relaxed">{item}</span>
                      </li>
                  ))}
              </ul>
          </div>

          {/* Strategic Advice (Full Width) */}
          <div className="md:col-span-2 glass-card p-8 rounded-[2rem] animate-slide-up delay-300 border-indigo-200 dark:border-indigo-500/20">
              <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={20} className="text-indigo-500" />
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Strategic Advice</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-7 font-medium">
                  {report.advice}
              </p>
          </div>

      </div>

    </div>
  );
};

export default CompatibilityView;