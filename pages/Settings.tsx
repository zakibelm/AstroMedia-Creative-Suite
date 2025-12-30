
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { generateOAuthUrl, OAUTH_CONFIG } from '../services/oauth';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'n8n' | 'social'>('social');
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>(storage.getConnectedAccounts());
  const [tokens, setTokens] = useState<Record<string, string>>(storage.getTokens());
  const [showDevDetails, setShowDevDetails] = useState(false);

  useEffect(() => {
    // Poll for changes in storage every 1.5 seconds to handle updates from OAuth popups
    const interval = setInterval(() => {
      const currentAccounts = storage.getConnectedAccounts();
      const currentTokens = storage.getTokens();
      
      // Only update state if values actually changed to avoid unnecessary re-renders
      setConnectedAccounts(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(currentAccounts)) return currentAccounts;
        return prev;
      });
      setTokens(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(currentTokens)) return currentTokens;
        return prev;
      });
    }, 1500);

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_SUCCESS') {
        const { platform } = event.data;
        setConnectedAccounts(storage.getConnectedAccounts());
        setTokens(storage.getTokens());
        console.log(`Successfully linked ${platform}! Refreshing settings state.`);
      }

      if (event.data?.type === 'OAUTH_ERROR') {
        alert(`Authentication failed: ${event.data.error}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(interval);
    };
  }, []);

  const handleRealConnect = (platform: keyof typeof OAUTH_CONFIG) => {
    const url = generateOAuthUrl(platform);
    
    const width = 600, height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      url, 
      `Connect ${platform}`, 
      `width=${width},height=${height},left=${left},top=${top},status=no,location=yes,toolbar=no`
    );
  };

  const handleDisconnect = (p: string) => {
    if (confirm(`Revoke access to ${p}? This will delete all associated session tokens.`)) {
      storage.setAccountConnection(p, false);
      storage.clearToken(p);
      // Immediate UI update after storage change
      setConnectedAccounts(storage.getConnectedAccounts());
      setTokens(storage.getTokens());
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-fadeIn min-h-screen">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Infrastructure Config</h1>
          <p className="text-slate-400 text-lg font-medium">Production endpoints, secrets, and deployment handshakes.</p>
        </div>
        <button 
          onClick={() => setShowDevDetails(!showDevDetails)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            showDevDetails ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
          }`}
        >
          {showDevDetails ? 'Hide Registry Info' : 'Dev Mode: Active'}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'api', label: 'Intelligence', icon: '🔑' },
          { id: 'n8n', label: 'Orchestration', icon: '⚡' },
          { id: 'social', label: 'Social Hub', icon: '🌐' },
          { id: 'profile', label: 'Identity', icon: '👤' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-3 border flex-shrink-0 ${
              activeTab === tab.id
                ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span className="text-sm uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="glass p-10 rounded-[3rem] border-slate-700/50 shadow-2xl space-y-8 min-h-[500px]">
        {activeTab === 'social' && (
          <div className="space-y-8 animate-slideInRight">
            <div className="flex items-center gap-4 text-indigo-400">
              <span className="text-2xl">🌐</span>
              <h2 className="text-2xl font-black uppercase tracking-tight">Active OAuth Connections</h2>
            </div>

            {showDevDetails && (
              <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Callback Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-black/40 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase mb-1">Authenticated Redirect URI</p>
                    <code className="text-[10px] text-blue-300">{window.location.origin}/oauth-callback</code>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase mb-1">State Verification</p>
                    <code className="text-[10px] text-emerald-400">SessionStorage Validation Active</code>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(['twitter', 'linkedin', 'facebook'] as const).map((p) => (
                <div 
                  key={p} 
                  className={`p-6 rounded-[2rem] border transition-all ${
                    connectedAccounts[p] ? 'bg-emerald-500/5 border-emerald-500/20 shadow-inner' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                        connectedAccounts[p] ? 'bg-emerald-500/20 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {p === 'twitter' && '𝕏'}
                        {p === 'linkedin' && 'in'}
                        {p === 'facebook' && 'f'}
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-tight text-white">{p}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${connectedAccounts[p] ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${connectedAccounts[p] ? 'text-emerald-500' : 'text-slate-500'}`}>
                            {connectedAccounts[p] ? 'Authorized' : 'Disconnected'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {connectedAccounts[p] ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-black/40 rounded-xl border border-white/5 overflow-hidden">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Session Token Fingerprint</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate select-all">{tokens[p] || 'Unknown Token'}</p>
                      </div>
                      <button 
                        onClick={() => handleDisconnect(p)}
                        className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Revoke Access
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleRealConnect(p as any)}
                      className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700"
                    >
                      Establish Connection
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-8 animate-slideInRight">
             <div className="flex items-center gap-4 text-purple-400">
              <span className="text-2xl">🔑</span>
              <h2 className="text-2xl font-black uppercase tracking-tight">Intelligence Access</h2>
            </div>
            <div className="p-8 bg-purple-500/5 border border-purple-500/20 rounded-[2rem] space-y-6">
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Gemini API Key is currently managed via environmental injection. Ensure <code>process.env.API_KEY</code> is correctly configured in your deployment layer.
              </p>
              <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                 <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500 font-black">GM</div>
                 <div>
                   <p className="text-xs font-bold text-white uppercase tracking-tight">Gemini 2.5 Flash / 3.1 Pro</p>
                   <p className="text-[10px] text-emerald-500 font-black tracking-widest">ACTIVE READY</p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'n8n' && (
          <div className="space-y-8 animate-slideInRight">
             <div className="flex items-center gap-4 text-orange-400">
              <span className="text-2xl">⚡</span>
              <h2 className="text-2xl font-black uppercase tracking-tight">Orchestration Nodes</h2>
            </div>
            <div className="p-8 bg-orange-500/5 border border-orange-500/20 rounded-[2rem] space-y-6">
              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">n8n Webhook Endpoint</label>
                 <input 
                    type="text" 
                    readOnly 
                    value="https://n8n.astromedia.internal/webhook/dispatch"
                    className="w-full bg-black/40 border border-slate-800 rounded-xl p-4 text-xs text-orange-400 font-mono"
                 />
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-4 bg-orange-600/20 text-orange-400 border border-orange-600/30 rounded-xl text-[10px] font-black uppercase tracking-widest">Test Handshake</button>
                <button className="flex-1 py-4 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest">View Logs</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-8 animate-slideInRight">
             <div className="flex items-center gap-4 text-blue-400">
              <span className="text-2xl">👤</span>
              <h2 className="text-2xl font-black uppercase tracking-tight">Identity Management</h2>
            </div>
            <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[2rem] flex items-center gap-8">
               <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl" />
               <div className="space-y-2">
                  <h4 className="text-2xl font-black uppercase tracking-tight text-white">John Doe</h4>
                  <p className="text-slate-500 font-medium">Enterprise Architect • JD-01-V4</p>
                  <div className="flex gap-2 pt-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-500/20">Admin</span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-500/20">Pro Tier</span>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center pt-8 opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">AstroMedia v4.2.0 • Build ID: f29a-99b1</p>
      </div>
    </div>
  );
};
