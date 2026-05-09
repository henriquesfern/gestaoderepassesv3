import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatBRL } from './OverviewUtils';

export function OverviewHistoryChart({ evolucaoData }: { evolucaoData: any[] }) {
  return (
    <div className="bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
      <div className="flex items-start gap-4 mb-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Evolução de Orçamento</h3>
          <p className="text-sm text-slate-500 mt-1">Comparativo de total investido por frente (2025 x 2026).</p>
        </div>
      </div>
      <div className="h-[150px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={evolucaoData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorFomento" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPatrocinio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${(val / 1000000).toFixed(1)}M`} tick={{fill: '#64748b', fontSize: 12}} width={80} />
            <Tooltip 
              formatter={(value: number) => formatBRL(value)}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.375rem', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              itemStyle={{ color: '#f8fafc', fontWeight: 500 }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #334155', paddingBottom: '4px' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area type="monotone" name="Fomento" dataKey="Fomento" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFomento)" />
            <Area type="monotone" name="Patrocínio" dataKey="Patrocínio" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPatrocinio)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
