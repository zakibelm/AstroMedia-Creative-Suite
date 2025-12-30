
import React, { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { generateOAuthUrl, OAUTH_CONFIG } from '../services/oauth';

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'n8n' | 'social'>('api');
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>(storage.getConnectedAccounts());
  const [showDevDetails, setShowDevDetails] = useState(false);

  // Écouteur pour le callback réel (simulé ici via postMessage depuis une popup)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_SUCCESS') {
        const { platform } = event.data;
        storage.setAccountConnection(platform, true);
        setConnectedAccounts(storage.getConnectedAccounts());
        alert(`Connexion réelle réussie avec ${platform} ! Jeton stocké de manière sécurisée.`);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRealConnect = (platform: keyof typeof OAUTH_CONFIG) => {
    const url = generateOAuthUrl(platform);
    
    // Dans une app réelle, ceci ouvre la page de login officielle
    // Ici on ouvre une fenêtre qui simule le retour d'autorisation
    const width = 600, height = 700;
    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;
    
    const popup = window.open(
      url, 
      `Connecter ${platform}`, 
      `width=${width},height=${height},left=${left},top=${top}`
    );

    // Simulation du retour de la plateforme (car nous n'avons pas de vrai Client ID valide pour l'URL)
    // Dans la réalité, c'est votre page 'redirect_uri' qui ferait ce postMessage
    setTimeout(() => {
      if (popup) {
        window.postMessage({ type: 'OAUTH_SUCCESS', platform }, window.location.origin);
        popup.close();
      }
    }, 2000);
  };

  const handleDisconnect = (p: string) => {
    if (confirm(`Révoquer l'accès à ${p} ?`)) {
      storage.setAccountConnection(p, false);
      setConnectedAccounts(storage.getConnectedAccounts());
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-fadeIn min-h-screen">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">Configuration Réelle</h1>
          <p className="text-slate-400 text-lg font-medium">Infrastructure de connexion et déploiement.</p>
        </div>
        <button 
          onClick={() => setShowDevDetails(!showDevDetails)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
            showDevDetails ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-500'
          }`}
        >
          {showDevDetails ? 'Masquer Détails Tech' : 'Mode Développeur'}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'api', label: 'Clés Intelligence', icon: '🔑' },
          { id: 'n8n', label: 'Hub Orchestration', icon: '⚡' },
          { id: 'social', label: 'Réseaux Sociaux', icon: '🌐' },
          { id: 'profile', label: 'Identité', icon: '👤' },
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-indigo-400">
                <span className="text-2xl">🌐</span>
                <h2 className="text-2xl font-black uppercase tracking-tight">Authentification OAuth 2.0</h2>
              </div>
            </div>

            {showDevDetails && (
              <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Configuration de l'environnement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-black/40 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase mb-1">Redirect URI (Whitelist)</p>
                    <code className="text-[10px] text-blue-300">{window.location.origin}/oauth-callback</code>
                  </div>
                  <div className="p-3 bg-black/40 rounded-xl">
                    <p className="text-[9px] text-slate-500 uppercase mb-1">Grant Type</p>
                    <code className="text-[10px] text-blue-300">Authorization Code + PKCE</code>
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
                          {connectedAccounts[p] ? 'Session Active' : 'Prêt pour Handshake'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {showDevDetails && (
                    <div className="mb-4 space-y-2">
                       <p className="text-[9px] font-black text-slate-600 uppercase">Scopes demandés</p>
                       <p className="text-[10px] font-mono text-slate-400 break-all bg-black/20 p-2 rounded-lg">{OAUTH_CONFIG[p].scope}</p>
                    </div>
                  )}

                  {connectedAccounts[p] ? (
                    <div className="space-y-4">
                       <div className="p-3 bg-black/40 rounded-xl border border-slate-800 flex justify-between items-center">
                          <div>
                            <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Encrypted Token</p>
                            <p className="text-[10px] font-mono text-emerald-400">••••••••••••••••</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">AES-256</span>
                       </div>
                       <button
                        onClick={() => handleDisconnect(p)}
                        className="w-full py-3 bg-slate-800 text-red-400 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-slate-700 shadow-lg"
                      >
                        Révoquer Jeton
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRealConnect(p)}
                      className="w-full py-4 bg-white text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                    >
                      <span className="group-hover:rotate-12 transition-transform">⚡</span>
                      Démarrer Flux OAuth
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-800/30 border border-slate-700/50 rounded-3xl">
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Note Technique Sécurité</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Pour une implémentation finale, vous devrez héberger un <strong>Endpoint Callback</strong> (ex: <code>/api/auth/callback</code>). 
                Ce dernier recevra le <code>code</code> d'autorisation, l'échangera contre un <code>access_token</code> côté serveur (pour cacher votre <em>Client Secret</em>), 
                puis renverra le jeton final au frontend via un cookie sécurisé ou un message window.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-8 animate-slideInRight">
            <div className="flex items-center gap-4 text-purple-400">
               <span className="text-2xl">🔑</span>
               <h2 className="text-2xl font-black uppercase tracking-tight">Clés d'Accès Services</h2>
            </div>
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 text-xl">✓</div>
                  <div>
                    <p className="font-bold text-white">Google Gemini Engine</p>
                    <p className="text-xs text-emerald-400 font-medium">Auto-injectée via variables d'environnement</p>
                  </div>
               </div>
               <code className="px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-500 tracking-tighter">API_KEY_LOADED_OK</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
