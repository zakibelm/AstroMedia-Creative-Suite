
import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { n8nService } from '../../services/n8n';
import { generateOAuthUrl } from '../../services/oauth';
import { MediaAsset, SocialPost } from '../../types';
import { useTranslation } from '../../services/i18n';

export const SocialPublisher: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<SocialPost['platform']>('twitter');
  const [caption, setCaption] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>(storage.getConnectedAccounts());
  const { t } = useTranslation();

  useEffect(() => {
    setAssets(storage.getAssets());
    setPosts(storage.getPosts());
    const interval = setInterval(() => {
      setPosts(storage.getPosts());
      setConnectedAccounts(storage.getConnectedAccounts());
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handlePublish = async () => {
    if (!selectedMediaId || !caption || !connectedAccounts[platform]) return;
    setIsPublishing(true);
    try {
      await n8nService.publishPost({ mediaId: selectedMediaId, platform, caption });
      setCaption('');
      setSelectedMediaId(null);
    } finally {
      setIsPublishing(false);
    }
  };

  const isPlatformConnected = connectedAccounts[platform];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fadeIn">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-purple-500 rounded-full" />
          <h3 className="text-2xl font-black uppercase tracking-tight text-white">{t('publish.title')}</h3>
        </div>
        
        <div className="space-y-8 bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('publish.auth')}</label>
            <div className="grid grid-cols-2 gap-3">
              {(['twitter', 'linkedin', 'facebook'] as const).map((p) => (
                <div key={p} className={`p-4 rounded-2xl border flex items-center justify-between ${connectedAccounts[p] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                  <span className="text-[10px] font-black uppercase text-slate-300">{p}</span>
                  {connectedAccounts[p] ? <span className="text-[8px] text-emerald-500 font-bold">ON</span> : <span className="text-[8px] text-slate-600 font-bold">OFF</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('publish.source')}</label>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {assets.map((asset) => (
                <button key={asset.id} onClick={() => setSelectedMediaId(asset.id)} className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all overflow-hidden ${selectedMediaId === asset.id ? 'border-purple-500 scale-105' : 'border-slate-800 opacity-50'}`}>
                  <img src={asset.url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('publish.target')}</label>
            <div className="flex gap-2">
              {(['twitter', 'linkedin', 'facebook'] as const).map((p) => (
                <button key={p} onClick={() => setPlatform(p)} className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest ${platform === p ? 'bg-slate-800 border-white text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('publish.narrative')}</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white text-xs min-h-[120px] outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <button
            onClick={handlePublish}
            disabled={isPublishing || !selectedMediaId || !caption || !isPlatformConnected}
            className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${isPlatformConnected ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'bg-slate-800 text-slate-600'}`}
          >
            {isPublishing ? '...' : t('publish.execute')}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-black uppercase tracking-tight text-white">{t('publish.logs')}</h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto no-scrollbar">
          {posts.map((post) => (
            <div key={post.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-4 items-center">
              <div className="w-16 h-16 rounded-lg bg-black overflow-hidden flex-shrink-0">
                <img src={assets.find(a => a.id === post.mediaId)?.url} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <span className="text-[10px] font-black uppercase text-white">{post.platform}</span>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>{post.status}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate mt-1">"{post.caption}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
