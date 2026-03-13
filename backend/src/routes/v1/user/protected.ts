import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';

const protectedRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/protected',
    method: 'GET',
    schema: {
      tags: ['Protected'],
    },
    handler: async (_req, res) => {
      res.send({ message: 'Protected route for user' });
    },
  });
};

export default protectedRoute;
