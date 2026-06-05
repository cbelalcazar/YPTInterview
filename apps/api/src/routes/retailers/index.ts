import { FastifyPluginAsync } from 'fastify';

const retailers: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const retailers = await fastify.db.retailer.findMany({
      orderBy: { name: 'asc' }
    });
    return retailers;
  });
};

export default retailers;
