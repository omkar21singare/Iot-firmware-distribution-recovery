import React from 'react';
import { Zap, Server, ShieldCheck, ArrowRight } from 'lucide-react';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

interface LandingPageProps {
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenDashboard }) => {
  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 bg-[#060911]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-6 h-6 text-slate-950 font-bold" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 tracking-wide leading-tight">ADAPTIVE TFTP SYSTEM</h1>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase block">Patent Invention Presentation</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenDashboard}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition shadow-lg shadow-cyan-950/40 flex items-center gap-2"
          >
            Open Dashboard Demo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-xs font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          PATENT PROJECT FINAL YEAR DEMONSTRATION
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-cyan-200 to-emerald-300 leading-tight">
          Adaptive Firmware Intelligence for the IoT Era
        </h1>

        <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Intelligent, concurrent, and resilient firmware deployment for heterogeneous IoT networks using UDP-based multithreaded TFTP with dynamic score-based transfer mode allocation and block-level recovery.
        </p>

        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={onOpenDashboard}
            className="px-8 py-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition shadow-2xl shadow-cyan-950/50 flex items-center gap-2"
          >
            Launch Live Interactive Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Invention Features Cards */}
      <section className="px-8 py-16 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-100">Key Patent Innovations &amp; Architectural Features</h2>
          <p className="text-xs text-slate-400">Core technology modules implemented in this web application</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-3">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h3 className="text-base font-bold text-slate-200">Adaptive Decision Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically evaluates Wi-Fi RSSI, packet loss %, latency, health score, and failure count to assign FAST, NORMAL, or SAFE transfer modes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-3">
            <Server className="w-8 h-8 text-emerald-400" />
            <h3 className="text-base font-bold text-slate-200">Multithreaded UDP TFTP</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated worker thread pool executing RFC 1350 / RFC 2347 block transfer protocol with low socket overhead for ESP32 devices.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-3">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            <h3 className="text-base font-bold text-slate-200">Block Resume &amp; Auto Rollback</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Resumes interrupted transfers directly from block N instead of block 0. Automatically triggers dual OTA partition rollback if post-reboot health check fails.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture Visual Section */}
      <section className="px-8 py-12 max-w-6xl mx-auto">
        <ArchitectureDiagram />
      </section>
    </div>
  );
};
