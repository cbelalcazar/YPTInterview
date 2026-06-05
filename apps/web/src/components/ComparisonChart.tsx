'use client'

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ComparisonData {
  period: string;
  companyValue: number;
  sectorValue: number;
}

interface ComparisonChartProps {
  data: ComparisonData[];
  format: 'CURRENCY' | 'NUMBER';
  companyName: string;
  sectorName: string;
}

export function ComparisonChart({ data, format, companyName, sectorName }: ComparisonChartProps) {
  if (!data || data.length === 0) return null;

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

  const chartData = data.map(d => ({
    ...d,
    date: new Date(d.period).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
  })).sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
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
            width={60}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontWeight: 'bold', fontSize: '12px' }}
            formatter={(value: number) => [format === 'CURRENCY' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value) : new Intl.NumberFormat('en-US').format(value), 'Value']}
          />
          <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
          <Line 
            name={companyName}
            type="monotone" 
            dataKey="companyValue" 
            stroke="#14b8a6" 
            strokeWidth={4} 
            dot={{ r: 4, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line 
            name={`${sectorName} (Avg)`}
            type="monotone" 
            dataKey="sectorValue" 
            stroke="#94a3b8" 
            strokeWidth={3} 
            strokeDasharray="5 5"
            dot={{ r: 4, fill: '#94a3b8', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
