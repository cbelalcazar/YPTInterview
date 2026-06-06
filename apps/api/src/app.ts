import { FastifyPluginAsync } from 'fastify';
import cors from '@fastify/cors';

process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection:', reason);
});
import multipart from '@fastify/multipart';
import dbPlugin from './plugins/db';
import jwtPlugin from './plugins/jwt';
import websocketPlugin from './plugins/websocket';
import companiesRoute from './routes/companies/index';
import kpisRoute from './routes/companies/kpis';
import kpisRootRoute from './routes/kpis/index';
import estimatesRoute from './routes/estimates/index';
import importRoute from './routes/estimates/import';
import retailersRoute from './routes/retailers/index';
import sectorsRoute from './routes/sectors/index';
import rankingsRoute from './routes/rankings/index';
import authRoute from './routes/auth/index';

export type AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {
  await fastify.register(cors, {
    origin: '*',
    methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
    credentials: true,
  });

  await fastify.register(multipart);
  await fastify.register(dbPlugin);
  await fastify.register(jwtPlugin);
  await fastify.register(websocketPlugin);

  await fastify.register(companiesRoute, { prefix: '/companies' });
  await fastify.register(retailersRoute, { prefix: '/retailers' });
  await fastify.register(sectorsRoute, { prefix: '/sectors' });
  await fastify.register(rankingsRoute, { prefix: '/rankings' });
  await fastify.register(kpisRoute, { prefix: '/companies' });
  await fastify.register(kpisRootRoute, { prefix: '/kpis' });
  await fastify.register(estimatesRoute, { prefix: '/estimates' });
  await fastify.register(importRoute, { prefix: '/estimates' });
  await fastify.register(authRoute, { prefix: '/auth' });
};

export default app;
export { app };
