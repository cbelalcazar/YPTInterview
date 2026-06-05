'use client'

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SnapshotEvolutionProps {
  data: {
    asOf: string;
    value: number;
  }[];
  format: 'CURRENCY' | 'NUMBER';
}

export function SnapshotEvolution({ data, format }: SnapshotEvolutionProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map(d => ({
    time: new Date(d.asOf).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    value: d.value
  }));

  const formatValue = (val: number) => {
    if (format === 'CURRENCY') {
      if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
      return `$${val}`;
    }
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toString();
  };

  return (
    <div className="w-full h-48 mt-6">
      <h4 className="text-sm font-black text-brand-navy uppercase tracking-widest mb-4">MTD Evolution (Today)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
            tickFormatter={formatValue}
            domain={['dataMin', 'dataMax']}
            width={50}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', fontSize: '12px' }}
            formatter={(value: number) => [format === 'CURRENCY' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value) : new Intl.NumberFormat('en-US').format(value), 'Value']}
            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
