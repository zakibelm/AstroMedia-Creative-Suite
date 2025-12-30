
import React, { useState, useEffect } from 'react';
import { generateAIIImage } from '../../services/gemini';
import { storage } from '../../services/storage';
import { ImageEditor } from './ImageEditor';
import { Campaign } from '../../types';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [style, setStyle] = useState('hyper-realistic');
  const [campaignId, setCampaignId] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    setCampaigns(storage.getCampaigns());
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setGenerating(true);
    try {
      const fullPrompt = `Style: ${style}. ${prompt}`;
      const imageUrl = await generateAIIImage(fullPrompt, aspectRatio);
      setResult(imageUrl);
    } catch (err) {
      console.error(err);
      alert("Failed to generate image. Ensure API configuration is correct.");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    storage.saveAsset({
      id: crypto.randomUUID(),
      type: 'image',
      url: result,
      prompt,
      createdAt: new Date().toISOString(),
      metadata: { style, aspectRatio },
      campaignId: campaignId || undefined
    });
    alert("Asset saved to library!");
  };

  const handleEditComplete = (editedUrl: string) => {
    setResult(editedUrl);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Visual Prompt</label>
            <textarea
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-purple-500 outline-none h-40 resize-none transition-all"
              placeholder="Describe the image you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Target Campaign</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              >
                <option value="">No Campaign (General)</option>
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Style Profile</label>
              <select 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                <option value="hyper-realistic">Hyper Realistic</option>
                <option value="cinematic">Cinematic 35mm</option>
                <option value="digital-art">Cyberpunk Digital Art</option>
                <option value="oil-painting">Classic Oil Painting</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Aspect Ratio</label>
              <div className="flex gap-2">
                {['1:1', '16:9', '9:16'].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`flex-1 py-3 rounded-lg border transition-all ${
                      aspectRatio === ratio
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating || !prompt}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 ${
              generating 
                ? 'bg-slate-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/30'
            }`}
          >
            {generating ? "Generating..." : '✨ Generate AI Artwork'}
          </button>
        </div>

        <div className="relative h-full min-h-[400px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center">
          {result ? (
            <img src={result} alt="AI Generated" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center p-8 opacity-20 text-6xl">🖼️</div>
          )}
          {generating && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
               <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button className="px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold border border-slate-700 hover:bg-slate-700 transition-colors">Download</button>
            <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-500 transition-colors">Save to Library</button>
            <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors">✏️ Edit Image</button>
        </div>
      )}

      {isEditing && result && (
        <ImageEditor 
          imageUrl={result} 
          onSave={handleEditComplete} 
          onCancel={() => setIsEditing(false)} 
        />
      )}
    </div>
  );
};
