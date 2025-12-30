
import React, { useState, useEffect, useRef } from 'react';
import { startVideoGeneration, pollVideoOperation, fetchVideoData } from '../../services/gemini';
import { storage } from '../../services/storage';
import { Campaign } from '../../types';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [campaignId, setCampaignId] = useState<string>('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'processing' | 'done'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const pollInterval = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Editing States
  const [editMode, setEditMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [filter, setFilter] = useState('none');
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [duration, setVideoDuration] = useState(0);

  useEffect(() => {
    setCampaigns(storage.getCampaigns());
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    
    if (typeof window !== 'undefined' && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await (window as any).aistudio.openSelectKey();
        }
    }

    setStatus('submitting');
    setVideoUrl(null);
    setProgress(5);
    setEditMode(false);

    try {
      let operation = await startVideoGeneration(prompt, aspectRatio);
      setStatus('processing');
      
      pollInterval.current = setInterval(async () => {
        try {
            operation = await pollVideoOperation(operation);
            setProgress(prev => Math.min(prev + 2, 95));

            if (operation.done) {
                clearInterval(pollInterval.current);
                const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                if (downloadLink) {
                    const localUrl = await fetchVideoData(downloadLink);
                    setVideoUrl(localUrl);
                    setStatus('done');
                    setProgress(100);
                } else {
                    throw new Error("No download link received");
                }
            }
        } catch (e) {
            console.error("Polling error:", e);
            clearInterval(pollInterval.current);
            setStatus('idle');
            alert("Video generation failed or timed out.");
        }
      }, 5000);

    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert("Error starting video generation.");
    }
  };

  const handleMetadataLoaded = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const dur = e.currentTarget.duration;
    setVideoDuration(dur);
    setTrimEnd(dur);
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (video.currentTime < trimStart) {
      video.currentTime = trimStart;
    }
    if (video.currentTime > trimEnd) {
      video.currentTime = trimStart;
    }
  };

  const handleSave = () => {
    if (!videoUrl) return;
    storage.saveAsset({
      id: crypto.randomUUID(),
      type: 'video',
      url: videoUrl,
      prompt,
      createdAt: new Date().toISOString(),
      campaignId: campaignId || undefined,
      metadata: { 
        aspectRatio, 
        engine: 'Veo 3.1 Fast',
        playbackSpeed,
        filter,
        trim: { start: trimStart, end: trimEnd }
      }
    });
    alert("Video saved to library with edits applied!");
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, []);

  const filterStyles: Record<string, string> = {
    none: '',
    grayscale: 'grayscale(100%)',
    sepia: 'sepia(100%)',
    warm: 'contrast(120%) saturate(150%) sepia(20%)',
    cool: 'contrast(110%) saturate(120%) hue-rotate(180deg)',
    noir: 'grayscale(100%) contrast(150%) brightness(80%)'
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3">
        <span className="text-xl">💡</span>
        <p className="text-sm text-blue-300">
          Video generation using <strong>Veo 3.1</strong> can take 2-5 minutes. Post-processing edits are non-destructive.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {!editMode ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Cinematic Directive</label>
                <textarea
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none h-40 resize-none"
                  placeholder="Describe the motion, camera angles, and atmosphere..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                   <label className="block text-sm font-semibold text-slate-300 mb-2">Target Campaign</label>
                    <select 
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={campaignId}
                      onChange={(e) => setCampaignId(e.target.value)}
                    >
                      <option value="">No Campaign (General)</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Format</label>
                  <div className="flex gap-2">
                    {(['16:9', '9:16'] as const).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`flex-1 py-3 rounded-lg border transition-all ${
                          aspectRatio === ratio
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {ratio === '16:9' ? 'Landscape' : 'Portrait'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Resolution</label>
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 text-center font-medium">
                    1080p (HQ Fast)
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={status !== 'idle' || !prompt}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
                  status !== 'idle'
                    ? 'bg-slate-700 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg hover:shadow-blue-500/30'
                }`}
              >
                {status !== 'idle' ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating {progress}%</span>
                  </div>
                ) : '🎬 Initiate Veo Render'}
              </button>
            </>
          ) : (
            <div className="space-y-6 animate-slideInLeft">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Advanced Edit Controls</h3>
                <button 
                  onClick={() => setEditMode(false)}
                  className="text-xs text-slate-500 hover:text-white underline"
                >
                  Exit Edit Mode
                </button>
              </div>

              {/* Playback Speed */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-3 uppercase tracking-widest">Playback Velocity</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        playbackSpeed === speed ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-3 uppercase tracking-widest">Cinematic Filters</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(filterStyles).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`py-2 rounded-lg text-[10px] font-bold capitalize transition-all ${
                        filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trimming */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-400 uppercase tracking-widest">Time Clipping (Trim)</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">Start Point</span>
                    <input 
                      type="range" 
                      min="0" 
                      max={trimEnd} 
                      step="0.1"
                      value={trimStart}
                      onChange={(e) => setTrimStart(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-[10px] text-right mt-1 font-mono text-blue-400">{trimStart.toFixed(1)}s</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-1">End Point</span>
                    <input 
                      type="range" 
                      min={trimStart} 
                      max={duration} 
                      step="0.1"
                      value={trimEnd}
                      onChange={(e) => setTrimEnd(parseFloat(e.target.value))}
                      className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-[10px] text-right mt-1 font-mono text-cyan-400">{trimEnd.toFixed(1)}s</div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSave}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
                >
                  Confirm Edits & Save
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-full min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center relative shadow-inner">
          {videoUrl ? (
            <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
              <video 
                ref={videoRef}
                src={videoUrl} 
                controls 
                className="w-full h-full object-contain transition-all duration-500" 
                style={{ filter: filterStyles[filter] }}
                onLoadedMetadata={handleMetadataLoaded}
                onTimeUpdate={handleTimeUpdate}
                autoPlay 
                loop 
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded border border-white/10">
                  {playbackSpeed}x SPEED
                </span>
                <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold px-2 py-1 rounded border border-white/10 uppercase">
                  FILTER: {filter}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="text-6xl mb-4 opacity-20">🎥</div>
              <p className="text-slate-500 font-medium italic">Architectural simulation pending...</p>
            </div>
          )}

          {status === 'processing' && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-12 text-center animate-fadeIn">
               <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full mb-6 overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
               </div>
               <h3 className="text-xl font-black mb-2 tracking-tight">DISPATCHING RENDER ENGINE</h3>
               <p className="text-slate-500 text-xs animate-pulse">Calculating spatial temporal dynamics...</p>
            </div>
          )}
        </div>
      </div>

      {videoUrl && status === 'done' && !editMode && (
        <div className="flex gap-4 justify-end animate-fadeIn">
            <button className="px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold border border-slate-700 hover:bg-slate-700 transition-all">Download RAW</button>
            <button 
              onClick={() => setEditMode(true)} 
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-500 transition-all flex items-center gap-2"
            >
              🪄 Refine & Edit
            </button>
            <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
              Save to Library
            </button>
        </div>
      )}
    </div>
  );
};
