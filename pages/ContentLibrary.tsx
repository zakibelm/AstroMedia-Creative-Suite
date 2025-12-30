
import React from 'react';
import { MediaLibrary } from '../components/creative/MediaLibrary';

export const ContentLibrary: React.FC = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-fadeIn min-h-screen">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Content Repository</h1>
          <p className="text-slate-400 text-lg font-medium">Manage and deploy your high-performance AI media assets.</p>
        </div>
        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Vault Synchronized</span>
           </div>
        </div>
      </div>

      <div className="glass p-10 rounded-[3rem] border-slate-700/50 shadow-2xl bg-slate-900/40 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none"></div>
        
        <MediaLibrary />
      </div>

      <div className="p-10 bg-slate-900/20 border border-slate-800 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Advanced Orchestration</h4>
            <p className="text-sm text-slate-500">Connect your repository assets to dynamic multi-agent n8n workflows.</p>
         </div>
         <button className="px-8 py-3 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-xl">
           Configure Workflows
         </button>
      </div>
    </div>
  );
};
