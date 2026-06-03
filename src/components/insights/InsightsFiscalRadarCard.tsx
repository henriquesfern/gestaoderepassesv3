import React, { useMemo } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Hexagon } from 'lucide-react';
import { EntidadeSelecionada } from '../../types';

interface Props {
  data: EntidadeSelecionada[];
}

const FISCAL_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();

export function InsightsFiscalRadarCard({ data }: Props) {
  const { radarData, fiscais } = useMemo(() => {
    const fomento = data.filter(d => d.tipoRepasse === 'Fomento' && d.FISCAL);

    // Descobre todas as dimensões únicas dos projetos
    const dimSet = new Set<string>();
    fomento.forEach(d => {
      [d.DIMENSAO_1, d.DIMENSAO_2, d.DIMENSAO_3, d.DIMENSAO_4, d.DIMENSAO_5].forEach(dim => {
        if (dim && dim.trim()) dimSet.add(normalizar(dim.trim()));
      });
    });

    // Mapeamento para label curto de exibição
    const labelMap: Record<string, string> = {};
    fomento.forEach(d => {
      [d.DIMENSAO_1, d.DIMENSAO_2, d.DIMENSAO_3, d.DIMENSAO_4, d.DIMENSAO_5].forEach(dim => {
        if (dim && dim.trim()) {
          const key = normalizar(dim.trim());
          if (!labelMap[key]) {
            // Mantém label original com capitalização
            labelMap[key] = dim.trim().length > 22
              ? dim.trim().substring(0, 22) + '…'
              : dim.trim();
          }
        }
      });
    });

    const dims = Array.from(dimSet);

    // Fiscais com mais projetos (máx 6 para legibilidade)
    const fiscalCount = new Map<string, number>();
    fomento.forEach(d => {
      const f = d.FISCAL.trim();
      fiscalCount.set(f, (fiscalCount.get(f) ?? 0) + 1);
    });
    const topFiscais = Array.from(fiscalCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([f]) => f);

    // Para cada fiscal: conta projetos por dimensão
    const fiscalDimCount: Record<string, Record<string, number>> = {};
    topFiscais.forEach(f => { fiscalDimCount[f] = {}; dims.forEach(d => { fiscalDimCount[f][d] = 0; }); });

    fomento.forEach(d => {
      const f = d.FISCAL.trim();
      if (!topFiscais.includes(f)) return;
      [d.DIMENSAO_1, d.DIMENSAO_2, d.DIMENSAO_3, d.DIMENSAO_4, d.DIMENSAO_5].forEach(dim => {
        if (dim && dim.trim()) {
          const key = normalizar(dim.trim());
          fiscalDimCount[f][key] = (fiscalDimCount[f][key] ?? 0) + 1;
        }
      });
    });

    // Normaliza: % dos projetos do fiscal em cada dimensão (máx 100)
    const fiscalTotal = Object.fromEntries(topFiscais.map(f => [f, fiscalCount.get(f) ?? 1]));
    const radarRows = dims.map(dim => {
      const row: Record<string, any> = { dimension: labelMap[dim] ?? dim };
      topFiscais.forEach(f => {
        row[f] = parseFloat(
          ((fiscalDimCount[f][dim] / fiscalTotal[f]) * 100).toFixed(1)
        );
      });
      return row;
    });

    return { radarData: radarRows, fiscais: topFiscais };
  }, [data]);

  const shortName = (f: string) => f.split(' ').slice(0, 2).join(' ');

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Hexagon size={18} className="text-violet-500" />
        <h3 className="font-semibold text-slate-800">Alinhamento Infra-BR por Fiscal</h3>
      </div>
      <p className="text-xs text-slate-500 mb-5">
        Distribuição dos projetos de cada fiscal pelas dimensões do Infra-BR
        (% dos projetos com aderência a cada dimensão)
      </p>

      <ResponsiveContainer width="100%" height={340}>
        <RadarChart data={radarData} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fontSize: 10, fill: '#64748b' }}
          />
          <PolarRadiusAxis
            angle={90} domain={[0, 100]}
            tick={{ fontSize: 9, fill: '#94a3b8' }}
            tickFormatter={v => `${v}%`}
          />
          {fiscais.map((f, i) => (
            <Radar
              key={f}
              name={shortName(f)}
              dataKey={f}
              stroke={FISCAL_COLORS[i % FISCAL_COLORS.length]}
              fill={FISCAL_COLORS[i % FISCAL_COLORS.length]}
              fillOpacity={0.08}
              strokeWidth={2}
              dot={{ r: 3, fill: FISCAL_COLORS[i % FISCAL_COLORS.length] }}
            />
          ))}
          <Tooltip
            formatter={(value: number, name: string) => [`${value}%`, shortName(name)]}
            contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Legend
            formatter={(value) => <span style={{ fontSize: 10, color: '#475569' }}>{shortName(value)}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
