import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface InfraBRScatterViewProps {
  correlationData: any[];
  avgInfraBR: number;
  avgRepasse: number;
}

const formatBRL = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

export function InfraBRScatterView({ correlationData, avgInfraBR, avgRepasse }: InfraBRScatterViewProps) {
  return (
    <>
      {/* Relação Repasse vs InfraBR */}
      <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
          Relação Repasse Financeiro vs Nota Infra-BR
        </h3>
        <p className="text-xs text-slate-500 mb-4 h-12 overflow-hidden">
          Compara o volume total de repasse financeiro direcionado a cada UF com sua respectiva nota no índice geral do Infra-BR. Tamanho do círculo influenciado pelo repasse x rank Infra-BR.
        </p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
              <XAxis 
                type="number" 
                dataKey="infra_br" 
                name="Nota Infra-BR" 
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fill: '#64748b' }}
              />
              <YAxis 
                type="number" 
                dataKey="repasse" 
                name="Repasse" 
                tickFormatter={(v) => `R$ ${(v/1000000).toFixed(0)}M`}
                tick={{ fill: '#64748b' }}
              />
              <ZAxis 
                type="number" 
                dataKey="sizeScore" 
                range={[100, 1500]} 
                name="Repasse / Rank" 
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded shadow-xl text-sm">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-2">{data.name} ({data.uf})</p>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Nota Infra-BR:</span>
                          <span className="text-blue-400 font-semibold">{data.infra_br.toFixed(2)} (Rank: {data.rank}º)</span>
                        </div>
                        <div className="flex justify-between gap-4 mt-1">
                          <span className="text-slate-400">Total Repassado:</span>
                          <span className="text-emerald-400 font-semibold">{formatBRL(data.repasse)}</span>
                        </div>
                        <div className="flex justify-between gap-4 mt-1 pt-1 border-t border-slate-700/50">
                          <span className="text-slate-400 text-xs italic">Razão Repasse/Rank (Tamanho):</span>
                          <span className="text-indigo-400 font-semibold text-xs">{data.sizeScore > 0 ? (data.sizeScore / 1000000).toFixed(2) + 'k' : '-'}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter name="Estados" data={correlationData} fill="#0ea5e9" shape="circle" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Matriz de Quadrantes */}
      <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
          Matriz de Quadrantes: Desvio da Média
        </h3>
        <p className="text-xs text-slate-500 mb-4 h-12 overflow-hidden">
          Classifica os estados em quadrantes através das médias do repasse histórico financeiro e nota Infra-BR. Permite rápido diagnóstico (Ex: "Alto Repasse, Baixa Infra").
        </p>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                type="number" 
                dataKey="infra_br" 
                name="Nota Infra-BR" 
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fill: '#64748b' }}
              />
              <YAxis 
                type="number" 
                dataKey="repasse" 
                name="Repasse" 
                tickFormatter={(v) => `R$ ${(v/1000000).toFixed(0)}M`}
                tick={{ fill: '#64748b' }}
              />
              <ZAxis 
                type="number" 
                dataKey="sizeScore" 
                range={[100, 1500]} 
                name="Repasse / Rank" 
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    let quadrante = "";
                    if (data.repasse > avgRepasse && data.infra_br > avgInfraBR) quadrante = "Alto Repasse / Alta Infra";
                    else if (data.repasse > avgRepasse && data.infra_br <= avgInfraBR) quadrante = "Alto Repasse / Baixa Infra";
                    else if (data.repasse <= avgRepasse && data.infra_br > avgInfraBR) quadrante = "Baixo Repasse / Alta Infra";
                    else quadrante = "Baixo Repasse / Baixa Infra";

                    return (
                      <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded shadow-xl text-sm">
                        <p className="font-bold border-b border-slate-700 pb-1 mb-2">{data.name} ({data.uf})</p>
                        <div className="flex justify-between gap-4 mb-2 border-b border-slate-700/50 pb-2">
                          <span className="text-slate-400">Quadrante:</span>
                          <span className="text-amber-400 font-semibold">{quadrante}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Nota Infra-BR:</span>
                          <span className="text-blue-400 font-semibold">{data.infra_br.toFixed(2)} (Rank: {data.rank}º)</span>
                        </div>
                        <div className="flex justify-between gap-4 mt-1">
                          <span className="text-slate-400">Total Repassado:</span>
                          <span className="text-emerald-400 font-semibold">{formatBRL(data.repasse)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={avgInfraBR} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'top', value: 'Média Infra', fill: '#f59e0b', fontSize: 12 }} />
              <ReferenceLine y={avgRepasse} stroke="#f59e0b" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Média Repasse', fill: '#f59e0b', fontSize: 12 }} />
              <Scatter name="Estados" data={correlationData} fill="#8b5cf6" shape="circle" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
