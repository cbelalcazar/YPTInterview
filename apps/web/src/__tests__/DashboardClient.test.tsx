import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DashboardClient } from '../components/DashboardClient'

// Mock Recharts to avoid DOM calculation issues in JSDOM
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
}))

// Mock URL.createObjectURL for export functionality
const mockCreateObjectURL = vi.fn()
URL.createObjectURL = mockCreateObjectURL

describe('DashboardClient Component', () => {
  let mockWebSocket: any

  beforeEach(() => {
    // Setup WebSocket Mock
    mockWebSocket = {
      onmessage: null,
      close: vi.fn(),
    }
    global.WebSocket = function() { return mockWebSocket } as any
    mockCreateObjectURL.mockReset()

    // Mock Fetch
    global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes('/companies')) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'comp-1', name: 'Trendy Shoe Brand', sector: 'Footwear' }]) })
        if (url.includes('/kpis')) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'kpi-1', name: 'GMV' }, { id: 'kpi-2', name: 'Units Sold' }, { id: 'kpi-3', name: 'ASP' }]) })
        if (url.includes('/retailers')) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ id: 'ret-1', name: 'Sole City' }]) })
        if (url.includes('/sectors')) return Promise.resolve({ ok: true, json: () => Promise.resolve(['Footwear']) })
        if (url.includes('/analysis')) return Promise.resolve({ 
            ok: true,
            json: () => Promise.resolve({ 
                kpi: { name: 'GMV' }, 
                mtd: { value: 650000, period: '2023-10-01' }, 
                history: [{ period: '2023-10-01', value: 1200000 }],
                trends: { mom: 12.5, yoy: 50 },
                breakdown: [{ retailerName: 'Sole City', value: 1200000 }],
                evolution: [{ asOf: '2023-10-01T12:00:00Z', value: 650000 }]
            }) 
        })
        if (url.includes('/rankings')) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ companyName: 'Trendy Shoe Brand', value: 1200000 }]) })
        return Promise.reject(new Error(`Unknown URL: ${url}`))
    }) as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders initial state correctly (GMV, 13m)', async () => {
    render(<DashboardClient />)
    
    // Wait for loading to finish
    expect(await screen.findByText(/Footwear Analytics/i)).toBeInTheDocument()
    
    // Check initial active states - the GMV card should have the active border class
    // We look for the label text specifically to avoid chart title conflict
    const gmvLabel = await screen.findByText(/^GMV \(SALES \$\)$/i)
    const gmvCard = gmvLabel.closest('div.cursor-pointer')
    expect(gmvCard).toHaveClass('border-brand-teal') 
  })

  it('switches active KPI when clicking KPI cards', async () => {
    const user = userEvent.setup()
    render(<DashboardClient />)
    
    // Wait for data
    await screen.findByText(/Footwear Analytics/i)
    
    const unitsLabels = screen.getAllByText(/^UNITS SOLD$/i)
    // The KPI card label is a <p> element, the option is an <option>
    const unitsLabel = unitsLabels.find(el => el.tagName.toLowerCase() === 'p')!
    const unitsCard = unitsLabel.closest('div.cursor-pointer')
    expect(unitsCard).not.toBeNull()
    
    await user.click(unitsCard!)
    
    // Card state should update
    expect(unitsCard).toHaveClass('border-brand-teal')
  })

  it('handles date range filtering (YTD)', async () => {
    const user = userEvent.setup()
    render(<DashboardClient />)
    
    await screen.findByText(/Footwear Analytics/i)
    
    const ytdButton = screen.getByRole('button', { name: /YTD/i })
    await user.click(ytdButton)
    
    expect(ytdButton).toHaveClass('bg-white')
  })

  it('receives and displays WebSocket notifications', async () => {
    render(<DashboardClient />)
    await screen.findByText(/Footwear Analytics/i)
    
    // Simulate incoming WS message
    const mockMessage = {
      type: 'ESTIMATE_UPDATED',
      payload: {
        companyName: 'TestCo',
        kpiName: 'Sales',
        value: 999
      }
    }
    
    mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) })
    
    // Check if toast appears
    expect(await screen.findByText(/TestCo - Sales updated to 999/i)).toBeInTheDocument()
  })

  it('renders the guided query builder', async () => {
    render(<DashboardClient />)
    
    // Check for GuidedQueryBuilder presence
    expect(await screen.findByText(/Analyze/i)).toBeInTheDocument()
    // Find 'for' specifically as a span to avoid matching 'No relation data for...'
    const forElements = await screen.findAllByText(/for/i)
    expect(forElements.some(el => el.tagName.toLowerCase() === 'span')).toBe(true)
  })
})
