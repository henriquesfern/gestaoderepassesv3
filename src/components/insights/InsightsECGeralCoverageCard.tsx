import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InsightsECGeralCoverageCardProps {
  stateData: Array<{ state: string; received: number; notReceived: number }>;
}

export function InsightsECGeralCoverageCard({ stateData }: InsightsECGeralCoverageCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[#003865] mb-6">Cobertura por Estado (Top 10)</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stateData.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" />
            <YAxis dataKey="state" type="category" width={40} />
            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend />
            <Bar dataKey="received" stackId="a" name="Com Repasse" fill="#008f4c" radius={[0, 0, 0, 0]} />
            <Bar dataKey="notReceived" stackId="a" name="Sem Repasse" fill="#d4a017" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
