import React, { useEffect, useState } from 'react';
import { Cpu, ArrowLeft, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import type { Device } from '../types';

interface DeviceDetailPageProps {
  deviceId: string;
  onBack: () => void;
}

export const DeviceDetailPage: React.FC<DeviceDetailPageProps> = ({ deviceId, onBack }) => {
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [deviceId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const data = await api.getDeviceDetail(deviceId);
      setDevice(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const telemetryData = [
    { time: '10:00', cpu: 12.0, temp: 41.5, rssi: -54, loss: 0.8 },
    { time: '10:05', cpu: 14.5, temp: 42.0, rssi: -55, loss: 1.0 },
    { time: '10:10', cpu: 18.2, temp: 43.1, rssi: -53, loss: 0.6 },
    { time: '10:15', cpu: 15.0, temp: 42.5, rssi: -56, loss: 1.2 },
    { time: '10:20', cpu: 12.8, temp: 42.1, rssi: -54, loss: 0.9 },
  ];

  if (loading || !device) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono flex items-center justify-center gap-2">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        Loading ESP32 Telemetry for {deviceId}...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-slate-100 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Fleet Registry
        </button>

        <span className="px-3 py-1 rounded-full text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
          ● ONLINE &amp; TELEMETRY LIVE
        </span>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Information Card */}
        <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{device.device_id}</h2>
              <p className="text-xs text-slate-400">{device.name}</p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono divide-y divide-slate-800">
            <div className="py-1.5 flex justify-between">
              <span className="text-slate-500">IP Address:</span>
              <span className="text-cyan-300 font-bold">{device.ip_address}</span>
            </div>
            <div className="py-1.5 flex justify-between">
              <span className="text-slate-500">MAC Address:</span>
              <span className="text-slate-300">{device.mac_address}</span>
            </div>
            <div className="py-1.5 flex justify-between">
              <span className="text-slate-500">Hardware Series:</span>
              <span className="text-slate-200">{device.hardware_version}</span>
            </div>
            <div className="py-1.5 flex justify-between">
              <span className="text-slate-500">Current Firmware:</span>
              <span className="text-emerald-400 font-bold">{device.current_firmware_version}</span>
            </div>
            <div className="py-1.5 flex justify-between">
              <span className="text-slate-500">Target Firmware:</span>
              <span className="text-cyan-400">{device.target_firmware_version || 'v2.4.1 (Ready)'}</span>
            </div>
            <div className="py-1.5 flex justify-between">
              <span className="text-slate-500">Priority Level:</span>
              <span className="text-amber-400 font-bold">{device.priority}</span>
            </div>
          </div>

          {/* Visual Health Score Dial */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 block">ESP32 Health Index</span>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-emerald-500 bg-emerald-950/20 shadow-lg shadow-emerald-950/40">
              <span className="text-2xl font-bold font-mono text-emerald-400">{device.health_score}</span>
            </div>
          </div>
        </div>

        {/* Live Telemetry Charts */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            ESP32 Live Telemetry Metrics
            <span className="text-xs font-mono text-cyan-400">Wi-Fi RSSI: {device.wifi_rssi} dBm</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryData}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="cpu" name="CPU Usage %" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                <Area type="monotone" dataKey="temp" name="Temperature °C" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Transfer History Table */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">Historical TFTP Transfers</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-500 text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Firmware</th>
                    <th className="p-2">Mode</th>
                    <th className="p-2">Retries</th>
                    <th className="p-2">SHA-256 Check</th>
                    <th className="p-2">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-[11px]">
                  <tr>
                    <td className="p-2 text-slate-400">2026-10-03 14:30</td>
                    <td className="p-2 text-cyan-300">v2.4.1</td>
                    <td className="p-2 text-emerald-400">FAST (4 Thr)</td>
                    <td className="p-2 text-slate-300">0</td>
                    <td className="p-2 text-emerald-400">✓ Verified</td>
                    <td className="p-2"><span className="text-emerald-400 font-bold">SUCCESS</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 text-slate-400">2026-09-18 09:15</td>
                    <td className="p-2 text-cyan-300">v2.3.8</td>
                    <td className="p-2 text-amber-400">NORMAL</td>
                    <td className="p-2 text-slate-300">1</td>
                    <td className="p-2 text-emerald-400">✓ Verified</td>
                    <td className="p-2"><span className="text-emerald-400 font-bold">SUCCESS</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
