import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import InputSection from './components/InputSection';
import ReportView from './components/ReportView';
import SegmentationView from './components/SegmentationView';
import CompatibilityView from './components/CompatibilityView';
import ChatInterface from './components/ChatInterface';
import MonitoringView from './components/MonitoringView';
import SimulatorInterface from './components/SimulatorInterface';
import { AnalysisReport, FormData, FileData, AnalysisMode, SegmentationReport, CompatibilityReport, MonitoredProfile } from './types';
import { analyzePersona, analyzeClientSegmentation, analyzeCompatibility } from './services/geminiService';

type ViewState = 'landing' | 'input' | 'report' | 'monitoring';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<ViewState>('landing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // State for reports
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [segmentationReport, setSegmentationReport] = useState<SegmentationReport | null>(null);
  const [compatibilityReport, setCompatibilityReport] = useState<CompatibilityReport | null>(null);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  
  // Monitoring State
  const [monitoredProfiles, setMonitoredProfiles] = useState<MonitoredProfile[]>([]);

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
    setReport(null);
    setSegmentationReport(null);
    setCompatibilityReport(null);

    try {
      if (mode === AnalysisMode.B2B) {
        const result = await analyzeClientSegmentation(
            data.textContext + (data.uploadedContent ? `\n\nUPLOADED FILES:\n${data.uploadedContent}` : ""),
            files,
            data.relationship, // repurposed as Industry
            data.purpose // repurposed as Objective
        );
        setSegmentationReport(result);
      } else if (mode === AnalysisMode.COMPATIBILITY) {
        const result = await analyzeCompatibility(
            data.textContext + (data.uploadedContent ? `\n\nUPLOADED FILES:\n${data.uploadedContent}` : ""), // Target Data
            data.userContext || '', // User Data
            files,
            data.relationship
        );
        setCompatibilityReport(result);
      } else {
        // Standard Analysis
        // Note: Scraping is now handled within InputSection before this is called
        // We just pass the aggregated scrapedContent to the analysis service
        const result = await analyzePersona(
            data.textContext, 
            files, 
            data.relationship, 
            data.purpose,
            mode,
            data.uploadedContent,
            data.scrapedContent // New field populated by InputSection
        );
        setReport(result);
      }

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
       if (report || segmentationReport || compatibilityReport) {
         setView('report');
       } else if (view !== 'input') {
         setView('landing'); 
       }
    } else if (tab === 'monitoring') {
        setView('monitoring');
    }
  };

  const resetAnalysis = () => {
    setReport(null);
    setSegmentationReport(null);
    setCompatibilityReport(null);
    setView('input');
    setActiveTab('home');
  };

  const addToMonitoring = () => {
    if (report) {
        const newProfile: MonitoredProfile = {
            id: Date.now().toString(),
            name: "Unknown Target", // In a real app we'd ask for a name
            status: 'Stable',
            lastScan: 'Just now',
            changeDetected: false
        };
        setMonitoredProfiles(prev => [newProfile, ...prev]);
        setActiveTab('monitoring');
        setView('monitoring');
    }
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
        
        {/* VIEW: LANDING & INPUT */}
        {(view === 'landing' || view === 'input') && activeTab === 'home' && (
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
          </>
        )}

        {/* VIEW: REPORTS */}
        {view === 'report' && activeTab === 'home' && (
              <div className="animate-slide-up max-w-5xl mx-auto">
                 <div className="mb-6 flex items-center justify-between bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-2 rounded-2xl border border-white/50 dark:border-white/10 sticky top-24 z-20 shadow-sm transition-colors duration-200 ease-out max-w-2xl mx-auto">
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
                 
                 {report && (
                    <ReportView 
                        report={report} 
                        onChatClick={() => setIsChatOpen(true)} 
                        onSimulateClick={() => setIsSimulatorOpen(true)}
                        onVigilanceClick={addToMonitoring}
                    />
                 )}
                 {segmentationReport && <SegmentationView report={segmentationReport} />}
                 {compatibilityReport && <CompatibilityView report={compatibilityReport} />}
                 
              </div>
        )}

        {/* VIEW: MONITORING */}
        {view === 'monitoring' && (
            <MonitoringView profiles={monitoredProfiles} />
        )}

        {/* VIEW: HISTORY (Placeholder) */}
        {activeTab === 'history' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-slide-up">
             <div className="glass-card p-10 rounded-[2rem] text-center max-w-sm mx-auto shadow-xl shadow-indigo-500/10 dark:shadow-black/30">
                <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-bold text-xl text-gray-800 dark:text-white mb-2">History Vault</h3>
                <p className="text-gray-400 dark:text-gray-400 leading-relaxed mb-4">Your previous analyses are encrypted and stored locally. Feature coming in the next update.</p>
                <button 
                  onClick={() => { setActiveTab('home'); setView('landing'); }}
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

      {/* Simulator Overlay */}
      {isSimulatorOpen && report && (
        <SimulatorInterface report={report} onClose={() => setIsSimulatorOpen(false)} />
      )}
    </div>
  );
};

export default App;
