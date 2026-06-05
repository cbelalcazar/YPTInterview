import { FastifyPluginAsync } from 'fastify';

const sectors: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => {
    const companies = await fastify.db.company.findMany({
      select: { sector: true },
      distinct: ['sector']
    });
    return companies.map(c => c.sector).sort();
  });

  fastify.get('/:sectorName/kpis/:kpiId/analysis', async (request, reply) => {
    const { sectorName, kpiId } = request.params as any;
    
    const allEstimates = await fastify.db.kPIEstimate.findMany({
      where: {
        company: { sector: sectorName },
        kpiId,
        isMtd: false
      },
      orderBy: { period: 'asc' },
      include: { company: true }
    });

    if (allEstimates.length === 0) {
      return reply.code(404).send({ message: 'No data found for this sector' });
    }

    const groupedByPeriod: Record<string, number[]> = {};
    allEstimates.forEach(e => {
      const p = e.period.toISOString();
      if (!groupedByPeriod[p]) groupedByPeriod[p] = [];
      groupedByPeriod[p].push(e.value);
    });

    const averageHistory = Object.entries(groupedByPeriod).map(([period, values]) => ({
      period,
      value: values.reduce((a, b) => a + b, 0) / values.length
    })).sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());

    return { sector: sectorName, history: averageHistory };
  });
};
export default sectors;
