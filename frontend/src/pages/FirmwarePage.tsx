import React, { useEffect, useState } from 'react';
import { HardDrive, Upload, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import type { Firmware } from '../types';

export const FirmwarePage: React.FC = () => {
  const [firmwares, setFirmwares] = useState<Firmware[]>([]);
  const [uploading, setUploading] = useState(false);

  // Form fields
  const [name, setName] = useState('ESP32_MOTOR_MONITOR');
  const [version, setVersion] = useState('v2.5.0');
  const [compatibleGroup, setCompatibleGroup] = useState('ESP32-MOTOR');
  const [changelog, setChangelog] = useState('Added UDP multithreaded TFTP client block-resume support');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchFirmware();
  }, []);

  const fetchFirmware = async () => {
    try {
      const data = await api.getFirmwareList();
      setFirmwares(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a .bin firmware binary file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('version', version);
    formData.append('compatible_group', compatibleGroup);
    formData.append('changelog', changelog);
    formData.append('file', file);

    try {
      await api.uploadFirmware(formData);
      alert('Firmware uploaded and SHA-256 hash calculated successfully!');
      fetchFirmware();
      setFile(null);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          Firmware Binary Repository &amp; Hash Integrity Verification
        </h2>
        <p className="text-xs text-slate-400">Upload `.bin` files, calculate cryptographic SHA-256 hashes, and manage target compatibility</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" /> Upload New Firmware Binary (.bin)
          </h3>

          <form onSubmit={handleUpload} className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Firmware Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Version String</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Hardware Compatibility Series</label>
              <select
                value={compatibleGroup}
                onChange={(e) => setCompatibleGroup(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ESP32-MOTOR">ESP32-MOTOR Series</option>
                <option value="ESP32-GATEWAY">ESP32-GATEWAY Series</option>
                <option value="ESP32-SENSOR">ESP32-SENSOR Series</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Select .bin Binary File</label>
              <input
                type="file"
                accept=".bin"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-cyan-950 file:text-cyan-400"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Changelog / Release Notes</label>
              <textarea
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition shadow-lg flex items-center justify-center gap-2"
            >
              {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Validate & Upload Firmware'}
            </button>
          </form>
        </div>

        {/* Existing Firmware List */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-glass-card border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
            Registered Firmware Binaries ({firmwares.length})
            <span className="text-[10px] font-mono text-emerald-400">SHA-256 Hardware Validation</span>
          </h3>

          <div className="space-y-3">
            {firmwares.map((fw) => (
              <div key={fw.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">{fw.compatible_group}</span>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      {fw.name} <span className="text-xs text-emerald-400 font-mono">({fw.version})</span>
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    STATUS: READY
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">File Size:</span>
                    <span className="text-slate-200">{(fw.size_bytes / (1024 * 1024)).toFixed(2)} MB ({fw.size_bytes.toLocaleString()} bytes)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">SHA-256 Hash:</span>
                    <span className="text-cyan-400 text-[10px] truncate max-w-[280px] font-mono">{fw.sha256_hash}</span>
                  </div>
                </div>

                {fw.changelog && (
                  <p className="text-xs text-slate-400 italic">"{fw.changelog}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
