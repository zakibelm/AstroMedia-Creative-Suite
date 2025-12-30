
import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { n8nService } from '../../services/n8n';
import { MediaAsset, SocialPost } from '../../types';

export const SocialPublisher: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [platform, setPlatform] = useState<SocialPost['platform']>('twitter');
  const [caption, setCaption] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<Record<string, boolean>>(storage.getConnectedAccounts());
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);

  useEffect(() => {
    setAssets(storage.getAssets());
    setPosts(storage.getPosts());
    
    const interval = setInterval(() => {
      setPosts(storage.getPosts());
      setConnectedAccounts(storage.getConnectedAccounts());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = (p: string) => {
    setConnectingPlatform(p);
    // Simulate OAuth flow with a realistic delay
    setTimeout(() => {
      storage.setAccountConnection(p, true);
      setConnectedAccounts(storage.getConnectedAccounts());
      setConnectingPlatform(null);
    }, 1800);
  };

  const handleDisconnect = (p: string) => {
    if (confirm(`Unlink your ${p} account? This will prevent automatic deployment for this platform.`)) {
      storage.setAccountConnection(p, false);
      setConnectedAccounts(storage.getConnectedAccounts());
    }
  };

  const handlePublish = async () => {
    if (!selectedMediaId || !caption || !connectedAccounts[platform]) return;
    
    setIsPublishing(true);
    try {
      await n8nService.publishPost({
        mediaId: selectedMediaId,
        platform,
        caption
      });
      setCaption('');
      setSelectedMediaId(null);
      alert('Post successfully dispatched to n8n orchestration workflow!');
    } catch (e) {
      alert('Transmission failed. Check network orchestration logs.');
    } finally {
      setIsPublishing(false);
    }
  };

  const selectedAsset = assets.find(a => a.id === selectedMediaId);
  const isPlatformConnected = connectedAccounts[platform];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
      {/* Compose Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tight text-white">Broadcast Console</h3>
        
        <div className="space-y-6">
          {/* 1. Account Connectivity */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Cloud Service Status</label>
            <div className="grid grid-cols-2 gap-3">
              {(['twitter', 'linkedin', 'instagram', 'facebook'] as const).map((p) => (
                <div 
                  key={p} 
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    connectedAccounts[p] ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg opacity-80">{p === 'twitter' ? '𝕏' : p === 'linkedin' ? '💼' : p === 'instagram' ? '📸' : '👤'}</span>
                    <span className="text-[10px] font-bold capitalize text-slate-300">{p}</span>
                  </div>
                  {connectedAccounts[p] ? (
                    <button 
                      onClick={() => handleDisconnect(p)}
                      className="text-[9px] font-black text-slate-500 hover:text-red-400 uppercase tracking-tighter transition-colors"
                    >
                      Unlink
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleConnect(p)}
                      disabled={connectingPlatform === p}
                      className="px-3 py-1 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-lg text-[9px] font-black uppercase hover:bg-purple-600 hover:text-white transition-all flex items-center gap-1"
                    >
                      {connectingPlatform === p ? (
                        <div className="w-2 h-2 border border-purple-400 border-t-white rounded-full animate-spin" />
                      ) : null}
                      {connectingPlatform === p ? 'Linking' : 'Connect'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">1. Select Visual Content</label>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedMediaId(asset.id)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl border-2 transition-all relative overflow-hidden ${
                    selectedMediaId === asset.id ? 'border-purple-500 scale-105 shadow-xl shadow-purple-500/20' : 'border-slate-800 opacity-60'
                  }`}
                >
                  <img src={asset.url} className="w-full h-full object-cover" />
                  {asset.type === 'video' && <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] text-xs">🎬</div>}
                </button>
              ))}
              {assets.length === 0 && (
                <div className="w-full h-24 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 border-dashed rounded-xl text-[10px] text-slate-500 px-6 text-center">
                  <span className="text-xl mb-1 opacity-20">📁</span>
                  Warehouse Empty. Generate content first.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">2. Target Destination</label>
            <div className="grid grid-cols-4 gap-3">
              {(['twitter', 'linkedin', 'instagram', 'facebook'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all relative ${
                    platform === p ? 'bg-slate-700 border-white text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {p}
                  {connectedAccounts[p] && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1 mb-2">3. Composition & Narrative</label>
            <textarea
              className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-5 text-white outline-none focus:ring-2 focus:ring-purple-500 transition-all h-36 resize-none font-medium text-sm shadow-inner"
              placeholder="Inject your high-conversion brand voice here..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <button
            onClick={handlePublish}
            disabled={isPublishing || !selectedMediaId || !caption || !isPlatformConnected}
            className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-2xl active:scale-[0.98] ${
              isPlatformConnected 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-purple-500/30' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {!isPlatformConnected 
               ? `Unauthorized: Connect ${platform.charAt(0).toUpperCase() + platform.slice(1)} Above` 
               : (isPublishing ? 'Transmitting to Cloud Hub...' : '🚀 Broadcast Now')}
          </button>
        </div>
      </div>

      {/* History/Status Section */}
      <div className="space-y-6">
        <h3 className="text-xl font-black uppercase tracking-tight text-white">Orchestration Logs</h3>
        <div className="space-y-4 max-h-[650px] overflow-y-auto pr-4 custom-scrollbar bg-slate-900/20 p-6 rounded-[2.5rem] border border-slate-800/50">
          {posts.length === 0 && (
            <div className="py-24 text-center text-slate-600 border border-slate-800/50 rounded-3xl border-dashed">
              <div className="text-5xl mb-4 opacity-10">📡</div>
              <p className="font-bold text-xs uppercase tracking-widest opacity-40">No active transmissions detected.</p>
            </div>
          )}
          {posts.map((post) => (
            <div key={post.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex gap-5 items-center group hover:border-slate-700 transition-all shadow-sm">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-slate-800 shadow-inner">
                <img src={assets.find(a => a.id === post.mediaId)?.url} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{post.platform} • {new Date(post.publishedAt || Date.now()).toLocaleTimeString()}</span>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                    post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                    post.status === 'failed' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 animate-pulse'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <p className="text-xs truncate text-slate-400 font-medium italic">"{post.caption}"</p>
                <div className="mt-3 flex items-center justify-between border-t border-slate-800/50 pt-2">
                   <p className="text-[9px] text-slate-600 font-mono tracking-tighter">JOB_ID: {post.jobId}</p>
                   {post.status === 'published' && <button className="text-[10px] text-blue-400 font-black uppercase tracking-widest hover:text-blue-300 transition-colors">Audit Node</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-6 bg-slate-800/30 border border-slate-700/30 rounded-[2rem] text-[10px] text-slate-500 leading-relaxed font-medium italic">
           All social transmissions are routed through a <strong>multi-agent n8n workflow</strong> featuring automated sentiment balancing and optimal window scheduling.
        </div>
      </div>
    </div>
  );
};
