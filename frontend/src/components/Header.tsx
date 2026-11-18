import React, { useState } from 'react';
import { Play, Square, Wifi, User } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

interface HeaderProps {
  onLandingPageClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLandingPageClick }) => {
  const { isConnected } = useSocket();
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggleDemo = async () => {
    setLoading(true);
    try {
      if (!isDemoRunning) {
        await api.startDemoSimulation();
        setIsDemoRunning(true);
      } else {
        await api.stopDemoSimulation();
        setIsDemoRunning(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-16 bg-[#0a0f1d]/90 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
      {/* Title & Patent Notice */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            Adaptive Intelligent Firmware Distribution System
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
              UDP-TFTP
            </span>
          </h2>
          <p className="text-[11px] text-slate-400">ESP32 Fleet Management &amp; Dynamic Thread Recovery Engine</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-4">
        {/* Landing Page Link */}
        <button
          onClick={onLandingPageClick}
          className="text-xs text-slate-400 hover:text-cyan-400 font-medium px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition"
        >
          View Landing Page
        </button>

        {/* Live WS Status Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <Wifi className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`} />
          <span className="font-mono text-[11px]">
            {isConnected ? 'WS LIVE' : 'DISCONNECTED'}
          </span>
        </div>

        {/* Live Patent Demo Simulation Button */}
        <button
          onClick={handleToggleDemo}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold shadow-lg transition-all duration-200 ${
            isDemoRunning
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-emerald-950/40'
          }`}
        >
          {isDemoRunning ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              Stop Demo Simulation
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              Start Demo Deployment
            </>
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <User className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-medium text-slate-200">Admin User</div>
            <div className="text-[10px] text-slate-500 font-mono">ADMINISTRATOR</div>
          </div>
        </div>
      </div>
    </header>
  );
};
