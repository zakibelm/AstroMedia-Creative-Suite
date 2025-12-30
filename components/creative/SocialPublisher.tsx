
import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { n8nService } from '../../services/n8n';
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
  const { t, lang } = useTranslation();

  useEffect(() => {
    setAssets(storage.getAssets());
    setPosts(storage.getPosts());
    
    // Real-time synchronization for status updates and account changes
    const interval = setInterval(() => {
      setPosts(storage.getPosts());
      const currentAccounts = storage.getConnectedAccounts();
      setConnectedAccounts(prev => {
        if (JSON.stringify(prev) !== JSON.stringify(currentAccounts)) return currentAccounts;
        return prev;
      });
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);

  const handlePublish = async () => {
    if (!selectedMediaId || !caption || !connectedAccounts[platform]) return;
    setIsPublishing(true);
    try {
      await n8nService.publishPost({ 
        mediaId: selectedMediaId, 
        platform, 
        caption,
        scheduledFor: new Date().toISOString() // Immediate for this demo
      });
      setCaption('');
      setSelectedMediaId(null);
    } finally {
      setIsPublishing(false);
    }
  };

  const isPlatformConnected = connectedAccounts[platform];

  const getPlatformIcon = (p: string) => {
    switch (p) {
      case 'twitter': return '𝕏';
      case 'linkedin': return 'in';
      case 'facebook': return 'f';
      case 'instagram': return '📸';
      default: return '🌐';
    }
  };

  const getStatusDisplay = (post: SocialPost) => {
    const dateStr = post.publishedAt || post.scheduledFor;
    const dateLabel = post.status === 'published' ? 'Published' : post.status === 'scheduled' ? 'Scheduled' : 'Failed';
    const formattedDate = dateStr ? new Date(dateStr).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '---';

    switch (post.status) {
      case 'published':
        return {
          color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
          label: dateLabel,
          time: formattedDate,
          icon: 'check'
        };
      case 'scheduled':
        return {
          color: 'text-blue-500 bg-blue-500/10 border-blue-500/20 animate-pulse',
          label: dateLabel,
          time: formattedDate,
          icon: 'clock'
        };
      case 'failed':
        return {
          color: 'text-red-500 bg-red-500/10 border-red-500/20',
          label: dateLabel,
          time: formattedDate,
          icon: 'alert'
        };
      default:
        return { color: 'text-slate-500 bg-slate-500/10', label: 'Unknown', time: '', icon: '' };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fadeIn">
      {/* Editor Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-purple-500 rounded-full" />
          <h3 className="text-2xl font-black uppercase tracking-tight text-white">{t('publish.title')}</h3>
        </div>
        
        <div className="space-y-8 bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 shadow-inner">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('publish.auth')}</label>
            <div className="grid grid-cols-3 gap-3">
              {(['twitter', 'linkedin', 'facebook'] as const).map((p) => (
                <div key={p} className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${connectedAccounts[p] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-800 opacity-60'}`}>
                  <span className="text-xl font-black text-slate-300">{getPlatformIcon(p)}</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${connectedAccounts[p] ? 'text-emerald-500' : 'text-slate-600'}`}>
                    {connectedAccounts[p] ? 'Linked' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('publish.source')}</label>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {assets.length === 0 ? (
                <div className="w-full h-24 rounded-2xl border border-dashed border-slate-800 flex items-center justify-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                  No assets in vault
                </div>
              ) : assets.map((asset) => (
                <button 
                  key={asset.id} 
                  onClick={() => setSelectedMediaId(asset.id)} 
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all overflow-hidden relative group ${selectedMediaId === asset.id ? 'border-purple-500 scale-105 shadow-lg shadow-purple-500/20' : 'border-slate-800 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'}`}
                >
                  <img src={asset.url} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-purple-600/20 transition-opacity ${selectedMediaId === asset.id ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('publish.target')}</label>
            <div className="flex gap-2">
              {(['twitter', 'linkedin', 'facebook'] as const).map((p) => (
                <button 
                  key={p} 
                  onClick={() => setPlatform(p)} 
                  className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${platform === p ? 'bg-slate-800 border-white text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                >
                  {getPlatformIcon(p)} {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('publish.narrative')}</label>
            <textarea
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white text-sm min-h-[140px] outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-slate-700"
              placeholder="Draft your viral message here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <button
            onClick={handlePublish}
            disabled={isPublishing || !selectedMediaId || !caption || !isPlatformConnected}
            className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.3em] transition-all transform active:scale-95 shadow-xl ${isPlatformConnected ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/30' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            {isPublishing ? 'Transmitting...' : t('publish.execute')}
          </button>
        </div>
      </div>

      {/* Logs Section */}
      <div className="space-y-8">
        <h3 className="text-2xl font-black uppercase tracking-tight text-white">{t('publish.logs')}</h3>
        <div className="space-y-4 max-h-[700px] overflow-y-auto no-scrollbar pr-2">
          {posts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-[2.5rem] text-slate-600">
               <span className="text-4xl mb-4">📡</span>
               <p className="text-[10px] font-black uppercase tracking-[0.2em]">Broadcast queue empty</p>
            </div>
          ) : posts.map((post) => {
            const media = assets.find(a => a.id === post.mediaId);
            const statusInfo = getStatusDisplay(post);
            return (
              <div 
                key={post.id} 
                className="bg-slate-900/60 border border-slate-800 p-5 rounded-[2rem] flex gap-5 items-start group hover:border-slate-700 transition-all"
              >
                <div className="w-20 h-20 rounded-2xl bg-black overflow-hidden flex-shrink-0 border border-white/5 relative group">
                  {media ? (
                    <img src={media.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-800 text-xs">ERR</div>
                  )}
                  <div className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-black/80 flex items-center justify-center text-[10px] font-black border border-white/10">
                    {getPlatformIcon(post.platform)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between h-20 py-1">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black uppercase text-white tracking-widest flex items-center gap-2">
                        {post.platform}
                      </span>
                      <div className={`text-[8px] font-black px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusInfo.color}`}>
                        <span className="w-1 h-1 rounded-full bg-current" />
                        {statusInfo.label}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate font-medium">"{post.caption}"</p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Job Node ID</span>
                      <span className="text-[10px] font-mono text-slate-500">{post.jobId.slice(0, 15)}...</span>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{statusInfo.time}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
