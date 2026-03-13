import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { LeaderboardService } from '../../../../services/leaderboard.service.ts';
import type { FastifyRequest, FastifyReply } from 'fastify';

const leaderboardService = new LeaderboardService();

const leaderboardEntriesRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/entries/:categoryId',
    method: 'GET',
    schema: {
      tags: ['Leaderboard'],
      summary: 'Get leaderboard entries for a specific category',
      params: Type.Object({
        categoryId: Type.String({ format: 'uuid' }),
      }),
      querystring: Type.Object({
        limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 50 })),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            category: Type.Object({
              id: Type.String({ format: 'uuid' }),
              name: Type.String(),
            }),
            entries: Type.Array(Type.Object({
              rank: Type.Number(),
              userId: Type.String({ format: 'uuid' }),
              userName: Type.String(),
              totalScore: Type.Number(),
              cvScore: Type.Number(),
            })),
          }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req: FastifyRequest, reply: FastifyReply) => {
      const { categoryId } = req.params as { categoryId: string };
      const { limit = 50 } = req.query as { limit?: number };
      
      // Get category info
      const category = await leaderboardService.getCategoryById(categoryId);
      if (!category || !category.isActive) {
        return reply.notFound(req.i18n.t('user.leaderboard.categoryNotFound'));
      }
      
      // Get leaderboard entries
      const entries = await leaderboardService.getEntriesByCategory(categoryId, limit);
      
      // In a real implementation, you would join with the users table to get user names
      // For now, we'll simulate this data
      const entriesWithUserNames = entries.map((entry, index) => ({
        rank: index + 1,
        userId: entry.userId,
        userName: `User ${entry.userId.substring(0, 8)}`,
        totalScore: entry.totalScore,
        cvScore: entry.cvScore,
      }));
      
      return reply.send({
        success: true,
        data: {
          category: {
            id: category.id,
            name: category.name,
          },
          entries: entriesWithUserNames,
        },
        message: req.i18n.t('user.leaderboard.entriesRetrieved'),
      });
    }),
  });

  app.route({
    url: '/position/:categoryId',
    method: 'GET',
    schema: {
      tags: ['Leaderboard'],
      summary: 'Get current user position in a leaderboard category',
      params: Type.Object({
        categoryId: Type.String({ format: 'uuid' }),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            position: Type.Number(),
            totalScore: Type.Number(),
            cvScore: Type.Number(),
            projectScore: Type.Optional(Type.Number()),
            attendanceScore: Type.Optional(Type.Number()),
            certificationScore: Type.Optional(Type.Number()),
          }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req: FastifyRequest, reply: FastifyReply) => {
      const { categoryId } = req.params as { categoryId: string };
      const userId = (req as any).session.user.id;
      
      // Get user's position in the category
      const position = await leaderboardService.getUserPositionInCategory(userId, categoryId);
      
      if (!position) {
        return reply.notFound('No position found for user in this category');
      }
      
      return reply.send({
        success: true,
        data: {
          position: position.rank,
          totalScore: position.totalScore,
          cvScore: position.cvScore,
          projectScore: position.projectScore || undefined,
          attendanceScore: position.attendanceScore || undefined,
          certificationScore: position.certificationScore || undefined,
        },
        message: req.i18n.t('user.leaderboard.positionRetrieved'),
      });
    }),
  });
};

export default leaderboardEntriesRoute;