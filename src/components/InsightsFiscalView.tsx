import React, { Suspense, lazy, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { UserCheck } from 'lucide-react';
import { ChartPanelFallback } from './shared/ChartPanelFallback';

const InsightsFiscalMatrixCard = lazy(async () => {
  const m = await import('./insights/InsightsFiscalMatrixCard');
  return { default: m.InsightsFiscalMatrixCard };
});

const InsightsFiscalRadarCard = lazy(async () => {
  const m = await import('./insights/InsightsFiscalRadarCard');
  return { default: m.InsightsFiscalRadarCard };
});

const InsightsFiscalHeatmapCard = lazy(async () => {
  const m = await import('./insights/InsightsFiscalHeatmapCard');
  return { default: m.InsightsFiscalHeatmapCard };
});

export function InsightsFiscalView() {
  const { appData } = useData();

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  const fomento2026 = useMemo(() => appData.fomento2026, [appData.fomento2026]);

  const kpis = useMemo(() => {
    const f = fomento2026.filter(d => d.tipoRepasse === 'Fomento');
    const total = f.length;
    const totalValue = f.reduce((s, d) => s + d.VALOR_REPASSE, 0);
    const notaMedia = total > 0
      ? f.filter(d => d.NOTA > 0).reduce((s, d) => s + d.NOTA, 0) /
        Math.max(1, f.filter(d => d.NOTA > 0).length)
      : 0;
    const fiscais = new Set(f.map(d => d.FISCAL).filter(Boolean)).size;
    const semFiscal = f.filter(d => !d.FISCAL || d.FISCAL.trim() === '').length;
    return { total, totalValue, notaMedia: notaMedia.toFixed(2), fiscais, semFiscal };
  }, [fomento2026]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <UserCheck className="text-[#3b82f6]" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Análise Fiscal</h2>
          <p className="text-slate-500">
            Visão estratégica do portfólio dos fiscais — qualidade, alinhamento Infra-BR e distribuição por objetivo.
            Fomento 2026.
          </p>
        </div>
      </div>

      {/* KPIs resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Projetos Fomento 2026', value: String(kpis.total), sub: formatBRL(kpis.totalValue), color: 'text-blue-700' },
          { label: 'Nota Média do Ciclo', value: kpis.notaMedia, sub: 'escala 0–12', color: 'text-amber-600' },
          { label: 'Fiscais Atuantes', value: String(kpis.fiscais), sub: `≈ ${kpis.fiscais > 0 ? Math.round(kpis.total / kpis.fiscais) : 0} proj. por fiscal`, color: 'text-indigo-600' },
          { label: 'Sem Fiscal Atribuído', value: String(kpis.semFiscal), sub: kpis.semFiscal === 0 ? 'todos atribuídos' : 'requer atenção', color: kpis.semFiscal === 0 ? 'text-emerald-600' : 'text-rose-600' },
        ].map(kpi => (
          <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Matriz de portfólio + Radar Infra-BR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartPanelFallback className="bg-white p-6 border border-slate-200 shadow-sm" />}>
          <InsightsFiscalMatrixCard data={fomento2026} formatBRL={formatBRL} />
        </Suspense>

        <Suspense fallback={<ChartPanelFallback className="bg-white p-6 border border-slate-200 shadow-sm" />}>
          <InsightsFiscalRadarCard data={fomento2026} />
        </Suspense>
      </div>

      {/* Heatmap de concentração */}
      <Suspense fallback={<ChartPanelFallback className="bg-white p-6 border border-slate-200 shadow-sm" />}>
        <InsightsFiscalHeatmapCard data={fomento2026} formatBRL={formatBRL} />
      </Suspense>
    </div>
  );
}
