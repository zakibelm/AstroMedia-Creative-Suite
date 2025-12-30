
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Deep Insights</h1>
        <div className="flex gap-2 bg-slate-800 p-1 rounded-xl">
           <button className="px-4 py-1.5 bg-slate-700 rounded-lg text-sm font-bold">Real-time</button>
           <button className="px-4 py-1.5 text-slate-400 text-sm font-bold hover:text-white">Historical</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
            <h3 className="text-lg font-bold mb-6">Growth Trajectory</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reachData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
            <h3 className="text-lg font-bold mb-6">Audience Distribution</h3>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 pr-8">
                {platformData.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
         </div>
      </div>

      <div className="bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50">
         <h3 className="text-xl font-bold mb-6">Conversion Funnel</h3>
         <div className="flex flex-col md:flex-row items-stretch gap-4">
            {[
              { label: 'Impressions', val: '2.4M', color: 'bg-indigo-500' },
              { label: 'Interactions', val: '184k', color: 'bg-purple-500' },
              { label: 'Click Throughs', val: '12.5k', color: 'bg-blue-500' },
              { label: 'Conversions', val: '1,842', color: 'bg-emerald-500' },
            ].map((step, i) => (
              <div key={i} className="flex-1 p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:bg-slate-800 transition-all cursor-default">
                 <div className="text-slate-500 text-xs font-bold uppercase mb-4">{step.label}</div>
                 <div className="text-3xl font-black mb-2">{step.val}</div>
                 <div className={`h-1.5 w-full rounded-full ${step.color}`} style={{ opacity: 1 - (i * 0.2) }} />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};
