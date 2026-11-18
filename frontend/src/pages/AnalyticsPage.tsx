import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { api } from '../services/api';
import type { AnalyticsSummary } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await api.getAnalyticsSummary();
      setSummary(data);
    } catch (e) {
      console.error(e);
    }
  };

  const modeDistribution = [
    { mode: 'FAST (High Concurrency)', count: 55 },
    { mode: 'NORMAL (Standard)', count: 32 },
    { mode: 'SAFE (Aggressive ACK)', count: 13 }
  ];

  const historicalTrends = [
    { day: 'Mon', successRate: 98.2, avgDuration: 34.2, retries: 2 },
    { day: 'Tue', successRate: 96.5, avgDuration: 39.8, retries: 4 },
    { day: 'Wed', successRate: 99.0, avgDuration: 31.0, retries: 1 },
    { day: 'Thu', successRate: 97.4, avgDuration: 36.5, retries: 3 },
    { day: 'Fri', successRate: 98.8, avgDuration: 33.1, retries: 1 },
    { day: 'Sat', successRate: 99.5, avgDuration: 29.4, retries: 0 },
    { day: 'Sun', successRate: 98.0, avgDuration: 35.0, retries: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Historical Transfer &amp; Firmware Deployment Analytics
          </h2>
          <p className="text-xs text-slate-400">Long-term network reliability, transfer duration trends &amp; mode distribution metrics</p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          {['7d', '30d', '90d', 'Custom'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === range
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Rate & Transfer Duration Chart */}
        <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            Deployment Success Rate (%) &amp; Avg Duration (sec)
            <span className="text-[10px] font-mono text-emerald-400">98.5% Target Achieved</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalTrends}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="successRate" name="Success Rate %" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="avgDuration" name="Avg Duration (s)" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transfer Mode Distribution Bar Chart */}
        <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            Adaptive Transfer Mode Selection Usage
            <span className="text-[10px] font-mono text-cyan-400">55% Fast Mode</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modeDistribution}>
                <XAxis dataKey="mode" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" name="Session Count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
