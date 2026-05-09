import React from 'react';
import { useInfraBRMetrics } from '../hooks/useInfraBRMetrics';
import { InfraBRScatterView } from './infrabr/InfraBRScatterView';
import { InfraBRMapView } from './infrabr/InfraBRMapView';
import { InfraBRStateDetails } from './infrabr/InfraBRStateDetails';

export function InfraBRInsights() {
  const { state, metrics } = useInfraBRMetrics();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <InfraBRScatterView 
          correlationData={metrics.correlationData}
          avgInfraBR={metrics.avgInfraBR}
          avgRepasse={metrics.avgRepasse}
        />

        <InfraBRMapView 
          stateRepasse={metrics.stateRepasse}
          stateRepasseBreakdown={metrics.stateRepasseBreakdown}
          setSelectedState={state.setSelectedState}
        />

        <InfraBRStateDetails 
          selectedState={state.selectedState}
          setSelectedState={state.setSelectedState}
          selectedDimension={state.selectedDimension}
          setSelectedDimension={state.setSelectedDimension}
          availableDimensions={metrics.availableDimensions}
          radarData={metrics.radarData}
          componentData={metrics.componentData}
        />

      </div>
    </div>
  );
}
