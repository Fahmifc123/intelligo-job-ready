import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { getProfileByUserId, addSkill, deleteSkill } from '../../../../services/profile/index.ts';

const alumniSkillsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/skills',
    method: 'POST',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Add a skill to the alumni profile',
      body: Type.Object({
        skillName: Type.String(),
        proficiencyLevel: Type.Optional(Type.String()),
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
      
      // Add the skill to the profile
      const skill = await addSkill({
        alumniProfileId: profile.id,
        skillName: body.skillName,
        proficiencyLevel: body.proficiencyLevel,
      });
      
      return reply.send({
        success: true,
        data: {
          id: skill.id,
        },
        message: req.i18n.t('user.alumniProfile.skillAdded'),
      });
    }),
  });

  app.route({
    url: '/skills/:id',
    method: 'DELETE',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Remove a skill from the alumni profile',
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
      
      await deleteSkill((req.params as any).id);
      
      return reply.send({
        success: true,
        message: req.i18n.t('user.alumniProfile.skillRemoved'),
      });
    }),
  });
};

export default alumniSkillsRoute;