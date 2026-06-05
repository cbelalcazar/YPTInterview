'use client'

import React from 'react';

interface RetailerBreakdownProps {
  data: {
    retailerName: string;
    value: number;
  }[];
  format: 'CURRENCY' | 'NUMBER';
}

export function RetailerBreakdown({ data, format }: RetailerBreakdownProps) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  const colors = ['bg-brand-teal', 'bg-brand-blue', 'bg-brand-green', 'bg-slate-400', 'bg-slate-300'];

  const formatValue = (val: number) => {
    if (format === 'CURRENCY') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    }
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div className="w-full">
      <h4 className="text-sm font-black text-brand-navy uppercase tracking-widest mb-4">Retailer Breakdown</h4>
      <div className="flex w-full h-4 rounded-full overflow-hidden mb-4">
        {sortedData.map((item, idx) => (
          <div 
            key={item.retailerName}
            style={{ width: `${(item.value / total) * 100}%` }}
            className={colors[idx % colors.length]}
            title={`${item.retailerName}: ${formatValue(item.value)}`}
          />
        ))}
      </div>
      <div className="space-y-2">
        {sortedData.slice(0, 5).map((item, idx) => (
          <div key={item.retailerName} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${colors[idx % colors.length]}`} />
              <span className="font-bold text-slate-600">{item.retailerName}</span>
            </div>
            <span className="font-medium text-slate-500">
              {formatValue(item.value)} ({(item.value / total * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
