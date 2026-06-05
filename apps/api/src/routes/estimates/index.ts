import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

interface EstimateBody {
  companyId: string;
  kpiId: string;
  retailerId: string;
  value: number;
  period: string;
  isMtd: boolean;
  asOf?: string;
}

const estimates: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post('/', { onRequest: [fastify.authenticate] }, async function (request: FastifyRequest<{ Body: EstimateBody }>, reply: FastifyReply) {
    const { companyId, kpiId, retailerId, value, period, isMtd, asOf } = request.body;

    const asOfDate = asOf ? new Date(asOf) : new Date('1970-01-01T00:00:00Z');

    try {
      const estimate = await fastify.db.kPIEstimate.upsert({
        where: {
          companyId_kpiId_retailerId_period_isMtd_asOf: {
            companyId,
            kpiId,
            retailerId,
            period: new Date(period),
            isMtd: !!isMtd,
            asOf: asOfDate
          }
        },
        update: { value, updatedAt: new Date() },
        create: {
          companyId,
          kpiId,
          retailerId,
          value,
          period: new Date(period),
          isMtd: !!isMtd,
          asOf: asOfDate
        },
        include: {
            company: true,
            kpi: true
        }
      });

      fastify.broadcast({
        type: 'ESTIMATE_UPDATED',
        payload: {
          companyName: estimate.company.name,
          kpiName: estimate.kpi.name,
          value: estimate.value,
          isMtd: estimate.isMtd
        }
      });

      return estimate;
    } catch (error: any) {
      fastify.log.error(error);
      return reply.code(500).send({ message: error.message });
    }
  });
};

export default estimates;
