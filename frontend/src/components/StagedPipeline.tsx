import React from 'react';
import { ArrowRight, ShieldCheck, Activity } from 'lucide-react';

interface StagedPipelineProps {
  currentStage: number;
  totalStages: number;
  status: string;
}

export const StagedPipeline: React.FC<StagedPipelineProps> = ({ currentStage, totalStages, status }) => {
  const stages = [
    { stage: 1, devices: ['ESP32-001', 'ESP32-002'], label: 'Canary Stage (Pilot)', status: currentStage > 1 ? 'PASSED' : (currentStage === 1 ? 'IN_PROGRESS' : 'PENDING') },
    { stage: 2, devices: ['ESP32-003', 'ESP32-004', 'ESP32-005', 'ESP32-006', 'ESP32-008'], label: 'Stage 2 (Batch 2)', status: currentStage > 2 ? 'PASSED' : (currentStage === 2 ? 'IN_PROGRESS' : 'PENDING') },
    { stage: 3, devices: ['ESP32-007', 'ESP32-012'], label: 'Final Stage (Remaining)', status: currentStage >= 3 && status === 'COMPLETED' ? 'PASSED' : (currentStage === 3 ? 'IN_PROGRESS' : 'PENDING') }
  ];

  return (
    <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Staged Deployment Pipeline Execution
          </h3>
          <p className="text-xs text-slate-400">Automated multi-stage rollout with post-reboot health verification gating</p>
        </div>
        <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded bg-slate-900 border border-slate-800">
          Stage {currentStage} of {totalStages} Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stages.map((s, idx) => (
          <div key={idx} className="relative">
            <div className={`p-4 rounded-xl border ${
              s.status === 'PASSED'
                ? 'border-emerald-500/40 bg-emerald-950/20 text-slate-200'
                : s.status === 'IN_PROGRESS'
                ? 'border-cyan-500/50 bg-cyan-950/30 text-slate-100 shadow-lg shadow-cyan-950/30'
                : 'border-slate-800 bg-slate-900/40 text-slate-500'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Stage 0{s.stage}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  s.status === 'PASSED'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                    : s.status === 'IN_PROGRESS'
                    ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40 animate-pulse'
                    : 'bg-slate-950 text-slate-500'
                }`}>
                  {s.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-200">{s.label}</h4>
              <p className="text-[11px] text-slate-400 mt-1">{s.devices.length} Devices Target</p>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {s.devices.map((d) => (
                  <span key={d} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-300">
                    {d}
                  </span>
                ))}
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" /> Health Gate:
                </span>
                <span className="font-mono text-emerald-400">&gt; 80% Threshold</span>
              </div>
            </div>

            {idx < stages.length - 1 && (
              <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
