import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { UF_TO_REGION } from '../../hooks/useOverviewMetrics';
import { AdherenceProgressBar } from './OverviewUtils';

export function OverviewMap({
  theme,
  mapProjection,
  geoData,
  geoUrl,
  selectedState,
  setSelectedState,
  setSelectedInfraDimension,
  setSelectedInfraComponent,
  regionData,
  stateData,
  stateBreakdownData,
  sortedStateData,
  infraData,
  totalGlobalRepasse,
  maxStateValue,
  getStateColor,
  tColorSecondary,
  tColorSecondaryDark,
  stateAdherenceData,
  setMapTooltip,
  showEntityCount,
  stateEntitiesCount,
  cityMarkers,
  mapTooltip,
  kpis,
  clearFilters,
  selectedCategoria
}: any) {
  return (
    <>
      <div className="flex justify-end items-center min-h-[24px] mb-2 -mt-4 relative z-10 w-full col-span-1 lg:col-span-4 max-w-[800px] mx-auto opacity-0 pointer-events-none"></div>

      <div className="mb-6 border-b pb-2 shrink-0 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center cursor-default">
            <span>Investimento por Estado</span>
          </h3>
          <div className="text-xs font-normal text-slate-500 mt-0.5 cursor-default min-h-[16px]">
            {selectedState ? `Filtrado: ${selectedState}` : '\u00A0'}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <RadixTooltip.Provider delayDuration={100}>
            <RadixTooltip.Root>
              <RadixTooltip.Trigger asChild>
                <div className="flex flex-col items-end cursor-help group">
                  <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase group-hover:text-slate-600 transition-colors">Média Aderência Infra-BR</span>
                  <AdherenceProgressBar percentage={kpis.avgPercentage} className="w-24 h-2" />
                </div>
              </RadixTooltip.Trigger>
              <RadixTooltip.Portal>
                <RadixTooltip.Content 
                  className="z-50 bg-white p-4 rounded-xl shadow-2xl border border-slate-200 max-w-[320px] animate-in fade-in zoom-in duration-200" 
                  sideOffset={5}
                >
                  <div className="space-y-3">
                    <div className="pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Cálculo de Média de Aderência</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 italic">Total de dimensões atingidas:</span>
                        <span className="font-bold text-slate-700">{kpis.totalDimensions}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 italic">Total de entidades:</span>
                        <span className="font-bold text-slate-700">{kpis.total}</span>
                      </div>
                      <div className="flex justify-between text-[11px] pt-1 border-t border-slate-50">
                        <span className="text-slate-600 font-medium italic">Média de dimensões por entidade:</span>
                        <span className="font-bold text-slate-800">{kpis.avgDimensions.toFixed(2)} / 6.00</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 font-medium italic">Percentual médio de aderência:</span>
                        <span className="font-bold text-indigo-600">{kpis.avgPercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg text-[9px] text-slate-400 text-center leading-relaxed">
                      O cálculo representa a distribuição média de dimensões em que as entidades selecionadas possuem aderência técnica perante os critérios da metodologia Infra-BR.
                    </div>
                  </div>
                  <RadixTooltip.Arrow className="fill-white" />
                </RadixTooltip.Content>
              </RadixTooltip.Portal>
            </RadixTooltip.Root>
          </RadixTooltip.Provider>
        </div>
      </div>
      <div className="flex-1 w-full relative min-h-[500px]">
        <ComposableMap
          projection={mapProjection as any}
          width={800}
          height={500}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoData || geoUrl}>
            {({ geographies }) =>
              geographies.map(geo => {
                const ufSigla = geo.properties.sigla;
                const stateName = geo.properties.name;
                const regionName = UF_TO_REGION[ufSigla];
                
                if (selectedState && stateName !== selectedState) return null;

                const isSelected = selectedState === stateName;
                const isFaded = selectedState && !isSelected;
                
                const regionVal = regionData.find((d: any) => d.name === regionName)?.value || 0;
                const stateVal = stateData.get(stateName) || 0;
                const breakdown = stateBreakdownData.get(stateName) || { fomento: 0, patrocinio: 0 };
                
                const formattedRegionSum = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(regionVal);
                const formattedStateSum = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stateVal);
                const formattedFomento = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(breakdown.fomento);
                const formattedPatrocinio = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(breakdown.patrocinio);
                
                const rankIndex = sortedStateData.findIndex((s: any) => s[0] === stateName) + 1;
                const infraState = infraData.infraEstados?.find((s: any) => s.sigla_uf === ufSigla);
                
                const stateProp = totalGlobalRepasse > 0 ? ((stateVal / totalGlobalRepasse) * 100).toFixed(1) + '%' : '0%';
                const regionProp = totalGlobalRepasse > 0 ? ((regionVal / totalGlobalRepasse) * 100).toFixed(1) + '%' : '0%';

                const entidadesSize = stateEntitiesCount.get(stateName) || 0;
                const isDark = stateVal > maxStateValue * 0.35;
                
                let textColor = "#00284a";
                let shadowText = "0px 1px 3px rgba(255,255,255,0.9), 0px 0px 2px rgba(255,255,255,1)";
                
                if (stateVal === 0) {
                  textColor = "#991b1b";
                  shadowText = "0px 1px 2px rgba(255,255,255,0.5)";
                } else if (isDark) {
                  textColor = "#ffffff";
                  shadowText = "0px 1px 3px rgba(0,0,0,0.8)";
                }

                // Temporary workaround since we don't have geoCentroid in scope directly easily
                // we import geoCentroid in the actual hook but we don't return centroid
                // we will skip text marker rendering or mock the centroid if not rendering in map hook
                // Wait, geoCentroid was imported from d3-geo
                
                return (
                  <React.Fragment key={`${geo.rsmKey}-group`}>
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getStateColor(stateName)}
                      stroke="#ffffff"
                      strokeWidth={0.5}
                      style={{
                        default: { 
                          outline: "none", 
                          opacity: isFaded ? 0.3 : 1,
                          transition: "all 250ms"
                        },
                        hover: { 
                          outline: "none", 
                          fill: tColorSecondary, 
                          opacity: 1,
                          transition: "all 250ms",
                          cursor: "pointer"
                        },
                        pressed: { outline: "none", fill: tColorSecondaryDark }
                      }}
                      onClick={() => {
                        const isSame = selectedState === stateName;
                        setSelectedState(isSame ? null : stateName);
                        if (!isSame) {
                          setSelectedInfraDimension(null);
                          setSelectedInfraComponent(null);
                        }
                      }}
                      onMouseEnter={(e) => {
                        const adherence = stateAdherenceData.get(stateName);
                        let adherenceInfo = undefined;
                        if (adherence && adherence.totalEntities > 0) {
                          adherenceInfo = {
                            avgDimensions: adherence.totalHits / adherence.totalEntities,
                            avgPercentage: ((adherence.totalHits / adherence.totalEntities) / 6) * 100,
                            totalDimensions: adherence.totalDimensions,
                            totalEntities: adherence.totalEntities
                          };
                        }

                        setMapTooltip({
                          content: `${stateName} (${ufSigla})`, 
                          rankRepasse: rankIndex > 0 ? `${rankIndex}º` : undefined,
                          rankInfraBR: infraState ? `${infraState.rank}º` : undefined,
                          sub: showEntityCount ? `Estado: ${formattedStateSum}` : `Repasse no Estado: ${formattedStateSum}`,
                          sub2: showEntityCount ? `Região: ${formattedRegionSum}` : `Região ${regionName}: ${formattedRegionSum}`, 
                          sub3: (showEntityCount || theme === 'overview') ? `Total de Entidades: ${entidadesSize}` : undefined,
                          fom: (showEntityCount || theme === 'overview') ? formattedFomento : undefined,
                          pat: (showEntityCount || theme === 'overview') ? formattedPatrocinio : undefined,
                          stateProp,
                          regionProp,
                          x: e.clientX, 
                          y: e.clientY,
                          adherenceInfo
                        });
                      }}
                      onMouseMove={(e) => {
                        setMapTooltip((prev: any) => prev ? {...prev, x: e.clientX, y: e.clientY} : prev);
                      }}
                      onMouseLeave={() => {
                        setMapTooltip(null);
                      }}
                    />
                  </React.Fragment>
                );
              })
            }
          </Geographies>
          {selectedState && cityMarkers.map((marker: any, index: number) => (
            <Marker key={`city-${index}`} coordinates={marker.coords}>
              <circle r={6} fill="#1e40af" stroke="#ffffff" strokeWidth={2} style={{ cursor: 'pointer' }}
                onMouseEnter={(e: any) => {
                  const fom = marker.entities.reduce((acc: any, e: any) => acc + (e.VALOR_REPASSE || 0), 0);
                  setMapTooltip({
                    isCityMarker: true,
                    content: marker.label,
                    sub: `Entidades: ${marker.entities.length}`,
                    fom: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(fom),
                    x: e.clientX,
                    y: e.clientY
                  });
                }}
                onMouseMove={(e: any) => {
                  setMapTooltip((prev: any) => prev ? {...prev, x: e.clientX, y: e.clientY} : prev);
                }}
                onMouseLeave={() => {
                  setMapTooltip(null);
                }}
              />
              <text
                textAnchor="middle"
                y={-12}
                style={{
                  fontFamily: "system-ui",
                  fill: "#1e3a8a",
                  fontSize: "11px",
                  fontWeight: "bold",
                  pointerEvents: "none",
                  textShadow: "0px 1px 3px rgba(255,255,255,0.9), 0px 0px 2px rgba(255,255,255,1)"
                }}
              >
                {marker.label}
              </text>
            </Marker>
          ))}
        </ComposableMap>
        
        {mapTooltip && (
          <div 
            className="fixed z-50 bg-slate-900 border border-slate-700 text-white p-4 rounded shadow-xl pointer-events-none min-w-[200px]"
            style={{ top: mapTooltip.y + 15, left: mapTooltip.x + 15, opacity: 0.95 }}
          >
            <div className="font-bold text-base mb-2 border-b border-slate-700 pb-1">
              <span>{mapTooltip.content}</span>
            </div>
            {mapTooltip.isCityMarker ? (
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between gap-4 mt-1">
                  <span className="text-slate-400 font-medium">Projetos Identificados:</span> 
                  <span className="font-semibold text-white">{mapTooltip.sub.replace('Entidades: ', '')}</span>
                </div>
                {mapTooltip.fom && (
                  <div className="flex justify-between gap-4 pt-1 mt-1 border-t border-slate-700/50">
                    <span className="text-slate-400 font-medium">Repasse Local:</span> 
                    <span className="font-medium text-emerald-400">{mapTooltip.fom}</span>
                  </div>
                )}
              </div>
            ) : theme === 'history' && showEntityCount ? (
              <div className="flex flex-col gap-1 text-sm">
                {mapTooltip.rankRepasse && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 font-medium">Posição em Repasse:</span>
                    <span className="text-[#F19D26] font-medium">{mapTooltip.rankRepasse}</span>
                  </div>
                )}
                {mapTooltip.rankInfraBR && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 font-medium">Posição do Infra-BR:</span>
                    <span className="text-[#F19D26] font-medium">{mapTooltip.rankInfraBR}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-slate-700/50">
                  <span className="text-slate-400 font-medium">Estado:</span> 
                  <span className="font-semibold text-white">
                    {mapTooltip.sub.replace('Estado: ', '')}
                    {mapTooltip.stateProp && <span className="text-slate-400 text-xs ml-1 font-normal">({mapTooltip.stateProp})</span>}
                  </span>
                </div>
                <div className="flex justify-between gap-4 mt-1">
                  <span className="text-slate-400 font-medium">Região:</span> 
                  <span className="font-semibold text-white">
                    {mapTooltip.sub2?.replace('Região: ', '')}
                    {mapTooltip.regionProp && <span className="text-slate-400 text-xs ml-1 font-normal">({mapTooltip.regionProp})</span>}
                  </span>
                </div>
                {mapTooltip.sub3 && (
                  <div className="flex justify-between gap-4 mt-1">
                    <span className="text-slate-400 font-medium">Total de Entidades:</span> 
                    <span className="font-medium text-indigo-400">{mapTooltip.sub3.replace('Total de Entidades: ', '')}</span>
                  </div>
                )}
                {mapTooltip.fom && (
                  <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                    <span className="text-slate-400 font-medium">Fomento:</span> 
                    <span className="font-medium text-emerald-400">{mapTooltip.fom}</span>
                  </div>
                )}
                {mapTooltip.pat && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 font-medium">Patrocínio:</span> 
                    <span className="font-medium text-amber-400">{mapTooltip.pat}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1 text-sm">
                {mapTooltip.rankRepasse && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 font-medium">Posição em Repasse:</span>
                    <span className="text-[#F19D26] font-medium">{mapTooltip.rankRepasse}</span>
                  </div>
                )}
                {mapTooltip.rankInfraBR && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 font-medium">Posição do Infra-BR:</span>
                    <span className="text-[#F19D26] font-medium">{mapTooltip.rankInfraBR}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-slate-700/50">
                  <span className="text-slate-400 font-medium">Estado:</span> 
                  <span className="font-semibold text-white">
                    {mapTooltip.sub.replace('Repasse no Estado: ', '')}
                    {mapTooltip.stateProp && <span className="text-slate-400 text-xs ml-1 font-normal">({mapTooltip.stateProp})</span>}
                  </span>
                </div>
                <div className="flex justify-between gap-4 mt-1">
                  <span className="text-slate-400 font-medium">Região:</span> 
                  <span className="font-semibold text-white">
                    {mapTooltip.sub2?.split(': ')[1]}
                    {mapTooltip.regionProp && <span className="text-slate-400 text-xs ml-1 font-normal">({mapTooltip.regionProp})</span>}
                  </span>
                </div>
                {mapTooltip.sub3 && (
                  <div className="flex justify-between gap-4 mt-1">
                    <span className="text-slate-400 font-medium">Total de Entidades:</span> 
                    <span className="font-medium text-indigo-400">{mapTooltip.sub3.replace('Total de Entidades: ', '')}</span>
                  </div>
                )}
                {mapTooltip.fom && (
                  <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                    <span className="text-slate-400 font-medium">Fomento:</span> 
                    <span className="font-medium text-emerald-400">{mapTooltip.fom}</span>
                  </div>
                )}
                {mapTooltip.pat && (
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400 font-medium">Patrocínio:</span> 
                    <span className="font-medium text-amber-400">{mapTooltip.pat}</span>
                  </div>
                )}
              </div>
            )}
            {mapTooltip.adherenceInfo && (
              <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-slate-700/50">
                <div className="flex justify-between gap-4 items-center mb-1">
                  <span className="text-slate-400 font-medium text-xs">Aderência Infra-BR (Média):</span>
                  <span className="font-bold text-xs bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded shadow-sm">
                    {mapTooltip.adherenceInfo.avgPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between gap-4 items-center">
                  <span className="text-slate-500 text-[10px] leading-tight">Média de Dimensões / Entidade:</span>
                  <span className="text-slate-300 text-[10px] whitespace-nowrap font-medium">
                    {mapTooltip.adherenceInfo.avgDimensions.toFixed(2)} / 6.00
                  </span>
                </div>
                <div className="flex justify-between gap-4 items-center mt-0.5">
                  <span className="text-slate-500 text-[10px] leading-tight">Total Dimensões Atingidas:</span>
                  <span className="text-slate-300 text-[10px] whitespace-nowrap font-medium">
                    {mapTooltip.adherenceInfo.totalDimensions}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center shrink-0">Clique em um estado para filtrar os demais gráficos e focar na região.</p>
    </>
  );
}
