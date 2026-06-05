import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { calculateTrends } from '../../services/kpi-service';

const kpis: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/:companyId/kpis/:kpiId/analysis', async function (request: FastifyRequest<{ Params: { companyId: string, kpiId: string }, Querystring: { retailerId?: string } }>, reply: FastifyReply) {
    const { companyId, kpiId } = request.params;
    const { retailerId } = request.query;

    const where: any = { companyId, kpiId };
    if (retailerId) {
      where.retailerId = retailerId;
    }

    const allEstimates = await fastify.db.kPIEstimate.findMany({
      where,
      orderBy: [
        { period: 'desc' },
        { asOf: 'desc' }
      ],
      include: { kpi: true, retailer: true }
    });

    if (allEstimates.length === 0) {
      return reply.code(404).send({ message: 'No data found' });
    }

    const grouped: Record<string, any[]> = {};
    for (const e of allEstimates) {
      const key = `${e.period.toISOString()}_${e.isMtd}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(e);
    }

    let mtdSnapshots: any[] = [];
    const retailerBreakdown: Record<string, number> = {};

    const processedEstimates = Object.values(grouped).map(group => {
      const first = group[0];
      if (first.isMtd) {
        if (mtdSnapshots.length === 0) {
            mtdSnapshots = [...group].sort((a, b) => a.asOf.getTime() - b.asOf.getTime());
        }

        const latestPerRetailer: Record<string, any> = {};
        for (const e of group) {
          if (latestPerRetailer[e.retailerId] === undefined) {
            latestPerRetailer[e.retailerId] = e;
          }
        }

        if (Object.keys(retailerBreakdown).length === 0) {
            Object.values(latestPerRetailer).forEach(e => {
                retailerBreakdown[e.retailer.name] = (retailerBreakdown[e.retailer.name] || 0) + e.value;
            });
        }

        const totalValue = Object.values(latestPerRetailer).reduce((a, b) => a + b.value, 0);
        return { ...first, value: totalValue };
      } else {
        const totalValue = group.reduce((sum, e) => sum + e.value, 0);
        return { ...first, value: totalValue };
      }
    });

    processedEstimates.sort((a, b) => b.period.getTime() - a.period.getTime());

    const mtd = processedEstimates.find(e => e.isMtd);
    const history = processedEstimates.filter(e => !e.isMtd).slice(0, 13);

    const trends = calculateTrends(history);

    const breakdown = Object.entries(retailerBreakdown).map(([name, value]) => ({ retailerName: name, value }));
    const evolution = mtdSnapshots.map(s => ({ asOf: s.asOf.toISOString(), value: s.value }));

    return {
      kpi: allEstimates[0].kpi,
      mtd,
      history,
      trends,
      breakdown,
      evolution
    };
  });
};

export default kpis;
