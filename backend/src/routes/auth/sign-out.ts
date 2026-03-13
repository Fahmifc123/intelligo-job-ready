import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { sessions } from '../../db/schema/auth.schema.ts';
import {withErrorHandler} from "../../utils/withErrorHandler.ts";
import { Type } from '@sinclair/typebox';

const signOutRoute: FastifyPluginAsyncTypebox = async (app) => {
  // POST /sign-out
  app.route({
    url: '/sign-out',
    method: 'POST',
    schema: {
      tags: ['default'],
      summary: 'Sign out',
      description: 'Clear current user session',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      // Get session token from cookies or headers
      const token = req.cookies.sid || req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        // Delete the session from database
        await db.delete(sessions).where(eq(sessions.token, token));
      }

      // Clear the session cookie
      reply.clearCookie('sid');

      return reply.send({ 
        success: true, 
        message: req.i18n.t('auth.sessionCleared') 
      });
    }),
  });
};
export default signOutRoute;