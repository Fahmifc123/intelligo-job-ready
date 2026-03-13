import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { LeaderboardService } from '../../../../services/leaderboard.service.ts';
import type { FastifyRequest, FastifyReply } from 'fastify';

const leaderboardService = new LeaderboardService();

const leaderboardCategoriesRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/categories',
    method: 'GET',
    schema: {
      tags: ['Leaderboard'],
      summary: 'Get all active leaderboard categories',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Array(Type.Object({
            id: Type.String({ format: 'uuid' }),
            name: Type.String(),
            description: Type.Optional(Type.String()),
          })),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req: FastifyRequest, reply: FastifyReply) => {
      const categories = await leaderboardService.getActiveCategories();
      
      return reply.send({
        success: true,
        data: categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || undefined,
        })),
        message: req.i18n.t('user.leaderboard.categoriesRetrieved'),
      });
    }),
  });
};

export default leaderboardCategoriesRoute;