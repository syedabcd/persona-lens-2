import React from 'react';
import { Sparkles, History } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (t: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, isDark, toggleTheme }) => {
  return (
    <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <div className="glass px-2 py-2 rounded-full shadow-xl shadow-indigo-500/10 dark:shadow-black/40 flex items-center gap-2 sm:gap-4 pointer-events-auto transform transition-transform duration-300 hover:scale-[1.02]">
        
        <div className="flex items-center gap-1">
            <button 
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300 ${
                activeTab === 'home' 
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' 
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white'
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
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white'
            }`}
            >
            <History size={16} />
            <span className="font-semibold text-sm hidden sm:inline">History</span>
            </button>
        </div>

        <div className="w-px h-6 bg-gray-300/50 dark:bg-white/10 mx-0 sm:mx-1"></div>

        <div className="pr-1">
             <ThemeToggle isDark={isDark} toggle={toggleTheme} />
        </div>
        
      </div>
    </nav>
  );
};

export default Navbar;
