import fp from 'fastify-plugin';
import fastifyWebsocket from '@fastify/websocket';

export default fp(async (fastify) => {
  fastify.register(fastifyWebsocket);

  fastify.decorate('broadcast', (data: any) => {
    for (const client of fastify.websocketServer.clients) {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    }
  });

  fastify.register(async function (fastify) {
    fastify.get('/ws', { websocket: true }, (connection, req) => {
      fastify.log.info('Client connected via WebSocket');
      
      connection.socket.on('message', (message: any) => {
      });

      connection.socket.on('error', (error: any) => {
        fastify.log.error({ err: error }, 'WebSocket connection error');
      });

      connection.socket.on('close', () => {
        fastify.log.info('Client disconnected from WebSocket');
      });
    });
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    broadcast: (data: any) => void;
  }
}
