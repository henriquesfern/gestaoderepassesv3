import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface FinancialRegionComparisonCardProps {
  regionFinancial: Array<{ name: string; Projeto: number; Concedido: number }>;
  formatBRL: (value: number) => string;
  tColorSecondary: string;
}

export function FinancialRegionComparisonCard({
  regionFinancial,
  formatBRL,
  tColorSecondary,
}: FinancialRegionComparisonCardProps) {
  return (
    <div className="lg:col-span-2 p-6 bg-white border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2">Comparativo Solicitado vs. Repassado (Por Região)</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={regionFinancial} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(val) => `R$ ${(Number(val) / 1000000).toFixed(1)}M`} />
            <Tooltip
              formatter={(val: number) => formatBRL(val)}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
            />
            <Legend />
            <Bar dataKey="Projeto" fill="#A0AAB2" name="Valor Solicitado" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Concedido" fill={tColorSecondary} name="Valor de Repasse" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
