
import React, { useEffect, useState } from 'react';
import { fetchHistory, deleteHistory } from '../services/supabaseService';
import { HistoryItem } from '../types';
import { Clock, Trash2, ChevronRight, FileText, Briefcase, HeartHandshake, Loader2, Search } from 'lucide-react';

interface HistoryViewProps {
  userId: string;
  onSelectReport: (item: HistoryItem) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ userId, onSelectReport }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      const data = await fetchHistory(userId);
      setHistory(data as any); // Type assertion needed due to complex jsonb mapping
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    
    setDeletingId(id);
    try {
      await deleteHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      alert("Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  const getIcon = (mode: string) => {
    switch (mode) {
      case 'B2B': return <Briefcase size={18} className="text-blue-500" />;
      case 'COMPATIBILITY': return <HeartHandshake size={18} className="text-rose-500" />;
      default: return <FileText size={18} className="text-violet-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] text-gray-500 animate-pulse">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p>Loading your archives...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto pb-40 animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Clock className="text-violet-400" /> Analysis History
      </h2>

      {history.length === 0 ? (
        <div className="glass-card p-10 rounded-3xl text-center border-dashed border-2 border-slate-700">
           <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
               <Search size={24} />
           </div>
           <h3 className="text-lg font-bold text-white mb-2">No Reports Found</h3>
           <p className="text-gray-400 text-sm">Your analysis history will appear here once you generate a report.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelectReport(item)}
              className="bg-slate-900/50 hover:bg-slate-800 border border-slate-800 hover:border-violet-500/30 p-5 rounded-2xl cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shrink-0 border border-slate-700">
                    {getIcon(item.mode)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg group-hover:text-violet-300 transition-colors line-clamp-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mt-1 max-w-md">{item.summary}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                       <span className="bg-slate-800 px-2 py-0.5 rounded-md">{item.mode}</span>
                       <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                   <button 
                     onClick={(e) => handleDelete(e, item.id)}
                     className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-900/10 rounded-lg transition-colors z-10"
                   >
                      {deletingId === item.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                   </button>
                   <ChevronRight className="text-slate-700 group-hover:translate-x-1 transition-transform mt-auto ml-auto" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
