
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../services/storage';
import { useNavigate } from 'react-router-dom';
import { Campaign } from '../types';
import { useTranslation } from '../services/i18n';

const data = [
  { name: 'Mon', reach: 4000 },
  { name: 'Tue', reach: 3000 },
  { name: 'Wed', reach: 2000 },
  { name: 'Thu', reach: 2780 },
  { name: 'Fri', reach: 1890 },
  { name: 'Sat', reach: 2390 },
  { name: 'Sun', reach: 3490 },
];

export const Dashboard: React.FC = () => {
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const navigate = useNavigate();
  const { t, lang } = useTranslation();

  useEffect(() => {
    setRecentAssets(storage.getAssets().slice(0, 3));
    setRecentPosts(storage.getPosts().slice(0, 3));
    
    const allCampaigns = storage.getCampaigns();
    const now = new Date();
    
    const processedCampaigns = allCampaigns.map(c => {
      if (c.status === 'scheduled' && c.scheduledAt && new Date(c.scheduledAt) <= now) {
        return { ...c, status: 'active' as const };
      }
      return c;
    });
    
    setCampaigns(processedCampaigns.slice(0, 5));
  }, []);

  const getStatusColor = (status: Campaign['status']) => {
    switch(status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'scheduled': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'draft': return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'completed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">{t('dashboard.title')}</h2>
          <p className="text-slate-400 font-medium">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/campaigns')}
            className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-purple-500/20 hover:scale-105 transition-all active:scale-95"
          >
            {t('dashboard.initiate')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('dashboard.stats.reach'), val: '142.8k', change: '+12.5%', color: 'text-blue-400' },
          { label: t('dashboard.stats.conversion'), val: '4.2%', change: '+0.8%', color: 'text-emerald-400' },
          { label: t('dashboard.stats.throughput'), val: '892', change: '+24', color: 'text-purple-400' },
          { label: t('dashboard.stats.roi'), val: '3.8x', change: '+0.4x', color: 'text-amber-400' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-[2rem] border-slate-800/50 hover:border-slate-700 transition-all group">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 group-hover:text-slate-400 transition-colors">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className={`text-3xl font-black ${stat.color}`}>{stat.val}</h3>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[3rem] border-slate-800/50">
            <h3 className="text-lg font-black uppercase tracking-tight mb-8 text-white">{t('dashboard.intelligence')}</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 'bold' }} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tick={{ fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '24px' }}
                    itemStyle={{ color: '#f8fafc', fontWeight: '900', textTransform: 'uppercase', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="reach" stroke="#8b5cf6" strokeWidth={5} fill="url(#colorReach)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass p-8 rounded-[3rem] border-slate-800/50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase tracking-tight text-white">{t('dashboard.pipeline')}</h3>
              <button onClick={() => navigate('/campaigns')} className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest">{t('dashboard.viewAll')}</button>
            </div>
            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="py-12 text-center text-slate-600 border border-dashed border-slate-800 rounded-3xl">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50">Pipeline vide.</p>
                </div>
              ) : campaigns.map(campaign => (
                <div key={campaign.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-slate-800 border border-slate-700`}>
                      {campaign.status === 'scheduled' ? '⏳' : '🚀'}
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm uppercase tracking-tight">{campaign.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full border ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        {campaign.status === 'scheduled' && campaign.scheduledAt && (
                          <span className="text-[10px] font-mono text-blue-400 font-bold">
                            T- {new Date(campaign.scheduledAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="glass p-8 rounded-[3rem] border-slate-800/50 h-full">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 border-b border-slate-800 pb-4">{t('dashboard.ingestions')}</h3>
              <div className="space-y-4">
                 {recentAssets.map((asset, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all group cursor-pointer">
                       <div className="w-14 h-14 rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
                          <img src={asset.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       </div>
                       <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">Asset_{asset.id.slice(0, 8)}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">{asset.type} • {new Date(asset.createdAt).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</p>
                       </div>
                    </div>
                 ))}
                 <button onClick={() => navigate('/library')} className="w-full py-4 bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-purple-400 hover:bg-slate-800 hover:text-purple-300 rounded-2xl border border-slate-800/50 transition-all">
                   {t('dashboard.openVault')}
                 </button>
              </div>

              <div className="mt-12 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 border-b border-slate-800 pb-4">{t('dashboard.transmission')}</h3>
                <div className="space-y-3">
                  {recentPosts.map((post, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-900/80 rounded-2xl border border-slate-800">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{post.platform}</p>
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20 animate-pulse'}`}>
                            {post.status.toUpperCase()}
                        </span>
                      </div>
                  ))}
                  <button onClick={() => navigate('/studio')} className="w-full py-4 bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-slate-800 hover:text-blue-300 rounded-2xl border border-slate-800/50 transition-all">
                    {t('dashboard.goStudio')}
                  </button>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
