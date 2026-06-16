import React from 'react';
import { Sparkles, History, User, Zap, Crown } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  credits?: number;
  isPro?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, credits, isPro }) => {
  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="glass px-2 py-2 rounded-full shadow-xl shadow-black/40 flex items-center gap-1 sm:gap-2 pointer-events-auto transform transition-transform duration-300 hover:scale-[1.02]">
        
        <button 
        onClick={() => setActiveTab('home')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${
            activeTab === 'home' 
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
        >
        <Sparkles size={16} className={activeTab === 'home' ? 'animate-pulse' : ''} />
        <span className="font-semibold text-sm">Analyze</span>
        </button>

        <button 
        onClick={() => setActiveTab('history')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${
            activeTab === 'history' 
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
        >
        <History size={16} />
        <span className="font-semibold text-sm hidden sm:inline">History</span>
        </button>

        <button 
        onClick={() => setActiveTab('profile')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${
            activeTab === 'profile' 
            ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
        >
        <User size={16} />
        <span className="font-semibold text-sm hidden sm:inline">Profile</span>
        </button>
        
        {/* Credits Display Display */}
        {credits !== undefined && (
            <div className="ml-2 pl-3 border-l border-white/10 flex items-center gap-1.5 sm:gap-3 py-1 pr-2">
                <div 
                    title="Available Credits"
                    className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-full border border-white/5 cursor-help"
                >
                    <Zap size={14} className="text-amber-400 fill-amber-400/50" />
                    <span className="font-mono font-bold text-sm text-white">{credits}</span>
                </div>
                {isPro && (
                    <div title="Pro Member" className="hidden sm:flex items-center justify-center bg-gradient-to-tr from-amber-400 to-orange-500 w-8 h-8 rounded-full shadow-lg border border-white/10 cursor-help">
                        <Crown size={14} className="text-white" />
                    </div>
                )}
            </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;