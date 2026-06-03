import React, { useMemo } from 'react';
import { TableProperties, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { EntidadeSelecionada } from '../../types';

interface Props {
  data: EntidadeSelecionada[];
  formatBRL: (v: number) => string;
}

export function InsightsFiscalProgressTable({ data, formatBRL }: Props) {
  const rows = useMemo(() => {
    const fomento = data.filter(d => d.tipoRepasse === 'Fomento' && d.FISCAL);
    const map = new Map<string, {
      projetos: number; value: number;
      comTermo: number; com1: number; com2: number;
    }>();

    fomento.forEach(d => {
      const f = d.FISCAL.trim();
      const p = map.get(f) ?? { projetos: 0, value: 0, comTermo: 0, com1: 0, com2: 0 };
      map.set(f, {
        projetos: p.projetos + 1,
        value: p.value + d.VALOR_REPASSE,
        comTermo: p.comTermo + (d.gestao_termodefomento ? 1 : 0),
        com1: p.com1 + (parseFloat(String(d.gestao_primeirorepasse ?? '')) > 0 ? 1 : 0),
        com2: p.com2 + (parseFloat(String(d.gestao_segundorepasse ?? '')) > 0 ? 1 : 0),
      });
    });

    return Array.from(map.entries())
      .map(([fiscal, s]) => ({
        fiscal,
        ...s,
        pctExecucao: s.projetos > 0
          ? Math.round(((s.comTermo + s.com1 * 2 + s.com2 * 3) / (s.projetos * 3)) * 100)
          : 0,
      }))
      .sort((a, b) => b.projetos - a.projetos);
  }, [data]);

  const StageCell = ({ n, total, color }: { n: number; total: number; color: string }) => {
    const pct = total > 0 ? Math.round((n / total) * 100) : 0;
    return (
      <td className="px-3 py-2 text-center">
        <span className={`text-sm font-bold ${color}`}>{n}</span>
        <span className="text-[10px] text-slate-400 ml-1">/{total}</span>
      </td>
    );
  };

  const ProgressBar = ({ pct }: { pct: number }) => {
    const color = pct >= 70 ? 'bg-emerald-500' : pct >= 35 ? 'bg-amber-400' : 'bg-slate-300';
    return (
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-slate-600 w-8 text-right">{pct}%</span>
        </div>
      </td>
    );
  };

  const totalGeral = rows.reduce((s, r) => s + r.projetos, 0);
  const totalValue = rows.reduce((s, r) => s + r.value, 0);
  const totalTermo = rows.reduce((s, r) => s + r.comTermo, 0);
  const total1 = rows.reduce((s, r) => s + r.com1, 0);
  const total2 = rows.reduce((s, r) => s + r.com2, 0);

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <TableProperties size={18} className="text-slate-600" />
        <h3 className="font-semibold text-slate-800">Avanço de Execução por Fiscal</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Progressão de cada fiscal pelas etapas do ciclo de repasse Fomento 2026
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Fiscal</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide">Projetos</th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-blue-600 uppercase tracking-wide">
                <span className="flex items-center justify-center gap-1">
                  <CheckCircle2 size={11} /> Termo
                </span>
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                <span className="flex items-center justify-center gap-1">
                  <Clock size={11} /> 1º Repasse
                </span>
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-violet-600 uppercase tracking-wide">
                <span className="flex items-center justify-center gap-1">
                  <AlertCircle size={11} /> 2º Repasse
                </span>
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor Total</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide w-36">Execução</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.fiscal} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                <td className="px-3 py-2">
                  <p className="text-xs font-medium text-slate-700 truncate max-w-[160px]" title={r.fiscal}>{r.fiscal}</p>
                </td>
                <td className="px-3 py-2 text-center text-sm font-bold text-slate-700">{r.projetos}</td>
                <StageCell n={r.comTermo} total={r.projetos} color="text-blue-600" />
                <StageCell n={r.com1} total={r.projetos} color="text-emerald-600" />
                <StageCell n={r.com2} total={r.projetos} color="text-violet-600" />
                <td className="px-3 py-2 text-right text-xs font-medium text-emerald-600">{formatBRL(r.value)}</td>
                <ProgressBar pct={r.pctExecucao} />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-3 py-2 text-xs font-bold text-slate-600">TOTAL</td>
              <td className="px-3 py-2 text-center text-sm font-bold text-slate-700">{totalGeral}</td>
              <td className="px-3 py-2 text-center text-sm font-bold text-blue-600">{totalTermo}</td>
              <td className="px-3 py-2 text-center text-sm font-bold text-emerald-600">{total1}</td>
              <td className="px-3 py-2 text-center text-sm font-bold text-violet-600">{total2}</td>
              <td className="px-3 py-2 text-right text-xs font-bold text-emerald-600">{formatBRL(totalValue)}</td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-[10px] text-slate-400 mt-3">
        * % Execução ponderada: termo (33%) + 1º repasse (33%) + 2º repasse (33%).
        Dados em atualização conforme andamento do ciclo 2026.
      </p>
    </div>
  );
}
