import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { getProfileByUserId, addCertification, deleteCertification } from '../../../../services/profile/index.ts';

const alumniCertificationsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/certifications',
    method: 'POST',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Add certification to the alumni profile',
      body: Type.Object({
        certificationName: Type.String(),
        issuingOrganization: Type.String(),
        issueDate: Type.Optional(Type.String({ format: 'date-time' })),
        expiryDate: Type.Optional(Type.String({ format: 'date-time' })),
        credentialUrl: Type.Optional(Type.String()),
        credentialId: Type.Optional(Type.String()),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            id: Type.String({ format: 'uuid' }),
          }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const userId = (req as any).session.user.id;
      const body = req.body as any;
      
      // First get the user's profile
      const profile = await getProfileByUserId(userId);
      
      if (!profile) {
        return reply.notFound(req.i18n.t('user.alumniProfile.profileNotFound') + '. Please create a profile first.');
      }
      
      // Add the certification to the profile
      const certification = await addCertification({
        alumniProfileId: profile.id,
        certificationName: body.certificationName,
        issuingOrganization: body.issuingOrganization,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        credentialUrl: body.credentialUrl,
        credentialId: body.credentialId,
      });
      
      return reply.send({
        success: true,
        data: {
          id: certification.id,
        },
        message: req.i18n.t('user.alumniProfile.certificationAdded'),
      });
    }),
  });

  app.route({
    url: '/certifications/:id',
    method: 'DELETE',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Remove certification from the alumni profile',
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const userId = (req as any).session.user.id;
      
      // First get the user's profile to verify ownership
      const profile = await getProfileByUserId(userId);
      
      if (!profile) {
        return reply.notFound(req.i18n.t('user.alumniProfile.profileNotFound'));
      }
      
      // Delete the certification
      await deleteCertification((req.params as any).id);
      
      return reply.send({
        success: true,
        message: req.i18n.t('user.alumniProfile.certificationRemoved'),
      });
    }),
  });
};

export default alumniCertificationsRoute;
