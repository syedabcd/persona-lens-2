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
import AuthPage from './components/AuthPage';
import HistoryView from './components/HistoryView';
import ProfileView from './components/ProfileView';
import BlogIndex from './components/BlogIndex';
import BlogPostView from './components/BlogPost';
import AdminPanel from './components/AdminPanel';
import { AnalysisReport, FormData, FileData, AnalysisMode, SegmentationReport, CompatibilityReport, MonitoredProfile, HistoryItem } from './types';
import { analyzePersona, analyzeClientSegmentation, analyzeCompatibility } from './services/geminiService';
import { supabase, saveHistory } from './services/supabaseService';
import { Session } from '@supabase/supabase-js';

type ViewState = 'landing' | 'auth' | 'input' | 'report' | 'monitoring' | 'profile' | 'blog' | 'blog-post' | 'admin';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<ViewState>('landing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  
  // State for reports
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [segmentationReport, setSegmentationReport] = useState<SegmentationReport | null>(null);
  const [compatibilityReport, setCompatibilityReport] = useState<CompatibilityReport | null>(null);
  const [resultLanguage, setResultLanguage] = useState<'english' | 'roman'>('english');
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  
  // Monitoring State
  const [monitoredProfiles, setMonitoredProfiles] = useState<MonitoredProfile[]>([]);

  // Blog State
  const [selectedPostSlug, setSelectedPostSlug] = useState<string>('');

  useEffect(() => {
    // Check for Admin Route manually since we aren't using React Router
    // Added hash check (#admin) as a fallback if server redirects fail
    if (window.location.pathname === '/admin/admin' || window.location.hash === '#admin') {
        setView('admin');
        return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (session) {
      setView('input');
    } else {
      setView('auth');
    }
  };

  const handleAuthSuccess = () => {
    setView('input');
  };

  const handleAnalyze = async (data: FormData, files: FileData[], mode: AnalysisMode) => {
    setIsAnalyzing(true);
    setReport(null);
    setSegmentationReport(null);
    setCompatibilityReport(null);
    setResultLanguage(data.language); 

    try {
      let resultReport: any = null;
      let summary = "";
      let title = "";

      if (mode === AnalysisMode.B2B) {
        const result = await analyzeClientSegmentation(
            data.textContext + (data.uploadedContent ? `\n\nUPLOADED FILES:\n${data.uploadedContent}` : ""),
            files,
            data.relationship,
            data.purpose,
            data.language 
        );
        setSegmentationReport(result);
        resultReport = result;
        title = `B2B: ${data.relationship}`;
        summary = result.overview.substring(0, 150) + "...";

      } else if (mode === AnalysisMode.COMPATIBILITY) {
        const result = await analyzeCompatibility(
            data.textContext + (data.uploadedContent ? `\n\nUPLOADED FILES:\n${data.uploadedContent}` : ""),
            data.userContext || '',
            files,
            data.relationship,
            data.language
        );
        setCompatibilityReport(result);
        resultReport = result;
        title = `Compatibility: ${data.relationship}`;
        summary = result.longTermPrediction.substring(0, 150) + "...";

      } else {
        const result = await analyzePersona(
            data.textContext, 
            files, 
            data.relationship, 
            data.purpose,
            mode,
            data.uploadedContent,
            data.language
        );
        setReport(result);
        resultReport = result;
        title = `${data.relationship} - ${data.purpose}`;
        summary = result.summary.substring(0, 150) + "...";
      }

      if (session?.user && resultReport) {
          await saveHistory(session.user.id, mode, title, summary, resultReport);
      }

      setView('report');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      console.error("Analysis Error:", error);
      alert(error.message || "Something went wrong during analysis. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
     setReport(null);
     setSegmentationReport(null);
     setCompatibilityReport(null);

     if (item.mode === 'B2B') {
         setSegmentationReport(item.report_data as SegmentationReport);
     } else if (item.mode === 'COMPATIBILITY') {
         setCompatibilityReport(item.report_data as CompatibilityReport);
     } else {
         setReport(item.report_data as AnalysisReport);
     }
     
     setView('report');
     setActiveTab('home');
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavbarClick = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
       if (report || segmentationReport || compatibilityReport) {
         setView('report');
       } else if (session) {
         setView('input');
       } else {
         setView('landing'); 
       }
    } else if (tab === 'profile') {
        setView('profile');
    } else if (tab === 'blog') {
        setView('blog');
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

  const handleLogout = () => {
      supabase.auth.signOut().then(() => {
          setSession(null);
          setView('landing');
          setActiveTab('home');
      });
  };

  const handleReadPost = (slug: string) => {
      setSelectedPostSlug(slug);
      setView('blog-post');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Special Admin View
  if (view === 'admin') {
      return <AdminPanel onLogout={() => { window.location.pathname = '/'; setView('landing'); }} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-gray-100 bg-[#020617]">
      
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-blob bg-violet-900/20"></div>
         <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] animate-blob delay-200 bg-indigo-900/20"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full blur-[100px] animate-blob delay-700 bg-fuchsia-900/20"></div>
      </div>

      <Navbar activeTab={activeTab} setActiveTab={handleNavbarClick} />
      
      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-10">
        
        {activeTab === 'home' && (
          <>
            {view === 'landing' && (
              <LandingPage onGetStarted={handleGetStarted} />
            )}

            {view === 'auth' && (
              <AuthPage onAuthSuccess={handleAuthSuccess} />
            )}

            {view === 'input' && (
              <InputSection 
                onAnalyze={handleAnalyze} 
                isAnalyzing={isAnalyzing} 
                onBack={() => setView('landing')}
              />
            )}

            {view === 'report' && (
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
                        language={resultLanguage}
                        onChatClick={() => setIsChatOpen(true)} 
                        onSimulateClick={() => setIsSimulatorOpen(true)}
                        onVigilanceClick={addToMonitoring}
                    />
                 )}
                 {segmentationReport && <SegmentationView report={segmentationReport} />}
                 {compatibilityReport && <CompatibilityView report={compatibilityReport} />}
                 
              </div>
            )}
          </>
        )}

        {/* Blog Views */}
        {activeTab === 'blog' && (
            <>
                {view === 'blog' && (
                    <BlogIndex onReadPost={handleReadPost} />
                )}
                {view === 'blog-post' && (
                    <BlogPostView 
                        slug={selectedPostSlug} 
                        onBack={() => { setView('blog'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    />
                )}
            </>
        )}

        {/* Profile View Integration */}
        {activeTab === 'profile' && (
             <>
                {!session ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-slide-up text-center">
                        <h3 className="text-xl font-bold mb-4">Please Sign In</h3>
                        <p className="text-gray-400 mb-6">You need to be logged in to view your profile.</p>
                        <button onClick={() => { setActiveTab('home'); setView('auth'); }} className="bg-violet-600 px-6 py-2 rounded-full font-bold">Sign In</button>
                    </div>
                ) : (
                    <ProfileView session={session} onLogout={handleLogout} />
                )}
             </>
        )}

        {activeTab === 'monitoring' && (
            <MonitoringView profiles={monitoredProfiles} />
        )}

        {activeTab === 'history' && (
          <>
            {!session ? (
               <div className="flex flex-col items-center justify-center min-h-[50vh] animate-slide-up text-center">
                  <h3 className="text-xl font-bold mb-4">Please Sign In</h3>
                  <p className="text-gray-400 mb-6">You need to be logged in to view your history.</p>
                  <button onClick={() => { setActiveTab('home'); setView('auth'); }} className="bg-violet-600 px-6 py-2 rounded-full font-bold">Sign In</button>
               </div>
            ) : (
               <HistoryView userId={session.user.id} onSelectReport={handleSelectHistory} />
            )}
          </>
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