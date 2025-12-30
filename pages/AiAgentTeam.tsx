
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { AIAgent, AgentTask, AgentStep } from '../types';
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

  const STEPS: AgentStep[] = ['execute', 'observe', 'validate', 'conform'];

  const getStepStatus = (task: AgentTask, step: AgentStep, index: number) => {
    const currentIndex = STEPS.indexOf(task.currentStep);
    const stepIndex = STEPS.indexOf(step);

    if (task.status === 'completed') return 'completed';
    if (task.status === 'failed' && stepIndex === currentIndex) return 'failed';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepStyles = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]';
      case 'active': return 'bg-blue-600 border-blue-400 text-white animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110';
      case 'failed': return 'bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]';
      default: return 'bg-slate-900 border-slate-700 text-slate-500';
    }
  };

  const getLogColor = (log: string) => {
    const l = log.toLowerCase();
    if (l.includes('[execute]')) return 'text-blue-400';
    if (l.includes('[observe]')) return 'text-amber-400';
    if (l.includes('[validate]')) return 'text-purple-400';
    if (l.includes('[conform]')) return 'text-emerald-400';
    if (l.includes('[retry]') || l.includes('[error]')) return 'text-red-400';
    return 'text-slate-400';
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
          className="group relative px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/30 transition-all active:scale-95 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            <span className="text-lg">⚡</span> {t('agents.initACM')} || Trigger ACM Loop
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>

      {/* Agents Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="glass p-8 rounded-[2.5rem] border-slate-800/50 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${agent.status === 'processing' ? 'from-emerald-500/10 to-transparent' : 'from-slate-800/10 to-transparent'}`} />
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-[2rem] bg-slate-950 border border-slate-800 flex items-center justify-center text-4xl shadow-2xl group-hover:rotate-6 transition-transform duration-500 relative">
                {agent.avatar}
                {agent.status === 'processing' && (
                  <div className="absolute inset-0 rounded-[2rem] border-2 border-emerald-500/30 animate-ping" />
                )}
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
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden p-0.5 border border-white/5">
                   <div 
                    className={`h-full rounded-full transition-all duration-1000 ${agent.efficiency > 95 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`} 
                    style={{ width: `${agent.efficiency}%` }} 
                   />
                </div>

                <div className="flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-black/40 border border-white/5">
                   <span className="flex items-center gap-2">
                     <span className={`w-2 h-2 rounded-full ${agent.status === 'processing' ? 'bg-emerald-500 animate-pulse' : agent.status === 'learning' ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`} />
                     <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{agent.status}</span>
                   </span>
                   <span className="text-[9px] font-bold text-slate-700 uppercase">T-Logic: Online</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest opacity-50">{t('agents.lastAction')}</p>
               <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 text-[10px] text-slate-400 font-medium italic min-h-[48px] flex items-center">
                 "{agent.lastAction}"
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Tasks Monitoring */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-10 rounded-[3.5rem] border-slate-800/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <span className="text-8xl font-black tracking-tighter">EOVC</span>
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-10 flex items-center gap-4">
              <span className="p-3 bg-blue-500/20 rounded-2xl text-blue-400 shadow-inner">🌀</span>
              Logic Node Execution Stream
            </h3>
            
            <div className="space-y-10">
              {activeTasks.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-slate-800/50 rounded-[3rem] bg-slate-900/10">
                   <div className="text-5xl mb-6 opacity-20">📡</div>
                   <p className="text-slate-600 text-[11px] font-black uppercase tracking-[0.3em]">System idle. Awaiting autonomous triggers.</p>
                </div>
              ) : activeTasks.map(task => (
                <div key={task.id} className="p-8 bg-slate-900/40 border border-slate-800/50 rounded-[3rem] space-y-10 animate-fadeIn hover:bg-slate-900/60 transition-all duration-300 group">
                   <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                      <div className="flex gap-6 items-center">
                         <div className="w-16 h-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-3xl shadow-inner group-hover:rotate-3 transition-transform">
                           {task.agentId === 'a3' ? '💬' : '🤖'}
                         </div>
                         <div>
                            <div className="flex items-center gap-3">
                              <h4 className="text-xl font-black text-white uppercase tracking-tight">{task.title}</h4>
                              <span className="text-[10px] font-mono text-slate-600">ID: {task.id.split('_')[1]}</span>
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              Autonomous Loop • Step Latency: 42ms • Attempts: <span className={task.attempts > 1 ? 'text-amber-500' : 'text-slate-400'}>{task.attempts}/{task.maxAttempts}</span>
                            </p>
                         </div>
                      </div>
                      <div className={`px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-[0.2em] border shadow-lg transition-all duration-500 ${
                        task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 
                        task.status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                        'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse'
                      }`}>
                        {task.status}
                      </div>
                   </div>

                   {/* Visual Timeline Stepper */}
                   <div className="relative px-4">
                      {/* Connector Line */}
                      <div className="absolute left-12 right-12 h-1 bg-slate-800 top-5 -translate-y-1/2 rounded-full overflow-hidden">
                         <div 
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 transition-all duration-1000 ease-in-out" 
                          style={{ width: `${(STEPS.indexOf(task.currentStep) / (STEPS.length - 1)) * 100}%` }}
                         />
                      </div>

                      <div className="flex justify-between items-center relative z-10">
                        {STEPS.map((step, i) => {
                          const status = getStepStatus(task, step, i);
                          return (
                            <div key={step} className="flex flex-col items-center gap-4">
                               <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center font-black text-xs transition-all duration-700 ${getStepStyles(status)}`}>
                                 {status === 'completed' ? '✓' : i + 1}
                               </div>
                               <div className="text-center space-y-1">
                                  <p className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-500 ${status === 'active' ? 'text-white' : 'text-slate-600'}`}>
                                    {step}
                                  </p>
                                  {status === 'active' && (
                                    <span className="flex gap-0.5 justify-center">
                                      <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                                      <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                      <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </span>
                                  )}
                               </div>
                            </div>
                          );
                        })}
                      </div>
                   </div>

                   {/* Logical Log Terminal */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Logical Execution Stack</h5>
                         <span className="text-[9px] font-mono text-slate-700 uppercase">Real-time Telemetry</span>
                      </div>
                      <div className="bg-slate-950 border border-white/5 rounded-[2rem] p-6 font-mono text-[11px] space-y-3 max-h-56 overflow-y-auto custom-scrollbar shadow-inner">
                         {task.logs.map((log, i) => (
                           <div key={i} className={`flex gap-4 group/log ${i === task.logs.length - 1 ? 'animate-pulse' : ''}`}>
                              <span className="text-slate-800 w-8 select-none">[{i.toString().padStart(2, '0')}]</span>
                              <span className={`${getLogColor(log)} font-medium leading-relaxed`}>{log}</span>
                           </div>
                         ))}
                         {task.status === 'running' && (
                           <div className="flex gap-4 animate-pulse">
                              <span className="text-slate-800 w-8">--</span>
                              <span className="text-slate-600 italic">Inference in progress...</span>
                           </div>
                         )}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-time Intel Column */}
        <div className="space-y-8">
           <div className="glass p-10 rounded-[3.5rem] border-slate-800/50 flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 via-purple-500/50 to-blue-500/50" />
              
              <h3 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 mb-8 border-b border-slate-800/50 pb-6 flex items-center justify-between">
                <span>Logic Telemetry</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h3>

              <div className="space-y-6 font-mono text-[10px] flex-1 overflow-y-auto no-scrollbar pr-2">
                 {[
                   { time: '14:22:01', agent: 'Echo-ACM', msg: 'New post detected on LinkedIn. Initiating sentiment scan...', color: 'border-emerald-500', nameColor: 'text-emerald-500' },
                   { time: '14:22:15', agent: 'Oracle-01', msg: 'Engagement threshold exceeded. Routing budget to Echo-ACM.', color: 'border-purple-500', nameColor: 'text-purple-500' },
                   { time: '14:23:40', agent: 'DataPulse', msg: 'Drafting retrospective report. Projection: +2% efficiency.', color: 'border-amber-500', nameColor: 'text-amber-500' },
                   { time: '14:24:12', agent: 'System', msg: 'EOVC Loop Cycle #1282 initiated successfully.', color: 'border-blue-500', nameColor: 'text-blue-500' },
                 ].map((log, i) => (
                   <div key={i} className={`flex gap-4 p-4 bg-slate-900/40 rounded-2xl border-l-4 ${log.color} hover:bg-slate-900/60 transition-all cursor-default`}>
                      <span className="text-slate-600 shrink-0">[{log.time}]</span>
                      <div>
                        <span className={`${log.nameColor} font-black uppercase`}>{log.agent}:</span>
                        <p className="text-slate-300 mt-1 leading-normal">{log.msg}</p>
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="mt-10 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] space-y-3 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">🤖</div>
                 <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                   Validation Layer: Active
                 </p>
                 <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                   Every autonomous action is parsed through <span className="text-white font-bold">Gemini 3 Pro</span> before execution to ensure 100% brand safety and strategic alignment.
                 </p>
                 <div className="pt-2">
                    <button className="text-[9px] font-black uppercase text-emerald-400 hover:text-emerald-300 underline tracking-widest">
                      Audit Intelligence Path
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
};
