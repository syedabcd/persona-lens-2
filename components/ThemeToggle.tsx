import React from 'react';

interface ThemeToggleProps {
  isDark: boolean;
  toggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggle }) => {
  return (
    <button
      onClick={toggle}
      className={`relative w-16 h-8 rounded-full shadow-inner transition-colors duration-200 ease-out overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        isDark ? 'bg-slate-900 shadow-slate-950/50' : 'bg-cyan-400 shadow-cyan-500/50'
      }`}
      aria-label="Toggle Dark Mode"
    >
      {/* Scenery: Stars (Dark Mode) */}
      <div className={`absolute inset-0 transition-opacity duration-200 ease-out ${isDark ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-white rounded-full animate-twinkle"></div>
         <div className="absolute top-4 left-6 w-0.5 h-0.5 bg-white rounded-full animate-twinkle delay-100"></div>
         <div className="absolute bottom-2 left-4 w-1 h-1 bg-white rounded-full animate-twinkle delay-300"></div>
         <div className="absolute top-2 right-4 w-0.5 h-0.5 bg-white rounded-full animate-twinkle delay-200"></div>
         <div className="absolute bottom-3 right-6 w-0.5 h-0.5 bg-white rounded-full animate-twinkle delay-500"></div>
      </div>

      {/* Scenery: Clouds (Light Mode) */}
      <div className={`absolute inset-0 transition-transform duration-200 ease-out ${isDark ? 'translate-y-10' : 'translate-y-0'}`}>
         <div className="absolute bottom-[-2px] left-1 w-4 h-4 bg-white rounded-full opacity-80"></div>
         <div className="absolute bottom-[-4px] left-3 w-5 h-5 bg-white rounded-full opacity-90"></div>
         <div className="absolute bottom-[-1px] right-2 w-4 h-4 bg-white rounded-full opacity-80"></div>
         <div className="absolute bottom-1 right-[-2px] w-3 h-3 bg-white rounded-full opacity-60"></div>
      </div>

      {/* Thumb (Sun/Moon) */}
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-md transition-all duration-200 ease-out flex items-center justify-center overflow-hidden
        ${isDark 
            ? 'translate-x-8 bg-slate-100 shadow-slate-200/20' 
            : 'translate-x-0 bg-yellow-300 shadow-yellow-400/50'
        }`}
      >
        {/* Moon Craters (Only visible in Dark) */}
        <div className={`absolute w-full h-full transition-opacity duration-200 ease-out ${isDark ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-1 right-2 w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
            <div className="absolute bottom-2 left-1.5 w-1 h-1 bg-slate-300 rounded-full"></div>
            <div className="absolute bottom-1 right-3 w-0.5 h-0.5 bg-slate-300 rounded-full"></div>
        </div>
      </div>
      
      {/* Glow Effect overlay on button */}
      <div className={`absolute inset-0 rounded-full transition-opacity duration-200 ease-out pointer-events-none ${isDark ? 'bg-indigo-500/10' : 'bg-white/10'}`}></div>

    </button>
  );
};

export default ThemeToggle;