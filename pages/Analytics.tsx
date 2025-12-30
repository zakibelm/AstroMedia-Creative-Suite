
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { storage } from '../services/storage';
import { Campaign } from '../types';
import { useTranslation } from '../services/i18n';

const reachData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const platformData = [
  { name: 'Instagram', value: 400 },
  { name: 'LinkedIn', value: 300 },
  { name: 'Twitter', value: 300 },
  { name: 'TikTok', value: 200 },
];

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

export const Analytics: React.FC = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    setCampaigns(storage.getCampaigns());
  }, []);

  // Mock a report if none exists for the demo
  const mockReport = {
    sentimentScore: 88,
    engagementQuality: 'high' as const,
    lessonsLearned: [
      "Visuals with cyan highlights convert 14% better on LinkedIn.",
      "Engagement peaks at 18:00 UTC for multi-modal campaigns.",
      "Audience prefers concise, technical captions over purely marketing speak."
    ],
    selfCorrectionPlan: "Switching Creative Director nodes to 'Cinematic 35mm' style for next iteration. Adjusting Community Manager response latency to mimic human natural breaks.",
    generatedAt: new Date().toISOString()
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">Deep Insights</h1>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-xl">
           <button className="px-4 py-1.5 bg-slate-700 rounded-lg text-xs font-black uppercase">Real-time</button>
           <button className="px-4 py-1.5 text-slate-400 text-xs font-black uppercase hover:text-white">Historical</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="glass p-8 rounded-[3rem] border-slate-700/50">
            <h3 className="text-lg font-black uppercase tracking-tight mb-8 text-white">Growth Trajectory</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reachData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '24px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="url(#colorVal)" strokeWidth={4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="glass p-8 rounded-[3rem] border-slate-700/50">
            <h3 className="text-lg font-black uppercase tracking-tight mb-8 text-white">Audience Distribution</h3>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '24px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-4 pr-12">
                {platformData.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
         </div>
      </div>

      {/* AI Retrospective Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
          <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">🤖</span>
          {t('report.title')}
        </h2>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <div className="glass p-10 rounded-[3rem] border-emerald-500/20 shadow-2xl space-y-10 relative overflow-hidden bg-emerald-500/5">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">{t('report.lessons')}</h4>
                  <ul className="space-y-3">
                    {mockReport.lessonsLearned.map((lesson, i) => (
                      <li key={i} className="flex gap-3 text-slate-300 font-medium">
                        <span className="text-emerald-500">→</span>
                        {lesson}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center min-w-[180px]">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">{t('report.sentiment')}</p>
                   <div className="text-5xl font-black text-white">{mockReport.sentimentScore}</div>
                   <div className="text-[9px] font-bold text-emerald-600 mt-2">OPTIMAL ENGAGEMENT</div>
                </div>
              </div>

              <div className="space-y-4 border-t border-emerald-500/10 pt-8">
                <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">{t('report.correction')}</h4>
                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-[2rem] text-sm text-slate-400 font-medium leading-relaxed italic">
                  "{mockReport.selfCorrectionPlan}"
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
             <div className="glass p-8 rounded-[3rem] border-slate-700/50 flex flex-col justify-between h-full">
                <div className="space-y-6">
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('report.quality')}</h3>
                   <div className="space-y-8">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-[9px] font-black inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200">
                              Positive
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black inline-block text-emerald-600">
                              82%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-emerald-200">
                          <div style={{ width: "82%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"></div>
                        </div>
                      </div>

                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-[9px] font-black inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                              Neutral
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black inline-block text-blue-600">
                              12%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                          <div style={{ width: "12%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                        </div>
                      </div>

                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-[9px] font-black inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">
                              Critical
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black inline-block text-red-600">
                              6%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                          <div style={{ width: "6%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800 text-center">
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Automated Optimization</p>
                   <button className="w-full py-3 bg-purple-600/20 text-purple-400 border border-purple-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all">
                     Apply All Recommendations
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
