'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from 'recharts'

interface KPIChartProps {
  data: any[]
  kpiName: string
  format: 'CURRENCY' | 'NUMBER' | 'PERCENTAGE'
}

export function KPIChart({ data, kpiName, format }: KPIChartProps) {
  const formatValue = (value: number) => {
    if (format === 'CURRENCY') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }).format(value)
    }
    return value.toLocaleString()
  }

  const sortedData = [...data].sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime())

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sortedData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0066ff" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#0066ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="period" 
            tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            tickFormatter={formatValue}
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            className="tabular-nums"
          />
          <Tooltip 
            cursor={{ stroke: '#001b3a', strokeWidth: 1, strokeDasharray: '4 4' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-[#001b3a] p-4 shadow-2xl rounded-xl border border-white/10 text-white">
                    <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-2 opacity-80">
                      {new Date(label).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xl font-black tabular-nums">
                      {formatValue(payload[0].value as number)}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                      {kpiName} Estimate
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#0066ff" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            dot={{ r: 5, fill: '#0066ff', strokeWidth: 2.5, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 0, fill: '#0066ff' }}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
