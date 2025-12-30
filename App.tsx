
import React, { useState } from 'react';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { CreativeStudio } from './pages/CreativeStudio';
import { CampaignBuilder } from './pages/CampaignBuilder';
import { ContentLibrary } from './pages/ContentLibrary';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { AiAgentTeam } from './pages/AiAgentTeam';
import { NanoBananaLab } from './pages/NanoBananaLab';
import { OAuthCallback } from './pages/OAuthCallback';
import { I18nContext, Language, translations } from './services/i18n';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('fr');

  const t = (path: string) => {
    return path.split('.').reduce((obj, key) => (obj as any)?.[key], translations[lang]) || path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      <Router>
        <div className="flex bg-[#0f172a] text-slate-100 min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen transition-all">
            <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-40">
              <div className="flex items-center gap-2">
                 <span className="text-emerald-500 animate-pulse">●</span>
                 <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                   NOMINAL STATUS: SYSTEM ALPHA
                 </span>
              </div>
              
              <div className="flex gap-6 items-center">
                {/* Language Switcher */}
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button 
                    onClick={() => setLang('fr')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${lang === 'fr' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    FR
                  </button>
                  <button 
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 text-[10px] font-black rounded-lg transition-all ${lang === 'en' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    EN
                  </button>
                </div>

                <button className="text-xl hover:text-purple-400 transition-all">🔔</button>
                <Link to="/settings" className="text-xl hover:text-purple-400 transition-all">⚙️</Link>
                <div className="h-8 w-px bg-slate-800" />
                <div className="flex items-center gap-3">
                   <span className="text-sm font-semibold hidden md:block">JD-Enterprise-01</span>
                   <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700" />
                </div>
              </div>
            </header>
            
            <div className="pb-20">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/studio" element={<CreativeStudio />} />
                <Route path="/agents" element={<AiAgentTeam />} />
                <Route path="/nanobanana" element={<NanoBananaLab />} />
                <Route path="/campaigns" element={<CampaignBuilder />} />
                <Route path="/library" element={<ContentLibrary />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/oauth-callback" element={<OAuthCallback />} />
                <Route path="*" element={<Dashboard />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </I18nContext.Provider>
  );
};

export default App;
