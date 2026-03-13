import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { getProfileByUserId, addEducation, deleteEducation } from '../../../../services/profile/index.ts';

const alumniEducationRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/education',
    method: 'POST',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Add education to the alumni profile',
      body: Type.Object({
        schoolName: Type.String(),
        degree: Type.Optional(Type.String()),
        fieldOfStudy: Type.Optional(Type.String()),
        startDate: Type.Optional(Type.String({ format: 'date-time' })),
        endDate: Type.Optional(Type.String({ format: 'date-time' })),
        isCurrent: Type.Optional(Type.Boolean()),
        description: Type.Optional(Type.String()),
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
      
      // Add the education to the profile
      const education = await addEducation({
        alumniProfileId: profile.id,
        schoolName: body.schoolName,
        degree: body.degree,
        fieldOfStudy: body.fieldOfStudy,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        isCurrent: body.isCurrent || false,
        description: body.description,
      });
      
      return reply.send({
        success: true,
        data: {
          id: education.id,
        },
        message: req.i18n.t('user.alumniProfile.educationAdded'),
      });
    }),
  });

  app.route({
    url: '/education/:id',
    method: 'DELETE',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Remove education from the alumni profile',
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
      
      // Delete the education
      await deleteEducation((req.params as any).id);
      
      return reply.send({
        success: true,
        message: req.i18n.t('user.alumniProfile.educationRemoved'),
      });
    }),
  });
};

export default alumniEducationRoute;
