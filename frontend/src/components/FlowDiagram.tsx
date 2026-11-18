import React from 'react';
import { Cpu, Activity, Zap, Layers, Server, ShieldCheck, ArrowRight } from 'lucide-react';

export const FlowDiagram: React.FC = () => {
  const steps = [
    {
      title: 'Device Data Telemetry',
      subtitle: 'RSSI, Packet Loss, Health, Failure History',
      icon: Cpu,
      color: 'border-cyan-500/50 bg-cyan-950/30 text-cyan-400'
    },
    {
      title: 'Condition Analysis',
      subtitle: 'Weighted Metric Scoring & Rule Matrix',
      icon: Activity,
      color: 'border-blue-500/50 bg-blue-950/30 text-blue-400'
    },
    {
      title: 'Adaptive Engine',
      subtitle: 'Mode Determination Logic',
      icon: Zap,
      color: 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400'
    },
    {
      title: 'Transfer Mode Selection',
      subtitle: 'FAST / NORMAL / SAFE Mode',
      icon: Layers,
      color: 'border-amber-500/50 bg-amber-950/30 text-amber-400'
    },
    {
      title: 'Dynamic Thread Allocation',
      subtitle: 'TFTP Worker Pool Assignment',
      icon: Server,
      color: 'border-purple-500/50 bg-purple-950/30 text-purple-400'
    },
    {
      title: 'Recovery & Integrity Policy',
      subtitle: 'Block Resume + Rollback Engine',
      icon: ShieldCheck,
      color: 'border-rose-500/50 bg-rose-950/30 text-rose-400'
    }
  ];

  return (
    <div className="p-6 rounded-2xl bg-glass-card border border-slate-800">
      <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <Zap className="w-4 h-4 text-cyan-400" />
        Patent System Flow Diagram: Adaptive Engine Pipeline
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative flex flex-col items-center">
              <div className={`w-full p-4 rounded-xl border ${step.color} backdrop-blur-md flex flex-col items-center text-center hover:scale-105 transition-transform duration-200 shadow-lg`}>
                <div className="p-2.5 rounded-lg bg-slate-900/80 mb-2">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Step 0{idx + 1}</span>
                <h4 className="text-xs font-bold text-slate-100 mt-1">{step.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1 leading-tight">{step.subtitle}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
