import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { withErrorHandler } from '../../utils/withErrorHandler.ts';
import { db } from '../../db/index.ts';
import { users } from '../../db/schema/index.ts';
import { eq } from 'drizzle-orm';
import { Type } from '@sinclair/typebox';

const getUserInfoRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: 'GET',
    url: '/user-info',
    schema: {
      tags: ['default'],
      summary: 'Get User Info',
      description: 'Return authenticated user info. If role is contractor, include subcontractors.',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          user: Type.Any(),
        }),
        401: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          error: Type.Optional(Type.String()),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const session = req.session.user;

      if (!session) {
        return reply.status(401).send({ 
          success: false,
          message: req.i18n.t('auth.unauthorized'),
        });
      }

      const userId = session.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      if (!user) {
        return reply.status(401).send({ 
          success: false,
          message: req.i18n.t('auth.userNotFoundInDb'),
        });
      }

      // Base user info
      const userInfo: Record<string, any> = { ...user };

      return reply.send({
        success: true,
        message: req.i18n.t('auth.userInfo'),
        data: userInfo,
      });
    }),
  });
};

export default getUserInfoRoute;