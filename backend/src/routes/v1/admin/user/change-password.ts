import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { db } from '../../../../db/index.ts';
import { accounts } from '../../../../db/schema/auth.schema.ts';
import { eq } from 'drizzle-orm';
import { getAuthInstance } from '../../../../decorators/auth.decorator.ts';
import { ChangePasswordRequest } from '../../../../types/admin-users.types.ts';

const userAdminChangePasswordRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/change-password',
    method: 'PUT',
    schema: {
      tags: ['Admin'],
      summary: 'Change user password',
      body: ChangePasswordRequest,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const { userId, newPassword } = req.body as any;
      
      // For admin password change, we need to:
      // 1. Get the user's current password hash from the database
      // 2. Update it with the new password
      const auth = getAuthInstance(app);
      const context = await auth.$context;
      
      // Hash the new password
      const hashedPassword = await context.password.hash(newPassword);
      
      // Update the user's password in the accounts table
      await db.update(accounts).set({ 
        password: hashedPassword,
        updatedAt: new Date()
      }).where(eq(accounts.userId, userId));
      
      return reply.send({
        success: true,
        message: req.i18n.t('admin.user.passwordUpdated'),
      });
    }),
  });
};

export default userAdminChangePasswordRoute;