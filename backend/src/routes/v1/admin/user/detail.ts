import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { db } from '../../../../db/index.ts';
import { users } from '../../../../db/schema/auth.schema.ts';
import { eq } from 'drizzle-orm';
import { UserResponse } from '../../../../types/admin-users.types.ts';

const userAdminDetailRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/detail/:id',
    method: 'GET',
    schema: {
      tags: ['Admin'],
      summary: 'Get user detail',
      params: Type.Object({
        id: Type.String({ format: 'uuid' })
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: UserResponse,
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const { id } = req.params as any;
      
      // Get user detail
      const [user] = await db.select().from(users).where(eq(users.id, id));
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          message: req.i18n.t('admin.user.userNotFound'),
        });
      }
      
      return reply.send({
        success: true,
        data: user,
        message: req.i18n.t('admin.user.userDetail'),
      });
    }),
  });
};

export default userAdminDetailRoute;