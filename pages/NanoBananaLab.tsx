
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../services/i18n';
import { editImageWithNanoBanana, generateAIIImage } from '../services/gemini';
import { storage } from '../services/storage';

interface Experiment {
  id: string;
  url: string;
  prompt: string;
  timestamp: string;
}

export const NanoBananaLab: React.FC = () => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<Experiment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const assets = storage.getAssets().filter(a => a.metadata?.engine?.includes('NanoBanana'));
    setHistory(assets.slice(0, 10).map(a => ({
      id: a.id,
      url: a.url,
      prompt: a.prompt,
      timestamp: a.createdAt
    })));
  }, [result]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setBaseImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecute = async () => {
    if (!prompt) return;
    setIsProcessing(true);
    try {
      let finalUrl = '';
      if (baseImage) {
        finalUrl = await editImageWithNanoBanana(baseImage, mimeType, prompt);
      } else {
        finalUrl = await generateAIIImage(prompt, "1:1");
      }
      setResult(finalUrl);
    } catch (err) {
      console.error(err);
      alert("NanoBanana Inference Engine error. Verify context and connectivity.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    storage.saveAsset({
      id: crypto.randomUUID(),
      type: 'image',
      url: result,
      prompt: prompt,
      createdAt: new Date().toISOString(),
      metadata: { engine: 'NanoBanana (Gemini 2.5 Flash Image)', mode: baseImage ? 'morphing' : 'pure-gen' }
    });
  };

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 flex flex-col relative overflow-hidden">
      {/* Dynamic Background Pulse */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 blur-[160px] rounded-full transition-all duration-1000 ${isProcessing ? 'scale-150 opacity-20' : 'scale-100 opacity-10'}`} />
      
      {/* Header HUD */}
      <header className="px-10 py-8 flex justify-between items-center relative z-20">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <span className="text-amber-500">NANOBANANA</span>
            <span className="text-slate-600 font-light">ALCHEMY LAB</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Inference Node: GEMINI-2.5-FLASH-IMAGE</p>
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">Core Status</span>
             <span className="text-xs font-bold text-emerald-400">NOMINAL</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-amber-500/50 uppercase tracking-widest">Inference Latency</span>
             <span className="text-xs font-bold text-white">~4.2s</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex px-6 gap-6 relative z-10 pb-10">
        
        {/* Left Panel: Directives & Seed */}
        <div className="w-80 flex flex-col gap-6">
          <div className="glass bg-black/40 p-6 rounded-[2.5rem] border-white/5 space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 flex items-center justify-between">
              Mutation Seed
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </h3>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full aspect-square rounded-[2rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden group ${
                baseImage ? 'border-amber-500/30' : 'border-slate-800 hover:border-amber-500/20 bg-slate-900/20'
              }`}
            >
              {baseImage ? (
                <img src={baseImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
              ) : (
                <>
                  <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🍌</span>
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Inject Data</p>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800/50">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Alchemy Directive</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-black/60 border border-slate-800 rounded-2xl p-4 text-white text-[11px] min-h-[120px] outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800 font-medium resize-none leading-relaxed"
                placeholder="Synthesize neural patterns... e.g. 'Infuse with iridescent chrome kinetics'"
              />
            </div>

            <button
              onClick={handleExecute}
              disabled={isProcessing || !prompt}
              className={`w-full py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-2xl ${
                isProcessing ? 'bg-slate-900 text-slate-700' : 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-slate-700 border-t-amber-500 rounded-full animate-spin" />
                  Synthesis...
                </span>
              ) : 'EXECUTE FUSION'}
            </button>
          </div>

          <div className="glass bg-black/20 p-6 rounded-[2.5rem] border-white/5 space-y-4">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Core Telemetry</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-bold text-slate-500 uppercase">Engine Stability</span>
                 <span className="text-[9px] font-mono text-emerald-500">99.2%</span>
              </div>
              <div className="w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[99%]" />
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[9px] font-bold text-slate-500 uppercase">Throughput</span>
                 <span className="text-[9px] font-mono text-white">4.2 T/OPS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Stage: The Mutation Chamber */}
        <div className="flex-1 glass bg-white/[0.02] rounded-[3.5rem] border-white/5 flex flex-col relative overflow-hidden group shadow-inner">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-500/[0.02] to-transparent pointer-events-none" />
          
          <div className="flex-1 flex items-center justify-center p-12">
            {result ? (
              <div className="w-full h-full relative animate-fadeIn flex flex-col gap-8">
                 <div className="flex-1 rounded-[2.5rem] overflow-hidden border border-white/5 bg-black shadow-2xl relative">
                    <img src={result} className="w-full h-full object-contain" />
                    <div className="absolute top-6 right-6 flex gap-3">
                       <button onClick={handleSave} className="bg-black/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-2">
                         <span className="text-sm">💾</span> Inject to Vault
                       </button>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="text-center space-y-8 max-w-xs animate-pulse">
                 <div className="w-32 h-32 mx-auto rounded-full bg-amber-500/5 border border-amber-500/20 flex items-center justify-center text-6xl">🔬</div>
                 <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-amber-500/50">Mutation Chamber</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed uppercase font-bold tracking-widest">Awaiting dispatch of neural directive. Core inference engine ready for synthesis.</p>
                 </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-[#050507]/80 backdrop-blur-xl flex flex-col items-center justify-center gap-8 animate-fadeIn">
                 <div className="relative">
                   <div className="w-24 h-24 border-2 border-amber-500/20 rounded-full animate-ping" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 border-t-2 border-amber-500 rounded-full animate-spin" />
                   </div>
                 </div>
                 <div className="text-center space-y-2">
                    <p className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] animate-pulse">Neural Matrix Unfolding</p>
                    <p className="text-[9px] text-slate-500 font-mono italic">Rendering parallel visual kinetics...</p>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Mutation Log (History) */}
        <div className="w-72 flex flex-col">
          <div className="glass bg-black/40 flex-1 rounded-[2.5rem] border-white/5 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
               <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Mutation Log</h3>
               <span className="text-[9px] font-mono text-amber-500/50">VOL. 01</span>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
              {history.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                  <p className="text-[8px] font-black uppercase tracking-widest">No mutations archived</p>
                </div>
              ) : history.map((exp) => (
                <div key={exp.id} onClick={() => setResult(exp.url)} className="group relative aspect-square rounded-3xl overflow-hidden border border-white/5 bg-slate-900 cursor-pointer hover:border-amber-500/30 transition-all">
                  <img src={exp.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                     <p className="text-[8px] font-bold text-white uppercase tracking-tighter truncate w-full">"{exp.prompt}"</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-amber-500/5 border-t border-white/5">
              <button onClick={() => setResult(null)} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all">Clear Node Context</button>
            </div>
          </div>
        </div>

      </main>

      {/* Laboratory Controls Hud */}
      <footer className="px-10 py-6 border-t border-white/5 flex justify-between items-center relative z-20 bg-[#050507]/80 backdrop-blur-lg">
         <div className="flex gap-8">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Low-Latency Mode: Active</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Context: Neural Morphing 2.5</span>
            </div>
         </div>
         <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em]">AstroMedia Experimental Division • Matrix Build 2.5F</p>
      </footer>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
