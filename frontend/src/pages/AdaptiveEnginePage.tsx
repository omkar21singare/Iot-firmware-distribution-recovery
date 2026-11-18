import React, { useState, useEffect } from 'react';
import { Zap, Sliders } from 'lucide-react';
import { FlowDiagram } from '../components/FlowDiagram';
import { api } from '../services/api';
import type { AdaptiveDecision } from '../types';

export const AdaptiveEnginePage: React.FC = () => {
  // Input parameters state
  const [rssi, setRssi] = useState(-55);
  const [packetLoss, setPacketLoss] = useState(1.2);
  const [healthScore, setHealthScore] = useState(95);
  const [failureCount, setFailureCount] = useState(0);

  const [decision, setDecision] = useState<AdaptiveDecision | null>(null);

  useEffect(() => {
    evaluateEngine();
  }, [rssi, packetLoss, healthScore, failureCount]);

  const evaluateEngine = async () => {
    try {
      const res = await api.evaluateAdaptiveMode({
        wifi_rssi: rssi,
        packet_loss: packetLoss,
        latency_ms: 15,
        health_score: healthScore,
        priority: 'HIGH',
        failure_count: failureCount,
        transfer_success_rate: 98.5,
        compatibility_match: true
      });
      setDecision(res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyan-400" />
          Patent Invention: Adaptive Decision Engine Matrix
        </h2>
        <p className="text-xs text-slate-400">Dynamically evaluates network quality, telemetry &amp; failure history to select optimal TFTP transfer modes &amp; thread allocations</p>
      </div>

      {/* Visual Flow Diagram Component */}
      <FlowDiagram />

      {/* Interactive Parameter Evaluator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sliders Input Panel */}
        <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" /> Interactive Telemetry Simulator
          </h3>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Wi-Fi RSSI (Signal Strength):</span>
                <span className="text-cyan-400 font-bold">{rssi} dBm</span>
              </div>
              <input
                type="range"
                min="-90"
                max="-30"
                value={rssi}
                onChange={(e) => setRssi(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Packet Loss Percentage:</span>
                <span className={packetLoss < 5 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{packetLoss}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={packetLoss}
                onChange={(e) => setPacketLoss(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Device Health Score (0-100):</span>
                <span className="text-emerald-400 font-bold">{healthScore}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={healthScore}
                onChange={(e) => setHealthScore(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Previous Failure Count:</span>
                <span className="text-amber-400 font-bold">{failureCount} failures</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                value={failureCount}
                onChange={(e) => setFailureCount(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Real-time Decision Result Card */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            Adaptive Engine Decision Output
            <span className="text-xs font-mono text-emerald-400">Composite Score: {decision?.score || 92.5}/100</span>
          </h3>

          {decision && (
            <div className="space-y-4">
              <div className={`p-5 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                decision.recommended_mode === 'FAST' ? 'border-emerald-500/50 bg-emerald-950/30' :
                decision.recommended_mode === 'NORMAL' ? 'border-cyan-500/50 bg-cyan-950/30' : 'border-amber-500/50 bg-amber-950/30'
              }`}>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Recommended Transfer Mode</span>
                  <h2 className="text-2xl font-bold font-mono text-slate-100 flex items-center gap-2">
                    {decision.recommended_mode} MODE
                  </h2>
                </div>
                <div className="flex gap-4 text-center font-mono text-xs">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">WORKER THREADS</span>
                    <span className="text-cyan-400 font-bold">{decision.concurrency_threads} Threads</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">BLOCK SIZE</span>
                    <span className="text-slate-200 font-bold">{decision.block_size_bytes} Bytes</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 block text-[10px]">MAX RETRIES</span>
                    <span className="text-amber-400 font-bold">{decision.max_retries} Retries</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                <span className="text-slate-400 font-bold block">Engine Reasoning Rationale:</span>
                <p className="text-slate-200 leading-relaxed">"{decision.explanation}"</p>
              </div>

              {/* Scoring Breakdown Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">NETWORK SCORE</span>
                  <span className="text-cyan-400 font-bold">{decision.input_breakdown.network_score}%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">PACKET LOSS SCORE</span>
                  <span className="text-emerald-400 font-bold">{decision.input_breakdown.packet_loss_score}%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">DEVICE HEALTH</span>
                  <span className="text-slate-200 font-bold">{decision.input_breakdown.device_health}%</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">RELIABILITY SCORE</span>
                  <span className="text-amber-400 font-bold">{decision.input_breakdown.reliability_score}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
