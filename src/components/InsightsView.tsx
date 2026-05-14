import React, { Suspense, lazy, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Lightbulb } from 'lucide-react';
import { ChartPanelFallback } from './shared/ChartPanelFallback';

const InsightsEntityComparisonCard = lazy(async () => {
  const module = await import('./insights/InsightsEntityComparisonCard');
  return { default: module.InsightsEntityComparisonCard };
});

const InsightsFundingTypeCard = lazy(async () => {
  const module = await import('./insights/InsightsFundingTypeCard');
  return { default: module.InsightsFundingTypeCard };
});

export function InsightsView() {
  const { appData } = useData();
  const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const insights = useMemo(() => {
    const allData = [...appData.fomento2026, ...appData.fomentoHistorico, ...appData.patrocinioHistorico];

    let cdenCount = 0;
    let cdenGranted = 0;
    let precCount = 0;
    let precGranted = 0;
    let fomentoCount = 0;
    let fomentoTotal = 0;
    let patrocinioCount = 0;
    let patrocinioTotal = 0;

    allData.forEach(item => {
      if (item.IsCDEN) {
        cdenCount++;
        cdenGranted += item.VALOR_REPASSE;
      } else if (item.IsPrecursora) {
        precCount++;
        precGranted += item.VALOR_REPASSE;
      }

      if (item.tipoRepasse === 'Fomento') {
        fomentoTotal += item.VALOR_REPASSE;
        fomentoCount++;
      } else if (item.tipoRepasse === 'Patrocínio') {
        patrocinioTotal += item.VALOR_REPASSE;
        patrocinioCount++;
      }
    });

    const cdenAvg = cdenCount > 0 ? cdenGranted / cdenCount : 0;
    const precAvg = precCount > 0 ? precGranted / precCount : 0;
    const fomAvg = fomentoCount > 0 ? fomentoTotal / fomentoCount : 0;
    const patAvg = patrocinioCount > 0 ? patrocinioTotal / patrocinioCount : 0;

    return {
      global: {
        cdenStats: { count: cdenCount, avg: cdenAvg, total: cdenGranted },
        precStats: { count: precCount, avg: precAvg, total: precGranted },
        fomentoStats: { count: fomentoCount, avg: fomAvg, total: fomentoTotal },
        patrocinioStats: { count: patrocinioCount, avg: patAvg, total: patrocinioTotal },
      },
    };
  }, [appData]);

  const entityData = [
    { name: 'CDEN', value: insights.global.cdenStats.total, count: insights.global.cdenStats.count },
    { name: 'Precursoras', value: insights.global.precStats.total, count: insights.global.precStats.count },
  ];
  const colors = ['#003865', '#008f4c'];

  const typeData = [
    { name: 'Fomento', value: insights.global.fomentoStats.total, count: insights.global.fomentoStats.count },
    { name: 'Patrocínio', value: insights.global.patrocinioStats.total, count: insights.global.patrocinioStats.count },
  ];
  const typeColors = ['#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Lightbulb className="text-[#008f4c]" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Insights e Análises</h2>
          <p className="text-slate-500">Descobertas baseadas nos dados históricos e projeções atuais (2025-2026).</p>
        </div>
      </div>

      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Suspense fallback={<ChartPanelFallback className="bg-white p-6 border border-[#003865]/10 shadow-sm" />}>
            <InsightsEntityComparisonCard
              entityData={entityData}
              colors={colors}
              cdenStats={insights.global.cdenStats}
              precStats={insights.global.precStats}
              formatBRL={formatBRL}
            />
          </Suspense>

          <Suspense fallback={<ChartPanelFallback />}>
            <InsightsFundingTypeCard
              typeData={typeData}
              typeColors={typeColors}
              fomentoStats={insights.global.fomentoStats}
              patrocinioStats={insights.global.patrocinioStats}
              formatBRL={formatBRL}
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
