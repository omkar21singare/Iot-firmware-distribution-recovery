import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import type { RollbackEvent } from '../types';

export const RecoveryCenterPage: React.FC = () => {
  const [rollbacks, setRollbacks] = useState<RollbackEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRollbacks();
  }, []);

  const fetchRollbacks = async () => {
    setLoading(true);
    try {
      const data = await api.getRollbackEvents();
      setRollbacks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          Recovery &amp; Automatic Firmware Rollback Center
        </h2>
        <p className="text-xs text-slate-400">Interrupted block-level resume operations, failed health checks, and dual-partition OTA rollback history</p>
      </div>

      {/* Highlights Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/40 border border-rose-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-400" />
            Automatic Post-Update Health Gating Active
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            If an ESP32 device fails post-reboot health verification (e.g. memory leak or watchdog crash), the system automatically restores firmware partition v2.3.8.
          </p>
        </div>
        <button
          onClick={fetchRollbacks}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-slate-100"
        >
          <RefreshCw className={`w-3.5 h-3.5 inline mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {/* Rollback Log Events Table */}
      <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          Rollback Events History ({rollbacks.length})
          <span className="text-[10px] font-mono text-rose-400">Dual Partition Recovery</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Device Code</th>
                <th className="p-3">Failed Firmware</th>
                <th className="p-3">Restored Version</th>
                <th className="p-3">Trigger Reason</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-[11px]">
              {rollbacks.length > 0 ? (
                rollbacks.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 text-cyan-300 font-bold">{r.device_code}</td>
                    <td className="p-3 text-rose-400">{r.failed_firmware_version}</td>
                    <td className="p-3 text-emerald-400 font-bold">{r.restored_firmware_version}</td>
                    <td className="p-3 text-slate-300">{r.trigger_reason}</td>
                    <td className="p-3 text-slate-500">{new Date(r.timestamp).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-cyan-300 font-bold">ESP32-012</td>
                  <td className="p-3 text-rose-400">v2.4.1</td>
                  <td className="p-3 text-emerald-400 font-bold">v2.3.8</td>
                  <td className="p-3 text-slate-300">Post-update health check failure (Memory leak in driver)</td>
                  <td className="p-3 text-slate-500">2026-10-03 14:35:10</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                      SUCCESS
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
