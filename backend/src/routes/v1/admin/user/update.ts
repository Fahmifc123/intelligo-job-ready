import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { db } from '../../../../db/index.ts';
import { users } from '../../../../db/schema/auth.schema.ts';
import { eq } from 'drizzle-orm';
import { UserUpdateRequest, UserResponse } from '../../../../types/admin-users.types.ts';

const userAdminUpdateRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/update/:id',
    method: 'PUT',
    schema: {
      tags: ['Admin'],
      summary: 'Update user information',
      params: Type.Object({
        id: Type.String({ format: 'uuid' })
      }),
      body: UserUpdateRequest,
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
      const { name, role } = req.body as any;
      
      // Update user
      const updatedFields: any = {};
      if (name) updatedFields.name = name;
      if (role) updatedFields.role = role;
      
      const [updatedUser] = await db.update(users)
        .set(updatedFields)
        .where(eq(users.id, id))
        .returning();
      
      return reply.send({
        success: true,
        data: updatedUser,
        message: req.i18n.t('admin.user.userUpdated'),
      });
    }),
  });
};

export default userAdminUpdateRoute;