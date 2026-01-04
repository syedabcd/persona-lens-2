import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Zap, Brain, X, ArrowRight, ArrowLeft, Briefcase, HeartHandshake, FileText, Loader2, Terminal, Image as ImageIcon, Globe, CheckCircle, AlertCircle, Trash2, Languages } from 'lucide-react';
import { FormData, FileData, AnalysisMode, SocialProfile } from '../types';
import { scrapePublicProfile } from '../services/scrapingService';

interface InputSectionProps {
  onAnalyze: (data: FormData, files: FileData[], mode: AnalysisMode) => void;
  isAnalyzing: boolean;
  onBack: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing, onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    relationship: '',
    purpose: '',
    textContext: '',
    userContext: '',
    uploadedContent: '',
    language: 'english', // Default to English
  });
  
  const [activeTab, setActiveTab] = useState<'upload' | 'social'>('upload');
  
  // Renamed to mediaFiles to support Images AND PDFs
  const [mediaFiles, setMediaFiles] = useState<{name: string, data: FileData}[]>([]);
  const [textFilesMeta, setTextFilesMeta] = useState<{name: string}[]>([]);
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.DEEP);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Social Scraping State
  const [scrapePlatform, setScrapePlatform] = useState('instagram');
  const [scrapeUsername, setScrapeUsername] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedProfiles, setScrapedProfiles] = useState<SocialProfile[]>([]);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const processFiles = async (files: FileList) => {
    const newMedia: {name: string, data: FileData}[] = [];
    const newTextFiles: {name: string}[] = [];
    let newTextContent = "";

    // Image compression helper to prevent Payload Too Large errors
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Limit max dimension to reduce token count and payload size
                    // Reduced from 1536 to 1024 to prevent XHR errors
                    const MAX_SIZE = 1024;
                    
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error("Canvas context not available"));
                        return;
                    }
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Export as JPEG with 0.7 quality to reduce size
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl.split(',')[1]);
                };
                img.onerror = (err) => reject(err);
                if (e.target?.result) {
                    img.src = e.target.result as string;
                }
            };
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    const processFile = async (file: File): Promise<void> => {
      try {
        // Handle Text Files (.txt) -> Append to context string
        if (file.type === "text/plain" || file.name.endsWith('.txt')) {
             return new Promise((resolve) => {
               const reader = new FileReader();
               reader.onload = (event) => {
                   let text = event.target?.result as string;
                   // Safety truncation for massive logs
                   if (text.length > 50000) {
                       text = text.substring(0, 50000) + "\n...[TRUNCATED DUE TO SIZE]...";
                   }
                   newTextContent += `\n--- START OF FILE: ${file.name} ---\n${text}\n--- END OF FILE ---\n`;
                   newTextFiles.push({ name: file.name });
                   resolve();
               };
               reader.readAsText(file);
             });
        } 
        // Handle Images -> Compress & Convert to Base64
        else if (file.type.startsWith("image/")) {
            const compressedBase64 = await compressImage(file);
            newMedia.push({
                name: file.name,
                data: {
                    mimeType: 'image/jpeg', // Normalize to JPEG
                    data: compressedBase64
                }
            });
        }
        // Handle PDFs -> Raw Base64
        else if (file.type === "application/pdf") {
           return new Promise((resolve) => {
               const reader = new FileReader();
               reader.onloadend = () => {
                  const base64String = reader.result as string;
                  const base64Data = base64String.split(',')[1];
                  newMedia.push({
                      name: file.name,
                      data: {
                          mimeType: file.type,
                          data: base64Data
                      }
                  });
                  resolve();
               };
               reader.readAsDataURL(file);
           });
        }
      } catch (error) {
          console.error("Error processing file:", file.name, error);
          alert(`Failed to process ${file.name}. It might be corrupted or too large.`);
      }
    };

    for (let i = 0; i < files.length; i++) {
      await processFile(files[i]);
    }

    setMediaFiles(prev => [...prev, ...newMedia]);
    setTextFilesMeta(prev => [...prev, ...newTextFiles]);
    setFormData(prev => ({
      ...prev,
      uploadedContent: prev.uploadedContent + newTextContent
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        await processFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
      if (e.clipboardData.files.length > 0) {
          e.preventDefault();
          await processFiles(e.clipboardData.files);
      }
  };

  const handleScrape = async () => {
      if (!scrapeUsername) return;
      setIsScraping(true);
      setScrapeError(null);
      try {
          const result = await scrapePublicProfile(scrapePlatform, scrapeUsername);
          if (result.success && result.data) {
              // Add to the list of profiles instead of replacing
              setScrapedProfiles(prev => [result.data!, ...prev]);
              setScrapeUsername(''); // Clear input for convenience
          } else {
              setScrapeError(result.error || "Failed to scrape profile. Ensure it is public.");
          }
      } catch (e) {
          setScrapeError("Unexpected error occurred.");
      } finally {
          setIsScraping(false);
      }
  };

  const removeProfile = (index: number) => {
      setScrapedProfiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeMedia = (index: number) => setMediaFiles(prev => prev.filter((_, i) => i !== index));
  const removeTextFile = (index: number) => setTextFilesMeta(prev => prev.filter((_, i) => i !== index));

  const handleRunAnalysis = async () => {
    if (!formData.relationship || !formData.purpose) {
      alert("Please fill in required fields (Relationship & Purpose).");
      return;
    }

    // Aggregate social data internally before sending to analysis
    let socialContext = "";
    if (scrapedProfiles.length > 0) {
        socialContext = "\n\n=== IMPORTED SOCIAL MEDIA PROFILES ===\n";
        scrapedProfiles.forEach(p => {
             socialContext += `
             \n--- PROFILE: ${p.platform.toUpperCase()} (${p.username}) ---
             Name: ${p.display_name}
             Bio: ${p.bio}
             Stats: ${p.followers} Followers | ${p.following} Following
             Location: ${p.location || 'N/A'}
             Work: ${p.work_history?.join(', ') || 'N/A'}
             Education: ${p.education?.join(', ') || 'N/A'}
             Email: ${p.email || 'N/A'}
             
             --- CONTENT & POSTS ---
             ${p.raw_posts_text}
             \n-----------------------------------\n
             `;
        });
    }

    const finalFormData = {
        ...formData,
        textContext: formData.textContext + socialContext
    };

    const hasText = finalFormData.textContext.length > 0 || finalFormData.uploadedContent.length > 0 || mediaFiles.length > 0;
    
    if (!hasText) {
        alert("No evidence available. Please add manual notes, upload a chat file, screenshots, or import a social profile.");
        return;
    }

    onAnalyze(finalFormData, mediaFiles.map(f => f.data), mode);
  };

  const isB2B = mode === AnalysisMode.B2B;
  const isCompat = mode === AnalysisMode.COMPATIBILITY;

  return (
    <div 
        className="w-full max-w-lg mx-auto animate-slide-up pb-20"
        onPaste={handlePaste} 
    >
      
      {/* Back Navigation */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-medium pl-2 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/20 dark:shadow-black/40 relative overflow-hidden transition-colors duration-200 ease-out">
        
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/30 dark:bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative z-10 mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                {isB2B ? "B2B Segmentation" : isCompat ? "Compatibility Check" : "New Analysis"}
            </h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
                {isB2B ? "Upload data for multiple clients to cluster them." : isCompat ? "Compare your personality with the target." : "Drag & drop chats, screenshots, or import social profiles."}
            </p>
        </div>

        {/* Mode Toggle */}
        <div className="relative z-10 bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-2xl flex mb-8 transition-colors duration-200 overflow-hidden">
            <div 
                className={`absolute top-1 bottom-1 w-[calc(25%-2px)] rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] z-0
                ${mode === AnalysisMode.DEEP ? 'left-1 bg-white dark:bg-slate-700' : 
                  mode === AnalysisMode.FAST ? 'left-[calc(25%+1px)] bg-white dark:bg-slate-700' :
                  mode === AnalysisMode.COMPATIBILITY ? 'left-[calc(50%+1px)] bg-white dark:bg-slate-700' :
                  'left-[calc(75%+1px)] bg-white dark:bg-slate-700'
                }`}
            ></div>
            
            <button
            onClick={() => setMode(AnalysisMode.DEEP)}
            className={`flex-1 py-3 px-1 rounded-xl flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold transition-colors z-10 relative ${
                mode === AnalysisMode.DEEP ? 'text-violet-600 dark:text-violet-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            >
            <Brain size={14} className={mode === AnalysisMode.DEEP ? 'text-violet-500 dark:text-violet-400' : ''} />
            <span className="hidden sm:inline">Deep</span>
            </button>

            <button
            onClick={() => setMode(AnalysisMode.FAST)}
            className={`flex-1 py-3 px-1 rounded-xl flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold transition-colors z-10 relative ${
                mode === AnalysisMode.FAST ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            >
            <Zap size={14} className={mode === AnalysisMode.FAST ? 'text-amber-500 dark:text-amber-400' : ''} />
            <span className="hidden sm:inline">Fast</span>
            </button>

            <button
            onClick={() => setMode(AnalysisMode.COMPATIBILITY)}
            className={`flex-1 py-3 px-1 rounded-xl flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold transition-colors z-10 relative ${
                mode === AnalysisMode.COMPATIBILITY ? 'text-rose-500 dark:text-rose-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            >
            <HeartHandshake size={14} className={mode === AnalysisMode.COMPATIBILITY ? 'text-rose-500 dark:text-rose-400' : ''} />
            <span className="hidden sm:inline">Match</span>
            </button>

            <button
            onClick={() => setMode(AnalysisMode.B2B)}
            className={`flex-1 py-3 px-1 rounded-xl flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold transition-colors z-10 relative ${
                mode === AnalysisMode.B2B ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            >
            <Briefcase size={14} className={mode === AnalysisMode.B2B ? 'text-blue-500 dark:text-blue-400' : ''} />
            <span className="hidden sm:inline">B2B</span>
            </button>
        </div>

        <div className="space-y-6 relative z-10">
            
            {/* Context Group */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                        {isB2B ? "Market Context" : "Target Profile"}
                    </h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <InputField 
                        label={isB2B ? "Industry" : "Relationship"}
                        placeholder={isB2B ? "Ex, SaaS, Real Estate..." : "Ex, Boss, Ex-Partner..."}
                        value={formData.relationship}
                        onChange={(v) => setFormData({...formData, relationship: v})}
                    />
                    <InputField 
                        label={isB2B ? "Sales Objective" : "Goal"}
                        placeholder={isB2B ? "Close deals..." : "Advice needed..."}
                        value={formData.purpose}
                        onChange={(v) => setFormData({...formData, purpose: v})}
                    />
                </div>

                {/* Language Selection */}
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10">
                         <Languages size={18} />
                    </div>
                    <select
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value as 'english' | 'roman'})}
                        className="w-full pl-12 pr-4 py-4 bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-white/10 rounded-2xl appearance-none outline-none focus:ring-4 focus:ring-violet-100/50 dark:focus:ring-violet-900/30 transition-all text-sm font-medium text-gray-800 dark:text-gray-100 cursor-pointer hover:bg-white dark:hover:bg-slate-800"
                    >
                        <option value="english">🇬🇧 English (Default)</option>
                        <option value="roman">🇮🇳/🇵🇰 Roman Urdu/Hindi (Desi Style)</option>
                    </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ArrowRight size={14} className="rotate-90" />
                    </div>
                </div>
            </div>

            {/* Input Method Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-2">
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`pb-2 px-4 text-sm font-medium transition-all relative ${activeTab === 'upload' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
                >
                    Files & Screenshots
                    {activeTab === 'upload' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></span>}
                </button>
                <button
                    onClick={() => setActiveTab('social')}
                    className={`pb-2 px-4 text-sm font-medium transition-all relative ${activeTab === 'social' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
                >
                    Social Media (Public)
                    {activeTab === 'social' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"></span>}
                </button>
            </div>

            {/* Evidence Group (Drag & Drop Zone OR Social Input) */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                    {isB2B ? "Client Data Source" : isCompat ? "Target Evidence" : "Evidence"}
                </h3>
                
                <textarea 
                    className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-violet-100/50 dark:focus:ring-violet-900/30 outline-none text-gray-700 dark:text-gray-200 transition-all duration-200 resize-none h-24 text-sm placeholder:text-gray-400"
                    placeholder={isB2B ? "Paste emails, meeting notes, or chat logs from multiple clients..." : "Paste messages, bio, or notes. You can also paste screenshots (Ctrl+V) directly here."}
                    value={formData.textContext}
                    onChange={(e) => setFormData({...formData, textContext: e.target.value})}
                ></textarea>

                {isCompat && (
                    <div className="animate-fade-in">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1 mb-3 mt-1">
                            About You (User Context)
                        </h3>
                        <textarea 
                            className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-rose-100/50 dark:focus:ring-rose-900/30 outline-none text-gray-700 dark:text-gray-200 transition-all duration-200 resize-none h-24 text-sm placeholder:text-gray-400"
                            placeholder="Describe your personality, communication style, or paste your own typical text messages..."
                            value={formData.userContext}
                            onChange={(e) => setFormData({...formData, userContext: e.target.value})}
                        ></textarea>
                    </div>
                )}
                
                {activeTab === 'upload' ? (
                    <>
                    <div 
                        className="relative group pt-2 animate-fade-in"
                        onDragEnter={handleDrag} 
                        onDragLeave={handleDrag} 
                        onDragOver={handleDrag} 
                        onDrop={handleDrop}
                    >
                        <input 
                            ref={inputRef}
                            type="file" 
                            id="file-upload" 
                            className="hidden" 
                            multiple 
                            accept=".txt,.pdf,image/*"
                            onChange={handleFileChange}
                        />
                        <label 
                            htmlFor="file-upload"
                            className={`flex flex-col items-center justify-center gap-2 w-full p-6 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer
                            ${dragActive 
                                ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-900/20 scale-[1.02]' 
                                : 'border-indigo-200 dark:border-indigo-800/50 bg-indigo-50/30 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-600'
                            }`}
                        >
                            <div className={`p-3 rounded-xl shadow-sm transition-colors ${dragActive ? 'bg-violet-100 text-violet-600' : 'bg-white dark:bg-slate-800 text-indigo-500 dark:text-indigo-400'}`}>
                                <Upload size={24} className={dragActive ? 'animate-bounce' : ''} />
                            </div>
                            <div className="text-center">
                                <span className="text-sm font-semibold block mb-1">
                                    {dragActive ? "Drop files to analyze" : isB2B ? "Upload Logs / Docs" : "Upload Chats (.txt, .pdf) or Screenshots"}
                                </span>
                                <span className="text-xs opacity-70">
                                    Drag & drop or paste (Ctrl+V) supported
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* File Previews */}
                    {(mediaFiles.length > 0 || textFilesMeta.length > 0) && (
                        <div className="flex flex-wrap gap-2 animate-fade-in pt-2">
                            {textFilesMeta.map((file, idx) => (
                                <div key={`txt-${idx}`} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-2 rounded-xl text-xs font-medium text-indigo-700 dark:text-indigo-300 shadow-sm border border-indigo-100 dark:border-indigo-800">
                                    <FileText size={14} className="opacity-70" />
                                    <span className="truncate max-w-[120px]">{file.name}</span>
                                    <button onClick={() => removeTextFile(idx)} className="text-indigo-400 hover:text-rose-500 p-1 rounded-full hover:bg-white/20 transition-colors">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {mediaFiles.map((file, idx) => (
                                <div key={`media-${idx}`} className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700">
                                    {file.data.mimeType === 'application/pdf' ? <FileText size={14} className="text-red-500" /> : <ImageIcon size={14} className="text-blue-500" />}
                                    <span className="truncate max-w-[120px]">{file.name}</span>
                                    <button onClick={() => removeMedia(idx)} className="text-gray-400 hover:text-rose-500 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    </>
                ) : (
                    <div className="animate-fade-in pt-2">
                        <div className="bg-white/50 dark:bg-slate-900/50 border border-indigo-200 dark:border-indigo-800/50 p-5 rounded-2xl space-y-4">
                           <div className="flex gap-4">
                               <div className="flex-1">
                                   <label className="text-xs font-bold text-gray-500 mb-1.5 block">Platform</label>
                                   <select 
                                     className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm"
                                     value={scrapePlatform}
                                     onChange={(e) => setScrapePlatform(e.target.value)}
                                   >
                                       <option value="instagram">Instagram</option>
                                       <option value="twitter">Twitter / X</option>
                                       <option value="tiktok">TikTok</option>
                                       <option value="linkedin">LinkedIn</option>
                                       <option value="snapchat">Snapchat</option>
                                   </select>
                               </div>
                               <div className="flex-[2]">
                                   <label className="text-xs font-bold text-gray-500 mb-1.5 block">Username / Profile URL</label>
                                   <input 
                                     type="text" 
                                     className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm"
                                     placeholder="@username"
                                     value={scrapeUsername}
                                     onChange={(e) => {
                                         setScrapeUsername(e.target.value);
                                         setScrapeError(null);
                                     }}
                                   />
                               </div>
                           </div>
                           
                           {scrapeError && (
                               <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-xl p-3 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400 animate-slide-up">
                                   <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                   <span>{scrapeError}</span>
                               </div>
                           )}

                           <button
                             onClick={handleScrape}
                             disabled={isScraping || !scrapeUsername}
                             className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                           >
                               {isScraping ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
                               {isScraping ? "Scraping Profile..." : "Import Public Profile Data"}
                           </button>
                           
                           <p className="text-[10px] text-gray-400 text-center">
                               Note: Only retrieves public bio, stats, and recent post captions. Private profiles cannot be accessed.
                           </p>

                           {/* Scraped Profiles List (Stack) */}
                           {scrapedProfiles.length > 0 && (
                               <div className="space-y-3 mt-4">
                                   {scrapedProfiles.map((p, idx) => (
                                        <div key={idx} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 flex gap-4 items-start animate-slide-up relative group">
                                            {/* Remove Button */}
                                            <button 
                                                onClick={() => removeProfile(idx)}
                                                className="absolute top-2 right-2 text-emerald-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-white/50 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove Profile"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            {p.profile_image && (
                                                <img src={p.profile_image} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-emerald-200" />
                                            )}
                                            <div className="flex-1 min-w-0 pr-6">
                                                <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-1">
                                                    {p.display_name} 
                                                    {p.is_verified && <CheckCircle size={12} className="fill-emerald-500 text-white" />}
                                                </h4>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 truncate">@{p.username} <span className="opacity-50">• {p.platform}</span></p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{p.bio}</p>
                                                <div className="flex gap-3 mt-2 text-[10px] font-mono text-gray-400">
                                                    <span><b>{p.followers}</b> Followers</span>
                                                    <span><b>{p.posts_count}</b> Posts</span>
                                                </div>
                                                <div className="mt-2 text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                    <CheckCircle size={10} /> Queued for analysis
                                                </div>
                                            </div>
                                        </div>
                                   ))}
                               </div>
                           )}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group mt-4
                ${isAnalyzing ? 'bg-slate-800 dark:bg-slate-900 cursor-not-allowed' : 'bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 text-white hover:shadow-indigo-500/40'}
                `}
            >
                {isAnalyzing ? (
                <>
                    <div className="flex items-center gap-3 z-10">
                        <div className="w-5 h-5 border-2 border-white/20 dark:border-gray-900/20 border-t-white dark:border-t-gray-900 rounded-full animate-spin"></div>
                        <span className="animate-pulse font-medium text-gray-300 dark:text-gray-500">
                            {isB2B ? "Segmenting..." : isCompat ? "Calculating Match..." : "Analyzing Psyche..."}
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-violet-500 animate-[width_2s_ease-in-out_infinite]"></div>
                </>
                ) : (
                <>
                    <span className="relative z-10">
                        {isB2B ? "Generate Segments" : isCompat ? "Check Compatibility" : "Run Analysis"}
                    </span>
                    <div className="relative z-10 bg-white/20 dark:bg-black/10 p-1 rounded-full">
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </>
                )}
            </button>

        </div>
      </div>
    </div>
  );
};

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
}

const InputField = ({ label, placeholder, value, onChange }: InputFieldProps) => {
    return (
        <div className="group relative">
            <input 
                type="text" 
                placeholder=" "
                className="peer w-full p-4 pt-5 pb-3 bg-white/50 dark:bg-slate-900/50 border rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 outline-none text-gray-800 dark:text-gray-100 text-sm font-medium transition-all duration-200 border-white/60 dark:border-white/10 focus:ring-violet-100/50 dark:focus:ring-violet-900/30"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <label className="absolute left-4 top-4 text-gray-400 text-xs transition-all duration-200 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-violet-500 dark:peer-focus:text-violet-400 peer-not-placeholder-shown:-translate-y-2.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-bold pointer-events-none">
                {label.toUpperCase()}
            </label>
        </div>
    );
};

export default InputSection;