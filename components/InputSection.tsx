import React, { useState } from 'react';
import { Upload, Sparkles, Zap, Brain, X, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { FormData, FileData, AnalysisMode } from '../types';

interface InputSectionProps {
  onAnalyze: (data: FormData, files: FileData[], mode: AnalysisMode) => void;
  isAnalyzing: boolean;
  onBack: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onAnalyze, isAnalyzing, onBack }) => {
  const [formData, setFormData] = useState<FormData>({
    tikTokUsername: '',
    instagramUsername: '',
    twitterUsername: '',
    relationship: '',
    purpose: '',
    textContext: ''
  });
  
  const [files, setFiles] = useState<{name: string, data: FileData}[]>([]);
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.DEEP);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles: {name: string, data: FileData}[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const base64Data = base64String.split(',')[1];
          newFiles.push({
            name: file.name,
            data: {
              mimeType: file.type,
              data: base64Data
            }
          });
          if (newFiles.length === e.target.files!.length) {
            setFiles(prev => [...prev, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.relationship || !formData.purpose) {
      alert("Please fill in Relationship and Purpose fields.");
      return;
    }
    onAnalyze(formData, files.map(f => f.data), mode);
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up">
      
      {/* Back Navigation */}
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm font-medium pl-2 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </button>

      <div className="glass-card p-6 md:p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/20 dark:shadow-black/40 relative overflow-hidden transition-colors duration-200 ease-out">
        
        {/* Decorative background gradients inside card - Removed slow transitions */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-200/30 dark:bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/30 dark:bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative z-10 mb-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">New Analysis</h2>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Provide context for the AI to analyze</p>
        </div>

        {/* Mode Toggle */}
        <div className="relative z-10 bg-gray-100/80 dark:bg-slate-800/80 p-1 rounded-2xl flex mb-8 transition-colors duration-200">
            <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl shadow-sm transition-all duration-200 ease-out z-0
                ${mode === AnalysisMode.DEEP ? 'left-1 bg-white dark:bg-slate-700' : 'left-[calc(50%+4px)] bg-white dark:bg-slate-700'}
                `}
            ></div>
            <button
            onClick={() => setMode(AnalysisMode.DEEP)}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors z-10 ${
                mode === AnalysisMode.DEEP ? 'text-violet-600 dark:text-violet-300' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            >
            <Brain size={16} className={mode === AnalysisMode.DEEP ? 'text-violet-500 dark:text-violet-400' : ''} />
            Deep Analysis
            </button>
            <button
            onClick={() => setMode(AnalysisMode.FAST)}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-colors z-10 ${
                mode === AnalysisMode.FAST ? 'text-amber-500 dark:text-amber-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            >
            <Zap size={16} className={mode === AnalysisMode.FAST ? 'text-amber-500 dark:text-amber-400' : ''} />
            Fast Check
            </button>
        </div>

        <div className="space-y-6 relative z-10">
            
            {/* Context Group */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Target Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                    <InputField 
                        label="Relationship" 
                        placeholder="Ex, Boss..." 
                        value={formData.relationship}
                        onChange={(v) => setFormData({...formData, relationship: v})}
                    />
                    <InputField 
                        label="Goal" 
                        placeholder="Advice needed..." 
                        value={formData.purpose}
                        onChange={(v) => setFormData({...formData, purpose: v})}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InputField 
                        label="Instagram" 
                        placeholder="@username" 
                        value={formData.instagramUsername}
                        onChange={(v) => setFormData({...formData, instagramUsername: v})}
                    />
                    <InputField 
                        label="TikTok" 
                        placeholder="@username" 
                        value={formData.tikTokUsername}
                        onChange={(v) => setFormData({...formData, tikTokUsername: v})}
                    />
                </div>
            </div>

            {/* Evidence Group */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Evidence</h3>
                <textarea 
                    className="w-full p-4 bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-violet-100/50 dark:focus:ring-violet-900/30 outline-none text-gray-700 dark:text-gray-200 transition-all duration-200 resize-none h-24 text-sm placeholder:text-gray-400"
                    placeholder="Paste messages or context here..."
                    value={formData.textContext}
                    onChange={(e) => setFormData({...formData, textContext: e.target.value})}
                ></textarea>
                
                <div className="relative group">
                    <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        multiple 
                        accept="image/*, text/*"
                        onChange={handleFileChange}
                    />
                    <label 
                        htmlFor="file-upload"
                        className="flex items-center justify-center gap-3 w-full p-4 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-600 hover:scale-[1.01] transition-all duration-200"
                    >
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-500 dark:text-indigo-400">
                            <Upload size={18} />
                        </div>
                        <span className="text-sm">Add Screenshots</span>
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="flex flex-wrap gap-2 animate-fade-in">
                        {files.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm border border-gray-100 dark:border-gray-700">
                                <span className="truncate max-w-[100px]">{file.name}</span>
                                <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500">
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Button */}
            <button
                onClick={handleSubmit}
                disabled={isAnalyzing}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group
                ${isAnalyzing ? 'bg-slate-800 dark:bg-slate-900 cursor-not-allowed' : 'bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 text-white hover:shadow-indigo-500/40'}
                `}
            >
                {isAnalyzing ? (
                <>
                    <div className="flex items-center gap-3 z-10">
                        <div className="w-5 h-5 border-2 border-white/20 dark:border-gray-900/20 border-t-white dark:border-t-gray-900 rounded-full animate-spin"></div>
                        <span className="animate-pulse font-medium text-gray-300 dark:text-gray-500">Analyzing Psyche...</span>
                    </div>
                    {/* Progress bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-violet-500 animate-[width_2s_ease-in-out_infinite]"></div>
                </>
                ) : (
                <>
                    <span className="relative z-10">Run Analysis</span>
                    <div className="relative z-10 bg-white/20 dark:bg-black/10 p-1 rounded-full">
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                    {/* Gradient shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </>
                )}
            </button>

        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, placeholder, value, onChange }: { label: string, placeholder: string, value: string, onChange: (v: string) => void }) => (
    <div className="group relative">
        <input 
            type="text" 
            placeholder=" "
            className="peer w-full p-4 pt-5 pb-3 bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-violet-100/50 dark:focus:ring-violet-900/30 outline-none text-gray-800 dark:text-gray-100 text-sm font-medium transition-all duration-200"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        <label className="absolute left-4 top-4 text-gray-400 text-xs transition-all duration-200 peer-focus:-translate-y-2.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:text-violet-500 dark:peer-focus:text-violet-400 peer-not-placeholder-shown:-translate-y-2.5 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:font-bold pointer-events-none">
            {label.toUpperCase()}
        </label>
        {value.length > 2 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 animate-scale-in bg-white dark:bg-slate-700 rounded-full p-0.5 shadow-sm">
                <Check size={14} strokeWidth={3} />
            </div>
        )}
    </div>
);

export default InputSection;