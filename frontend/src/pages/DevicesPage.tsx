import React, { useEffect, useState } from 'react';
import { Cpu, Search, Filter, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { Device } from '../types';

interface DevicesPageProps {
  onSelectDevice: (deviceId: string) => void;
}

export const DevicesPage: React.FC<DevicesPageProps> = ({ onSelectDevice }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await api.getDevices();
      setDevices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter((dev) => {
    const matchesSearch = dev.device_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dev.ip_address.includes(searchTerm);
    const matchesPriority = priorityFilter === 'ALL' || dev.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            ESP32 IoT Device Management Fleet
          </h2>
          <p className="text-xs text-slate-400">Heterogeneous device node registry, telemetry monitoring &amp; priority matrix</p>
        </div>

        <button
          onClick={fetchDevices}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-slate-100 transition flex items-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Fleet
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-glass-card border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID (e.g. ESP32-001), IP, Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto font-mono text-xs">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400">Priority Filter:</span>
          {['ALL', 'HIGH', 'NORMAL', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-lg transition ${
                priorityFilter === p
                  ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Devices Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevices.map((dev) => (
          <div
            key={dev.id}
            onClick={() => onSelectDevice(dev.device_id)}
            className="p-5 rounded-xl bg-glass-card border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer space-y-4 shadow-lg group"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">{dev.compatibility_group}</span>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition">{dev.device_id}</h3>
                <p className="text-[11px] text-slate-400">{dev.name}</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                dev.priority === 'HIGH' ? 'bg-rose-950 text-rose-400 border border-rose-800/40' :
                dev.priority === 'LOW' ? 'bg-slate-900 text-slate-400' : 'bg-blue-950 text-blue-400 border border-blue-800/40'
              }`}>
                {dev.priority} PRIORITY
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
              <div>
                <span className="text-slate-500 block text-[10px]">CURRENT FIRMWARE</span>
                <span className="text-slate-200 font-semibold">{dev.current_firmware_version}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">IP ADDRESS</span>
                <span className="text-slate-300">{dev.ip_address}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">WI-FI RSSI</span>
                <span className={dev.wifi_rssi > -65 ? 'text-emerald-400' : 'text-amber-400'}>{dev.wifi_rssi} dBm</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PACKET LOSS</span>
                <span className={dev.packet_loss < 3 ? 'text-emerald-400' : 'text-rose-400'}>{dev.packet_loss}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Health:</span>
                <span className={`font-mono font-bold ${dev.health_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {dev.health_score}/100
                </span>
              </div>
              <span className="text-xs text-cyan-400 font-medium group-hover:underline">View Details →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
