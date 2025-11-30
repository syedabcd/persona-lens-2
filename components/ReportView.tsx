import React, { useEffect, useState } from 'react';
import { AnalysisReport, PersonalityTrait, ProtocolPlan } from '../types';
import { MessageCircle, Flag, Shield, Heart, Activity, Brain, TrendingUp, Check, Calendar, ChevronRight, PlayCircle, Loader2 } from 'lucide-react';
import { generateActionPlan } from '../services/geminiService';

interface ReportViewProps {
  report: AnalysisReport;
  onChatClick: () => void;
}

const TraitBar: React.FC<{ trait: PersonalityTrait; index: number }> = ({ trait, index }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Delay setting width to trigger animation
    const timer = setTimeout(() => {
        setWidth(trait.score * 10);
    }, index * 100 + 400); // Staggered start
    return () => clearTimeout(timer);
  }, [trait.score, index]);

  const getColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-400 dark:bg-emerald-500';
    if (score >= 5) return 'bg-indigo-400 dark:bg-indigo-500';
    return 'bg-amber-400 dark:bg-amber-500';
  };

  return (
    <div className="mb-4 last:mb-0 group">
      <div className="flex justify-between items-end mb-1.5">
        <span className="font-semibold text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wide group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{trait.name}</span>
        <span className="text-gray-900 dark:text-white font-bold text-sm">{trait.score}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-[1.5s] ease-[cubic-bezier(0.22,1,0.36,1)] ${getColor(trait.score)} shadow-[0_0_10px_rgba(99,102,241,0.4)]`}
          style={{ width: `${width}%` }}
        ></div>
      </div>
      <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">{trait.description}</p>
    </div>
  );
};

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; color?: string; delay?: string }> = ({ title, icon, children, color = "text-violet-600", delay = "delay-100" }) => (
  <div className={`glass-card p-6 rounded-3xl mb-5 animate-slide-up ${delay} hover:-translate-y-1 transition-transform duration-300`}>
    <h3 className={`font-bold text-lg mb-4 flex items-center gap-3 ${color} dark:text-violet-400`}>
      <div className={`p-2.5 rounded-xl shadow-sm bg-white dark:bg-slate-800 ${color} dark:text-violet-400`}>
        {icon}
      </div>
      {title}
    </h3>
    <div className="text-gray-600 dark:text-gray-300 text-sm leading-7 font-medium">
      {children}
    </div>
  </div>
);

const ReportView: React.FC<ReportViewProps> = ({ report, onChatClick }) => {
  const [protocol, setProtocol] = useState<ProtocolPlan | null>(null);
  const [protocolLoading, setProtocolLoading] = useState(false);
  const [protocolGoal, setProtocolGoal] = useState("Get a Date");

  const handleGenerateProtocol = async () => {
    setProtocolLoading(true);
    try {
        const plan = await generateActionPlan(report, protocolGoal);
        setProtocol(plan);
    } catch (e) {
        console.error(e);
        alert("Failed to generate protocol. Please try again.");
    } finally {
        setProtocolLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto pb-40">
      
      {/* Summary Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-900 p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/30 dark:shadow-black/50 mb-8 text-white animate-scale-in transform transition-transform hover:scale-[1.01] duration-500">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full -mr-20 -mt-20 blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-fuchsia-500 opacity-20 rounded-full -ml-10 -mb-10 blur-3xl animate-blob delay-500"></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-2 text-indigo-200 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
                <Brain size={12} />
                Psychological Analysis
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight leading-tight">
              Behavioral <br/> <span className="text-indigo-300">Decoded.</span>
            </h2>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
                <p className="opacity-95 leading-relaxed text-[15px] font-light">
                    {report.summary}
                </p>
            </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-5">
        {/* Traits */}
        <div className="glass-card p-6 rounded-3xl animate-slide-up delay-100">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-6 flex items-center gap-2">
            <Activity size={20} className="text-indigo-500 dark:text-indigo-400" />
            Core Traits
            </h3>
            {report.traits.map((trait, idx) => (
            <TraitBar key={idx} trait={trait} index={idx} />
            ))}
        </div>

        {/* Dating / Purpose Message */}
        <div className="glass-card p-6 rounded-3xl animate-slide-up delay-200 flex flex-col justify-center bg-gradient-to-b from-white to-pink-50/30 dark:from-slate-800 dark:to-pink-900/10">
            <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-4 flex items-center gap-2">
                 <Heart size={20} className="text-pink-500 fill-pink-500" />
                 Strategy
            </h3>
            <div className="relative bg-white dark:bg-slate-700/50 p-5 rounded-2xl border border-pink-100 dark:border-pink-900/30 shadow-sm">
                <span className="absolute -top-3 -left-1 text-5xl text-pink-100 dark:text-pink-900/50 font-serif leading-none">"</span>
                <p className="text-pink-900 dark:text-pink-100 italic relative z-10 text-sm leading-relaxed">{report.datingMessage}</p>
            </div>
        </div>
      </div>

      {/* Psychological Profile */}
      <SectionCard title="Deep Dive" icon={<TrendingUp size={20} />} color="text-indigo-600" delay="delay-300">
         <p>{report.psychologicalProfile}</p>
      </SectionCard>

      {/* Communication */}
      <SectionCard title="Communication Keys" icon={<MessageCircle size={20} />} color="text-sky-600" delay="delay-400">
        <div className="grid gap-3">
          {report.communicationStrategies.map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-sky-50/50 dark:bg-sky-900/20 p-3 rounded-2xl border border-sky-100/50 dark:border-sky-800/30">
              <span className="flex-shrink-0 w-6 h-6 bg-sky-100 dark:bg-sky-800 text-sky-600 dark:text-sky-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
              <span className="text-gray-700 dark:text-gray-200">{item}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Flags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 animate-slide-up delay-500">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg shadow-emerald-500/10 dark:shadow-emerald-900/20 border border-emerald-100/50 dark:border-emerald-800/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-4 flex items-center gap-2 relative z-10">
                <Flag className="fill-emerald-100 dark:fill-emerald-900 text-emerald-600 dark:text-emerald-400" /> Green Flags
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3 relative z-10">
                {report.greenFlags.map((flag, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                        <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" strokeWidth={3} />
                        <span>{flag}</span>
                    </li>
                ))}
            </ul>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg shadow-rose-500/10 dark:shadow-rose-900/20 border border-rose-100/50 dark:border-rose-800/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
            <h4 className="font-bold text-rose-800 dark:text-rose-400 mb-4 flex items-center gap-2 relative z-10">
                <Flag className="fill-rose-100 dark:fill-rose-900 text-rose-600 dark:text-rose-400" /> Red Flags
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-3 relative z-10">
                {report.redFlags.map((flag, i) => (
                    <li key={i} className="flex gap-2.5 items-start">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0"></div>
                        <span>{flag}</span>
                    </li>
                ))}
            </ul>
        </div>
      </div>

      {/* Trust */}
      <SectionCard title="Winning Trust" icon={<Shield className="fill-amber-400 dark:fill-amber-500" size={20} />} color="text-amber-600" delay="delay-500">
        <p>{report.trustBuilding}</p>
      </SectionCard>

      {/* FEATURE 6: THE DAILY PROTOCOL */}
      <div className="glass-card p-6 md:p-8 rounded-[2rem] mb-8 animate-slide-up delay-700 border-indigo-100 dark:border-indigo-900/50 shadow-xl shadow-indigo-500/10 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"></div>
        
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-black text-xl md:text-2xl text-gray-900 dark:text-white flex items-center gap-3">
                        <Calendar className="text-violet-600 dark:text-violet-400" /> 
                        The Daily Protocol
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Turn insight into action with a 7-day plan.</p>
                </div>
                <div className="hidden md:block bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-violet-500/30">
                    Premium
                </div>
            </div>

            {!protocol && (
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Select your Objective</label>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <select 
                                value={protocolGoal}
                                onChange={(e) => setProtocolGoal(e.target.value)}
                                className="w-full appearance-none p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-gray-800 dark:text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all cursor-pointer hover:border-violet-300"
                            >
                                <option value="Get a Date">💘 Get a Date</option>
                                <option value="Deepen Connection">🤝 Deepen Connection</option>
                                <option value="Resolve Conflict">🕊️ Resolve Conflict</option>
                                <option value="Negotiate a Raise/Deal">💼 Negotiate a Raise/Deal</option>
                                <option value="Recover from a Mistake">🩹 Recover from a Mistake</option>
                                <option value="Build Trust">🛡️ Build Trust</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronRight size={16} className="rotate-90" />
                            </div>
                        </div>
                        <button 
                            onClick={handleGenerateProtocol}
                            disabled={protocolLoading}
                            className="bg-gray-900 dark:bg-white dark:text-gray-900 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px] flex items-center justify-center gap-2"
                        >
                            {protocolLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <PlayCircle size={18} />
                                    Generate Plan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {protocol && (
                <div className="animate-fade-in space-y-4 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-3 py-1 rounded-lg">
                            Goal: {protocol.goal}
                        </span>
                        <button onClick={() => setProtocol(null)} className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 underline">Reset</button>
                    </div>

                    <div className="grid gap-3">
                        {protocol.tasks.map((task) => (
                            <div key={task.day} className="group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-violet-200 dark:hover:border-violet-800 transition-colors shadow-sm">
                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-gray-500 dark:text-gray-300 text-sm group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                                        D{task.day}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-800 dark:text-white mb-1">{task.focus}</h4>
                                            {task.day === 1 && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Start Here</span>}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">{task.action}</p>
                                        <div className="flex items-center gap-2 text-xs text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg inline-flex">
                                            <Brain size={12} />
                                            <span className="font-medium">{task.tip}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Floating Chat Button */}
      <div className="fixed bottom-8 right-6 md:right-10 z-50 animate-scale-in delay-700">
        <button 
          onClick={onChatClick}
          className="group relative bg-gray-900 dark:bg-white dark:text-gray-900 text-white p-4 pr-6 pl-4 rounded-full shadow-2xl hover:bg-black dark:hover:bg-gray-200 transition-all hover:scale-[1.05] active:scale-95 flex items-center gap-3"
        >
          <div className="absolute inset-0 rounded-full bg-violet-500 opacity-20 animate-pulse"></div>
          <div className="bg-white/10 dark:bg-black/10 p-2 rounded-full">
            <MessageCircle size={24} className="text-white dark:text-gray-900" />
          </div>
          <div className="text-left">
             <div className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Ask AI</div>
             <div className="text-sm font-bold">Chat Assistant</div>
          </div>
        </button>
      </div>

    </div>
  );
};

export default ReportView;