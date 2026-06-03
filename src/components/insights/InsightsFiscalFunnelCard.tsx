import React from 'react';
import { GitMerge } from 'lucide-react';
import { EntidadeSelecionada } from '../../types';

interface Props {
  data: EntidadeSelecionada[];
  formatBRL: (v: number) => string;
}

interface Stage {
  label: string;
  sublabel: string;
  count: number;
  total: number;
  color: string;
  bg: string;
}

export function InsightsFiscalFunnelCard({ data, formatBRL }: Props) {
  const fomento = data.filter(d => d.tipoRepasse === 'Fomento');
  const total = fomento.length;
  const totalValue = fomento.reduce((s, d) => s + d.VALOR_REPASSE, 0);

  const comTermo = fomento.filter(d => d.gestao_termodefomento && d.gestao_termodefomento.trim() !== '');
  const comTernoValue = comTermo.reduce((s, d) => s + d.VALOR_REPASSE, 0);

  const com1Repasse = fomento.filter(d => {
    const v = parseFloat(String(d.gestao_primeirorepasse ?? ''));
    return isFinite(v) && v > 0;
  });
  const com1Value = com1Repasse.reduce((s, d) => s + parseFloat(String(d.gestao_primeirorepasse ?? '0')), 0);

  const com2Repasse = fomento.filter(d => {
    const v = parseFloat(String(d.gestao_segundorepasse ?? ''));
    return isFinite(v) && v > 0;
  });
  const com2Value = com2Repasse.reduce((s, d) => s + parseFloat(String(d.gestao_segundorepasse ?? '0')), 0);

  const stages: Stage[] = [
    { label: 'Projetos contratados', sublabel: 'Termo de fomento assinado', count: comTermo.length, total: comTernoValue, color: 'text-blue-700', bg: 'bg-blue-500' },
    { label: '1º Repasse realizado', sublabel: 'Primeiro desembolso efetuado', count: com1Repasse.length, total: com1Value, color: 'text-emerald-700', bg: 'bg-emerald-500' },
    { label: '2º Repasse realizado', sublabel: 'Segundo desembolso efetuado', count: com2Repasse.length, total: com2Value, color: 'text-violet-700', bg: 'bg-violet-500' },
  ];

  const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
  const conv = (n: number, prev: number) => prev > 0 ? Math.round((n / prev) * 100) : 0;

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <GitMerge size={18} className="text-blue-600" />
        <h3 className="font-semibold text-slate-800">Funil de Execução Financeira</h3>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Progressão dos {total} projetos Fomento 2026 pelas etapas de repasse
        {' '}· Total contratado: <span className="font-medium text-slate-700">{formatBRL(totalValue)}</span>
      </p>

      <div className="space-y-3">
        {stages.map((stage, i) => {
          const prev = i === 0 ? total : stages[i - 1].count;
          const pctOfTotal = pct(stage.count);
          const pctOfPrev = i === 0 ? pct(stage.count) : conv(stage.count, prev);
          const barWidth = Math.max(4, pctOfTotal);
          const emAberto = (i === 0 ? total : stages[i - 1].count) - stage.count;

          return (
            <div key={stage.label}>
              {i > 0 && (
                <div className="flex items-center gap-1 my-1 pl-2">
                  <div className="w-px h-3 bg-slate-200 ml-3" />
                  <span className="text-[10px] text-slate-400">
                    {pctOfPrev}% convertidos da etapa anterior
                  </span>
                </div>
              )}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className={`text-sm font-semibold ${stage.color}`}>{stage.label}</p>
                    <p className="text-[11px] text-slate-500">{stage.sublabel}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${stage.color}`}>{stage.count}</p>
                    <p className="text-[10px] text-slate-400">{pctOfTotal}% do total</p>
                  </div>
                </div>

                <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-full ${stage.bg} rounded-full transition-all duration-700`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <div className="flex justify-between mt-1.5 text-[10px]">
                  <span className="text-slate-500">
                    Em aberto: <span className="font-medium text-amber-600">{emAberto}</span>
                  </span>
                  {stage.total > 0 && (
                    <span className={`font-medium ${stage.color}`}>{formatBRL(stage.total)}</span>
                  )}
                  {stage.total === 0 && stage.count === 0 && (
                    <span className="text-slate-400 italic">dados em atualização</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
