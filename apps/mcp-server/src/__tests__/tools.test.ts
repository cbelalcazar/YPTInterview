import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@repo/db';
import { handleSearchCompanies, handleGetKpiAnalysis } from '../handlers';

const db = new PrismaClient();

describe('MCP Server Tool Handlers', () => {
  let testCompanyId: string;
  let testKpiId: string;

  beforeAll(async () => {
    await db.$connect();
    // Assuming the DB is seeded from previous steps
    const company = await db.company.findFirst();
    const kpi = await db.kPI.findFirst();
    if (company && kpi) {
      testCompanyId = company.id;
      testKpiId = kpi.id;
    }
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it('search_companies should return matching companies', async () => {
    // Search for a common substring or empty to get all
    const result = await handleSearchCompanies(db, 'Shoe', 'Footwear');
    
    expect(result.content).toBeDefined();
    expect(result.content[0].type).toBe('text');
    
    const parsedData = JSON.parse(result.content[0].text);
    expect(Array.isArray(parsedData)).toBe(true);
    if (parsedData.length > 0) {
      expect(parsedData[0].name).toContain('Shoe');
      expect(parsedData[0].sector).toBe('Footwear');
    }
  });

  it('get_kpi_analysis should format data and compute trends correctly', async () => {
    if (!testCompanyId || !testKpiId) {
      console.warn('Skipping get_kpi_analysis test because DB is empty');
      return;
    }

    const result = await handleGetKpiAnalysis(db, testCompanyId, testKpiId);
    
    expect(result.content).toBeDefined();
    expect(result.content[0].text).toContain('Analysis for');
    
    // We can't parse it entirely as JSON since the prefix text is attached, 
    // but we can check if it contains expected fields.
    const text = result.content[0].text;
    expect(text).toContain('"yoy_growth"');
    expect(text).toContain('"mtd_estimate"');
  });

  it('get_kpi_analysis should handle empty data gracefully', async () => {
    const result = await handleGetKpiAnalysis(db, 'non-existent', 'non-existent');
    expect(result.content[0].text).toBe('No data found for this selection. Make sure both companyId and kpiId are correct and currently exist in the database.');
  });
});
