import React, { useMemo } from 'react';
import { Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { EntidadeSelecionada } from '../../types';

interface Props {
  data: EntidadeSelecionada[];
  formatBRL: (v: number) => string;
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#0ea5e9', '#06b6d4', '#10b981', '#14b8a6', '#f59e0b'];

export function InsightsFiscalWorkloadCard({ data, formatBRL }: Props) {
  const fiscalStats = useMemo(() => {
    const fomento = data.filter(d => d.tipoRepasse === 'Fomento' && d.FISCAL);
    const map = new Map<string, { count: number; value: number; comTermo: number; com1: number }>();

    fomento.forEach(d => {
      const f = d.FISCAL.trim();
      const prev = map.get(f) ?? { count: 0, value: 0, comTermo: 0, com1: 0 };
      map.set(f, {
        count: prev.count + 1,
        value: prev.value + d.VALOR_REPASSE,
        comTermo: prev.comTermo + (d.gestao_termodefomento ? 1 : 0),
        com1: prev.com1 + (parseFloat(String(d.gestao_primeirorepasse ?? '')) > 0 ? 1 : 0),
      });
    });

    return Array.from(map.entries())
      .map(([name, s]) => ({
        name: name.split(' ').slice(0, 2).join(' '), // primeiros 2 nomes p/ legibilidade
        fullName: name,
        projetos: s.count,
        value: s.value,
        comTermo: s.comTermo,
        com1Repasse: s.com1,
        pctTermo: s.count > 0 ? Math.round((s.comTermo / s.count) * 100) : 0,
      }))
      .sort((a, b) => b.projetos - a.projetos);
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
        <p className="font-semibold text-blue-300">{d.fullName}</p>
        <p>Projetos: <span className="font-bold">{d.projetos}</span></p>
        <p>Valor total: <span className="font-bold text-emerald-400">{formatBRL(d.value)}</span></p>
        <p>Com termo: <span className="font-bold">{d.comTermo} ({d.pctTermo}%)</span></p>
        <p>Com 1º repasse: <span className="font-bold">{d.com1Repasse}</span></p>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Users size={18} className="text-indigo-600" />
        <h3 className="font-semibold text-slate-800">Carga por Fiscal</h3>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Distribuição de projetos e valor sob responsabilidade de cada fiscal
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={fiscalStats} layout="vertical" margin={{ top: 0, right: 60, left: 4, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="name"
            tick={{ fontSize: 11, fill: '#475569' }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="projetos" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {fiscalStats.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
            <LabelList dataKey="projetos" position="right" style={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3">
        {fiscalStats.map((f, i) => (
          <div key={f.fullName} className="rounded-lg border border-slate-100 bg-slate-50 p-2 text-center">
            <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <p className="text-[10px] text-slate-500 truncate" title={f.fullName}>{f.name}</p>
            <p className="text-xs font-bold text-slate-700">{f.projetos} proj.</p>
            <p className="text-[10px] text-emerald-600 font-medium">{formatBRL(f.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
