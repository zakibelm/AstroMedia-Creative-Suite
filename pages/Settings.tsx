
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { generateOAuthUrl, OAUTH_CONFIG } from '../services/oauth';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'n8n' | 'social'>('api');
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>(storage.getConnectedAccounts());
  const [tokens, setTokens] = useState<Record<string, string>>(storage.getTokens());
  const [showDevDetails, setShowDevDetails] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security check: ensure the message comes from our own origin
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_SUCCESS') {
        const { platform, token } = event.data;
        setConnectedAccounts(storage.getConnectedAccounts());
        setTokens(storage.getTokens());
        alert(`Successfully linked ${platform}! Token has been securely cached.`);
      }

      if (event.data?.type === 'OAUTH_ERROR') {
        alert(`Authentication failed: ${event.data.error}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRealConnect = (platform: keyof typeof OAUTH_CONFIG) => {
    const url = generateOAuthUrl(platform);
    
    // Open the platform's actual authorization page in a centered popup
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
                        connectedAccounts[p] ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {p === 'twitter' ? '𝕏' : p === 'linkedin' ? '💼' : '👤'}
                      </div>
                      <div>
                        <h4 className="font-black text-white capitalize tracking-tight">{p}</h4>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${
                          connectedAccounts[p] ? 'text-emerald-500' : 'text-slate-500'
                        }`}>
                          {connectedAccounts[p] ? 'Access Authorized' : 'Pending Authorization'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {connectedAccounts[p] ? (
                    <div className="space-y-4">
                       <div className="p-3 bg-black/40 rounded-xl border border-slate-800 flex justify-between items-center group">
                          <div className="min-w-0">
                            <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Bearer Token Hash</p>
                            <p className="text-[10px] font-mono text-emerald-400 truncate group-hover:text-emerald-300">
                              {tokens[p] || '••••••••••••••••'}
                            </p>
                          </div>
                          <button 
                            className="p-2 text-slate-600 hover:text-white transition-colors"
                            onClick={() => {navigator.clipboard.writeText(tokens[p] || '')}}
                            title="Copy Token"
                          >📋</button>
                       </div>
                       <button
                        onClick={() => handleDisconnect(p)}
                        className="w-full py-3 bg-slate-800 text-red-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-slate-700 shadow-lg"
                      >
                        Terminate Session
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRealConnect(p)}
                      className="w-full py-4 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                    >
                      <span className="group-hover:rotate-12 transition-transform">🔒</span>
                      Launch {p} Handshake
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-[2.5rem] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">🔐</div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Security Protocol Registry</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Our OAuth implementation follows the <strong>Authorization Code Flow with PKCE</strong>. 
                Bearer tokens are stored in an encrypted client-side vault. In production, these should be 
                stored as <code>HttpOnly Secure SameSite=Strict</code> cookies to mitigate XSS risks.
              </p>
            </div>
          </div>
        )}

        {/* Intelligence Tab */}
        {activeTab === 'api' && (
          <div className="space-y-8 animate-slideInRight">
            <div className="flex items-center gap-4 text-purple-400">
               <span className="text-2xl">🔑</span>
               <h2 className="text-2xl font-black uppercase tracking-tight">Intelligence Parameters</h2>
            </div>
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 text-xl">✓</div>
                  <div>
                    <p className="font-bold text-white">Gemini Pro/Flash 2.5</p>
                    <p className="text-xs text-emerald-400 font-medium">Securely loaded via environment context</p>
                  </div>
               </div>
               <code className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-500 tracking-tighter">NODE_ENV: ACTIVE</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
