import { FastifyPluginAsync } from 'fastify';
import { parseString } from 'fast-csv';

interface CSVRow {
  company_id: string;
  company_name: string;
  sector: string;
  retailer_id: string;
  retailer_name: string;
  kpi_id: string;
  kpi_name: string;
  period: string;
  estimate_type: string;
  value: string;
  as_of: string;
}

const importRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/import', async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({ message: 'No file uploaded' });
    }

    const buffer = await data.toBuffer();
    const csvContent = buffer.toString();

    const rows: CSVRow[] = [];
    let importedCount = 0;
    
    const companiesSet = new Set<string>();
    const retailersSet = new Set<string>();
    const kpisSet = new Set<string>();

    try {
      await new Promise<void>((resolve, reject) => {
        parseString(csvContent, { headers: true })
          .on('error', (error) => reject(error))
          .on('data', (row: CSVRow) => rows.push(row))
          .on('end', () => resolve());
      });
    } catch (err: any) {
      return reply.code(500).send({ message: err.message });
    }

    for (const row of rows) {
      try {
        if (!row.company_name || !row.kpi_name || !row.retailer_name || !row.value || !row.period) {
            continue;
        }

        const company = await fastify.db.company.upsert({
          where: { name: row.company_name },
          update: { sector: row.sector || 'Unknown' },
          create: { name: row.company_name, sector: row.sector || 'Unknown' }
        });
        companiesSet.add(company.name);

        const kpi = await fastify.db.kPI.upsert({
          where: { name: row.kpi_name },
          update: {}, 
          create: { name: row.kpi_name, format: 'NUMBER' } 
        });
        kpisSet.add(kpi.name);

        const retailer = await fastify.db.retailer.upsert({
          where: { name: row.retailer_name },
          update: {},
          create: { name: row.retailer_name }
        });
        retailersSet.add(retailer.name);

        const isMtd = row.estimate_type?.toLowerCase() === 'mtd';
        const asOf = row.as_of ? new Date(row.as_of) : new Date('1970-01-01T00:00:00Z');
        const periodDate = new Date(row.period + '-01');

        await fastify.db.kPIEstimate.upsert({
          where: {
            companyId_kpiId_retailerId_period_isMtd_asOf: {
              companyId: company.id,
              kpiId: kpi.id,
              retailerId: retailer.id,
              period: periodDate,
              isMtd,
              asOf
            }
          },
          update: {
            value: parseFloat(row.value),
            updatedAt: new Date()
          },
          create: {
            companyId: company.id,
            kpiId: kpi.id,
            retailerId: retailer.id,
            value: parseFloat(row.value),
            period: periodDate,
            isMtd,
            asOf
          }
        });

        importedCount++;
      } catch (err) {
        fastify.log.error(`Error importing row: ${err}`);
      }
    }

    return { 
        imported: importedCount,
        summary: {
            companies: Array.from(companiesSet),
            retailers: Array.from(retailersSet),
            kpis: Array.from(kpisSet)
        }
    };
  });
};

export default importRoutes;
