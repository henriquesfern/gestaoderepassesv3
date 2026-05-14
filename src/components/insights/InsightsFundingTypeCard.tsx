import React from 'react';
import { BarChart3 } from 'lucide-react';
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface InsightsFundingTypeCardProps {
  typeData: Array<{ name: string; value: number; count: number }>;
  typeColors: string[];
  fomentoStats: { count: number; avg: number; total: number };
  patrocinioStats: { count: number; avg: number; total: number };
  formatBRL: (value: number) => string;
}

export function InsightsFundingTypeCard({
  typeData,
  typeColors,
  fomentoStats,
  patrocinioStats,
  formatBRL,
}: InsightsFundingTypeCardProps) {
  const total = fomentoStats.total + patrocinioStats.total || 1;

  return (
    <div className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-amber-50 rounded-lg text-amber-500 shrink-0">
          <BarChart3 size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Fomento vs. Patrocínio</h3>
          <p className="text-sm text-slate-500 mt-1">Distribuição de valores concedidos historicamente.</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="h-64 w-full flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={5} dataKey="value">
                {typeData.map((entry, index) => (
                  <Cell key={`type-cell-${index}`} fill={typeColors[index % typeColors.length]} />
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
          <div className="p-3 bg-blue-500 rounded shadow-sm text-center flex flex-col items-center justify-center">
            <p className="text-xs text-blue-100 font-medium mb-0.5">Fomento ({fomentoStats.count})</p>
            <p className="text-lg font-bold text-white leading-tight">{formatBRL(fomentoStats.total)}</p>
            <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-blue-200 mt-0.5">
              <span>Média: {formatBRL(fomentoStats.avg)}</span>
              <span className="hidden md:inline">•</span>
              <span>{((fomentoStats.total / total) * 100).toFixed(1)}% do total</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500 rounded shadow-sm text-center flex flex-col items-center justify-center">
            <p className="text-xs text-amber-100 font-medium mb-0.5">Patrocínio ({patrocinioStats.count})</p>
            <p className="text-lg font-bold text-white leading-tight">{formatBRL(patrocinioStats.total)}</p>
            <div className="flex flex-wrap justify-center gap-1 md:gap-1.5 text-[11px] text-amber-200 mt-0.5">
              <span>Média: {formatBRL(patrocinioStats.avg)}</span>
              <span className="hidden md:inline">•</span>
              <span>{((patrocinioStats.total / total) * 100).toFixed(1)}% do total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
