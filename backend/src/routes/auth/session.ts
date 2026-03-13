import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { getAuthInstance } from "../../decorators/auth.decorator.ts";
import { fromNodeHeaders } from 'better-auth/node';
import { withErrorHandler } from '../../utils/withErrorHandler.ts';
import { Type } from '@sinclair/typebox';

const sessionRoute: FastifyPluginAsyncTypebox = async (app) => {

  // GET /session
  app.route({
    url: '/session',
    method: 'GET',
    schema: {
      tags: ['default'],
      summary: 'Session',
      description: 'Get current user session',
      response: {
        200: Type.Any(),
        401: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          error: Type.Optional(Type.String()),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const session = await getAuthInstance(app).api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session?.user) {
        return reply.status(401).send({ 
          success: false,
          message: req.i18n.t('auth.unauthorized'),
          error: req.i18n.t('auth.unauthorized') 
        });
      }

      return reply.send(session);
    }),
  });
};

export default sessionRoute;