import React, { useState } from 'react';
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
            data.relationship, // Industry
            data.purpose // Objective
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
        const result = await analyzePersona(
            data.textContext, 
            files, 
            data.relationship, 
            data.purpose,
            mode,
            data.uploadedContent
        );
        setReport(result);
      }

      setView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Analysis Error:", error);
      alert("Something went wrong during analysis. Please try again.");
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
            name: "Analyzed Target",
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
    <div className="min-h-screen relative overflow-hidden text-gray-100 bg-[#020617]">
      
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-blob bg-violet-900/20"></div>
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] animate-blob delay-200 bg-indigo-900/20"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full blur-[100px] animate-blob delay-700 bg-fuchsia-900/20"></div>
      </div>

      <Navbar activeTab={activeTab} setActiveTab={handleNavbarClick} />
      
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-10">
        
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

        {view === 'report' && activeTab === 'home' && (
              <div className="animate-slide-up max-w-5xl mx-auto">
                 <div className="mb-6 flex items-center justify-between bg-slate-800/50 backdrop-blur-md p-2 rounded-2xl border border-white/10 sticky top-24 z-20 shadow-sm transition-colors duration-200 ease-out max-w-2xl mx-auto">
                    <button 
                        onClick={resetAnalysis}
                        className="text-gray-300 text-sm font-medium flex items-center gap-2 hover:text-white px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all"
                    >
                        ← Start New Analysis
                    </button>
                    <span className="text-[10px] font-bold text-violet-300 bg-violet-900/50 px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse"></span>
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

        {view === 'monitoring' && (
            <MonitoringView profiles={monitoredProfiles} />
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-slide-up">
             <div className="glass-card p-10 rounded-[2rem] text-center max-w-sm mx-auto shadow-xl shadow-black/30">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="font-bold text-xl text-white mb-2">History Vault</h3>
                <p className="text-gray-400 leading-relaxed mb-4">Your previous analyses are encrypted and stored locally. Feature coming in the next update.</p>
                <button 
                  onClick={() => { setActiveTab('home'); setView('landing'); }}
                  className="text-violet-400 font-bold text-sm hover:underline"
                >
                  Go back to Analyze
                </button>
             </div>
          </div>
        )}

      </main>

      {isChatOpen && report && (
        <ChatInterface report={report} onClose={() => setIsChatOpen(false)} />
      )}

      {isSimulatorOpen && report && (
        <SimulatorInterface report={report} onClose={() => setIsSimulatorOpen(false)} />
      )}
    </div>
  );
};

export default App;