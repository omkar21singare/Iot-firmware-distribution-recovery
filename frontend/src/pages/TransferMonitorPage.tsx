import React, { useState } from 'react';
import { Activity, Server, Cpu, HardDrive, Layers, RefreshCw } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { BlockResumeModal } from '../components/BlockResumeModal';

export const TransferMonitorPage: React.FC = () => {
  const { activeSessionsLive, workerPoolLive } = useSocket();
  const [selectedResumeSession, setSelectedResumeSession] = useState<any>(null);

  // Fallback demo sessions if live simulator hasn't started yet
  const sessions = activeSessionsLive.length > 0 ? activeSessionsLive : [
    { id: 1, session_uuid: 's1', device_code: 'ESP32-001', mode: 'FAST', worker_thread: 'TFTP-Worker-1', current_block: 890, total_blocks: 1000, speed_kbps: 256.0, packets_sent: 890, acks_received: 890, retries: 0, packet_loss: 0.8, status: 'TRANSFERRING' },
    { id: 2, session_uuid: 's2', device_code: 'ESP32-002', mode: 'FAST', worker_thread: 'TFTP-Worker-2', current_block: 610, total_blocks: 1000, speed_kbps: 240.0, packets_sent: 612, acks_received: 610, retries: 1, packet_loss: 1.5, status: 'TRANSFERRING' },
    { id: 3, session_uuid: 's3', device_code: 'ESP32-003', mode: 'NORMAL', worker_thread: 'TFTP-Worker-3', current_block: 1000, total_blocks: 1000, speed_kbps: 128.0, packets_sent: 1002, acks_received: 1000, retries: 1, packet_loss: 2.1, status: 'COMPLETED' },
    { id: 4, session_uuid: 's4', device_code: 'ESP32-004', mode: 'SAFE', worker_thread: 'TFTP-Worker-4', current_block: 437, total_blocks: 1000, speed_kbps: 64.0, packets_sent: 442, acks_received: 436, retries: 3, packet_loss: 11.5, status: 'PAUSED' }
  ];

  const pool = workerPoolLive || { max_threads: 10, active_threads: 3, available_threads: 7, completed: 1 };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Real-Time Multithreaded TFTP Transfer Monitor
        </h2>
        <p className="text-xs text-slate-400">Live block stream, UDP socket ACK verification, thread pool metrics &amp; block resume</p>
      </div>

      {/* Multithread Block Movement Flow Animation */}
      <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" /> Concurrent Firmware Distribution Animation Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
            <HardDrive className="w-6 h-6 text-cyan-400 mb-1" />
            <span className="font-bold text-slate-200">Firmware Repository</span>
            <span className="text-[10px] text-slate-500">.bin Binary Store</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center relative overflow-hidden">
            <Server className="w-6 h-6 text-emerald-400 mb-1" />
            <span className="font-bold text-slate-200">TFTP Server</span>
            <span className="text-[10px] text-slate-500">UDP Port 6969</span>
            <div className="w-full h-1 bg-cyan-500/20 mt-2 rounded overflow-hidden">
              <div className="w-1/2 h-full bg-cyan-400 animate-flow-block" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
            <Layers className="w-6 h-6 text-amber-400 mb-1" />
            <span className="font-bold text-slate-200">Worker Thread Pool</span>
            <span className="text-[10px] text-emerald-400 font-bold">{pool.active_threads}/{pool.max_threads} Active Threads</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
            <Cpu className="w-6 h-6 text-purple-400 mb-1" />
            <span className="font-bold text-slate-200">ESP32 Device Fleet</span>
            <span className="text-[10px] text-slate-500">UDP Block OTA Flash</span>
          </div>
        </div>
      </div>

      {/* Sessions Grid / Progress Bars */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Active TFTP Transfer Sessions ({sessions.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((s: any) => {
            const pct = Math.round((s.current_block / s.total_blocks) * 100);
            return (
              <div key={s.session_uuid || s.id} className="p-5 rounded-2xl bg-glass-card border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono font-bold text-sm text-slate-100">{s.device_code}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      s.mode === 'FAST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                      s.mode === 'NORMAL' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                    }`}>
                      {s.mode}
                    </span>
                  </div>

                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                    s.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                    s.status === 'PAUSED' ? 'bg-amber-950 text-amber-400 border border-amber-800/40 animate-pulse' :
                    'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                  }`}>
                    {s.status}
                  </span>
                </div>

                {/* Visual Block Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-300">
                    <span>Block {s.current_block} of {s.total_blocks}</span>
                    <span className="font-bold text-cyan-400">{pct}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        s.status === 'COMPLETED' ? 'bg-emerald-400' :
                        s.status === 'PAUSED' ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Session Detailed Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] font-mono p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">THREAD ID</span>
                    <span className="text-slate-200">{s.worker_thread}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">SPEED</span>
                    <span className="text-cyan-400 font-bold">{s.speed_kbps} KB/s</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">PACKETS / ACKS</span>
                    <span className="text-slate-300">{s.packets_sent} / {s.acks_received}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">RETRIES / LOSS</span>
                    <span className={s.retries > 0 ? 'text-amber-400 font-bold' : 'text-slate-400'}>{s.retries} ({s.packet_loss}%)</span>
                  </div>
                </div>

                {/* Action for Interrupted Session */}
                {s.status === 'PAUSED' && (
                  <button
                    onClick={() => setSelectedResumeSession(s)}
                    className="w-full py-2 rounded-lg text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resume Transfer from Block {s.current_block}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Resume Modal */}
      {selectedResumeSession && (
        <BlockResumeModal
          session={selectedResumeSession}
          onClose={() => setSelectedResumeSession(null)}
          onSuccess={() => setSelectedResumeSession(null)}
        />
      )}
    </div>
  );
};
