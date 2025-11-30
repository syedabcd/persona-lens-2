import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import InputSection from './components/InputSection';
import ReportView from './components/ReportView';
import ChatInterface from './components/ChatInterface';
import { AnalysisReport, FormData, FileData, AnalysisMode } from './types';
import { analyzePersona } from './services/geminiService';

type ViewState = 'landing' | 'input' | 'report';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<ViewState>('landing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Theme Management
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference or saved preference could go here
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleAnalyze = async (data: FormData, files: FileData[], mode: AnalysisMode) => {
    setIsAnalyzing(true);
    try {
      const usernames = {
        tiktok: data.tikTokUsername,
        instagram: data.instagramUsername,
        twitter: data.twitterUsername
      };

      const result = await analyzePersona(
        data.textContext, 
        files, 
        usernames, 
        data.relationship, 
        data.purpose,
        mode
      );

      setReport(result);
      setView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Analysis Error:", error);
      alert("Something went wrong during analysis. Please try again. Ensure you have network connectivity.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNavbarClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
       if (report) {
         setView('report');
       } else if (view !== 'input') {
         setView('landing'); 
       }
    }
  };

  const resetAnalysis = () => {
    setReport(null);
    setView('input');
  };

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-800 dark:text-gray-100 bg-[#f3f4f6] dark:bg-[#020617]">
      
      {/* Dynamic Background Elements - Optimization: Removed transitions on blurred elements to fix lag */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
         {/* Blob 1 */}
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-blob bg-violet-200/40 dark:bg-violet-900/20"></div>
         
         {/* Blob 2 */}
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] animate-blob delay-200 bg-indigo-200/40 dark:bg-indigo-900/20"></div>
         
         {/* Blob 3 */}
         <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full blur-[100px] animate-blob delay-700 bg-pink-100/40 dark:bg-fuchsia-900/20"></div>
      </div>

      <Navbar activeTab={activeTab} setActiveTab={handleNavbarClick} isDark={isDark} toggleTheme={toggleTheme} />
      
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-10">
        
        {activeTab === 'home' && (
          <>
            {view === 'landing' && (
              <LandingPage onGetStarted={() => setView('input')} />
            )}

            {view === 'input' && (
              <InputSection 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing} 
                onBack={() => setView('landing')}
              />
            )}

            {view === 'report' && report && (
              <div className="animate-slide-up max-w-2xl mx-auto">
                 <div className="mb-6 flex items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-2 rounded-2xl border border-white/50 dark:border-white/10 sticky top-24 z-20 shadow-sm transition-colors duration-200 ease-out">
                    <button 
                        onClick={resetAnalysis}
                        className="text-gray-600 dark:text-gray-300 text-sm font-medium flex items-center gap-2 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/80 dark:hover:bg-white/10 transition-all"
                    >
                        ← Start New Analysis
                    </button>
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-violet-600 dark:bg-violet-400 rounded-full animate-pulse"></span>
                        Report Ready
                    </span>
                 </div>
                 <ReportView report={report} onChatClick={() => setIsChatOpen(true)} />
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-slide-up">
             <div className="glass-card p-10 rounded-[2rem] text-center max-w-sm mx-auto shadow-xl shadow-indigo-500/10 dark:shadow-black/30">
                <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">History Vault</h3>
                <p className="text-gray-400 dark:text-gray-400 leading-relaxed mb-4">Your previous analyses are encrypted and stored locally. Feature coming in the next update.</p>
                <button 
                  onClick={() => setActiveTab('home')}
                  className="text-violet-600 dark:text-violet-400 font-bold text-sm hover:underline"
                >
                  Go back to Analyze
                </button>
             </div>
          </div>
        )}

      </main>

      {/* Chat Overlay */}
      {isChatOpen && report && (
        <ChatInterface report={report} onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
};

export default App;