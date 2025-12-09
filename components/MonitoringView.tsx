
import React, { useState } from 'react';
import { MonitoredProfile } from '../types';
import { Shield, Activity, RefreshCw, AlertTriangle, CheckCircle, Search, Bell, Lock, User, Clock } from 'lucide-react';

interface MonitoringViewProps {
  profiles: MonitoredProfile[];
}

const MonitoringView: React.FC<MonitoringViewProps> = ({ profiles }) => {
  return (
    <div className="w-full max-w-5xl mx-auto pb-40 animate-fade-in">
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-slate-900 dark:bg-black p-8 rounded-[2rem] shadow-2xl shadow-emerald-900/20 mb-8 text-white border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 opacity-5 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
                    <Shield size={12} />
                    Vigilance System Active
                </div>
                <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                  Persona <span className="text-emerald-500">Monitor</span>
                </h2>
                <p className="text-slate-400 text-sm max-w-lg">
                    Autonomous tracking of behavioral shifts and digital footprint changes for your saved profiles.
                </p>
            </div>
            
            <div className="flex gap-4">
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-4 rounded-2xl flex flex-col items-center min-w-[100px]">
                    <span className="text-2xl font-bold text-white">{profiles.length}</span>
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Active</span>
                </div>
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-4 rounded-2xl flex flex-col items-center min-w-[100px]">
                    <span className="text-2xl font-bold text-rose-500">0</span>
                    <span className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">Alerts</span>
                </div>
            </div>
        </div>
      </div>

      {/* Profile List */}
      {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[2rem]">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-400">
                  <Search size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No Profiles Monitored</h3>
              <p className="text-slate-500 max-w-sm mx-auto text-sm">
                  Run an analysis and click "Activate Vigilance" on the report page to start tracking a persona.
              </p>
          </div>
      ) : (
          <div className="grid gap-4">
              {profiles.map((profile) => (
                  <ProfileCard key={profile.id} profile={profile} />
              ))}
          </div>
      )}

      {/* Info Footer */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <Lock size={12} />
          <span>Encrypted Vault • Refresh interval: 24h</span>
      </div>

    </div>
  );
};

const ProfileCard: React.FC<{ profile: MonitoredProfile }> = ({ profile }) => {
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center gap-6 group">
            
            {/* Avatar / Icon */}
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0 relative">
                <User size={20} className="text-slate-500 dark:text-slate-400" />
                {profile.changeDetected && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">{profile.name}</h3>
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                        <Clock size={12} /> Last scan: {profile.lastScan}
                    </span>
                    <span className="flex items-center gap-1">
                        ID: #{profile.id.slice(-4)}
                    </span>
                </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-6">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
                    profile.changeDetected 
                    ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 border-rose-200 dark:border-rose-900/50' 
                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/50'
                }`}>
                    {profile.changeDetected ? (
                        <>
                            <AlertTriangle size={12} />
                            Change Detected
                        </>
                    ) : (
                        <>
                            <Activity size={12} />
                            Stable
                        </>
                    )}
                </div>

                <button 
                    onClick={handleScan}
                    disabled={isScanning}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <RefreshCw size={18} className={isScanning ? 'animate-spin' : ''} />
                </button>
            </div>

        </div>
    );
};

export default MonitoringView;
