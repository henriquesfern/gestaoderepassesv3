import React from 'react';
import { Star } from 'lucide-react';
import { formatCNPJ } from '../../utils/sanitizers';

export function DirectoryECGeralRow({ item }: any) {
  const state = item.origem ? item.origem.replace('Crea-', '').toUpperCase() : '-';
  const hasFomento = item.isFomento;
  const hasPatrocinio = item.isPatrocinio;

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex gap-1">
          {hasFomento && (
            <div title="Fomento" className="p-1 rounded bg-[#008f4c]/10 text-[#008f4c]">
              <Star size={16} className="fill-current" />
            </div>
          )}
          {hasPatrocinio && (
            <div title="Patrocínio" className="p-1 rounded bg-[#d4a017]/10 text-[#d4a017]">
              <Star size={16} className="fill-current" />
            </div>
          )}
          {!hasFomento && !hasPatrocinio && (
            <span className="text-slate-300">-</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
        {item.sigla || '-'}
      </td>
      <td className="px-6 py-4 text-slate-700">
        {item.denominacao}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
        {item.cnpjsDetails && item.cnpjsDetails.length > 0 ? (
          <div className="flex flex-col gap-2">
            {item.cnpjsDetails.map((detail: any, i: number) => (
              <div key={i} className="flex flex-col gap-1">
                <span className="font-mono">{formatCNPJ(detail.cnpj)}</span>
                <div className="flex flex-wrap gap-1">
                  {detail.sources.map((source: string) => {
                    let colorClass = 'bg-slate-100 text-slate-600 border border-slate-200';
                    if (source.includes('Fomento')) colorClass = 'bg-emerald-50 text-[#19904E] border border-[#19904E]/30';
                    else if (source.includes('Patrocínio')) colorClass = 'bg-amber-50 text-[#F19D26] border border-[#F19D26]/30';
                    else if (source === 'CDEN') colorClass = 'bg-blue-50 text-blue-700 border border-blue-700/30';
                    else if (source === 'Precursoras') colorClass = 'bg-purple-50 text-purple-700 border border-purple-700/30';
                    
                    let label = source;
                    if (source === 'Fomento2025') label = 'Fomento (2025)';
                    if (source === 'Fomento2026') label = 'Fomento (2026)';
                    if (source === 'Patrocínio2025') label = 'Patrocínio (2025)';

                    return (
                      <span key={source} className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${colorClass}`}>
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {item.isCDEN ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
            Sim
          </span>
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-center">
        {item.isPrecursora ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
            Sim
          </span>
        ) : (
          <span className="text-slate-300">-</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#003865]/10 text-[#003865]">
          {state}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          {item.tipo || '-'}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-red-600 font-medium">
        {item.obs}
      </td>
    </tr>
  );
}
