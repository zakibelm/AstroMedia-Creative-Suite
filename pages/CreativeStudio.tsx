
import React, { useState } from 'react';
import { ImageGenerator } from '../components/creative/ImageGenerator';
import { VideoGenerator } from '../components/creative/VideoGenerator';
import { MediaLibrary } from '../components/creative/MediaLibrary';
import { SocialPublisher } from '../components/creative/SocialPublisher';
import { useTranslation } from '../services/i18n';

export const CreativeStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'library' | 'publish'>('image');
  const { t } = useTranslation();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">{t('studio.title')}</h1>
          <p className="text-slate-400 text-lg">{t('studio.subtitle')}</p>
        </div>
        
        <div className="flex bg-slate-800 p-1.5 rounded-2xl border border-slate-700 self-start md:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'image', label: t('studio.tabs.image') },
            { id: 'video', label: t('studio.tabs.video') },
            { id: 'library', label: t('studio.tabs.library') },
            { id: 'publish', label: t('studio.tabs.publish') },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass p-8 rounded-[2rem] border-slate-700/50 shadow-2xl min-h-[600px]">
        {activeTab === 'image' && <ImageGenerator />}
        {activeTab === 'video' && <VideoGenerator />}
        {activeTab === 'library' && <MediaLibrary />}
        {activeTab === 'publish' && <SocialPublisher />}
      </div>
    </div>
  );
};
