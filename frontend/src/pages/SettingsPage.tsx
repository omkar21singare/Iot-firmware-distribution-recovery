import React, { useState } from 'react';
import { Settings, Server, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [tftpHost, setTftpHost] = useState('0.0.0.0');
  const [tftpPort, setTftpPort] = useState(6969);
  const [maxThreads, setMaxThreads] = useState(10);
  const [defaultTimeout, setDefaultTimeout] = useState(2.5);
  const [maxRetries, setMaxRetries] = useState(5);

  const handleSave = () => {
    alert('System TFTP configuration saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          System Configuration &amp; TFTP Engine Settings
        </h2>
        <p className="text-xs text-slate-400">Configure UDP sockets, thread pool limits, timeouts &amp; retry thresholds</p>
      </div>

      <div className="max-w-2xl p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" /> UDP Multithreaded TFTP Server Parameters
        </h3>

        <div className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1">TFTP Server Listen Host IP</label>
            <input
              type="text"
              value={tftpHost}
              onChange={(e) => setTftpHost(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">TFTP Server UDP Listen Port</label>
            <input
              type="number"
              value={tftpPort}
              onChange={(e) => setTftpPort(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Maximum Worker Threads in Pool</label>
            <input
              type="number"
              value={maxThreads}
              onChange={(e) => setMaxThreads(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Default Block Ack Timeout (seconds)</label>
            <input
              type="number"
              step="0.5"
              value={defaultTimeout}
              onChange={(e) => setDefaultTimeout(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-bold"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Maximum Retry Count per Block</label>
            <input
              type="number"
              value={maxRetries}
              onChange={(e) => setMaxRetries(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-rose-400 font-bold"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition shadow-lg flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Configuration Settings
        </button>
      </div>
    </div>
  );
};
