import fp from 'fastify-plugin';
import { PrismaClient } from '@repo/db';

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient;
  }
}

export default fp(async (fastify) => {
  fastify.log.info('Prisma: Initializing client...');
  const prisma = new PrismaClient();

  try {
    fastify.log.info('Prisma: Attempting to connect...');
    await prisma.$connect();
    fastify.log.info('Prisma: Connected successfully');
  } catch (err) {
    fastify.log.error({ err }, 'Prisma: Connection failed');
    throw err;
  }

  fastify.decorate('db', prisma);

  fastify.addHook('onClose', async (fastifyInstance) => {
    fastify.log.info('Prisma: Disconnecting...');
    await fastifyInstance.db.$disconnect();
  });
});
