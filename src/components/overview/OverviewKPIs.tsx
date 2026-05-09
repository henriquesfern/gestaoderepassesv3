import React from 'react';
import { Building2, CircleDollarSign } from 'lucide-react';

interface OverviewKPIsProps {
  kpis: {
    total: number;
    totalFomentado: string;
  };
  tColorPrimaryHex: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  bgSecondaryClass: string;
}

export function OverviewKPIs({ kpis, tColorPrimaryHex, textPrimaryClass, textSecondaryClass, bgSecondaryClass }: OverviewKPIsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-white shadow-sm flex items-center justify-start gap-6 border-l-8" style={{ borderLeftColor: tColorPrimaryHex }}>
          <Building2 className={`opacity-80 shrink-0 ${textPrimaryClass}`} size={64} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-500 mb-2 uppercase tracking-wider">Entidades Selecionadas</p>
            <div className="flex items-end justify-between">
              <p className={`text-6xl font-black tracking-tight ${textSecondaryClass}`}>{kpis.total}</p>
            </div>
          </div>
        </div>
        <div className={`p-8 text-white shadow-sm flex items-center justify-start gap-6 relative overflow-hidden ${bgSecondaryClass}`}>
           <div className="absolute -right-8 -top-12 opacity-10 pointer-events-none">
             <div className="w-48 h-48 rounded-full bg-white"></div>
           </div>
          <CircleDollarSign className="opacity-80 z-10 relative shrink-0 text-white" size={64} />
          <div className="z-10 relative">
            <p className="text-sm font-semibold mb-2 uppercase tracking-wider text-white/90">Total de Repasse</p>
            <p className="text-5xl font-black tracking-tight text-white">{kpis.totalFomentado}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
