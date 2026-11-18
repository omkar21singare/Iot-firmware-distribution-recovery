import React, { useEffect, useState } from 'react';
import { Cpu, Wifi, Activity, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { KPICard } from '../components/KPICard';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import type { AnalyticsSummary, Device } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
  onSelectDevice: (deviceId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectDevice }) => {
  const { liveEvents } = useSocket();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, devRes] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getDevices()
        ]);
        setSummary(sumRes);
        setDevices(devRes);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const healthData = [
    { name: 'Healthy', value: summary?.healthy_devices || 7, color: '#10b981' },
    { name: 'Warning', value: summary?.warning_devices || 1, color: '#f59e0b' },
    { name: 'Critical', value: summary?.critical_devices || 1, color: '#f43f5e' },
    { name: 'Offline', value: summary?.offline_devices || 0, color: '#64748b' },
  ];

  const activityData = [
    { time: '00:00', Successful: 12, Failed: 1, InProgress: 2 },
    { time: '04:00', Successful: 18, Failed: 0, InProgress: 1 },
    { time: '08:00', Successful: 24, Failed: 2, InProgress: 4 },
    { time: '12:00', Successful: 32, Failed: 1, InProgress: 6 },
    { time: '16:00', Successful: 28, Failed: 0, InProgress: 3 },
    { time: '20:00', Successful: 40, Failed: 1, InProgress: 5 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/60 border border-cyan-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            ESP32 Fleet Telemetry &amp; Multithreaded TFTP Distribution Center
          </h2>
          <p className="text-xs text-slate-400">Intelligent network-adaptive block streaming &amp; automated recovery</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('adaptive')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition flex items-center gap-1.5"
          >
            Adaptive Engine Rules <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('transfers')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition flex items-center gap-1.5"
          >
            Live Monitor <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <KPICard title="Total Devices" value={summary?.total_devices || 9} icon={Cpu} color="slate" />
        <KPICard title="Online" value={summary?.online_devices || 9} icon={Wifi} color="emerald" trend="+100%" />
        <KPICard title="Offline" value={summary?.offline_devices || 0} icon={Wifi} color="rose" />
        <KPICard title="Healthy" value={summary?.healthy_devices || 7} icon={CheckCircle2} color="emerald" />
        <KPICard title="Active Transfers" value={summary?.active_transfers || 3} icon={Activity} color="cyan" trend="UDP TFTP" />
        <KPICard title="Successful" value={summary?.successful_deployments || 14} icon={CheckCircle2} color="emerald" />
        <KPICard title="Failed" value={summary?.failed_deployments || 1} icon={AlertTriangle} color="rose" />
        <KPICard title="Avg Duration" value={`${summary?.avg_transfer_time_sec || 38.4}s`} icon={Clock} color="amber" />
      </div>

      {/* Middle Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Health Overview Donut Chart */}
        <div className="p-5 rounded-2xl bg-glass-card border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            Device Health Overview
            <span className="text-[10px] font-mono text-cyan-400">0-100 Score</span>
          </h3>
          <div className="h-56 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-2xl font-bold font-mono text-slate-100">{summary?.healthy_devices || 7}</span>
              <span className="text-[10px] text-slate-400 block font-mono uppercase">Healthy ESP32</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            {healthData.map((h, i) => (
              <div key={i} className="flex items-center gap-2 p-1.5 rounded bg-slate-900/60 border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: h.color }} />
                <span className="text-slate-400">{h.name}:</span>
                <span className="text-slate-200 font-bold ml-auto">{h.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Firmware Deployment Activity Line/Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-glass-card border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            Firmware Deployment Activity over Time
            <span className="text-[10px] font-mono text-emerald-400">Live 24h Window</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Successful" stroke="#10b981" fillOpacity={1} fill="url(#colorSuccess)" />
                <Area type="monotone" dataKey="InProgress" stroke="#06b6d4" fillOpacity={1} fill="url(#colorProgress)" />
                <Area type="monotone" dataKey="Failed" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Active Fleet & Live Events Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Fleet Table */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Active ESP32 Fleet Devices
            </h3>
            <button
              onClick={() => onNavigate('devices')}
              className="text-xs font-mono text-cyan-400 hover:underline"
            >
              View All ({devices.length}) →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Device Code</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Firmware</th>
                  <th className="p-3">RSSI / Loss</th>
                  <th className="p-3">Health Score</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {devices.slice(0, 6).map((dev) => (
                  <tr
                    key={dev.id}
                    onClick={() => onSelectDevice(dev.device_id)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="p-3 text-cyan-300 font-bold">{dev.device_id}</td>
                    <td className="p-3 text-slate-400">{dev.ip_address}</td>
                    <td className="p-3 text-slate-200">{dev.current_firmware_version}</td>
                    <td className="p-3 text-slate-300">
                      {dev.wifi_rssi} dBm <span className="text-slate-500">({dev.packet_loss}%)</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        dev.health_score >= 80 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      }`}>
                        {dev.health_score}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {dev.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live System Events Stream */}
        <div className="p-5 rounded-2xl bg-glass-card border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            Recent System Events
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {liveEvents.length > 0 ? (
              liveEvents.map((evt, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono space-y-1">
                  <div className="flex justify-between items-center">
                    <span className={`font-bold text-[10px] px-1.5 py-0.2 rounded ${
                      evt.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' :
                      evt.level === 'WARNING' ? 'bg-amber-950 text-amber-400' :
                      evt.level === 'ERROR' ? 'bg-rose-950 text-rose-400' : 'bg-cyan-950 text-cyan-400'
                    }`}>
                      {evt.category}
                    </span>
                    <span className="text-slate-500 text-[10px]">{evt.timestamp}</span>
                  </div>
                  <p className="text-slate-300 leading-tight">{evt.message}</p>
                </div>
              ))
            ) : (
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-emerald-400 font-bold">[14:32:01]</span> ESP32-001 firmware transfer completed. SHA-256 Verified.
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-amber-400 font-bold">[14:31:45]</span> ESP32-007 packet loss detected (14.2%). Throttling mode to SAFE.
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold">[14:30:10]</span> ESP32-004 transfer resumed from block 437.
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300">
                  <span className="text-rose-400 font-bold">[14:28:00]</span> ESP32-012 post-update health verification failed. Automatic Rollback initiated.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
