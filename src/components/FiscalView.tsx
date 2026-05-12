import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, LabelList, Legend } from 'recharts';
import { Users, FileText, Map as MapIcon, CircleDollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { EntidadeSelecionada } from '../types';
import { formatCNPJ } from '../utils/sanitizers';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FiscalViewProps {
  data?: EntidadeSelecionada[];
}

const parseDate = (dateStr: string) => {
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d);
  } else {
    // Expecting yyyy-MM-dd
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
};

export function FiscalView({ data }: FiscalViewProps) {
  const { appData } = useData();
  const selecionados = data || appData.fomento2026;
  const [selectedFiscal, setSelectedFiscal] = useState<string | null>(null);
  const [expandedFiscal, setExpandedFiscal] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const toggleProject = (sei: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(sei)) newExpanded.delete(sei);
    else newExpanded.add(sei);
    setExpandedProjects(newExpanded);
  };

  const fiscalData = useMemo(() => {
    const map = new Map<string, {
      name: string;
      processes: number;
      processesFomento: number;
      processesPatrocinio: number;
      totalConcedido: number;
      totalFomento: number;
      totalPatrocinio: number;
      statesFomento: Set<string>;
      statesPatrocinio: Set<string>;
      regionsFomento: Set<string>;
      regionsPatrocinio: Set<string>;
      projects: EntidadeSelecionada[];
    }>();

    selecionados.forEach(item => {
      const fiscalName = item.FISCAL || 'Não Atribuído';
      if (!map.has(fiscalName)) {
        map.set(fiscalName, {
          name: fiscalName,
          processes: 0,
          processesFomento: 0,
          processesPatrocinio: 0,
          totalConcedido: 0,
          totalFomento: 0,
          totalPatrocinio: 0,
          statesFomento: new Set(),
          statesPatrocinio: new Set(),
          regionsFomento: new Set(),
          regionsPatrocinio: new Set(),
          projects: [],
        });
      }
      const f = map.get(fiscalName)!;
      f.processes += 1;
      f.totalConcedido += item.VALOR_REPASSE;
      f.projects.push(item);
      
      const repasse = item.tipoRepasse || 'Fomento';
      if (repasse === 'Fomento') {
        f.processesFomento += 1;
        f.totalFomento += item.VALOR_REPASSE;
        if (item.ESTADO) f.statesFomento.add(item.ESTADO);
        if (item.REGIÃO) f.regionsFomento.add(item.REGIÃO);
      } else if (repasse === 'Patrocínio') {
        f.processesPatrocinio += 1;
        f.totalPatrocinio += item.VALOR_REPASSE;
        if (item.ESTADO) f.statesPatrocinio.add(item.ESTADO);
        if (item.REGIÃO) f.regionsPatrocinio.add(item.REGIÃO);
      }
    });

    return Array.from(map.values())
      .map(f => ({
        ...f,
        statesFomentoList: Array.from(f.statesFomento).sort().join(', '),
        statesPatrocinioList: Array.from(f.statesPatrocinio).sort().join(', '),
        regionsFomentoList: Array.from(f.regionsFomento).sort().join(', '),
        regionsPatrocinioList: Array.from(f.regionsPatrocinio).sort().join(', '),
        statesFomentoCount: f.statesFomento.size,
        statesPatrocinioCount: f.statesPatrocinio.size,
      }))
      .sort((a,b) => b.totalConcedido - a.totalConcedido); // sort by volume
  }, [selecionados]);

  const kpis = useMemo(() => {
    const definedFiscais = fiscalData.filter(f => f.name !== 'Não Atribuído');
    const assignedProcesses = definedFiscais.reduce((sum, f) => sum + f.processes, 0);
    const avgProcesses = definedFiscais.length > 0 ? (assignedProcesses / definedFiscais.length).toFixed(1) : '0';
    return {
      totalFiscais: definedFiscais.length,
      avgProcesses,
      totalUnassigned: fiscalData.find(f => f.name === 'Não Atribuído')?.processes || 0
    };
  }, [fiscalData]);

  const chartData = useMemo(() => {
    return fiscalData.map(f => ({
      name: f.name === 'Não Atribuído' ? 'N/A' : f.name.split(' ')[0],
      fullName: f.name,
      processes: f.processes,
      volume: f.totalConcedido,
      volumeFomento: f.totalFomento,
      volumePatrocinio: f.totalPatrocinio,
    }));
  }, [fiscalData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white border border-[#003865]/20 shadow-sm flex items-center justify-start gap-5">
          <div className="p-4 bg-slate-50 rounded-lg shrink-0">
            <Users className="text-[#008f4c]" size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Fiscais Atuantes</p>
            <p className="text-3xl font-bold text-[#003865]">{kpis.totalFiscais}</p>
          </div>
        </div>
        
        <div className="p-6 bg-white border border-[#003865]/20 shadow-sm flex items-center justify-start gap-5">
          <div className="p-4 bg-slate-50 rounded-lg shrink-0">
            <FileText className="text-[#008f4c]" size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Média Proc./Fiscal</p>
            <p className="text-3xl font-bold text-[#003865]">{kpis.avgProcesses}</p>
          </div>
        </div>
        
        <div className="p-6 bg-white border border-[#003865]/20 shadow-sm flex items-center justify-start gap-5">
          <div className="p-4 bg-slate-50 rounded-lg shrink-0">
            <MapIcon className="text-slate-400" size={32} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium mb-1">Não Atribuídos</p>
            <p className="text-3xl font-bold text-slate-600">{kpis.totalUnassigned}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart comparing volume by fiscal */}
        <div className="col-span-1 lg:col-span-1 p-6 bg-white border border-[#003865]/20 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Volume Financeiro vs Processos</h3>
          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip 
                  formatter={(val: number, name: string) => {
                    const labelMap: Record<string, string> = {
                      volumeFomento: 'Volume Fomento',
                      volumePatrocinio: 'Volume Patrocínio'
                    };
                    const label = labelMap[name] || name;
                    return [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val), label];
                  }}
                  labelFormatter={(name) => `Fiscal: ${chartData.find(d => d.name === name)?.fullName || name}`}
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
                />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="volumeFomento" stackId="a" fill="#008f4c" name="Fomento">
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-fom-${index}`} 
                      fill={entry.fullName === 'Não Atribuído' ? '#cbd5e1' : '#008f4c'}
                      opacity={selectedFiscal && selectedFiscal !== entry.fullName ? 0.3 : 1}
                      onClick={() => setSelectedFiscal(selectedFiscal === entry.fullName ? null : entry.fullName)}
                      cursor="pointer"
                    />
                  ))}
                </Bar>
                <Bar dataKey="volumePatrocinio" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Patrocínio">
                  {chartData.map((entry, index) => (
                     <Cell 
                     key={`cell-pat-${index}`} 
                     fill={entry.fullName === 'Não Atribuído' ? '#e2e8f0' : '#f59e0b'}
                     opacity={selectedFiscal && selectedFiscal !== entry.fullName ? 0.3 : 1}
                     onClick={() => setSelectedFiscal(selectedFiscal === entry.fullName ? null : entry.fullName)}
                     cursor="pointer"
                   />
                  ))}
                  <LabelList 
                    dataKey="processes" 
                    position="right" 
                    fill="#334155" 
                    fontSize={11} 
                    fontWeight={600} 
                    formatter={(val: number) => val.toString()}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">Clique na barra para filtrar a tabela ao lado.</p>
        </div>

        {/* Detailed cards for each fiscal */}
        <div className="col-span-1 lg:col-span-2 bg-white border border-[#003865]/20 shadow-sm p-6 overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex justify-between items-center shrink-0">
            <span>Visão Detalhada por Fiscal</span>
            {selectedFiscal && (
              <button 
                onClick={() => setSelectedFiscal(null)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Limpar Filtro
              </button>
            )}
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[450px]">
            {fiscalData
              .filter(f => !selectedFiscal || f.name === selectedFiscal)
              .map((f, i) => (
              <div 
                key={i} 
                className="border border-slate-200 rounded-md hover:border-[#008f4c]/50 transition-colors bg-slate-50/50 overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedFiscal(expandedFiscal === f.name ? null : f.name)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-[#003865] flex items-center">
                      <Users size={16} className="mr-2 text-[#008f4c]" />
                      {f.name}
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className="font-semibold text-[#008f4c] text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(f.totalConcedido)}
                      </div>
                      <div className="text-slate-400">
                        {expandedFiscal === f.name ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-sm mt-3 border-t border-slate-200/60 pt-3">
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Total Processos</div>
                      <div className="font-medium text-slate-800">{f.processes} projeto{f.processes !== 1 && 's'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Repasses</div>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {f.processesFomento > 0 && <div className="text-[#008f4c] font-medium">{f.processesFomento} Fomento</div>}
                        {f.processesPatrocinio > 0 && <div className="text-amber-600 font-medium">{f.processesPatrocinio} Patrocínio</div>}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Regiões</div>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {f.regionsFomentoList && <div className="text-[#008f4c] font-medium" title={f.regionsFomentoList}>{f.regionsFomentoList}</div>}
                        {f.regionsPatrocinioList && <div className="text-amber-600 font-medium" title={f.regionsPatrocinioList}>{f.regionsPatrocinioList}</div>}
                        {!f.regionsFomentoList && !f.regionsPatrocinioList && <div className="font-medium text-slate-500">N/A</div>}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Estados</div>
                      <div className="flex flex-col gap-0.5 text-xs">
                        {f.statesFomentoList && <div className="text-[#008f4c] font-medium line-clamp-1" title={f.statesFomentoList}>({f.statesFomentoCount}) {f.statesFomentoList}</div>}
                        {f.statesPatrocinioList && <div className="text-amber-600 font-medium line-clamp-1" title={f.statesPatrocinioList}>({f.statesPatrocinioCount}) {f.statesPatrocinioList}</div>}
                        {!f.statesFomentoList && !f.statesPatrocinioList && <div className="font-medium text-slate-500">N/A</div>}
                      </div>
                    </div>
                  </div>
                </div>
                
                {expandedFiscal === f.name && (
                  <div className="bg-white border-t border-slate-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-slate-600">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th scope="col" className="px-4 py-3">Nome</th>
                            <th scope="col" className="px-4 py-3">CNPJ</th>
                            <th scope="col" className="px-4 py-3">SEI</th>
                            <th scope="col" className="px-4 py-3 text-center">Estado</th>
                            <th scope="col" className="px-4 py-3 text-right">Repasse</th>
                          </tr>
                        </thead>
                        <tbody>
                          {f.projects.map((proj, pIdx) => (
                                                    <React.Fragment key={pIdx}>
                              <tr 
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 cursor-pointer"
                                onClick={() => (proj.gestao_inicioexecucao || proj.gestao_primeirorepasse || proj.gestao_status) && toggleProject(proj.SEI)}
                              >
                                <td className="px-4 py-3 font-medium text-slate-800 break-words max-w-xs flex items-center gap-2">
                                  {(proj.gestao_inicioexecucao || proj.gestao_primeirorepasse || proj.gestao_status) && (
                                    <span className="text-slate-400">
                                      {expandedProjects.has(proj.SEI) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </span>
                                  )}
                                  {proj.ENTIDADE || 'N/A'}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">{formatCNPJ(proj.CNPJ) || 'N/A'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-[#003865]">{proj.SEI || 'N/A'}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700">
                                    {proj.ESTADO || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-[#008f4c]">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proj.VALOR_REPASSE)}
                                </td>
                              </tr>
                              {expandedProjects.has(proj.SEI) && (proj.gestao_inicioexecucao || proj.gestao_primeirorepasse || proj.gestao_status) ? (
                                <tr className="bg-slate-50/30 border-b border-slate-200">
                                  <td colSpan={5} className="px-4 py-3 px-6 pb-4 text-xs">
                                    <div className="p-3 bg-white border border-[#003865]/10 rounded-md shadow-sm space-y-4">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                          <div className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Fiscal Suplente</div>
                                          <div className="text-slate-700 font-medium">{proj.gestao_fiscalsuplente || '-'}</div>
                                        </div>
                                        <div>
                                          <div className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Período de Execução</div>
                                          <div className="text-slate-700 font-medium">{proj.gestao_inicioexecucao || '-'} a {proj.gestao_fimexecucao || '-'}</div>
                                          {proj.gestao_inicioexecucao && proj.gestao_fimexecucao && (() => {
                                            const start = parseDate(proj.gestao_inicioexecucao);
                                            const end = parseDate(proj.gestao_fimexecucao);
                                            const now = new Date();
                                            const total = end.getTime() - start.getTime();
                                            const elapsedPos = Math.min(Math.max(now.getTime() - start.getTime(), 0), total);
                                            const percentage = (elapsedPos / total) * 100;

                                            if (total <= 0) return null;

                                            return (
                                              <div className="relative w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full" />
                                                <div className="absolute top-0 right-0 h-full bg-slate-200 transition-all duration-300" style={{ width: `${100 - percentage}%` }} />
                                                <div
                                                  className="absolute top-0.5 h-1.5 w-1.5 bg-black border border-black rotate-45"
                                                  style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
                                                />
                                              </div>
                                            );
                                          })()}
                                        </div>
                                        <div>
                                          <div className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Termo de Fomento</div>
                                          <div className="text-slate-700 font-medium">{proj.gestao_termodefomento || '-'}</div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-3">
                                        <div>
                                          <div className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-[10px]">Status</div>
                                          <div className="text-slate-700 font-medium">
                                            {proj.gestao_status && (
                                              <span className={cn("inline-block px-2 py-0.5 rounded text-[10px] font-bold", 
                                                ['Em execução', 'Primeiro Repasse', 'Segundo Repasse'].includes(proj.gestao_status) ? "bg-blue-100 text-blue-700" :
                                                proj.gestao_status === 'Em prestação de Contas' ? "bg-orange-100 text-orange-700" :
                                                proj.gestao_status === 'Finalizado' ? "bg-emerald-100 text-emerald-700" :
                                                "bg-slate-100 text-slate-700"
                                              )}>
                                                {proj.gestao_status}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-[10px]">1º Repasse</div>
                                          <div className="text-[#008f4c] font-bold">
                                            {proj.gestao_primeirorepasse || '-'} 
                                            {proj.gestao_dataprimeirorepasse && <span className="text-slate-400 font-normal text-[10px] ml-1">({proj.gestao_dataprimeirorepasse})</span>}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-[10px]">2º Repasse</div>
                                          <div className="text-[#008f4c] font-bold">
                                            {proj.gestao_segundorepasse || '-'} 
                                            {proj.gestao_datasegundorepasse && <span className="text-slate-400 font-normal text-[10px] ml-1">({proj.gestao_datasegundorepasse})</span>}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              ) : null}
                              </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {fiscalData.filter(f => !selectedFiscal || f.name === selectedFiscal).length === 0 && (
              <div className="text-center text-slate-500 py-8">Nenhum dado encontrado para o filtro selecionado.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
