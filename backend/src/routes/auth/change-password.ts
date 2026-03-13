import { Type, type Static } from '@sinclair/typebox';
import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { getAuthInstance } from '../../decorators/auth.decorator.ts';
import { fromNodeHeaders } from 'better-auth/node';
import { withErrorHandler } from '../../utils/withErrorHandler.ts';

// Define the body schema separately so we can reference it
const ChangePasswordBody = Type.Object({
  CurrentPassword: Type.String({ minLength: 8 }),
  newPassword: Type.String({ minLength: 8 }),
});

// Extract the static type from the schema
type ChangePasswordBodyType = Static<typeof ChangePasswordBody>;

const userChangePasswordRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    method: 'PUT',
    url: '/change-password',
    schema: {
      tags: ['User'],
      summary: 'User change password',
      body: ChangePasswordBody,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        }),
        400: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
          error: Type.Optional(Type.String()),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const body = req.body as ChangePasswordBodyType;
      
      const auth = getAuthInstance(app);

      await auth.api.changePassword({
        headers: fromNodeHeaders(req.headers),
        body: {
          currentPassword: body.CurrentPassword,
          newPassword: body.newPassword,
          revokeOtherSessions: true,
        },
      });

      return reply.send({ 
        success: true, 
        message: req.i18n.t('auth.passwordChanged') 
      });
    }),
  });
};

export default userChangePasswordRoute;