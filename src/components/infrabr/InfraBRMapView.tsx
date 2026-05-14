import React, { useState, useEffect, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { geoMercator } from 'd3-geo';
import type { InfraRuntimeData } from '../../data/runtime-loaders';
import { BRAZIL_STATES_GEOJSON_URL, loadBrazilStatesGeoJson } from '../../lib/brazilGeo';

interface InfraBRMapViewProps {
  infraData: InfraRuntimeData;
  stateRepasse: Map<string, number>;
  stateRepasseBreakdown: Map<string, { fomento26: number, fomento25: number, patrocinio25: number }>;
  setSelectedState: (state: string) => void;
}

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

export function InfraBRMapView({ infraData, stateRepasse, stateRepasseBreakdown, setSelectedState }: InfraBRMapViewProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [mapTooltip, setMapTooltip] = useState<{content: string, infraBr?: number, rank?: number, totalRepasse?: number, fomento26?: number, fomento25?: number, patrocinio25?: number, x: number, y: number} | null>(null);

  useEffect(() => {
    loadBrazilStatesGeoJson().then(data => setGeoData(data));
  }, []);

  const mapProjection = useMemo(() => {
    const projection = geoMercator();
    if (!geoData) return projection.scale(750).center([-54, -15]);
    return projection.fitSize([800, 500], geoData);
  }, [geoData]);

  const minInfra = Math.min(...infraData.infraEstados.map(s => s.infra_br));
  const maxInfra = Math.max(...infraData.infraEstados.map(s => s.infra_br));
  const colorScale = scaleLinear<string>().domain([minInfra, maxInfra]).range(["#e0f2fe", "#0284c7"]);

  return (
    <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2 relative">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
        Distribuição Geográfica da Nota Infra-BR
      </h3>
      <p className="text-sm text-slate-500 mb-4 h-6">
        Intensidade da cor reflete a Nota Infra-BR. O tooltip exibe adicionalmente a divisão de repasses (Fomento e Patrocínio).
      </p>
      <div className="w-full relative min-h-[500px] flex justify-center bg-slate-50 border border-slate-100 rounded-lg">
        <ComposableMap
          projection={mapProjection as any}
          width={800}
          height={500}
          style={{ width: "100%", height: "100%", maxWidth: "800px" }}
        >
          <Geographies geography={geoData || BRAZIL_STATES_GEOJSON_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const ufSigla = geo.properties.sigla;
                const stateName = geo.properties.name;
                
                const infraState = infraData.infraEstados.find(s => s.sigla_uf === ufSigla);
                const infraScore = infraState?.infra_br || 0;
                
                const repasse = stateRepasse.get(stateName) || 0;
                const breakdown = stateRepasseBreakdown.get(stateName) || { fomento26: 0, fomento25: 0, patrocinio25: 0 };
                
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={infraScore > 0 ? colorScale(infraScore) : "#f1f5f9"}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#f59e0b", outline: "none", cursor: "pointer", transition: "all 250ms" },
                      pressed: { outline: "none" }
                    }}
                    onMouseEnter={(e) => {
                      setMapTooltip({
                        content: `${stateName} (${ufSigla})`,
                        infraBr: infraScore,
                        rank: infraState?.rank,
                        totalRepasse: repasse,
                        fomento26: breakdown.fomento26,
                        fomento25: breakdown.fomento25,
                        patrocinio25: breakdown.patrocinio25,
                        x: e.clientX,
                        y: e.clientY
                      });
                    }}
                    onMouseMove={(e) => {
                      setMapTooltip(prev => prev ? {...prev, x: e.clientX, y: e.clientY} : prev);
                    }}
                    onMouseLeave={() => {
                      setMapTooltip(null);
                    }}
                    onClick={() => {
                      setSelectedState(ufSigla);
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>

        {/* Tooltip customizado */}
        {mapTooltip && (
          <div 
            className="fixed z-50 bg-slate-900 border border-slate-700 text-white p-4 rounded shadow-xl pointer-events-none min-w-[200px]"
            style={{ top: mapTooltip.y + 15, left: mapTooltip.x + 15, opacity: 0.95 }}
          >
            <div className="font-bold text-base mb-2 border-b border-slate-700 pb-1">
              <span>{mapTooltip.content}</span>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-medium">Nota Infra-BR:</span>
                <span className="text-blue-400 font-medium">{mapTooltip.infraBr?.toFixed(2) || '-'} <span className="text-slate-500 font-normal text-xs">(Rank: {mapTooltip.rank}º)</span></span>
              </div>
              
              <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                <span className="text-slate-400 font-medium">Total Repassado:</span>
                <span className="font-medium text-white">{formatBRL(mapTooltip.totalRepasse || 0)}</span>
              </div>
              
              <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                <span className="text-slate-400 font-medium">Fomento (Atual/2026):</span>
                <span className="font-medium text-emerald-400">{formatBRL(mapTooltip.fomento26 || 0)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                <span className="text-slate-400 font-medium">Fomento (Hist/2025):</span>
                <span className="font-medium text-emerald-400 opacity-80">{formatBRL(mapTooltip.fomento25 || 0)}</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-700/50 mt-1 pt-1">
                <span className="text-slate-400 font-medium">Patrocínio (Hist/2025):</span>
                <span className="font-medium text-amber-400">{formatBRL(mapTooltip.patrocinio25 || 0)}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Legenda de cor inferior */}
        <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded border border-slate-200 shadow-sm backdrop-blur-sm pointer-events-none">
          <div className="text-xs font-semibold text-slate-700 mb-2">Nota Infra-BR</div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 w-8 text-right">{minInfra.toFixed(0)}</span>
            <div className="w-32 h-3 rounded bg-gradient-to-r from-[#e0f2fe] to-[#0284c7]"></div>
            <span className="text-[10px] text-slate-500 w-8">{maxInfra.toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
