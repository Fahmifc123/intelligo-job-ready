import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { updateProfile, getProfileByUserId } from '../../../../services/profile/index.ts';
import { UpdateProfileBodySchema, ProfileResponseSchema } from '../../../../services/profile/schemas.ts';
import type { UpdateProfileRequest } from '../../../../services/profile/types.ts';

const alumniProfileRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/profile',
    method: 'PUT',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Update alumni profile information',
      body: UpdateProfileBodySchema,
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: ProfileResponseSchema,
          message: Type.String()
        })
      }
    },
    handler: withErrorHandler(async (req, reply) => {
      const userId = (req as any).session.user.id;
      const body = req.body as UpdateProfileRequest;
      
      // Get existing profile to get profile ID
      const existingProfile = await getProfileByUserId(userId);
      if (!existingProfile) {
        return reply.notFound(req.i18n.t('user.alumniProfile.profileNotFound') + '. Please create a profile first.');
      }
      
      const { workExperiences, educationHistory, certificationsData, skills, ...profileData } = body;
      
      const profile = await updateProfile(existingProfile.id, {
        ...profileData,
        updatedAt: new Date(),
        workExperiences,
        educationHistory,
        certificationsData,
        skills,
      } as any);
      
      return reply.send({
        success: true,
        data: profile,
        message: req.i18n.t('user.alumniProfile.profileUpdated'),
      });
    }),
  });

 
};

export default alumniProfileRoute;
