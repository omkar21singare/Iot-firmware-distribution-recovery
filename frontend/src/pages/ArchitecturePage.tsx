import React from 'react';
import { Network } from 'lucide-react';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

export const ArchitecturePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Network className="w-5 h-5 text-cyan-400" />
          System Architecture &amp; UDP Multithreaded TFTP Protocol Stack
        </h2>
        <p className="text-xs text-slate-400">Complete hardware &amp; software architectural specification for patent committee demonstration</p>
      </div>

      <ArchitectureDiagram />
    </div>
  );
};
