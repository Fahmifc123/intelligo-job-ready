import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { db } from '../../../../db/index.ts';
import { users } from '../../../../db/schema/auth.schema.ts';
import { eq } from 'drizzle-orm';
import { UserDeleteRequest } from '../../../../types/admin-users.types.ts';

const userAdminDeleteRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/delete',
    method: 'DELETE',
    schema: {
      tags: ['Admin'],
      summary: 'Delete a user',
      body: UserDeleteRequest,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const { userId } = req.body as any;
      
      // Delete user (this will cascade delete related records)
      await db.delete(users).where(eq(users.id, userId));
      
      return reply.send({
        success: true,
        message: req.i18n.t('admin.user.userDeleted'),
      });
    }),
  });
};

export default userAdminDeleteRoute;