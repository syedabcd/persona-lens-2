import React from 'react';
import { SegmentationReport, ClientGroup } from '../types';
import { Users, TrendingUp, DollarSign, Target, Briefcase, ChevronRight, PieChart } from 'lucide-react';

interface SegmentationViewProps {
  report: SegmentationReport;
}

const SegmentationView: React.FC<SegmentationViewProps> = ({ report }) => {
  return (
    <div className="w-full max-w-5xl mx-auto pb-40">
      
      {/* Dashboard Header */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-black p-8 rounded-[2rem] shadow-2xl shadow-indigo-500/20 dark:shadow-blue-900/30 mb-8 text-white animate-scale-in">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 opacity-10 rounded-full -mr-20 -mt-20 blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-indigo-500 opacity-10 rounded-full -ml-10 -mb-10 blur-3xl animate-blob delay-500"></div>
        
        <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-300 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
                <Briefcase size={12} />
                Client Intelligence Unit
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight leading-tight">
              Market <span className="text-blue-400">Segmentation</span>
            </h2>
            <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 max-w-3xl">
                <p className="opacity-95 leading-relaxed text-[15px] font-light text-slate-300">
                    {report.overview}
                </p>
            </div>
        </div>
      </div>

      {/* Market Trends Ticker */}
      <div className="glass-card p-5 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center animate-slide-up delay-100 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold whitespace-nowrap">
              <TrendingUp size={18} />
              <span>Market Patterns:</span>
          </div>
          <div className="flex flex-wrap gap-2">
              {report.marketTrends.map((trend, i) => (
                  <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                      {trend}
                  </span>
              ))}
          </div>
      </div>

      {/* Group Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up delay-200">
          {report.groups.map((group, idx) => (
              <GroupCard key={idx} group={group} index={idx} />
          ))}
      </div>

    </div>
  );
};

const GroupCard: React.FC<{ group: ClientGroup; index: number }> = ({ group, index }) => {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group">
            
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

            <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white leading-tight pr-2">{group.groupName}</h3>
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
                        <PieChart size={18} />
                    </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4 min-h-[60px]">
                    {group.description}
                </p>
            </div>

            <div className="space-y-4 flex-1">
                {/* Buying Triggers */}
                <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <DollarSign size={10} /> Buying Triggers
                    </h4>
                    <ul className="space-y-1.5">
                        {group.buyingTriggers.slice(0, 3).map((trigger, i) => (
                            <li key={i} className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                                <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                                {trigger}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Strategy */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <h4 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Target size={10} /> Closing Strategy
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {group.salesStrategy}
                    </p>
                </div>
            </div>

            {/* Client List Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Users size={12} />
                    <span>Matched Clients ({group.clientNames.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {group.clientNames.map((name, i) => (
                        <span key={i} className="text-[10px] bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                            {name}
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default SegmentationView;