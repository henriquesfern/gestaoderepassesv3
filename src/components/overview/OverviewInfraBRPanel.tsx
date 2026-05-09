import React from 'react';
import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn, getAdherenceColorClass, getDimensionColor, AdherenceProgressBar } from './OverviewUtils';

export function OverviewInfraBRPanel({ 
  selectedState, 
  selectedInfraComponent, 
  setSelectedInfraComponent, 
  selectedInfraDimension, 
  setSelectedInfraDimension, 
  infraChartData, 
  tColorPrimary, 
  filteredData, 
  infraBRAdherenceTotals, 
  getComponentsForDimension, 
  getIndicatorsForComponent, 
  getIndicatorDetails 
}: any) {
  return (
    <>
      <div className="mb-6 border-b pb-2 shrink-0">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center">
          <a href="https://www.infrabr.org.br/" target="_blank" rel="noopener noreferrer" className="truncate hover:text-[#1e40af] transition-colors" title="Acessar https://www.infrabr.org.br/">Desempenho Infra-BR</a>
        </h3>
        <div className="text-xs font-normal text-slate-500 mt-0.5 cursor-default" title={selectedState ? selectedState : 'Média Nacional'}>
          {selectedState ? `Estado: ${selectedState}` : 'Média Nacional'}
        </div>
      </div>
      {selectedInfraComponent ? (
        <button
          onClick={() => setSelectedInfraComponent(null)}
          className="mb-4 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start"
        >
          &larr; Voltar para Componentes
        </button>
      ) : selectedInfraDimension ? (
        <button
          onClick={() => setSelectedInfraDimension(null)}
          className="mb-4 text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start"
        >
          &larr; Voltar para Dimensões
        </button>
      ) : null}
      <div className="flex-1 w-full flex flex-col gap-3 overflow-y-auto pr-2 pb-2">
        {infraChartData.map((d: any, index: number) => {
          const isDimension = !selectedInfraDimension;
          const isComponent = !!selectedInfraDimension && !selectedInfraComponent;
          const isIndicator = !!selectedInfraComponent;
          
          const tooltipItems = isDimension ? getComponentsForDimension(d.name)
            : isComponent ? getIndicatorsForComponent(d.name)
            : [];
            
          const currentColor = getDimensionColor(isIndicator ? selectedInfraDimension || d.name : isComponent ? selectedInfraDimension || d.name : d.name, tColorPrimary);
          const indicatorDetails = isIndicator ? getIndicatorDetails(d.name) : null;
            
          return (
            <RadixTooltip.Provider delayDuration={150} key={index}>
              <RadixTooltip.Root>
                <RadixTooltip.Trigger asChild>
                  <div 
                    className={`relative bg-white shadow-sm border-l-[6px] p-4 flex flex-col items-start transition-shadow hover:shadow-md shrink-0 ${(isDimension || isComponent) && selectedState ? 'cursor-pointer hover:bg-slate-50' : ''}`} 
                    style={{ borderLeftColor: currentColor }}
                    onClick={() => {
                      if (!selectedState) return;
                      if (isDimension) {
                        setSelectedInfraDimension(d.name);
                      } else if (isComponent) {
                        setSelectedInfraComponent(d.name);
                      }
                    }}
                  >
                    <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 w-full text-left leading-tight break-words whitespace-normal">{d.name}</h4>
                    <div className="flex w-full justify-between items-end mt-1">
                      <span className="text-3xl font-black tracking-tight text-slate-700">{d.value.toFixed(1)}</span>
                      {isDimension && (
                        <div className="flex flex-col items-end gap-1.5">
                          <div 
                            className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded border shadow-sm transition-colors duration-300",
                              getAdherenceColorClass(filteredData.length > 0 ? ((infraBRAdherenceTotals[d.name] || 0) / filteredData.length) * 100 : 0)
                            )} 
                            title={`Projetos aderentes a ${d.name}`}
                          >
                            {infraBRAdherenceTotals[d.name] || 0}/{filteredData.length} ({filteredData.length > 0 ? (((infraBRAdherenceTotals[d.name] || 0) / filteredData.length) * 100).toFixed(0) : 0}%)
                          </div>
                          <AdherenceProgressBar 
                            percentage={filteredData.length > 0 ? ((infraBRAdherenceTotals[d.name] || 0) / filteredData.length) * 100 : 0} 
                            className="w-16 h-1" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </RadixTooltip.Trigger>
                
                {(tooltipItems.length > 0 || indicatorDetails) && (
                  <RadixTooltip.Portal>
                    <RadixTooltip.Content 
                      side="left" 
                      sideOffset={14}
                      align="center"
                      className="z-50 bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95"
                    >
                      {indicatorDetails ? (
                        <>
                          <div className="font-semibold mb-2 pb-1 border-b border-slate-600 text-slate-200">Sobre o Indicador</div>
                          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {indicatorDetails.DESCRICAO && (
                              <div><div className="text-slate-400 mb-0.5">Descrição/Cálculo:</div><div className="text-slate-200 leading-snug">{indicatorDetails.DESCRICAO}</div></div>
                            )}
                            {indicatorDetails.UNIDADE && (
                              <div><div className="text-slate-400 mb-0.5">Unidade:</div><div className="text-slate-200 leading-snug">{indicatorDetails.UNIDADE}</div></div>
                            )}
                            {indicatorDetails.INTERPRETACAO && (
                              <div><div className="text-slate-400 mb-0.5">Interpretação:</div><div className="text-slate-200 leading-snug">{indicatorDetails.INTERPRETACAO}</div></div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold mb-2 pb-1 border-b border-slate-600 text-slate-200">{isComponent ? 'Indicadores' : 'Componentes'}</div>
                          <ul className="list-disc pl-4 space-y-1 max-h-[300px] overflow-y-auto w-full pr-2">
                            {tooltipItems.map((item: any, idx: number) => (
                              <li key={idx} className="text-slate-300 leading-snug">
                                {item.name}: <span className="font-semibold text-white">{item.value.toFixed(1)}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      <RadixTooltip.Arrow className="fill-slate-800" />
                    </RadixTooltip.Content>
                  </RadixTooltip.Portal>
                )}
              </RadixTooltip.Root>
            </RadixTooltip.Provider>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-400 mt-4 text-center shrink-0">Dados dimensionais provenientes do Infra-BR.</p>
    </>
  );
}
