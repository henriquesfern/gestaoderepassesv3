import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FinancialAdjustmentFunnelCardProps {
  ajusteStats: Array<{ name: string; items: number }>;
  tColorPrimary: string;
}

export function FinancialAdjustmentFunnelCard({
  ajusteStats,
  tColorPrimary,
}: FinancialAdjustmentFunnelCardProps) {
  return (
    <div className="p-6 bg-white border border-slate-200 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b pb-2">Funil de Ajustes</h3>
      <p className="text-sm text-slate-600 mb-4">
        Proporção de projetos que tiveram o valor de repasse ajustado em relação à proposta original (identificado por &apos;sim&apos; na coluna).
      </p>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ajusteStats} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
            />
            <Bar dataKey="items" fill={tColorPrimary} name="Qtd. Entidades" radius={[0, 4, 4, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
