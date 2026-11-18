import React, { useEffect, useState } from 'react';
import { Rocket, ArrowRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { Device, Firmware } from '../types';

interface CreateDeploymentPageProps {
  onSuccess: () => void;
}

export const CreateDeploymentPage: React.FC<CreateDeploymentPageProps> = ({ onSuccess }) => {
  const [step, setStep] = useState(1);
  const [firmwares, setFirmwares] = useState<Firmware[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedFirmwareId, setSelectedFirmwareId] = useState<number | null>(null);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<number[]>([]);
  const [strategy, setStrategy] = useState<'STAGED' | 'IMMEDIATE' | 'MANUAL'>('STAGED');
  const [deploymentName] = useState('Industrial Fleet Upgrade v2.4.1');

  // Wizard Check Result
  const [wizardResult, setWizardResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    fetchInitData();
  }, []);

  const fetchInitData = async () => {
    setLoading(true);
    try {
      const [fwList, devList] = await Promise.all([
        api.getFirmwareList(),
        api.getDevices()
      ]);
      setFirmwares(fwList);
      setDevices(devList);
      if (fwList.length > 0) setSelectedFirmwareId(fwList[0].id);
      setSelectedDeviceIds(devList.map(d => d.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCompatibilityCheck = async () => {
    if (!selectedFirmwareId || selectedDeviceIds.length === 0) return;
    setChecking(true);
    try {
      const result = await api.checkWizardCompatibility(selectedFirmwareId, selectedDeviceIds);
      setWizardResult(result);
      setStep(3);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handleLaunchDeployment = async () => {
    if (!selectedFirmwareId) return;
    setLoading(true);
    try {
      await api.createDeployment({
        name: deploymentName,
        firmware_id: selectedFirmwareId,
        target_device_ids: selectedDeviceIds,
        strategy: strategy,
        total_stages: strategy === 'STAGED' ? 3 : 1
      });
      alert('Deployment created and triggered successfully!');
      onSuccess();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to start deployment');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !firmwares.length) {
    return <div className="p-12 text-center text-slate-400 font-mono">Loading Deployment Wizard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Rocket className="w-5 h-5 text-cyan-400" />
          7-Step Firmware Deployment Wizard
        </h2>
        <p className="text-xs text-slate-400">Target evaluation, compatibility check, adaptive transfer mode determination &amp; staged rollout</p>
      </div>

      {/* Step Indicator */}
      <div className="p-4 rounded-xl bg-glass-card border border-slate-800 flex items-center justify-between font-mono text-xs overflow-x-auto gap-2">
        {[
          '1. Firmware', '2. Devices', '3. Compatibility',
          '4. Analysis', '5. Adaptive Decisions', '6. Strategy', '7. Launch'
        ].map((lbl, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap ${
              step === idx + 1
                ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold'
                : step > idx + 1
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                : 'text-slate-600 bg-slate-900/40'
            }`}
          >
            <span>{lbl}</span>
          </div>
        ))}
      </div>

      {/* Wizard Content Panels */}
      <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-6">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Step 1: Select Firmware Binary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {firmwares.map((fw) => (
                <div
                  key={fw.id}
                  onClick={() => setSelectedFirmwareId(fw.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    selectedFirmwareId === fw.id
                      ? 'border-cyan-500 bg-cyan-950/30 text-slate-100 shadow-lg'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">{fw.compatible_group}</span>
                  <h4 className="text-sm font-bold text-slate-100">{fw.name} ({fw.version})</h4>
                  <p className="text-xs text-slate-400 mt-1 font-mono">Size: {(fw.size_bytes / (1024*1024)).toFixed(2)} MB | SHA256: {fw.sha256_hash.slice(0, 16)}...</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-lg flex items-center gap-2"
            >
              Next: Select Target Devices <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Step 2: Select Target Devices</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedDeviceIds(devices.map(d => d.id))}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300"
              >
                Select All ({devices.length})
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              {devices.map((d) => {
                const selected = selectedDeviceIds.includes(d.id);
                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      if (selected) setSelectedDeviceIds(selectedDeviceIds.filter(id => id !== d.id));
                      else setSelectedDeviceIds([...selectedDeviceIds, d.id]);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      selected ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300' : 'border-slate-800 bg-slate-900/60 text-slate-500'
                    }`}
                  >
                    <span className="font-bold block">{d.device_id}</span>
                    <span className="text-[10px] text-slate-400">{d.ip_address}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400">Back</button>
              <button
                onClick={handleRunCompatibilityCheck}
                disabled={checking}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-lg flex items-center gap-2"
              >
                {checking ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Run Compatibility & Telemetry Assessment'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && wizardResult && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Step 3: Compatibility Verification Results</h3>
            <div className="grid grid-cols-3 gap-4 font-mono text-center">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
                <span className="text-2xl font-bold block">{wizardResult.compatible_count}</span>
                <span className="text-xs uppercase">Compatible Devices</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-400">
                <span className="text-2xl font-bold block">{wizardResult.incompatible_count}</span>
                <span className="text-xs uppercase">Incompatible</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                <span className="text-2xl font-bold block">{wizardResult.offline_count}</span>
                <span className="text-xs uppercase">Offline</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400">Back</button>
              <button onClick={() => setStep(4)} className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300">Next: Device Analysis</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Step 4 &amp; 5: Adaptive Engine Transfer Mode Allocations</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase">
                  <tr>
                    <th className="p-2.5">Device</th>
                    <th className="p-2.5">Health</th>
                    <th className="p-2.5">RSSI / Loss</th>
                    <th className="p-2.5">Adaptive Transfer Mode</th>
                    <th className="p-2.5">Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-[11px]">
                  {wizardResult?.devices?.map((d: any) => (
                    <tr key={d.id}>
                      <td className="p-2.5 text-cyan-300 font-bold">{d.device_id}</td>
                      <td className="p-2.5 text-slate-200">{d.health_score}%</td>
                      <td className="p-2.5 text-slate-300">{d.wifi_rssi} dBm ({d.packet_loss}%)</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          d.recommended_mode === 'FAST' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                          d.recommended_mode === 'NORMAL' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                        }`}>
                          {d.recommended_mode} MODE
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-400 italic text-[10px]">{d.explanation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400">Back</button>
              <button onClick={() => setStep(6)} className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300">Next: Strategy Select</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Step 6: Select Deployment Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {[
                { id: 'STAGED', title: 'Staged Rollout (Recommended)', desc: 'Rolls out in 3 progressive stages with post-reboot health check gates.' },
                { id: 'IMMEDIATE', title: 'Immediate Parallel Rollout', desc: 'Updates all target ESP32 devices simultaneously.' },
                { id: 'MANUAL', title: 'Manual Stage Approval', desc: 'Pauses after each stage requiring administrator confirmation.' }
              ].map((s) => (
                <div
                  key={s.id}
                  onClick={() => setStrategy(s.id as any)}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    strategy === s.id ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300' : 'border-slate-800 bg-slate-900/60 text-slate-400'
                  }`}
                >
                  <h4 className="font-bold text-slate-100 mb-1">{s.title}</h4>
                  <p className="text-[11px] text-slate-400">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(4)} className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400">Back</button>
              <button onClick={() => setStep(7)} className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300">Next: Review &amp; Launch</button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-100">Step 7: Confirm &amp; Launch Deployment</h3>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">Deployment Name:</span>
                <span className="text-slate-100 font-bold">{deploymentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Strategy:</span>
                <span className="text-cyan-400 font-bold">{strategy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Device Count:</span>
                <span className="text-emerald-400 font-bold">{selectedDeviceIds.length} ESP32 Devices</span>
              </div>
            </div>

            <button
              onClick={handleLaunchDeployment}
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Rocket className="w-5 h-5" /> Launch Staged Multithreaded TFTP Deployment</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
