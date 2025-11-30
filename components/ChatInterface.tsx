import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, Sparkles, Zap } from 'lucide-react';
import { AnalysisReport, ChatMessage } from '../types';
import { chatWithPersonaBot } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface ChatInterfaceProps {
  report: AnalysisReport;
  onClose: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ report, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'model',
      text: `The Strategist is online. I have analyzed the psychological profile. What is your immediate tactical objective?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 400); // Wait for animation
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };

    // Optimistically add user message
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      
      const streamResult = await chatWithPersonaBot(history, userMsg.text, report);
      
      let botResponseText = "";
      const botMsgId = (Date.now() + 1).toString();
      
      // Add empty bot message
      setMessages(prev => [...prev, { id: botMsgId, role: 'model', text: '' }]);

      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            botResponseText += c.text;
            // Functional update to ensure we always have the latest messages list
            setMessages(prev => prev.map(msg => 
                msg.id === botMsgId ? { ...msg, text: botResponseText } : msg
            ));
        }
      }
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Strategy computation failed. Network interference detected. Please retry." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-gray-900/30 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'animate-fade-in'}`}>
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleClose}></div>

      <div 
        className={`bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl w-full sm:w-[480px] h-[92vh] sm:h-[750px] sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col relative overflow-hidden transition-transform duration-400 cubic-bezier(0.32, 0.72, 0, 1) ${isClosing ? 'translate-y-full' : 'animate-slide-up'} border border-amber-500/10`}
      >
        {/* Header - Premium Strategist Branding */}
        <div className="p-5 border-b border-gray-100 dark:border-amber-500/20 flex items-center justify-between bg-white/50 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
           <div className="flex items-center gap-3">
             <div className="bg-gradient-to-tr from-amber-400 to-orange-600 p-2.5 rounded-xl text-white shadow-lg shadow-amber-500/20">
                <Zap size={20} className="fill-white" />
             </div>
             <div>
               <h3 className="font-bold text-gray-800 dark:text-amber-50 text-lg tracking-tight">The Strategist</h3>
               <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                 Tactical Uplink Active
               </p>
             </div>
           </div>
           <button 
             onClick={handleClose} 
             className="p-2.5 text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-white/10 rounded-full transition-all hover:rotate-90"
           >
             <X size={22} />
           </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-black/20 scrollbar-hide">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 animate-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-slate-900 shadow-md flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-amber-500/30 mt-1">
                  <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
                </div>
              )}
              
              <div 
                className={`max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 dark:bg-amber-600 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-amber-500/20 rounded-bl-sm shadow-indigo-100/50 dark:shadow-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
             <div className="flex gap-3 justify-start animate-fade-in">
               <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-slate-900 shadow-md flex items-center justify-center flex-shrink-0 border border-amber-200 dark:border-amber-500/30">
                  <Sparkles size={14} className="text-amber-600 dark:text-amber-400" />
               </div>
               <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-amber-500/20">
                 <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white/80 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-100 dark:border-white/5 pb-8 sm:pb-4">
          <div className="flex items-center gap-2 bg-gray-50/80 dark:bg-black/30 p-1.5 pr-2 rounded-[1.5rem] border border-gray-200 dark:border-amber-500/20 focus-within:border-amber-300 dark:focus-within:border-amber-600 focus-within:ring-4 focus-within:ring-amber-50 dark:focus-within:ring-amber-900/20 transition-all shadow-inner">
             <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask for strategy..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 font-medium"
                autoFocus
             />
             <button 
               onClick={handleSend}
               disabled={!inputText.trim() || isLoading}
               className={`p-3 rounded-full transition-all duration-300 transform active:scale-95 flex items-center justify-center ${
                 !inputText.trim() 
                   ? 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-gray-600' 
                   : 'bg-gradient-to-tr from-amber-400 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:-translate-y-0.5'
               }`}
             >
               <Send size={18} className={inputText.trim() ? '-ml-0.5' : ''} />
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;