import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { getProfileByUserId } from '../../../../services/profile/detail.service.ts';
import { saveProfilePhoto } from '../../../../services/profile/update.service.ts';
import { ProfileResponseSchema } from '../../../../services/profile/schemas.ts';
import { db } from '../../../../db/index.ts';
import { alumniProfiles } from '../../../../db/schema/alumni-profile.schema.ts';
import { eq } from 'drizzle-orm';
import envConfig from '../../../../config/env.config.ts';

const updatePhotoRoute: FastifyPluginAsyncTypebox = async (app) => { 
  app.route({ 
    url: '/photo', 
    method: 'PUT', 
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Update alumni profile photo',
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: ProfileResponseSchema,
            message: { type: 'string' }
          }
        }
      }
    },
    handler: withErrorHandler(async (req, reply) => {
      const userId = (req as any).session.user.id;
      
      // Get existing profile
      const existingProfile = await getProfileByUserId(userId);
      if (!existingProfile) {
        return reply.notFound(req.i18n.t('user.alumniProfile.profileNotFound') + '. Please create a profile first.');
      }
      
      // Handle multipart file upload
      const fileList: Array<{ buffer: Buffer; originalname: string }> = [];
      
      if (typeof req.parts === 'function') {
        for await (const part of req.parts()) {
          if (part.type === 'file' && part.fieldname === 'photo') {
            const buffer = await part.toBuffer();
            fileList.push({
              buffer,
              originalname: part.filename,
            });
          }
        }
      }
      
      if (fileList.length === 0) {
        return reply.badRequest(req.i18n.t('user.alumniProfile.noFileUploaded') || 'No photo file uploaded');
      }
      
      // Save the photo file
      const { buffer, originalname } = fileList[0];
      const filename = await saveProfilePhoto(userId, buffer, originalname);
      
      // Construct photo URL
      const photoUrl = `${envConfig.server.uploadsUrl}/${envConfig.server.uploadsUserDir}/${userId}/${filename}`;
      
      // Update profile with new photo URL
      const [result] = await db.update(alumniProfiles)
        .set({ photoUrl, updatedAt: new Date() })
        .where(eq(alumniProfiles.id, existingProfile.id))
        .returning();
      
      return reply.send({ success: true, data: result, message: req.i18n.t('user.alumniProfile.profileUpdated') || 'Profile photo updated successfully' });
    })
  });
};

export default updatePhotoRoute;
