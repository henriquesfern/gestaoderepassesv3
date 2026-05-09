import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export function OverviewDistributionChart({ grupoData }: { grupoData: any[] }) {
  return (
    <>
      <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2 cursor-default flex justify-between items-center shrink-0">
        <span className="truncate" title="Distribuição por Grupo">Distribuição por Grupo</span>
      </h3>
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[200px]">
        <div className="h-[250px] w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={grupoData}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                paddingAngle={2}
                dataKey="value"
              >
                {grupoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / data.total) * 100).toFixed(1);
                    const formattedValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(data.value);
                    return (
                      <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded shadow-xl">
                        <p className="font-bold text-sm mb-1" style={{ color: data.fill }}>{data.name}</p>
                        <p className="text-sm">Repasse: <span className="font-semibold">{formattedValue}</span></p>
                        <p className="text-sm">Proporção: <span className="font-semibold">{percentage}%</span></p>
                        <p className="text-sm">Entidades Atendidas: <span className="font-semibold">{data.count}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full flex justify-center gap-4 text-xs font-medium mt-4">
          <div className="flex items-center gap-1.5 text-[#1e40af]">
            <div className="w-3 h-3 rounded-full bg-[#1e40af]"></div> CDEN
          </div>
          <div className="flex items-center gap-1.5 text-[#065f46]">
            <div className="w-3 h-3 rounded-full bg-[#065f46]"></div> Precursoras
          </div>
          <div className="flex items-center gap-1.5 text-[#475569]">
            <div className="w-3 h-3 rounded-full bg-[#475569]"></div> Outras
          </div>
        </div>
      </div>
    </>
  );
}
