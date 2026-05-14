import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InsightsECGeralTypesCardProps {
  typeData: Array<{ name: string; value: number }>;
}

export function InsightsECGeralTypesCard({ typeData }: InsightsECGeralTypesCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm lg:col-span-2">
      <h3 className="text-lg font-bold text-[#003865] mb-6">Tipos de Registros na Base (EC Geral)</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={typeData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Bar dataKey="value" name="Quantidade" fill="#003865" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
