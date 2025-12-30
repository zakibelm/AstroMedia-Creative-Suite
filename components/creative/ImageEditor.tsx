
import React, { useState, useRef, useEffect } from 'react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedUrl: string) => void;
  onCancel: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      renderImage();
    };
  }, [imageUrl]);

  const renderImage = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, 0, 0);
  };

  useEffect(() => {
    renderImage();
  }, [brightness, contrast]);

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-xl font-black">Image Enhancement Studio</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Editor Canvas Area */}
          <div className="flex-1 bg-black p-4 flex items-center justify-center overflow-hidden">
            <div className="relative max-w-full max-h-full">
              <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-[60vh] object-contain shadow-2xl rounded-lg"
              />
            </div>
          </div>

          {/* Controls Sidebar */}
          <div className="w-full md:w-80 bg-slate-900 p-8 border-l border-slate-800 space-y-8 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Brightness</label>
                <span className="text-xs font-mono text-blue-400">{brightness}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={brightness} 
                onChange={(e) => setBrightness(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Contrast</label>
                <span className="text-xs font-mono text-purple-400">{contrast}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={contrast} 
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="pt-8 space-y-3">
              <button 
                onClick={handleApply}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Apply Changes
              </button>
              <button 
                onClick={onCancel}
                className="w-full py-3 bg-slate-800 text-slate-400 rounded-xl font-bold hover:bg-slate-700 hover:text-white transition-all"
              >
                Discard
              </button>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
               <p className="text-[10px] text-blue-300 leading-relaxed font-medium">
                 Changes are processed locally using your device's GPU for maximum performance and privacy.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
