import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { KPIChart } from '../components/KPIChart'

// Mock Recharts as it's hard to test in JSDOM
vi.mock('recharts', () => {
  return {
    ResponsiveContainer: ({ children }: any) => <div style={{ width: 800, height: 400 }}>{children}</div>,
    AreaChart: ({ children }: any) => <div>{children}</div>,
    Area: () => <div>Area</div>,
    XAxis: () => <div>XAxis</div>,
    YAxis: () => <div>YAxis</div>,
    CartesianGrid: () => <div>CartesianGrid</div>,
    Tooltip: () => <div>Tooltip</div>,
    Legend: () => <div>Legend</div>,
  }
})

describe('KPIChart Component', () => {
  const mockData = [
    { period: '2023-10-01', value: 1200000 },
    { period: '2023-09-01', value: 1100000 },
  ]

  it('renders without crashing', () => {
    render(<KPIChart data={mockData} kpiName="GMV" format="CURRENCY" />)
    // If it renders without crashing, basic check passes
  })

  it('correctly handles empty data', () => {
    render(<KPIChart data={[]} kpiName="GMV" format="CURRENCY" />)
    // Should still render the container/chart structure
  })
})
