import React, { useMemo } from 'react';
import { Grid3X3 } from 'lucide-react';
import { EntidadeSelecionada } from '../../types';

interface Props {
  data: EntidadeSelecionada[];
  formatBRL: (v: number) => string;
}

const truncate = (s: string, n = 28) => s.length > n ? s.substring(0, n) + '…' : s;

export function InsightsFiscalHeatmapCard({ data, formatBRL }: Props) {
  const { matrix, fiscais, objetivos, maxCount } = useMemo(() => {
    const fomento = data.filter(d =>
      d.tipoRepasse === 'Fomento' && d.FISCAL && d.OBJETIVO_ESTRATEGICO
    );

    // Fiscais únicos (por nº de projetos)
    const fiscalCount = new Map<string, number>();
    fomento.forEach(d => {
      const f = d.FISCAL.trim();
      fiscalCount.set(f, (fiscalCount.get(f) ?? 0) + 1);
    });
    const topFiscais = Array.from(fiscalCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([f]) => f);

    // Objetivos únicos
    const objSet = new Map<string, number>();
    fomento.forEach(d => {
      const obj = (d.OBJETIVO_ESTRATEGICO ?? '').trim();
      if (obj) objSet.set(obj, (objSet.get(obj) ?? 0) + 1);
    });
    const topObjetivos = Array.from(objSet.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([o]) => o);

    // Matriz: [objetivo][fiscal] = { count, valor }
    const mat: Record<string, Record<string, { count: number; valor: number }>> = {};
    topObjetivos.forEach(o => {
      mat[o] = {};
      topFiscais.forEach(f => { mat[o][f] = { count: 0, valor: 0 }; });
    });

    fomento.forEach(d => {
      const obj = (d.OBJETIVO_ESTRATEGICO ?? '').trim();
      const f = d.FISCAL.trim();
      if (mat[obj]?.[f] !== undefined) {
        mat[obj][f].count++;
        mat[obj][f].valor += d.VALOR_REPASSE;
      }
    });

    const max = Math.max(1, ...topObjetivos.flatMap(o =>
      topFiscais.map(f => mat[o]?.[f]?.count ?? 0)
    ));

    return { matrix: mat, fiscais: topFiscais, objetivos: topObjetivos, maxCount: max };
  }, [data]);

  const cellBg = (count: number) => {
    if (count === 0) return 'bg-slate-50 text-slate-300';
    const intensity = count / maxCount;
    if (intensity >= 0.8) return 'bg-blue-700 text-white';
    if (intensity >= 0.6) return 'bg-blue-500 text-white';
    if (intensity >= 0.4) return 'bg-blue-400 text-white';
    if (intensity >= 0.2) return 'bg-blue-200 text-blue-800';
    return 'bg-blue-100 text-blue-700';
  };

  const shortFiscal = (f: string) => {
    const parts = f.split(' ');
    return parts.length >= 2 ? `${parts[0]} ${parts[1][0]}.` : parts[0];
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Grid3X3 size={18} className="text-blue-600" />
        <h3 className="font-semibold text-slate-800">Concentração por Objetivo Estratégico</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Distribuição dos projetos Fomento 2026 por fiscal e objetivo estratégico.
        Intensidade da cor = quantidade de projetos na célula.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-max">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wide w-48">
                Objetivo Estratégico
              </th>
              {fiscais.map(f => (
                <th key={f} className="px-2 py-2 text-center text-[10px] font-semibold text-slate-600 min-w-[72px]">
                  <span title={f}>{shortFiscal(f)}</span>
                </th>
              ))}
              <th className="px-2 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody>
            {objetivos.map(obj => {
              const rowTotal = fiscais.reduce((s, f) => s + (matrix[obj]?.[f]?.count ?? 0), 0);
              return (
                <tr key={obj} className="border-t border-slate-100 hover:bg-slate-50/60 transition-colors">
                  <td className="px-2 py-2 text-[11px] text-slate-700 font-medium" title={obj}>
                    {truncate(obj)}
                  </td>
                  {fiscais.map(f => {
                    const cell = matrix[obj]?.[f] ?? { count: 0, valor: 0 };
                    return (
                      <td key={f} className="px-1 py-1 text-center">
                        <div
                          className={`rounded-md px-2 py-1.5 text-center font-semibold text-xs transition-colors ${cellBg(cell.count)}`}
                          title={cell.count > 0 ? `${cell.count} proj. · ${formatBRL(cell.valor)}` : ''}
                        >
                          {cell.count > 0 ? cell.count : '–'}
                        </div>
                      </td>
                    );
                  })}
                  <td className="px-2 py-2 text-center text-xs font-bold text-slate-600">{rowTotal}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-2 py-2 text-[11px] font-bold text-slate-600">Total</td>
              {fiscais.map(f => {
                const colTotal = objetivos.reduce((s, o) => s + (matrix[o]?.[f]?.count ?? 0), 0);
                return (
                  <td key={f} className="px-2 py-2 text-center text-xs font-bold text-slate-700">{colTotal}</td>
                );
              })}
              <td className="px-2 py-2 text-center text-xs font-bold text-blue-700">
                {fiscais.reduce((s, f) => s + objetivos.reduce((ss, o) => ss + (matrix[o]?.[f]?.count ?? 0), 0), 0)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <span className="text-[10px] text-slate-400">Intensidade:</span>
        {['bg-blue-100', 'bg-blue-200', 'bg-blue-400', 'bg-blue-500', 'bg-blue-700'].map((c, i) => (
          <div key={i} className={`${c} w-5 h-3 rounded`} />
        ))}
        <span className="text-[10px] text-slate-400">menos → mais</span>
      </div>
    </div>
  );
}
