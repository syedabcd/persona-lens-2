import React, { useState, useRef, useEffect } from 'react';
import { AnalysisReport, ChatMessage, SimulationFeedback } from '../types';
import { createSimulationChat, evaluateSimulation } from '../services/geminiService';
import { X, Send, Play, Shield, Target, Award, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { GenerateContentResponse, Chat } from '@google/genai';

interface SimulatorInterfaceProps {
  report: AnalysisReport;
  onClose: () => void;
}

type SimState = 'setup' | 'active' | 'evaluating' | 'results';

const SimulatorInterface: React.FC<SimulatorInterfaceProps> = ({ report, onClose }) => {
  const [simState, setSimState] = useState<SimState>('setup');
  const [goal, setGoal] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [feedback, setFeedback] = useState<SimulationFeedback | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startSimulation = () => {
    if (!goal.trim()) return;
    const session = createSimulationChat(report, goal);
    setChatSession(session);
    setSimState('active');
    
    // Initial bot message to start the scene (optional, or wait for user)
    // Let's have the AI wait for the user to initiate, or generic start
    setMessages([{
        id: 'sys', 
        role: 'model', 
        text: `*Simulation Initialized. Target persona active. Goal: ${goal}. Start the conversation when ready.*`
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    try {
      const result = await chatSession.sendMessageStream({ message: userMsg.text });
      
      let botResponseText = "";
      const botMsgId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            botResponseText += c.text;
            setMessages(prev => prev.map(msg => 
                msg.id === botMsgId ? { ...msg, text: botResponseText } : msg
            ));
        }
      }
    } catch (error) {
      console.error("Sim error", error);
    }
  };

  const endSimulation = async () => {
    setSimState('evaluating');
    try {
        // Filter out system messages
        const validHistory = messages.filter(m => !m.text.startsWith('*'));
        const result = await evaluateSimulation(validHistory, goal, report);
        setFeedback(result);
        setSimState('results');
    } catch (e) {
        console.error(e);
        alert("Evaluation failed. Please try again.");
        setSimState('active');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in text-gray-100">
      
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 w-full max-w-4xl h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 animate-pulse">
                    <Target size={20} />
                </div>
                <div>
                    <h2 className="font-mono font-bold text-lg text-emerald-400 tracking-wider">THE PRACTICE ROOM</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Conflict Simulator v1.0</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative flex flex-col">
            
            {/* STAGE 1: SETUP */}
            {simState === 'setup' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-slide-up">
                    <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
                        <Shield size={40} className="text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Configure Simulation</h3>
                    <p className="text-slate-400 max-w-md mb-8">
                        Enter a specific goal for this conversation. The AI will roleplay as the target, mimicking their exact psychological profile and defense mechanisms.
                    </p>
                    
                    <div className="w-full max-w-md relative">
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-700 text-white p-4 pr-12 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600 font-mono text-sm"
                            placeholder="Ex: Negotiate a higher salary..."
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && startSimulation()}
                        />
                        <button 
                            onClick={startSimulation}
                            disabled={!goal.trim()}
                            className="absolute right-2 top-2 p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Play size={16} fill="currentColor" />
                        </button>
                    </div>
                </div>
            )}

            {/* STAGE 2: ACTIVE SIMULATION */}
            {simState === 'active' && (
                <>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur border border-emerald-500/30 px-4 py-1.5 rounded-full text-xs font-mono text-emerald-400 flex items-center gap-2 z-20">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        SIMULATION LIVE: {goal}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-4 rounded-xl text-sm leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-100' 
                                    : msg.text.startsWith('*') 
                                        ? 'w-full text-center text-slate-500 italic bg-transparent border-none' 
                                        : 'bg-slate-800 border border-slate-700 text-slate-200'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-4">
                        <input 
                            type="text" 
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors font-mono text-sm"
                            placeholder="Type your response..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            autoFocus
                        />
                        <button 
                            onClick={handleSendMessage}
                            className="p-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white transition-colors"
                        >
                            <Send size={20} />
                        </button>
                        <button 
                            onClick={endSimulation}
                            className="px-4 py-3 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800 rounded-xl text-rose-400 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap"
                        >
                            End & Evaluate
                        </button>
                    </div>
                </>
            )}

            {/* STAGE 3: EVALUATING */}
            {simState === 'evaluating' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
                    <h3 className="text-xl font-mono text-emerald-400 animate-pulse">ANALYZING PERFORMANCE...</h3>
                </div>
            )}

            {/* STAGE 4: RESULTS */}
            {simState === 'results' && feedback && (
                <div className="flex-1 overflow-y-auto p-8 animate-slide-up">
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 rounded-full bg-slate-800 border-4 border-slate-700 mb-4 relative">
                            <span className={`text-4xl font-black ${
                                feedback.score >= 80 ? 'text-emerald-400' : feedback.score >= 50 ? 'text-amber-400' : 'text-rose-400'
                            }`}>{feedback.score}</span>
                            <div className={`absolute -right-2 -top-2 w-8 h-8 rounded-full flex items-center justify-center border-2 border-slate-900 text-slate-900 font-bold text-xs ${
                                feedback.score >= 80 ? 'bg-emerald-400' : feedback.score >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                            }`}>
                                {feedback.score >= 80 ? 'A' : feedback.score >= 50 ? 'C' : 'F'}
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-1">{feedback.outcome.toUpperCase()}</h2>
                        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Simulation Debrief</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-slate-800/50 rounded-xl p-5 border border-emerald-500/20">
                            <h4 className="flex items-center gap-2 text-emerald-400 font-bold mb-4 uppercase text-xs tracking-wider">
                                <CheckCircle size={16} /> Strengths
                            </h4>
                            <ul className="space-y-2">
                                {feedback.strengths.map((s, i) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-1">▹</span> {s}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-5 border border-rose-500/20">
                            <h4 className="flex items-center gap-2 text-rose-400 font-bold mb-4 uppercase text-xs tracking-wider">
                                <AlertCircle size={16} /> Weaknesses
                            </h4>
                            <ul className="space-y-2">
                                {feedback.weaknesses.map((w, i) => (
                                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                        <span className="text-rose-500 mt-1">▹</span> {w}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6 border-l-4 border-amber-500">
                        <h4 className="flex items-center gap-2 text-amber-400 font-bold mb-2 uppercase text-xs tracking-wider">
                            <Zap size={16} /> Tactical Advice
                        </h4>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            {feedback.tacticalAdvice}
                        </p>
                    </div>

                    <div className="mt-8 text-center">
                        <button 
                            onClick={() => {
                                setSimState('setup');
                                setMessages([]);
                                setFeedback(null);
                                setGoal('');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105"
                        >
                            New Simulation
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default SimulatorInterface;