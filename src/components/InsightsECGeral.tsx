import React, { Suspense, lazy, useMemo } from 'react';
import { ecGeralData } from '../data/ECGeral';
import { useData } from '../context/DataContext';
import { ChartPanelFallback } from './shared/ChartPanelFallback';

const InsightsECGeralCoverageCard = lazy(async () => {
  const module = await import('./insights/InsightsECGeralCoverageCard');
  return { default: module.InsightsECGeralCoverageCard };
});

const InsightsECGeralProportionCard = lazy(async () => {
  const module = await import('./insights/InsightsECGeralProportionCard');
  return { default: module.InsightsECGeralProportionCard };
});

const InsightsECGeralTypesCard = lazy(async () => {
  const module = await import('./insights/InsightsECGeralTypesCard');
  return { default: module.InsightsECGeralTypesCard };
});

const normalizeString = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/gi, '');

export function InsightsECGeral() {
  const { appData } = useData();
  const stats = useMemo(() => {
    const allRepasses = [...appData.fomentoHistorico, ...appData.patrocinioHistorico];
    const repassesSet = new Set(allRepasses.map(r => normalizeString(r.ENTIDADE)));

    let receivedAny = 0;
    let notReceived = 0;

    const byState = new Map<string, { total: number; received: number }>();

    for (const ec of ecGeralData) {
      if (!ec.origem) continue;

      const estado = ec.origem.replace('Crea-', '').toUpperCase();
      if (!byState.has(estado)) {
        byState.set(estado, { total: 0, received: 0 });
      }

      const stateObj = byState.get(estado)!;
      stateObj.total++;

      const isMatch = repassesSet.has(normalizeString(ec.denominacao)) || (ec.sigla && repassesSet.has(normalizeString(ec.sigla)));

      if (isMatch) {
        receivedAny++;
        stateObj.received++;
      } else {
        notReceived++;
      }
    }

    const stateData = Array.from(byState.entries())
      .map(([state, data]) => ({
        state,
        total: data.total,
        received: data.received,
        notReceived: data.total - data.received,
        percent: data.total > 0 ? (data.received / data.total) * 100 : 0,
      }))
      .filter(s => s.state && s.state.length === 2)
      .sort((a, b) => b.total - a.total);

    const typeCount = new Map<string, number>();
    for (const ec of ecGeralData) {
      if (ec.tipo) {
        const t = ec.tipo.trim();
        typeCount.set(t, (typeCount.get(t) || 0) + 1);
      }
    }

    const typeData = Array.from(typeCount.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      total: ecGeralData.length,
      receivedAny,
      notReceived,
      stateData,
      typeData,
    };
  }, [appData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-[#003865]">Análise: Base EC Geral</h2>
          <p className="text-slate-500 mt-1">Comparativo de entidades registradas (EC Geral) com o histórico de repasses (Fomento e Patrocínio).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Total de Registros (EC Geral)</h3>
          <p className="text-4xl font-bold text-[#003865]">{stats.total}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center border-b-4 border-b-[#d4a017]">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Sem Histórico de Repasse</h3>
          <p className="text-4xl font-bold text-[#d4a017]">{stats.notReceived}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-center border-b-4 border-b-[#008f4c]">
          <h3 className="text-slate-500 font-medium text-sm mb-2">Com Histórico de Repasse</h3>
          <p className="text-4xl font-bold text-[#008f4c]">{stats.receivedAny}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartPanelFallback className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" />}>
          <InsightsECGeralCoverageCard stateData={stats.stateData} />
        </Suspense>

        <Suspense fallback={<ChartPanelFallback className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" />}>
          <InsightsECGeralProportionCard total={stats.total} receivedAny={stats.receivedAny} notReceived={stats.notReceived} />
        </Suspense>

        <Suspense fallback={<ChartPanelFallback className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2" />}>
          <InsightsECGeralTypesCard typeData={stats.typeData} />
        </Suspense>
      </div>
    </div>
  );
}
