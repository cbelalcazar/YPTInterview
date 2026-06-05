import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import appService from '../app';
import { PrismaClient } from '@repo/db';

const prisma = new PrismaClient();

describe('API Routes Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = Fastify();
    app.register(appService);
    await app.ready();
    await prisma.$connect();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('should list companies via GET /companies', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/companies'
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(Array.isArray(data)).toBe(true);
    if (data.length > 0) {
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('name');
      expect(data[0]).toHaveProperty('sector');
      expect(data[0]).toHaveProperty('_count');
    }
  });

  it('should authenticate and reject invalid login via POST /auth/login', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'wrong',
        password: '123'
      }
    });

    expect(response.statusCode).toBe(401);
  });

  it('should authenticate valid login via POST /auth/login', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'admin',
        password: 'admin123'
      }
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data).toHaveProperty('token');
  });

  it('should reject unauthorized POST /estimates', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/estimates',
      payload: {
        companyId: 'test-id',
        kpiId: 'test-kpi',
        value: 100,
        period: '2023-10-01',
        isMtd: true
      }
    });

    // 401 Unauthorized because no token is provided
    expect(response.statusCode).toBe(401);
  });

  it('should accept authorized POST /estimates', async () => {
    // 1. Get token
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'admin',
        password: 'admin123'
      }
    });
    const { token } = JSON.parse(loginResponse.payload);

    // 2. Fetch a company and kpi to get real IDs for testing
    const companiesResponse = await app.inject({
      method: 'GET',
      url: '/companies'
    });
    const companies = JSON.parse(companiesResponse.payload);
    
    // We only test the estimate insertion if there is seeded data
    if (companies.length > 0) {
      const companyId = companies[0].id;
      
      // Need a KPI id and Retailer id
      const kpis = await prisma.kPI.findMany();
      const retailers = await prisma.retailer.findMany();
      if (kpis.length > 0 && retailers.length > 0) {
        const kpiId = kpis[0].id;
        const retailerId = retailers[0].id;

        const response = await app.inject({
          method: 'POST',
          url: '/estimates',
          headers: {
            Authorization: `Bearer ${token}`
          },
          payload: {
            companyId,
            kpiId,
            retailerId,
            value: 99999,
            period: '2023-11-01',
            isMtd: true
          }
        });

        expect(response.statusCode).toBe(200);
        const data = JSON.parse(response.payload);
        expect(data.value).toBe(99999);
      }
    }
  });

  it('should fetch KPI analysis via GET /companies/:companyId/kpis/:kpiId/analysis', async () => {
    const companiesResponse = await app.inject({
      method: 'GET',
      url: '/companies'
    });
    const companies = JSON.parse(companiesResponse.payload);
    
    if (companies.length > 0) {
      const companyId = companies[0].id;
      const kpis = await prisma.kPI.findMany();
      
      if (kpis.length > 0) {
        const kpiId = kpis[0].id;

        const analysisResponse = await app.inject({
          method: 'GET',
          url: `/companies/${companyId}/kpis/${kpiId}/analysis`
        });

        expect(analysisResponse.statusCode).toBe(200);
        const data = JSON.parse(analysisResponse.payload);
        expect(data).toHaveProperty('kpi');
        expect(data).toHaveProperty('history');
        expect(data).toHaveProperty('trends');
      }
    }
  });

  it('should import CSV data via POST /estimates/import', async () => {
    const csvContent = 'company_id,company_name,sector,retailer_id,retailer_name,kpi_id,kpi_name,period_start,period_end,period,estimate_type,value,unit,as_of,last_updated\n' +
      'trendy_shoe_brand,Trendy Shoe Brand,Footwear,sole_city,Sole City,gmv,GMV,2025-05-01,2025-05-31,2025-05,historical,100,USD,,2025-06-01T08:00:00Z';

    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const payload = `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="test.csv"\r\n` +
      `Content-Type: text/csv\r\n\r\n` +
      `${csvContent}\r\n` +
      `--${boundary}--\r\n`;

    const response = await app.inject({
      method: 'POST',
      url: '/estimates/import',
      headers: {
        'content-type': `multipart/form-data; boundary=${boundary}`
      },
      payload
    });

    expect(response.statusCode).toBe(200);
    const data = JSON.parse(response.payload);
    expect(data.imported).toBeGreaterThan(0);

    // Verify retailer was created
    const retailer = await prisma.retailer.findUnique({
      where: { name: 'Sole City' }
    });
    expect(retailer).not.toBeNull();
  });
});
