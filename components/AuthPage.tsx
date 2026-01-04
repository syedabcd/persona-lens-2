import React, { useState } from 'react';
import { supabase } from '../services/supabaseService';
import { Sparkles, Mail, Lock, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // If signup is successful but no session (email confirmation required),
        // we can either show a message or proceed. 
        // To satisfy "directly go to analyze", we call success immediately.
        // Note: Supabase project must have "Confirm Email" disabled for auto-login session to exist here.
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-slide-up">
      <div className="glass-card p-8 md:p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

        <div className="relative z-10 text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-slate-800 shadow-sm mb-4">
                <Sparkles className="text-indigo-600 dark:text-indigo-400" size={24} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
                {isLogin ? 'Sign in to access your persona analysis' : 'Join PersonaLens to decode behaviors'}
            </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
            {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-100 dark:border-rose-900/50">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Email</label>
                <div className="relative">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 pl-12 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 dark:text-white"
                        placeholder="you@example.com"
                        required
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-gray-800 dark:text-white"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl hover:shadow-indigo-500/20 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 size={20} className="animate-spin" /> : (
                    <>
                        {isLogin ? 'Sign In' : 'Sign Up'}
                        <ArrowRight size={20} />
                    </>
                )}
            </button>
        </form>

        <div className="mt-6 text-center relative z-10">
            <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors font-medium"
            >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;