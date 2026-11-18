import React from 'react';
import { UserCheck, Layout, Server, Cpu, Layers, HardDrive, Database, Activity, ShieldAlert, FileCheck } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-100">Patent Hardware & Software System Architecture</h3>
          <p className="text-xs text-slate-400">Interactive End-to-End IoT Multithreaded TFTP Deployment Diagram</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
          UDP/IP RFC 1350
        </span>
      </div>

      {/* Main Flow Pipeline */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400">Primary Control & Transmission Pipeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center flex flex-col items-center">
            <UserCheck className="w-6 h-6 text-cyan-400 mb-2" />
            <h5 className="text-xs font-bold text-slate-200">1. System Administrator</h5>
            <p className="text-[11px] text-slate-400 mt-1">Configures parameters, uploads .bin, triggers staged rollout</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center flex flex-col items-center">
            <Layout className="w-6 h-6 text-cyan-400 mb-2" />
            <h5 className="text-xs font-bold text-slate-200">2. React Web Dashboard</h5>
            <p className="text-[11px] text-slate-400 mt-1">Real-time telemetry, worker pool visualization, interactive wizard</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-center flex flex-col items-center">
            <Server className="w-6 h-6 text-emerald-400 mb-2" />
            <h5 className="text-xs font-bold text-slate-200">3. FastAPI Application Server</h5>
            <p className="text-[11px] text-slate-400 mt-1">REST API + WebSocket broadcaster + Auth JWT</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-center flex flex-col items-center">
            <Layers className="w-6 h-6 text-emerald-400 mb-2" />
            <h5 className="text-xs font-bold text-slate-200">4. Adaptive Engine</h5>
            <p className="text-[11px] text-slate-400 mt-1">Scores network/health parameters → FAST/NORMAL/SAFE decision</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-center flex flex-col items-center">
            <Server className="w-6 h-6 text-amber-400 mb-2" />
            <h5 className="text-xs font-bold text-slate-200">5. Deployment Manager</h5>
            <p className="text-[11px] text-slate-400 mt-1">Staged pipeline execution & health threshold verification</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 text-center flex flex-col items-center">
            <Cpu className="w-6 h-6 text-amber-400 mb-2" />
            <h5 className="text-xs font-bold text-slate-200">6. Multithreaded TFTP Server</h5>
            <p className="text-[11px] text-slate-400 mt-1">Worker thread pool, UDP block transfer, ACK handler</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30 text-center flex flex-col items-center">
            <Activity className="w-6 h-6 text-purple-400 mb-2" />
            <h5 className="text-xs font-bold text-slate-200">7. UDP Wireless Network</h5>
            <p className="text-[11px] text-slate-400 mt-1">Low-overhead packet delivery over Wi-Fi / LAN</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-rose-500/30 text-center flex flex-col items-center">
            <Cpu className="w-6 h-6 text-rose-400 mb-2" />
            <h5 className="text-xs font-bold text-slate-200">8. ESP32 IoT Fleet</h5>
            <p className="text-[11px] text-slate-400 mt-1">Flash memory writing, SHA-256 validation, dual OTA partition</p>
          </div>
        </div>
      </div>

      {/* Supporting Infrastructure Services */}
      <div className="pt-4 border-t border-slate-800">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Supporting Infrastructure & Safety Modules</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <HardDrive className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <span className="text-xs font-semibold text-slate-300 block">Firmware Repo</span>
            <span className="text-[10px] text-slate-500">Binary .bin store</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <Database className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-xs font-semibold text-slate-300 block">PostgreSQL DB</span>
            <span className="text-[10px] text-slate-500">Relational schema</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <Activity className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="text-xs font-semibold text-slate-300 block">Telemetry Monitor</span>
            <span className="text-[10px] text-slate-500">Live health logs</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <ShieldAlert className="w-4 h-4 text-rose-400 mx-auto mb-1" />
            <span className="text-xs font-semibold text-slate-300 block">Recovery Manager</span>
            <span className="text-[10px] text-slate-500">Block Resume & Rollback</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <FileCheck className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-xs font-semibold text-slate-300 block">Integrity Verifier</span>
            <span className="text-[10px] text-slate-500">SHA-256 Hash check</span>
          </div>
        </div>
      </div>
    </div>
  );
};
