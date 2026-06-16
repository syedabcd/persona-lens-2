

import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MarketingNavbar from './components/MarketingNavbar';
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
import AdminPanel from './components/AdminPanel';
import BlogIndex from './components/BlogIndex';
import BlogPostView from './components/BlogPost';
import AboutPage from './components/AboutPage';
import { AnalysisReport, FormData, FileData, AnalysisMode, SegmentationReport, CompatibilityReport, MonitoredProfile, HistoryItem } from './types';
import { analyzePersona, analyzeClientSegmentation, analyzeCompatibility } from './services/geminiService';
import { supabase, saveHistory, deductCredits, getUserProfile } from './services/supabaseService';
import { Session } from '@supabase/supabase-js';

type ViewState = 'auth' | 'input' | 'report' | 'monitoring' | 'profile' | 'admin';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Wrapper for Landing Page to include the correct Navbar
const LandingRoute = () => {
  const navigate = useNavigate();
  return (
    <>
      <MarketingNavbar />
      <LandingPage onGetStarted={() => navigate('/app')} />
    </>
  );
};

// Wrapper for Blog Routes to include the correct Navbar
const BlogLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <MarketingNavbar />
      {children}
    </>
  );
};

// The Main App Component (Protected/Functional Area)
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [view, setView] = useState<ViewState>('auth');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // State for reports

  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [segmentationReport, setSegmentationReport] = useState<SegmentationReport | null>(null);
  const [compatibilityReport, setCompatibilityReport] = useState<CompatibilityReport | null>(null);
  const [resultLanguage, setResultLanguage] = useState<'english' | 'roman'>('english');
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  
  // Monitoring State
  const [monitoredProfiles, setMonitoredProfiles] = useState<MonitoredProfile[]>([]);

  const location = useLocation();

  useEffect(() => {
    // Check for admin route hash
    if (location.hash === '#admin') {
        setView('admin');
        return;
    }

    // Function to reload profile safely
    const reloadProfile = async (currentSession: Session | null) => {
        if (currentSession?.user) {
            try {
                const profile = await getUserProfile(currentSession.user.id, currentSession.user.email || '');
                setUserProfile(profile);
            } catch (e) {
                console.error("Failed to load global profile", e);
            }
        } else {
            setUserProfile(null);
        }
    };

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      reloadProfile(session);
      // If user is logged in, default to input view
      if (session && view === 'auth') {
        setView('input');
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      reloadProfile(session);
      if (session && view === 'auth') {
        setView('input');
      }
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  // Update profile from any local changes (e.g. deductions)
  const refreshGlobalProfile = async (newProfile?: any) => {
      if (newProfile) {
          setUserProfile(newProfile);
          return;
      }
      if (session?.user) {
          try {
              const profile = await getUserProfile(session.user.id, session.user.email || '');
              setUserProfile(profile);
          } catch (e) {}
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
      // Deduct 1 credit for running an analysis
      if (session?.user) {
          const updatedProfile = await deductCredits(session.user.id, session.user.email || '', 1);
          setUserProfile(updatedProfile);
      }

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
    refreshGlobalProfile();
    if (tab === 'home') {
       if (report || segmentationReport || compatibilityReport) {
         setView('report');
       } else if (session) {
         setView('input');
       } else {
         setView('auth'); 
       }
    } else if (tab === 'profile') {
        setView('profile');
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
          setView('auth');
          setActiveTab('home');
      });
  };

  const isAppRoute = location.pathname.startsWith('/app');
  const isAdminRoute = location.pathname.startsWith('/admin') || location.hash === '#admin';

  if (isAdminRoute) {
      return <AdminPanel onLogout={() => { window.location.href = '/'; }} />;
  }

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen relative overflow-hidden text-gray-100 bg-[#020617]">
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
           <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-blob bg-violet-900/20"></div>
           <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] animate-blob delay-200 bg-indigo-900/20"></div>
           <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full blur-[100px] animate-blob delay-700 bg-fuchsia-900/20"></div>
        </div>

        {isAppRoute && (
          <>
            {/* Dynamic Navbar based on view */}
            {view === 'input' || view === 'report' || view === 'monitoring' || view === 'profile' ? (
                 <Navbar activeTab={activeTab} setActiveTab={handleNavbarClick} credits={userProfile?.credits} isPro={userProfile?.subscription_tier !== 'Free'} />
            ) : null}

            <div className="relative z-10 w-full min-h-screen pt-20 pb-10 px-4 md:px-6">
              
              {view === 'auth' && (
                 <div className="max-w-md mx-auto pt-10">
                     <AuthPage onAuthSuccess={handleAuthSuccess} />
                 </div>
              )}

              {view === 'input' && (
                 <InputSection 
                     onAnalyze={handleAnalyze} 
                     isAnalyzing={isAnalyzing} 
                     onBack={() => { window.location.href = '/'; }} 
                     onCreditsUpdated={refreshGlobalProfile}
                 />
              )}

              {view === 'report' && (
                 <>
                    {report && (
                        <ReportView 
                            report={report} 
                            language={resultLanguage}
                            onChatClick={() => setIsChatOpen(true)}
                            onSimulateClick={() => setIsSimulatorOpen(true)}
                            onVigilanceClick={addToMonitoring}
                        />
                    )}
                    {segmentationReport && (
                        <SegmentationView report={segmentationReport} />
                    )}
                    {compatibilityReport && (
                        <CompatibilityView report={compatibilityReport} />
                    )}

                    {/* Overlays */}
                    {isChatOpen && report && (
                        <ChatInterface report={report} onClose={() => setIsChatOpen(false)} />
                    )}
                    {isSimulatorOpen && report && (
                        <SimulatorInterface report={report} onClose={() => setIsSimulatorOpen(false)} />
                    )}
                 </>
              )}

              {view === 'monitoring' && (
                  <MonitoringView profiles={monitoredProfiles} />
              )}

              {view === 'profile' && session && (
                  <ProfileView session={session} onLogout={handleLogout} />
              )}
              
              {/* History Mode (Accessible via Tab) */}
              {activeTab === 'history' && view !== 'history' && (
                   // Simple overlay or switch view for history
                   <div className="fixed inset-0 z-40 bg-[#020617] pt-24 px-4 overflow-y-auto">
                       <div className="max-w-3xl mx-auto">
                            <button onClick={() => setActiveTab('home')} className="mb-4 text-slate-400 hover:text-white">← Back</button>
                            {session?.user && (
                                <HistoryView userId={session.user.id} onSelectReport={handleSelectHistory} />
                            )}
                       </div>
                   </div>
              )}

            </div>
          </>
        )}

        <div className="relative z-10">
          <Routes>
              <Route path="/" element={<LandingRoute />} />
              <Route path="/about" element={<BlogLayout><AboutPage /></BlogLayout>} />
              {/* The main app logic is rendered above when path starts with /app */}
              <Route path="/app/*" element={<div />} /> 
              <Route path="/admin/*" element={<div />} /> 
              <Route path="/blog" element={<BlogLayout><BlogIndex /></BlogLayout>} />
              <Route path="/blog/:slug" element={<BlogLayout><BlogPostView /></BlogLayout>} />
              <Route path="*" element={<LandingRoute />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;