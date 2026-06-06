import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

const companies: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (_request: FastifyRequest, _reply: FastifyReply) {
    fastify.log.info('Route: GET /companies - Starting DB query');
    try {
      const result = await fastify.db.company.findMany({
        include: {
          _count: {
            select: { estimates: true }
          }
        }
      });
      fastify.log.info({ count: result.length }, 'Route: GET /companies - Query successful');
      return result;
    } catch (err) {
      fastify.log.error({ err }, 'Route: GET /companies - DB Query failed');
      throw err;
    }
  });

  fastify.get('/:id', async function (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    const company = await fastify.db.company.findUnique({
      where: { id },
      include: {
        estimates: {
          orderBy: { period: 'desc' },
          take: 50
        }
      }
    });

    if (!company) {
      return reply.code(404).send({ message: 'Company not found' });
    }

    return company;
  });
};

export default companies;
