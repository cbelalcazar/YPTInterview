import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post('/login', async function (request: FastifyRequest<{ Body: Record<string, any> }>, reply: FastifyReply) {
    const { username, password } = request.body;

    // Hardcoded credentials for simple auth requirement
    if (username === 'admin' && password === 'admin123') {
      const token = fastify.jwt.sign({ username, role: 'admin' });
      return { token };
    }

    return reply.code(401).send({ message: 'Invalid credentials' });
  });
};

export default auth;
