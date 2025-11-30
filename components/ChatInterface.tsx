import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User as UserIcon, Sparkles } from 'lucide-react';
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
      text: `Hi! I've analyzed the profile. I know their red flags, green flags, and communication style. What do you want to know?`
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
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Sorry, I had trouble processing that. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-gray-900/30 dark:bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'animate-fade-in'}`}>
      
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleClose}></div>

      <div 
        className={`bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl w-full sm:w-[480px] h-[92vh] sm:h-[750px] sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl flex flex-col relative overflow-hidden transition-transform duration-400 cubic-bezier(0.32, 0.72, 0, 1) ${isClosing ? 'translate-y-full' : 'animate-slide-up'}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
           <div className="flex items-center gap-3">
             <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                <Bot size={22} />
             </div>
             <div>
               <h3 className="font-bold text-gray-800 dark:text-white text-lg">Persona AI</h3>
               <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                 <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                 Online & Ready
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
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center flex-shrink-0 border border-indigo-50 dark:border-white/5 mt-1">
                  <Sparkles size={14} className="text-violet-500" />
                </div>
              )}
              
              <div 
                className={`max-w-[80%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-gray-900 dark:bg-violet-600 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-bl-sm shadow-indigo-100/50 dark:shadow-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {isLoading && (
             <div className="flex gap-3 justify-start animate-fade-in">
               <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center flex-shrink-0 border border-indigo-50 dark:border-white/5">
                  <Sparkles size={14} className="text-violet-500" />
               </div>
               <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 dark:border-white/5">
                 <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-gray-100 dark:border-white/5 pb-8 sm:pb-4">
          <div className="flex items-center gap-2 bg-gray-50/80 dark:bg-black/30 p-1.5 pr-2 rounded-[1.5rem] border border-gray-200 dark:border-white/10 focus-within:border-violet-300 dark:focus-within:border-violet-600 focus-within:ring-4 focus-within:ring-violet-50 dark:focus-within:ring-violet-900/20 transition-all shadow-inner">
             <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-gray-800 dark:text-white placeholder-gray-400 font-medium"
                autoFocus
             />
             <button 
               onClick={handleSend}
               disabled={!inputText.trim() || isLoading}
               className={`p-3 rounded-full transition-all duration-300 transform active:scale-95 flex items-center justify-center ${
                 !inputText.trim() 
                   ? 'bg-gray-200 dark:bg-slate-700 text-gray-400' 
                   : 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 hover:-translate-y-0.5'
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
