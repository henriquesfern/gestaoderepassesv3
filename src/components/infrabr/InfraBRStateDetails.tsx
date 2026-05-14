import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import type { InfraRuntimeData } from '../../data/runtime-loaders';
import { stateSiglaToName } from '../../hooks/useInfraBRMetrics';

interface InfraBRStateDetailsProps {
  infraData: InfraRuntimeData;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDimension: string;
  setSelectedDimension: (dimension: string) => void;
  availableDimensions: string[];
  radarData: any[];
  componentData: any[];
}

export function InfraBRStateDetails({ 
  infraData,
  selectedState, setSelectedState, 
  selectedDimension, setSelectedDimension, 
  availableDimensions, radarData, componentData 
}: InfraBRStateDetailsProps) {
  return (
    <>
      <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2 flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            Detalhes por Estado
          </h3>
          <p className="text-sm text-slate-500">Selecione uma UF para analisar suas dimensões e componentes no Infra-BR vs Média Nacional.</p>
        </div>
        <div className="w-48 ml-4 shrink-0">
          <select
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700 font-medium"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
          >
            {infraData.infraEstados.slice().sort((a, b) => a.sigla_uf.localeCompare(b.sigla_uf)).map(state => (
              <option key={state.sigla_uf} value={state.sigla_uf}>{state.sigla_uf} - {stateSiglaToName[state.sigla_uf] || state.sigla_uf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Dimensões Radar */}
      <div className="bg-white p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 text-center">
          {selectedState} vs Média Brasil (Dimensões)
        </h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid opacity={0.3} />
              <PolarAngleAxis dataKey="dimensao" tick={{ fill: '#475569', fontSize: 11 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Radar name={selectedState} dataKey="estado" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.6} />
              <Radar name="Média BR" dataKey="mediaBR" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc', fontWeight: 500, fontSize: '13px' }}
                formatter={(val: number) => val.toFixed(2)}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Componentes Bar */}
      <div className="bg-white p-6 border border-slate-200 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-4 border-b pb-2 gap-4">
          <h3 className="text-lg font-semibold text-slate-800 shrink-0">
            Componentes Infra-BR ({selectedState})
          </h3>
          <select
            className="w-48 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003865]/20 focus:border-[#003865] bg-white text-slate-700"
            value={selectedDimension}
            onChange={(e) => setSelectedDimension(e.target.value)}
          >
            {availableDimensions.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={componentData} layout="vertical" margin={{ top: 10, right: 20, left: 110, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal={true} vertical={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b' }} />
              <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 11 }} width={100} />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc' }}
                itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                formatter={(val: number) => val.toFixed(2)}
              />
              <Bar dataKey="value" name="Nota do Componente" fill="#0284c7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Indicadores Detalhados (O que compõe a dimensão selecionada) */}
      <div className="bg-white p-6 border border-slate-200 shadow-sm col-span-1 lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
          Detalhamento de Indicadores - {selectedDimension} ({selectedState})
        </h3>
        <div className="w-full overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 font-semibold text-slate-700">Componente</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Indicador</th>
                <th className="px-4 py-3 font-semibold text-slate-700 w-24">Valor</th>
                <th className="px-4 py-3 font-semibold text-slate-700 w-24">Rank UF</th>
                <th className="px-4 py-3 font-semibold text-slate-700 w-20">Ano</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {infraData.indicadores
                .filter(i => i.sigla_uf === selectedState && i.dimension_name === selectedDimension)
                .sort((a,b) => a.component_name.localeCompare(b.component_name) || b.value - a.value)
                .map((ind, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 font-medium">{ind.component_name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {ind.indicator_name}
                      {ind.descricao && <p className="text-xs text-slate-400 mt-0.5">{ind.descricao}</p>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{ind.value.toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-600">{ind.rank}º</td>
                    <td className="px-4 py-3 text-slate-500">{ind.ano}</td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
