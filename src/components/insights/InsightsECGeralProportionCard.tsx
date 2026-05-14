import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InsightsECGeralProportionCardProps {
  total: number;
  receivedAny: number;
  notReceived: number;
}

export function InsightsECGeralProportionCard({
  total,
  receivedAny,
  notReceived,
}: InsightsECGeralProportionCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#003865] mb-6">Proporção Geral: Receberam vs Não Receberam</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: 'Receberam Repasse', value: receivedAny },
                { name: 'Sem Repasse', value: notReceived },
              ]}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill="#008f4c" />
              <Cell fill="#d4a017" />
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number, name: string) => [`${value} entidades (${((value / total) * 100).toFixed(1)}%)`, name]}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
