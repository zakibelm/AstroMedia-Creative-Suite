
import React, { useState } from 'react';
import { storage } from '../services/storage';
import { useNavigate } from 'react-router-dom';

export const CampaignBuilder: React.FC = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('engagement');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [triggers, setTriggers] = useState([
    { id: 1, label: 'Auto-reply to comments', active: true },
    { id: 2, label: 'A/B Test Visual Assets', active: true },
    { id: 3, label: 'Competitor Sentiment Analysis', active: false },
    { id: 4, label: 'Dynamic Budget Reallocation', active: true },
  ]);

  const navigate = useNavigate();

  const toggleTrigger = (id: number) => {
    setTriggers(triggers.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const handleLaunch = () => {
    const status = isScheduled ? 'scheduled' : 'active';
    
    const newCampaign = {
      id: crypto.randomUUID(),
      name,
      status: status as any,
      platform: 'Multi-Agent n8n',
      lastUpdated: new Date().toISOString(),
      scheduledAt: isScheduled ? scheduledDate : undefined,
      performance: { reach: 0, engagement: 0, conversion: 0 }
    };

    storage.saveCampaign(newCampaign);
    if (isScheduled) {
      alert(`📅 Campaign queued for transmission on ${new Date(scheduledDate).toLocaleString()}`);
    } else {
      alert("🚀 Campaign synchronized with n8n orchestration engine and launched successfully!");
    }
    navigate('/'); 
  };

  const isNextDisabled = step === 1 && !name.trim();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Campaign Orchestrator</h1>
        <p className="text-slate-400 font-medium text-lg">Configure your multi-armed bandit LLM routing strategy.</p>
      </div>

      {/* Stepper */}
      <div className="flex gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-500 ${
              step >= s ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-500'
            }`}>
              {s}
            </div>
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-700 ${
              step > s ? 'bg-purple-600' : 'bg-slate-800'
            }`} />
          </div>
        ))}
      </div>

      <div className="glass p-10 rounded-[3rem] border-slate-700/50 space-y-8 relative overflow-hidden">
        {step === 1 && (
          <div className="space-y-8 animate-slideInRight">
            <div className="flex items-center gap-4 text-purple-400">
               <span className="text-2xl">🎯</span>
               <h2 className="text-2xl font-black uppercase tracking-tight">Core Objectives</h2>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Campaign Identifier</label>
              <input 
                type="text" 
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-lg" 
                placeholder="e.g. Q4 Growth Sprint"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Optimization Goal</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'engagement', label: 'Engagement', icon: '🔥', desc: 'Boost social reach' },
                  { id: 'conversion', label: 'Conversion', icon: '💰', desc: 'Maximize sales' },
                  { id: 'brand', label: 'Awareness', icon: '📣', desc: 'Long-term growth' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setGoal(item.id)}
                    className={`p-8 rounded-[2rem] border-2 transition-all text-left group relative overflow-hidden ${
                      goal === item.id 
                        ? 'bg-purple-600/10 border-purple-500 text-white shadow-xl shadow-purple-500/5' 
                        : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                    <div className="font-black uppercase tracking-tight text-lg">{item.label}</div>
                    <div className="text-xs font-medium opacity-60 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-slideInRight">
            <div className="flex items-center gap-4 text-blue-400">
               <span className="text-2xl">⚡</span>
               <h2 className="text-2xl font-black uppercase tracking-tight">Workflow Triggers</h2>
            </div>

            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-300 text-sm font-medium flex gap-3 items-center">
              <span className="text-xl">🤖</span>
              <p>Selection will initiate <strong>n8n multi-agent orchestration</strong> nodes for this campaign.</p>
            </div>

            <div className="space-y-3">
              {triggers.map((trigger) => (
                <div 
                  key={trigger.id} 
                  onClick={() => toggleTrigger(trigger.id)}
                  className={`flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer group ${
                    trigger.active ? 'bg-slate-800/80 border-blue-500/50' : 'bg-slate-900/30 border-slate-800 opacity-60'
                  }`}
                >
                  <span className={`font-bold transition-colors ${trigger.active ? 'text-white' : 'text-slate-500'}`}>
                    {trigger.label}
                  </span>
                  <div className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
                    trigger.active ? 'bg-blue-600' : 'bg-slate-700'
                  }`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-lg ${
                      trigger.active ? 'right-1' : 'left-1'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-slideInRight">
            <div className="flex items-center gap-4 text-emerald-400">
               <span className="text-2xl">📋</span>
               <h2 className="text-2xl font-black uppercase tracking-tight">Deployment Review</h2>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-[2.5rem] p-8 space-y-8">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Campaign Identity</p>
                     <p className="text-2xl font-black text-white">{name}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Objective</p>
                     <p className="text-2xl font-black text-purple-400 capitalize">{goal}</p>
                  </div>
               </div>

               {/* Scheduling Section */}
               <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-3xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-tight">Temporal Scheduling</p>
                      <p className="text-[10px] text-slate-500 font-medium">Broadcast at a specific window</p>
                    </div>
                    <button 
                      onClick={() => setIsScheduled(!isScheduled)}
                      className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isScheduled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${isScheduled ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {isScheduled && (
                    <div className="pt-2 animate-fadeIn">
                      <input 
                        type="datetime-local" 
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                      />
                      <p className="text-[10px] text-emerald-500 mt-2 italic font-medium">
                        * Automatic deployment node will trigger at selected timestamp.
                      </p>
                    </div>
                  )}
               </div>

               <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Automation Nodes</p>
                  <div className="flex flex-wrap gap-2">
                     {triggers.filter(t => t.active).map(t => (
                       <span key={t.id} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full text-xs font-bold">
                         {t.label}
                       </span>
                     ))}
                  </div>
               </div>
            </div>

            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
               <div className="text-3xl">🚀</div>
               <p className="text-sm text-emerald-300 font-medium leading-relaxed">
                 {isScheduled 
                   ? `Transmission scheduled. The campaign will enter the multi-agent queue at the specified time.`
                   : `Ready for transmission. All assets linked to this campaign will be automatically routed through the optimized LLM bandit logic.`
                 }
               </p>
            </div>
          </div>
        )}

        {/* Navigation Actions */}
        <div className="flex justify-between pt-8 border-t border-slate-800">
          <button 
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className={`px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            ← Previous
          </button>
          
          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              disabled={isNextDisabled}
              className={`px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 ${
                isNextDisabled 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/20'
              }`}
            >
              Continue Execution →
            </button>
          ) : (
            <button 
              onClick={handleLaunch}
              disabled={isScheduled && !scheduledDate}
              className={`px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all active:scale-95 ${isScheduled && !scheduledDate ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isScheduled ? '📅 Schedule Launch' : '🚀 Launch Deployment'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
