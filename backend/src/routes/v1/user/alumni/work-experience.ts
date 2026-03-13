import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { getProfileByUserId, addWorkExperience, deleteWorkExperience } from '../../../../services/profile/index.ts';

const alumniWorkExperienceRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/work-experience',
    method: 'POST',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Add work experience to the alumni profile',
      body: Type.Object({
        companyName: Type.String(),
        position: Type.String(),
        startDate: Type.String({ format: 'date-time' }),
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
      
      // Add the work experience to the profile
      const workExp = await addWorkExperience({
        alumniProfileId: profile.id,
        companyName: body.companyName,
        position: body.position,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        isCurrent: body.isCurrent || false,
        description: body.description,
      });
      
      return reply.send({
        success: true,
        data: {
          id: workExp.id,
        },
        message: req.i18n.t('user.alumniProfile.workExperienceAdded') || 'Work experience added successfully',
      });
    }),
  });

  app.route({
    url: '/work-experience/:id',
    method: 'DELETE',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Remove work experience from the alumni profile',
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
      
      // Delete the work experience
      await deleteWorkExperience((req.params as any).id);
      
      return reply.send({
        success: true,
        message: req.i18n.t('user.alumniProfile.workExperienceRemoved') || 'Work experience removed successfully',
      });
    }),
  });
};

export default alumniWorkExperienceRoute;
