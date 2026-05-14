import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell, LabelList, Legend } from 'recharts';

interface ChartDatum {
  name: string;
  fullName: string;
  processes: number;
  volumeFomento: number;
  volumePatrocinio: number;
}

interface FiscalVolumeChartCardProps {
  chartData: ChartDatum[];
  selectedFiscal: string | null;
  setSelectedFiscal: (fiscal: string | null) => void;
}

export function FiscalVolumeChartCard({
  chartData,
  selectedFiscal,
  setSelectedFiscal,
}: FiscalVolumeChartCardProps) {
  return (
    <div className="col-span-1 lg:col-span-1 p-6 bg-white border border-[#003865]/20 shadow-sm flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Volume Financeiro vs Processos</h3>
      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(val: number, name: string) => {
                const labelMap: Record<string, string> = {
                  volumeFomento: 'Volume Fomento',
                  volumePatrocinio: 'Volume Patrocínio',
                };
                const label = labelMap[name] || name;
                return [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val), label];
              }}
              labelFormatter={(name) => `Fiscal: ${chartData.find(d => d.name === name)?.fullName || name}`}
              cursor={{ fill: '#f1f5f9' }}
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
              <LabelList dataKey="processes" position="right" fill="#334155" fontSize={11} fontWeight={600} formatter={(val: number) => val.toString()} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-slate-400 mt-2 text-center">Clique na barra para filtrar a tabela ao lado.</p>
    </div>
  );
}
