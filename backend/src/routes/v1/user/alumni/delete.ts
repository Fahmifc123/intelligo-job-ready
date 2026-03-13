import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { getProfileByUserId, deleteProfilePhoto, updateProfile } from '../../../../services/profile/index.ts';

const deleteAlumniProfile: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/profile/photo',
    method: 'DELETE',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Delete alumni profile photo',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const userId = (req as any).session.user.id;
      
      const profile = await getProfileByUserId(userId);
      
      if (!profile?.photoUrl) {
        return reply.notFound('No photo to delete');
      }
      
      // Delete photo files
      await deleteProfilePhoto(userId, profile.photoUrl);
      
      // Update profile to remove photo URL
      await updateProfile(profile.id, {
        photoUrl: null as any,
        updatedAt: new Date(),
      });
      
      return reply.send({
        success: true,
        message: req.i18n.t('user.alumniProfile.photoDeleted'),
      });
    }),
  });
};

export default deleteAlumniProfile;
