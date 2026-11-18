import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { api } from '../services/api';

interface BlockResumeModalProps {
  session: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const BlockResumeModal: React.FC<BlockResumeModalProps> = ({ session, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [resumed, setResumed] = useState(false);
  const targetBlock = session ? (session.current_block > 0 ? session.current_block : 437) : 437;

  const handleResume = async () => {
    setLoading(true);
    try {
      if (session?.id) {
        await api.resumeTransferBlock(session.id, targetBlock);
      }
      setResumed(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Interrupted TFTP Session Resume</h3>
            <p className="text-xs text-slate-400">Patent Block-Level Recovery Engine</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">Device Target:</span>
            <span className="text-cyan-400 font-bold">{session?.device_code || 'ESP32-004'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Target Firmware:</span>
            <span>{session?.firmware_version || 'ESP32_MOTOR_v2.4.1'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Last ACK Block:</span>
            <span className="text-emerald-400">{targetBlock - 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Failed Block Index:</span>
            <span className="text-rose-400 font-bold">{targetBlock}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Retry Counter:</span>
            <span>{session?.retries || 2}</span>
          </div>
        </div>

        {resumed ? (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Transfer resumed from block {targetBlock} instead of restarting from block 0!
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            Executing block-level resume will request block <strong className="text-cyan-300">{targetBlock}</strong> directly from the TFTP server, preserving the previously transferred 223.7 KB.
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 border border-slate-700 bg-slate-800/60"
          >
            Cancel
          </button>
          <button
            onClick={handleResume}
            disabled={loading || resumed}
            className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              `Resume from Block ${targetBlock}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
