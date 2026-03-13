import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { db } from '../../../../db/index.ts';
import { users } from '../../../../db/schema/auth.schema.ts';
import { eq } from 'drizzle-orm';
import { getAuthInstance } from '../../../../decorators/auth.decorator.ts';
import { UserCreateRequest, UserResponse } from '../../../../types/admin-users.types.ts';

const userAdminCreateRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/add',
    method: 'POST',
    schema: {
      tags: ['Admin'],
      summary: 'Create a new user',
      body: UserCreateRequest,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: UserResponse,
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const { name, email, password, role } = req.body as any;
      
      // Use better-auth to create user
      const auth = getAuthInstance(app);
      const newUser = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
        headers: req.headers as any,
      });
      
      // Update user role if it's not the default
      if (role && role !== 'user') {
        await db.update(users).set({ role }).where(eq(users.id, newUser.user.id));
      }
      
      // Fetch updated user
      const [updatedUser] = await db.select().from(users).where(eq(users.id, newUser.user.id));
      
      return reply.send({
        success: true,
        data: updatedUser,
        message: req.i18n.t('admin.user.userAdded'),
      });
    }),
  });
};

export default userAdminCreateRoute;