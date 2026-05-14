import React from 'react';
import { useData } from '../context/DataContext';
import type { EntidadeSelecionada } from '../types';

import { useOverviewMetrics } from '../hooks/useOverviewMetrics';
import { OverviewKPIs } from './overview/OverviewKPIs';
import { OverviewHistoryChart } from './overview/OverviewHistoryChart';
import { OverviewMap } from './overview/OverviewMap';
import { OverviewDistributionChart } from './overview/OverviewDistributionChart';
import { OverviewInfraBRPanel } from './overview/OverviewInfraBRPanel';

interface OverviewProps {
  data?: EntidadeSelecionada[];
  theme?: 'fomento' | 'patrocinio' | 'overview' | 'history';
  showEntityCount?: boolean;
}

export function Overview({ data, theme = 'overview', showEntityCount = false }: OverviewProps) {
  const { appData } = useData();
  const sourceData = data || appData.fomento2026;
  const tColorPrimary = theme === 'fomento' ? '#19904E' : theme === 'patrocinio' ? '#F19D26' : '#215F9A';
  const tColorPrimaryHex = tColorPrimary;
  const tColorSecondary = theme === 'fomento' ? '#006837' : theme === 'patrocinio' ? '#b45309' : '#003865';
  const tColorSecondaryDark = theme === 'fomento' ? '#004d28' : theme === 'patrocinio' ? '#78350f' : '#00284a';
  
  const textPrimaryClass = theme === 'fomento' ? 'text-[#19904E]' : theme === 'patrocinio' ? 'text-[#F19D26]' : 'text-[#215F9A]';
  const textSecondaryClass = theme === 'fomento' ? 'text-[#006837]' : theme === 'patrocinio' ? 'text-[#b45309]' : 'text-[#003865]';
  const bgSecondaryClass = theme === 'fomento' ? 'bg-[#19904E]' : theme === 'patrocinio' ? 'bg-[#F19D26]' : 'bg-[#215F9A]';

  const colorScaleStart = theme === 'fomento' ? '#DCE4E5' : theme === 'patrocinio' ? '#E6E2DC' : '#9EC6EA';
  const colorScaleEnd = tColorPrimary;

  const { state, metrics, helpers } = useOverviewMetrics(sourceData, theme, showEntityCount, colorScaleStart, colorScaleEnd);

  return (
    <div className="space-y-6 mt-4">
      <OverviewKPIs 
        kpis={metrics.kpis} 
        tColorPrimaryHex={tColorPrimaryHex} 
        textPrimaryClass={textPrimaryClass} 
        textSecondaryClass={textSecondaryClass} 
        bgSecondaryClass={bgSecondaryClass} 
      />

      {theme === 'history' && (
        <OverviewHistoryChart evolucaoData={metrics.evolucaoData} />
      )}

      <div className="flex flex-col gap-2 -mt-4">
        <div className="flex justify-end items-center min-h-[24px]">
          {(state.selectedState || state.selectedCategoria) && (
            <button 
              onClick={helpers.clearFilters}
              className="text-sm font-medium text-slate-500 hover:text-slate-800 underline transition-colors decoration-slate-300 hover:decoration-slate-500 underline-offset-4"
            >
              Limpar Filtros ({[state.selectedState, state.selectedCategoria].filter(Boolean).join(', ')})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="col-span-1 lg:col-span-3 p-6 bg-white border border-slate-200 shadow-sm relative flex flex-col">
            <OverviewMap 
              theme={theme}
              mapProjection={metrics.mapProjection}
              geoData={state.geoData}
              geoUrl={state.geoUrl}
              selectedState={state.selectedState}
              setSelectedState={state.setSelectedState}
              setSelectedInfraDimension={state.setSelectedInfraDimension}
              setSelectedInfraComponent={state.setSelectedInfraComponent}
              regionData={metrics.regionData}
              stateData={metrics.stateData}
              stateBreakdownData={metrics.stateBreakdownData}
              sortedStateData={metrics.sortedStateData}
              infraData={appData.infraBR}
              totalGlobalRepasse={metrics.totalGlobalRepasse}
              maxStateValue={metrics.maxStateValue}
              getStateColor={metrics.getStateColor}
              tColorSecondary={tColorSecondary}
              tColorSecondaryDark={tColorSecondaryDark}
              stateAdherenceData={metrics.stateAdherenceData}
              setMapTooltip={state.setMapTooltip}
              showEntityCount={showEntityCount}
              stateEntitiesCount={metrics.stateEntitiesCount}
              cityMarkers={metrics.cityMarkers}
              mapTooltip={state.mapTooltip}
              kpis={metrics.kpis}
              clearFilters={helpers.clearFilters}
              selectedCategoria={state.selectedCategoria}
            />
          </div>

          <div className="col-span-1 lg:col-span-1 p-6 bg-white border border-slate-200 shadow-sm relative flex flex-col">
            {theme === 'history' ? (
              <OverviewDistributionChart grupoData={metrics.grupoData} />
            ) : (
              <OverviewInfraBRPanel 
                selectedState={state.selectedState}
                selectedInfraComponent={state.selectedInfraComponent}
                setSelectedInfraComponent={state.setSelectedInfraComponent}
                selectedInfraDimension={state.selectedInfraDimension}
                setSelectedInfraDimension={state.setSelectedInfraDimension}
                infraChartData={metrics.infraChartData}
                tColorPrimary={tColorPrimary}
                filteredData={metrics.filteredData}
                infraBRAdherenceTotals={metrics.infraBRAdherenceTotals}
                getComponentsForDimension={helpers.getComponentsForDimension}
                getIndicatorsForComponent={helpers.getIndicatorsForComponent}
                getIndicatorDetails={helpers.getIndicatorDetails}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
