import React, { useMemo } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { Target } from 'lucide-react';
import { EntidadeSelecionada } from '../../types';

interface Props {
  data: EntidadeSelecionada[];
  formatBRL: (v: number) => string;
}

// Cor baseada no % de execução: verde → âmbar → cinza
function execColor(pct: number) {
  if (pct >= 60) return '#10b981';
  if (pct >= 30) return '#f59e0b';
  return '#94a3b8';
}

export function InsightsFiscalMatrixCard({ data, formatBRL }: Props) {
  const { points, medianNota, medianValor } = useMemo(() => {
    const fomento = data.filter(d => d.tipoRepasse === 'Fomento' && d.FISCAL);
    const map = new Map<string, {
      notas: number[]; valor: number; projetos: number;
      comTermo: number; com1: number; com2: number;
    }>();

    fomento.forEach(d => {
      const f = d.FISCAL.trim();
      const p = map.get(f) ?? { notas: [], valor: 0, projetos: 0, comTermo: 0, com1: 0, com2: 0 };
      if (d.NOTA > 0) p.notas.push(d.NOTA);
      p.valor += d.VALOR_REPASSE;
      p.projetos++;
      if (d.gestao_termodefomento) p.comTermo++;
      if (parseFloat(String(d.gestao_primeirorepasse ?? '')) > 0) p.com1++;
      if (parseFloat(String(d.gestao_segundorepasse ?? '')) > 0) p.com2++;
      map.set(f, p);
    });

    const pts = Array.from(map.entries()).map(([fiscal, s]) => {
      const notaMedia = s.notas.length > 0
        ? s.notas.reduce((a, b) => a + b, 0) / s.notas.length
        : 0;
      const pctExec = s.projetos > 0
        ? Math.round(((s.comTermo + s.com1 * 2 + s.com2 * 3) / (s.projetos * 3)) * 100)
        : 0;
      return {
        fiscal,
        shortName: fiscal.split(' ').slice(0, 2).join(' '),
        notaMedia: parseFloat(notaMedia.toFixed(2)),
        valorTotal: s.valor,
        projetos: s.projetos,
        pctExec,
        r: Math.max(10, Math.sqrt(s.projetos) * 14),
      };
    });

    const notas = pts.map(p => p.notaMedia).filter(n => n > 0).sort((a, b) => a - b);
    const valores = pts.map(p => p.valorTotal).sort((a, b) => a - b);
    const medN = notas[Math.floor(notas.length / 2)] ?? 10;
    const medV = valores[Math.floor(valores.length / 2)] ?? 0;

    return { points: pts, medianNota: medN, medianValor: medV };
  }, [data]);

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    const r = payload.r;
    const color = execColor(payload.pctExec);
    return (
      <g>
        <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.35} stroke={color} strokeWidth={2} />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
          style={{ fontSize: 10, fontWeight: 600, fill: '#1e293b', pointerEvents: 'none' }}>
          {payload.shortName.split(' ')[0]}
        </text>
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 min-w-[180px]">
        <p className="font-semibold text-blue-300 text-sm">{d.fiscal}</p>
        <p>Nota média: <span className="font-bold text-amber-400">{d.notaMedia.toFixed(2)}</span></p>
        <p>Valor total: <span className="font-bold text-emerald-400">{formatBRL(d.valorTotal)}</span></p>
        <p>Projetos: <span className="font-bold">{d.projetos}</span></p>
        <p>% Execução: <span className="font-bold" style={{ color: execColor(d.pctExec) }}>{d.pctExec}%</span></p>
      </div>
    );
  };

  const quadrantLabels = [
    { x: medianNota * 0.5, y: medianValor * 1.5, text: 'Alto Valor / Baixa Nota', color: '#ef4444' },
    { x: medianNota * 1.4, y: medianValor * 1.5, text: 'Alto Valor / Alta Nota', color: '#10b981' },
    { x: medianNota * 0.5, y: medianValor * 0.4, text: 'Baixo Valor / Baixa Nota', color: '#94a3b8' },
    { x: medianNota * 1.4, y: medianValor * 0.4, text: 'Baixo Valor / Alta Nota', color: '#3b82f6' },
  ];

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Target size={18} className="text-rose-500" />
        <h3 className="font-semibold text-slate-800">Matriz de Portfólio dos Fiscais</h3>
      </div>
      <p className="text-xs text-slate-500 mb-1">
        Posição de cada fiscal: Nota média × Valor sob gestão · Tamanho = nº projetos
      </p>
      <div className="flex gap-4 text-[10px] text-slate-500 mb-4">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> ≥60% execução</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 30-60%</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400 inline-block" /> &lt;30%</span>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            type="number" dataKey="notaMedia" name="Nota Média"
            domain={[0, 12]} tickCount={7}
            label={{ value: 'Nota Média dos Projetos', position: 'insideBottom', offset: -10, style: { fontSize: 11, fill: '#64748b' } }}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
          />
          <YAxis
            type="number" dataKey="valorTotal" name="Valor Total"
            tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={medianNota} stroke="#cbd5e1" strokeDasharray="4 3" label={{ value: 'mediana', position: 'top', style: { fontSize: 9, fill: '#94a3b8' } }} />
          <ReferenceLine y={medianValor} stroke="#cbd5e1" strokeDasharray="4 3" />
          <Scatter data={points} shape={<CustomDot />} />
        </ScatterChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {quadrantLabels.map(q => (
          <div key={q.text} className="text-[10px] text-center rounded-lg border border-slate-100 py-1 px-2" style={{ color: q.color }}>
            {q.text}
          </div>
        ))}
      </div>
    </div>
  );
}
