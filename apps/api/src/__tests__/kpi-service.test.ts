import { describe, it, expect } from 'vitest';
import { calculateTrends } from '../services/kpi-service';

describe('KPI Trend Calculations', () => {
  it('should calculate MOM growth correctly', () => {
    const data = [
      { period: new Date('2023-10-01'), value: 110 },
      { period: new Date('2023-09-01'), value: 100 },
    ];
    
    const result = calculateTrends(data);
    expect(result.mom).toBe(10); // 10% growth
  });

  it('should calculate YOY growth correctly', () => {
    const data = [
      { period: new Date('2023-10-01'), value: 150 },
      { period: new Date('2023-09-01'), value: 140 },
      { period: new Date('2022-10-01'), value: 100 },
    ];
    
    const result = calculateTrends(data);
    expect(result.yoy).toBe(50); // 50% growth vs last year same month
  });

  it('should return null if previous data is missing', () => {
    const data = [
      { period: new Date('2023-10-01'), value: 100 }
    ];
    
    const result = calculateTrends(data);
    expect(result.mom).toBeNull();
    expect(result.yoy).toBeNull();
  });

  it('should handle negative growth', () => {
    const data = [
      { period: new Date('2023-10-01'), value: 80 },
      { period: new Date('2023-09-01'), value: 100 },
    ];
    
    const result = calculateTrends(data);
    expect(result.mom).toBe(-20);
  });
});
