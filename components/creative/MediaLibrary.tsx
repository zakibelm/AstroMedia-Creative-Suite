
import React, { useState, useEffect } from 'react';
import { storage } from '../../services/storage';
import { MediaAsset, Campaign } from '../../types';
import { useNavigate } from 'react-router-dom';

export const MediaLibrary: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [filterCampaign, setFilterCampaign] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAssets(storage.getAssets());
    setCampaigns(storage.getCampaigns());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this asset? This action cannot be undone.')) {
      storage.deleteAsset(id);
      setAssets(storage.getAssets());
      if (selectedAsset?.id === id) setSelectedAsset(null);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesCampaign = filterCampaign === 'all' || 
                           (filterCampaign === 'Unassigned' && !asset.campaignId) || 
                           asset.campaignId === filterCampaign;
    const matchesSearch = asset.prompt.toLowerCase().includes(search.toLowerCase()) || 
                          JSON.stringify(asset.metadata).toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesCampaign && matchesSearch;
  });

  const getCampaignName = (id?: string) => {
    if (!id) return 'Unassigned';
    return campaigns.find(c => c.id === id)?.name || 'Unknown Campaign';
  };

  const getVideoStyles = (asset: MediaAsset) => {
    const styles: React.CSSProperties = {};
    const f = asset.metadata?.filter;
    if (f) {
      const filterMap: Record<string, string> = {
        grayscale: 'grayscale(100%)',
        sepia: 'sepia(100%)',
        warm: 'contrast(120%) saturate(150%) sepia(20%)',
        cool: 'contrast(110%) saturate(120%) hue-rotate(180deg)',
        noir: 'grayscale(100%) contrast(150%) brightness(80%)'
      };
      if (filterMap[f]) styles.filter = filterMap[f];
    }
    return styles;
  };

  const handleVideoRef = (el: HTMLVideoElement | null, asset: MediaAsset) => {
    if (el && asset.metadata?.playbackSpeed) {
      el.playbackRate = asset.metadata.playbackSpeed;
    }
    if (el && asset.metadata?.trim) {
      el.ontimeupdate = () => {
        if (el.currentTime < asset.metadata.trim.start) {
          el.currentTime = asset.metadata.trim.start;
        }
        if (el.currentTime > asset.metadata.trim.end) {
          el.currentTime = asset.metadata.trim.start;
        }
      };
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Filtering Header */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between p-6 bg-slate-900/50 rounded-3xl border border-slate-800">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">Asset Category</span>
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              {['all', 'image', 'video'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t as any)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    filterType === t ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">Campaign Association</span>
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none min-w-[200px] transition-all"
            >
              <option value="all">Global (All Campaigns)</option>
              <option value="Unassigned">Unassigned Assets</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full lg:w-96 space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">Metadata Discovery</span>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">🔍</span>
            <input
              type="text"
              placeholder="Search prompt, style, or metadata..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/10 text-center px-10 animate-pulse">
          <div className="text-7xl mb-6 opacity-10">📁</div>
          <h3 className="text-xl font-bold text-slate-400 mb-2">No Approved Media Assets Found</h3>
          <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
            Assets appear here once they are generated and saved from the Creative Studio tabs.
          </p>
          <button 
            onClick={() => navigate('/studio')}
            className="mt-6 px-6 py-3 bg-slate-800 text-purple-400 font-bold rounded-xl border border-purple-500/20 hover:bg-slate-700 transition-all cursor-pointer"
          >
            Return to Studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id} 
              onClick={() => setSelectedAsset(asset)}
              className="group relative bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/5 transition-all cursor-pointer"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-black">
                {asset.type === 'video' ? (
                  <video 
                    src={asset.url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                    muted 
                    playsInline 
                    style={getVideoStyles(asset)}
                    ref={(el) => handleVideoRef(el, asset)}
                  />
                ) : (
                  <img 
                    src={asset.url} 
                    alt={asset.prompt} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                  />
                )}
                
                {/* Meta Tags */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black tracking-widest text-white border border-white/10 uppercase">
                    {asset.type}
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                   <div className="w-full flex justify-between items-center translate-y-4 group-hover:translate-y-0 transition-transform">
                     <span className="text-[10px] font-black text-white tracking-widest uppercase">Inspect Details</span>
                     <div className="flex gap-2">
                        <button className="p-2 bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-all">📥</button>
                     </div>
                   </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                <p className="text-xs text-slate-300 line-clamp-2 font-medium leading-relaxed italic">
                  "{asset.prompt}"
                </p>
                <div className="flex justify-between items-center pt-3 border-t border-slate-800/50">
                   <div className="flex flex-col">
                     <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Campaign</span>
                     <span className="text-[10px] font-bold text-purple-400 truncate max-w-[140px]">
                       {getCampaignName(asset.campaignId)}
                     </span>
                   </div>
                   <button 
                    onClick={(e) => handleDelete(asset.id, e)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-red-500/20 text-slate-500 hover:text-red-500 transition-all border border-slate-800"
                    title="Delete Asset"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] max-w-7xl w-full max-h-[92vh] overflow-hidden flex flex-col lg:flex-row shadow-[0_0_100px_rgba(139,92,246,0.1)] relative text-white">
             
             {/* Preview Side */}
             <div className="lg:w-3/5 bg-[#050505] flex items-center justify-center relative overflow-hidden">
                {selectedAsset.type === 'video' ? (
                  <video 
                    src={selectedAsset.url} 
                    controls 
                    className="max-h-full w-full object-contain" 
                    autoPlay
                    loop
                    style={getVideoStyles(selectedAsset)}
                    ref={(el) => handleVideoRef(el, selectedAsset)}
                  />
                ) : (
                  <img src={selectedAsset.url} className="max-h-full w-full object-contain" />
                )}
                
                <div className="absolute top-8 left-8 flex flex-col gap-3">
                  <span className="bg-black/60 backdrop-blur-lg px-5 py-2 rounded-full text-[10px] font-black border border-white/10 uppercase tracking-[0.2em] shadow-xl">
                    {selectedAsset.type} Engine Input
                  </span>
                  {selectedAsset.metadata?.playbackSpeed && (
                    <span className="bg-blue-600/80 backdrop-blur-lg px-5 py-2 rounded-full text-[10px] font-black border border-white/10 uppercase tracking-widest shadow-xl">
                      {selectedAsset.metadata.playbackSpeed}x SPD Rate
                    </span>
                  )}
                </div>
             </div>

             {/* Metadata Side */}
             <div className="lg:w-2/5 p-12 space-y-10 overflow-y-auto custom-scrollbar bg-slate-900/40">
                <div className="flex justify-between items-start">
                   <div className="space-y-1.5">
                     <h3 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase">
                       Intelligence Analysis
                     </h3>
                     <p className="text-slate-500 text-sm font-semibold tracking-wide">Registered {new Date(selectedAsset.createdAt).toLocaleString()}</p>
                   </div>
                   <button 
                    onClick={() => setSelectedAsset(null)}
                    className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-xl hover:bg-slate-700 transition-all border border-slate-700 group"
                   >
                     <span className="group-hover:rotate-90 transition-transform">✕</span>
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Assigned Target</p>
                    <p className="text-sm font-bold text-purple-400 truncate">{getCampaignName(selectedAsset.campaignId)}</p>
                  </div>
                  <div className="bg-slate-800/40 p-5 rounded-3xl border border-slate-700/50 shadow-inner">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">System Reference</p>
                    <p className="text-xs font-mono text-slate-400 select-all">UID-{selectedAsset.id.slice(0, 12)}</p>
                  </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-slate-800 pb-2">Generative Directive</h4>
                   <div className="bg-black/40 p-8 rounded-[2rem] border border-slate-800 text-sm text-slate-400 leading-relaxed font-medium italic shadow-inner">
                      "{selectedAsset.prompt}"
                   </div>
                </div>

                <div className="space-y-4">
                   <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 border-b border-slate-800 pb-2">Technical Registry</h4>
                   <div className="grid grid-cols-1 gap-3.5">
                      {Object.entries(selectedAsset.metadata).map(([k, v]) => (
                        <div key={k} className="bg-slate-800/20 px-6 py-4 rounded-2xl border border-slate-800/50 flex justify-between items-center group hover:bg-slate-800/40 transition-all">
                           <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter group-hover:text-slate-400">{k.replace(/([A-Z])/g, ' $1')}</p>
                           <p className="text-xs font-bold text-slate-200 truncate max-w-[220px]">
                             {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                           </p>
                        </div>
                      ))}
                      <div className="bg-slate-800/20 px-6 py-4 rounded-2xl border border-slate-800/50 flex justify-between items-center group">
                           <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter">Asset Type</p>
                           <p className="text-xs font-bold text-slate-200 uppercase tracking-widest">{selectedAsset.type}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-10 flex flex-col sm:flex-row gap-5">
                   <button className="flex-1 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-purple-500/20 active:scale-[0.98]">
                     🚀 Launch Deployment
                   </button>
                   <button className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] transition-all border border-slate-700 active:scale-[0.98]">
                     📥 Sync High-Res
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
