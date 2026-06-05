import fp from 'fastify-plugin';
import { PrismaClient } from '@repo/db';

declare module 'fastify' {
  interface FastifyInstance {
    db: PrismaClient;
  }
}

export default fp(async (fastify) => {
  const prisma = new PrismaClient();

  await prisma.$connect();

  fastify.decorate('db', prisma);

  fastify.addHook('onClose', async (fastify) => {
    await fastify.db.$disconnect();
  });
});
