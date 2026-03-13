import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { getAlumniProfileDetail } from '../../../../services/profile/index.ts';

const detailAlumniProfile: FastifyPluginAsyncTypebox = async (app) => {
app.route({
    url: '/profile',
    method: 'GET',
    schema: {
      tags: ['Alumni Profile'],
      summary: 'Get current user alumni profile',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Any(),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const userId = (req as any).session.user.id;
      
      const profileDetail = await getAlumniProfileDetail(userId);
      
      if (!profileDetail) {
        return reply.notFound(req.i18n.t('user.alumniProfile.profileNotFound'));
      }
      
      return reply.send({
        success: true,
        data: profileDetail,
        message: req.i18n.t('user.alumniProfile.profileRetrieved'),
      });
    }),
  });
}

export default detailAlumniProfile;

