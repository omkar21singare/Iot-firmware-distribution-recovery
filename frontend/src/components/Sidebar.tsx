import React from 'react';
import { 
  LayoutDashboard, Cpu, HardDrive, Rocket, 
  Activity, Zap, ShieldAlert, BarChart3, 
  Settings, Network 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'devices', label: 'Devices', icon: Cpu },
    { id: 'firmware', label: 'Firmware', icon: HardDrive },
    { id: 'deployments', label: 'Deployments', icon: Rocket },
    { id: 'transfers', label: 'Transfer Monitor', icon: Activity },
    { id: 'adaptive', label: 'Adaptive Engine', icon: Zap },
    { id: 'recovery', label: 'Recovery Center', icon: ShieldAlert },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Zap className="w-6 h-6 text-slate-950 font-bold" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-100 tracking-wide leading-tight">ADAPTIVE TFTP</h1>
          <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">IoT Firmware System</span>
        </div>
      </div>

      {/* Patent Badge */}
      <div className="mx-4 my-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono text-emerald-400 font-semibold">PATENT READY</span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">v2.4.1</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 text-cyan-300 border-l-2 border-cyan-400 shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 text-[11px] text-slate-500 space-y-1">
        <div className="flex justify-between items-center">
          <span>TFTP Engine:</span>
          <span className="text-emerald-400 font-mono font-medium">Multithread UDP</span>
        </div>
        <div className="flex justify-between items-center">
          <span>Target Hardware:</span>
          <span className="text-cyan-400 font-mono font-medium">ESP32 Core</span>
        </div>
      </div>
    </aside>
  );
};
