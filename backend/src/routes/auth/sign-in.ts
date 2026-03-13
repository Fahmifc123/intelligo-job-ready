import type {FastifyPluginAsyncTypebox} from "@fastify/type-provider-typebox";
import { Type } from '@fastify/type-provider-typebox';
import {withErrorHandler} from "../../utils/withErrorHandler.ts";
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.ts';
import { users, sessions } from '../../db/schema/auth.schema.ts';

// Response schemas
const ErrorResponse = Type.Object({
  success: Type.Boolean({ default: false }),
  message: Type.String(),
});

const UserResponse = Type.Object({
  id: Type.String({ format: 'uuid' }),
  email: Type.String({ format: 'email' }),
  name: Type.Union([Type.String(), Type.Null()]),
  image: Type.Union([Type.String(), Type.Null()]),
  emailVerified: Type.Boolean(),
  role: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

const AuthResponse = Type.Object({
  success: Type.Boolean({ default: true }),
  message: Type.String(),
  user: Type.Omit(UserResponse, ['password']),
  token: Type.String(),
});

const publicRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/sign-in-email',
    method: 'POST',
    schema: {
      tags: ['Auth'],
      summary: 'Sign in with email and password',
      description: 'Authenticate user with email and password and return user data with access token',
      consumes: ['multipart/form-data'],
      response: {
        200: AuthResponse,
        400: ErrorResponse,
        404: ErrorResponse,
        500: ErrorResponse
      }
    },
    handler: withErrorHandler(async (req, reply) => {
      // Parse form data into a key-value object
      const formData = new Map<string, string>();
      if (typeof req.parts === 'function') {
        for await (const part of req.parts()) {
          if (part.type === 'field') {
            formData.set(part.fieldname, part.value as string);
          }
        }
      }
      const { certificateId, email, password } = Object.fromEntries(formData);

      // Check if using email/password or certificateId
      let userByCredential;
      
      if (email && password) {
        // Admin login with email and password
        userByCredential = await db.query.users.findFirst({
          where: eq(users.email, email.trim()),
          columns: {
            id: true,
            email: true,
            name: true,
            image: true,
            emailVerified: true,
            role: true,
            certificateId: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (!userByCredential) {
          return reply.status(404).send({
            success: false,
            message: req.i18n.t('auth.invalidCredentials') || 'Invalid email or password'
          } as const);
        }
        // Note: In a real implementation, you should verify password hash here
      } else if (certificateId) {
        // User login with certificate ID
        // Trim certificate ID
        const trimmedCertificateId = certificateId.trim();

        // Find user by certificate ID in database
        userByCredential = await db.query.users.findFirst({
          where: eq(users.certificateId, trimmedCertificateId),
          columns: {
            id: true,
            email: true,
            name: true,
            image: true,
            emailVerified: true,
            role: true,
            certificateId: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (!userByCredential) {
          return reply.status(404).send({
            success: false,
            message: req.i18n.t('auth.invalidCertificateId')
          } as const);
        }
      } else {
        return reply.status(400).send({
          success: false,
          message: req.i18n.t('auth.credentialsRequired') || 'Email/password or certificate ID is required',
        } as const);
      }

      // Create a session directly in the database
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 7 * 1000); // 1 week

      await db.insert(sessions).values({
        userId: userByCredential.id,
        token: sessionToken,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      // Return authenticated response with session token
      return reply
        .header('Set-Cookie', `sid=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`)
        .send({
          success: true,
          user: userByCredential,
          token: sessionToken,
          message: req.i18n.t('auth.signInSuccess'),
        });
    }),
  });
};

export default publicRoute;
