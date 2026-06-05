import { FastifyPluginAsync } from 'fastify';

const rankings: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request) => {
    const { kpiId, retailerId } = request.query as any;

    const latest = await fastify.db.kPIEstimate.findFirst({
      where: { kpiId, isMtd: false },
      orderBy: { period: 'desc' }
    });

    if (!latest) return [];

    const estimates = await fastify.db.kPIEstimate.findMany({
      where: {
        kpiId,
        period: latest.period,
        isMtd: false,
        ...(retailerId ? { retailerId } : {})
      },
      include: { company: true },
      orderBy: { value: 'desc' },
      take: 10
    });

    return estimates.map(e => ({
      companyName: e.company.name,
      value: e.value
    }));
  });
};
export default rankings;
