import React from 'react';
import { Users } from 'lucide-react';
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface InsightsEntityComparisonCardProps {
  entityData: Array<{ name: string; value: number; count: number }>;
  colors: string[];
  cdenStats: { count: number; avg: number; total: number };
  precStats: { count: number; avg: number; total: number };
  formatBRL: (value: number) => string;
}

export function InsightsEntityComparisonCard({
  entityData,
  colors,
  cdenStats,
  precStats,
  formatBRL,
}: InsightsEntityComparisonCardProps) {
  const total = cdenStats.total + precStats.total || 1;

  return (
    <div className="bg-white p-6 border border-[#003865]/10 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#003865]" />
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-blue-50 rounded-lg text-[#003865] shrink-0">
          <Users size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">CDEN vs. Precursoras</h3>
          <p className="text-sm text-slate-500 mt-1">Comparativo de representatividade no total de repasses históricos.</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="h-64 w-full flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={entityData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={5} dataKey="value">
                {entityData.map((entry, index) => (
                  <Cell key={`entity-cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatBRL(value)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
                labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 bg-[#003865] rounded shadow-sm text-center flex flex-col items-center justify-center">
            <p className="text-xs text-blue-100 font-medium mb-0.5">CDEN ({cdenStats.count})</p>
            <p className="text-lg font-bold text-white leading-tight">{formatBRL(cdenStats.total)}</p>
            <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-blue-200 mt-0.5">
              <span>Média: {formatBRL(cdenStats.avg)}</span>
              <span className="hidden md:inline">•</span>
              <span>{((cdenStats.total / total) * 100).toFixed(1)}% do total</span>
            </div>
          </div>
          <div className="p-3 bg-[#008f4c] rounded shadow-sm text-center flex flex-col items-center justify-center">
            <p className="text-xs text-green-100 font-medium mb-0.5">Precursoras ({precStats.count})</p>
            <p className="text-lg font-bold text-white leading-tight">{formatBRL(precStats.total)}</p>
            <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-green-200 mt-0.5">
              <span>Média: {formatBRL(precStats.avg)}</span>
              <span className="hidden md:inline">•</span>
              <span>{((precStats.total / total) * 100).toFixed(1)}% do total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
