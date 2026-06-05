import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

const kpisRoot: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (_request: FastifyRequest, _reply: FastifyReply) {
    return fastify.db.kPI.findMany();
  });
};

export default kpisRoot;
