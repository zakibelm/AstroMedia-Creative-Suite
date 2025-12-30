
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { AIAgent, AgentTask } from '../types';
import { useTranslation } from '../services/i18n';
import { n8nService } from '../services/n8n';

export const AiAgentTeam: React.FC = () => {
  const { t } = useTranslation();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [activeTasks, setActiveTasks] = useState<AgentTask[]>([]);

  useEffect(() => {
    setAgents(storage.getAgents());
    
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        efficiency: Math.min(100, Math.max(85, a.efficiency + (Math.random() * 2 - 1)))
      })));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const triggerACMTask = () => {
    n8nService.runCommunityManagerTask('C1', (updatedTask) => {
      setActiveTasks(prev => {
        const index = prev.findIndex(t => t.id === updatedTask.id);
        if (index > -1) {
          const newTasks = [...prev];
          newTasks[index] = updatedTask;
          return newTasks;
        }
        return [updatedTask, ...prev];
      });
    });
  };

  const getStepColor = (step: string) => {
    switch(step) {
      case 'execute': return 'text-blue-400';
      case 'observe': return 'text-amber-400';
      case 'validate': return 'text-purple-400';
      case 'conform': return 'text-emerald-400';
      case 'retry': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-fadeIn min-h-screen">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white">{t('agents.title')}</h1>
          <p className="text-slate-400 font-medium text-lg">{t('agents.subtitle')}</p>
        </div>
        <button 
          onClick={triggerACMTask}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
        >
          🚀 Trigger ACM Loop
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="glass p-8 rounded-[2.5rem] border-slate-800/50 relative overflow-hidden group hover:border-purple-500/30 transition-all">
            <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${agent.status === 'processing' ? 'from-emerald-500/20 to-transparent' : 'from-slate-800/20 to-transparent'}`} />
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-transform duration-500">
                {agent.avatar}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{agent.name}</h3>
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{agent.role}</p>
              </div>

              <div className="w-full space-y-4 pt-4 border-t border-slate-800/50">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('agents.efficiency')}</span>
                  <span className="text-xs font-mono font-bold text-white">{agent.efficiency.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ${agent.efficiency > 95 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`} 
                    style={{ width: `${agent.efficiency}%` }} 
                   />
                </div>

                <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-full bg-slate-950/50 border border-white/5">
                   <span className="flex items-center gap-1.5">
                     <span className={`w-1.5 h-1.5 rounded-full ${agent.status === 'processing' ? 'bg-emerald-500 animate-pulse' : agent.status === 'learning' ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`} />
                     <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">{agent.status}</span>
                   </span>
                   <span className="text-[8px] font-bold text-slate-600 uppercase">Latency: 14ms</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">{t('agents.lastAction')}</p>
               <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-[10px] text-slate-400 font-medium italic">
                 "{agent.lastAction}"
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Tasks Monitoring */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[3rem] border-slate-800/50">
            <h3 className="text-lg font-black uppercase tracking-tight text-white mb-8 flex items-center gap-3">
              <span className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">🌀</span>
              Live Autonomous Task Monitor
            </h3>
            
            <div className="space-y-6">
              {activeTasks.length === 0 ? (
                <div className="py-20 text-center border border-dashed border-slate-800 rounded-3xl">
                   <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">No active autonomous cycles</p>
                </div>
              ) : activeTasks.map(task => (
                <div key={task.id} className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-6 animate-fadeIn">
                   <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-center">
                         <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-xl">💬</div>
                         <div>
                            <h4 className="font-black text-white uppercase tracking-tight">{task.title}</h4>
                            <p className="text-[9px] font-black text-slate-500 uppercase">Attempts: {task.attempts}/{task.maxAttempts}</p>
                         </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        task.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                        task.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse'
                      }`}>
                        {task.status}
                      </div>
                   </div>

                   {/* Step Visualizer */}
                   <div className="flex justify-between items-center px-4 relative">
                      <div className="absolute left-0 right-0 h-0.5 bg-slate-800 top-1/2 -translate-y-1/2 z-0" />
                      {['execute', 'observe', 'validate', 'conform'].map((step, i) => (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                           <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                             task.currentStep === step ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
                             ['completed', 'conform'].includes(task.status) || (['observe', 'validate', 'conform'].includes(task.currentStep) && i < 2) ? 'bg-emerald-900 border-emerald-700 text-emerald-400' : 
                             'bg-slate-900 border-slate-700 text-slate-600'
                           }`}>
                             {i + 1}
                           </div>
                           <span className={`text-[8px] font-black uppercase tracking-tighter ${task.currentStep === step ? 'text-white' : 'text-slate-600'}`}>
                             {step}
                           </span>
                        </div>
                      ))}
                   </div>

                   {/* Step Logs */}
                   <div className="bg-black/40 rounded-2xl p-4 font-mono text-[10px] space-y-2 max-h-40 overflow-y-auto custom-scrollbar border border-white/5">
                      {task.logs.map((log, i) => (
                        <div key={i} className="flex gap-3">
                           <span className="text-slate-600">[{i}]</span>
                           <span className={getStepColor(log.split(']')[0].replace('[', '').toLowerCase())}>{log}</span>
                        </div>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Communication Stream */}
        <div className="glass p-10 rounded-[3rem] border-slate-800/50 flex flex-col h-full">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 border-b border-slate-800 pb-4">
            Real-time Logic Logs
          </h3>
          <div className="space-y-4 font-mono text-xs flex-1 overflow-y-auto no-scrollbar pr-2">
             <div className="flex gap-4 p-3 bg-slate-900/50 rounded-xl border-l-2 border-emerald-500 animate-fadeIn">
                <span className="text-slate-500">[14:22:01]</span>
                <span className="text-emerald-500 font-bold">Echo-ACM:</span>
                <span className="text-slate-300">New post detected on LinkedIn. Initiating sentiment scan...</span>
             </div>
             <div className="flex gap-4 p-3 bg-slate-900/50 rounded-xl border-l-2 border-purple-500 animate-fadeIn">
                <span className="text-slate-500">[14:22:15]</span>
                <span className="text-purple-500 font-bold">Oracle-01:</span>
                <span className="text-slate-300">Engagement threshold exceeded. Routing budget to Echo-ACM.</span>
             </div>
             <div className="flex gap-4 p-3 bg-slate-900/50 rounded-xl border-l-2 border-amber-500 animate-fadeIn">
                <span className="text-slate-500">[14:23:40]</span>
                <span className="text-amber-500 font-bold">DataPulse:</span>
                <span className="text-slate-300">Drafting retrospective report. Projection: +2% efficiency.</span>
             </div>
          </div>
          
          <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
             <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Self-Correction Active</p>
             <p className="text-[10px] text-slate-400 leading-tight">Agents are currently in 'Retrospective-First' mode. Every action is validated via Gemini 3 Flash before broadcast.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
