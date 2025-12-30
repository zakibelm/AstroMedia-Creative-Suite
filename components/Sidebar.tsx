
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../services/i18n';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { name: t('nav.dashboard'), path: '/', icon: '📊' },
    { name: t('nav.agents'), path: '/agents', icon: '🤖' },
    { name: t('nav.campaign'), path: '/campaigns', icon: '🚀' },
    { name: t('nav.studio'), path: '/studio', icon: '🎨' },
    { name: t('nav.library'), path: '/library', icon: '📁' },
    { name: t('nav.analytics'), path: '/analytics', icon: '📈' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          AstroMedia
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Next-Gen Media Suite</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-link flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              isActive(item.path)
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium text-sm">{item.name}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div>
            <p className="text-sm font-semibold">{t('system.welcome')}</p>
            <p className="text-xs text-slate-400">{t('system.plan')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
