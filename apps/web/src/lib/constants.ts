export const KPI_KEYS = {
  GMV: 'GMV',
  UNITS: 'Units Sold',
  ASP: 'ASP',
} as const;

export const QUERY_MODES = {
  ANALYZE: 'ANALYZE',
  COMPARE: 'COMPARE',
  RANK: 'RANK',
} as const;

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const WS_URL = `${API_URL.replace('http', 'ws')}/ws`;
