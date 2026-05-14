import React, { Suspense, lazy } from 'react';
import { useInfraBRMetrics } from '../hooks/useInfraBRMetrics';
import { ChartPanelFallback } from './shared/ChartPanelFallback';

const InfraBRScatterView = lazy(async () => {
  const module = await import('./infrabr/InfraBRScatterView');
  return { default: module.InfraBRScatterView };
});

const InfraBRMapView = lazy(async () => {
  const module = await import('./infrabr/InfraBRMapView');
  return { default: module.InfraBRMapView };
});

const InfraBRStateDetails = lazy(async () => {
  const module = await import('./infrabr/InfraBRStateDetails');
  return { default: module.InfraBRStateDetails };
});

export function InfraBRInsights() {
  const { state, metrics } = useInfraBRMetrics();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartPanelFallback className="bg-white p-6 border border-slate-200 shadow-sm col-span-1" heightClassName="min-h-[320px]" />}>
          <InfraBRScatterView correlationData={metrics.correlationData} avgInfraBR={metrics.avgInfraBR} avgRepasse={metrics.avgRepasse} />
        </Suspense>

        <Suspense fallback={<ChartPanelFallback className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2" heightClassName="min-h-[500px]" />}>
          <InfraBRMapView
            infraData={metrics.infraData}
            stateRepasse={metrics.stateRepasse}
            stateRepasseBreakdown={metrics.stateRepasseBreakdown}
            setSelectedState={state.setSelectedState}
          />
        </Suspense>

        <Suspense fallback={<ChartPanelFallback className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2" heightClassName="min-h-[500px]" />}>
          <InfraBRStateDetails
            infraData={metrics.infraData}
            selectedState={state.selectedState}
            setSelectedState={state.setSelectedState}
            selectedDimension={state.selectedDimension}
            setSelectedDimension={state.setSelectedDimension}
            availableDimensions={metrics.availableDimensions}
            radarData={metrics.radarData}
            componentData={metrics.componentData}
          />
        </Suspense>
      </div>
    </div>
  );
}
