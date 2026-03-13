import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance } from 'fastify';
import { getAuthInstance } from '../../../decorators/auth.decorator.ts';
import { db } from '../../../db/index.ts';
import { sessions, users } from '../../../db/schema/auth.schema.ts';
import { eq } from 'drizzle-orm';

async function adminHook(fastify: FastifyInstance) {
  fastify.decorateRequest('session');

  fastify.addHook('preHandler', async (req, res) => {
    // First try better-auth session
    let session = await getAuthInstance(fastify).api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // If better-auth session not found, check for direct database session
    if (!session?.user) {
      const token = req.cookies.sid || req.headers.authorization?.replace('Bearer ', '');
      
      if (token) {
        const dbSession = await db.query.sessions.findFirst({
          where: eq(sessions.token, token),
        });

        if (dbSession && dbSession.expiresAt > new Date()) {
          // Session is valid, fetch user data
          const user = await db.query.users.findFirst({
            where: eq(users.id, dbSession.userId),
          });

          if (user) {
            session = {
              session: dbSession,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                banned: user.banned,
                role: user.role,
              },
            };
          }
        }
      }
    }

    if (!session?.user) {
      return res.unauthorized('You must be logged in to access this resource.');
    }

    if(session?.user?.role !== 'admin') {
      return res.forbidden('You do not have permission to access this resource.');
    }

    req.setDecorator('session', session);
  });
}

export default adminHook;
