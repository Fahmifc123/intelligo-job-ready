import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import {getCvAnalysisAspectsByAnalysisId } from '../../../../services/cv-analysis.service.ts';
import { db } from '../../../../db/index.ts';
import { cvAnalysis } from '../../../../db/schema/cv-analysis.schema.ts';
import { users } from '../../../../db/schema/auth.schema.ts';
import { eq, and } from 'drizzle-orm';

const cvAnalysisResultsRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/results',
    method: 'GET',
    schema: {
      tags: ['CV Analysis'],
      summary: 'Get CV analysis results for current user',
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Array(Type.Object({
            id: Type.String({ format: 'uuid' }),
            nama: Type.String(),
            role: Type.String(),
            overallScore: Type.Number(),
            skorKecocokanRole: Type.Number(),
            suggestions: Type.Array(Type.String()),
            kekuatanUtama: Type.Array(Type.String()),
            gaps: Type.Array(Type.String()),
            prioritasPerbaikan: Type.Array(Type.String()),
            aspects: Type.Array(Type.Object({
              name: Type.String(),
              score: Type.Number(),
            })),
            createdAt: Type.String({ format: 'date-time' }),
          })),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const userId = (req as any).session.user.id;
      
      // Get analyses with user names by joining tables
      const results = await db.select({
        cvAnalysis: cvAnalysis,
        userName: users.name
      })
      .from(cvAnalysis)
      .leftJoin(users, eq(cvAnalysis.userId, users.id))
      .where(eq(cvAnalysis.userId, userId))
      .orderBy(cvAnalysis.createdAt);
      
      // Get all aspects for all analyses
      const analysesWithDetails = await Promise.all(results.map(async result => {
        const aspects = await getCvAnalysisAspectsByAnalysisId(result.cvAnalysis.id);
        
        return {
          id: result.cvAnalysis.id,
          nama: result.userName || 'Unknown User',
          role: result.cvAnalysis.role,
          overallScore: result.cvAnalysis.overallScore,
          skorKecocokanRole: result.cvAnalysis.skorKecocokanRole,
          suggestions: result.cvAnalysis.suggestions,
          kekuatanUtama: result.cvAnalysis.kekuatanUtama,
          gaps: result.cvAnalysis.gaps,
          prioritasPerbaikan: result.cvAnalysis.prioritasPerbaikan,
          aspects: aspects.map((aspect: any) => ({
            name: aspect.aspectName,
            score: aspect.score
          })),
          createdAt: result.cvAnalysis.createdAt.toISOString(),
        };
      }));
      
      return reply.send({
        success: true,
        data: analysesWithDetails,
        message: req.i18n.t('user.cvAnalysis.uploadSuccess'),
      });
    }),
  });

  app.route({
    url: '/results/:id',
    method: 'GET',
    schema: {
      tags: ['CV Analysis'],
      summary: 'Get detailed CV analysis result by ID',
      params: Type.Object({
        id: Type.String({ format: 'uuid' }),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            id: Type.String({ format: 'uuid' }),
            nama: Type.String(),
            role: Type.String(),
            overallScore: Type.Number(),
            skorKecocokanRole: Type.Number(),
            suggestions: Type.Array(Type.String()),
            kekuatanUtama: Type.Array(Type.String()),
            gaps: Type.Array(Type.String()),
            prioritasPerbaikan: Type.Array(Type.String()),
            aspects: Type.Array(Type.Object({
              name: Type.String(),
              score: Type.Number(),
            })),
            createdAt: Type.String({ format: 'date-time' }),
          }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const { id } = req.params as { id: string };
      const userId = (req as any).session.user.id;
      
      // Check if the CV analysis belongs to the current user and get user name
      const result = await db.select({
        cvAnalysis: cvAnalysis,
        userName: users.name
      })
      .from(cvAnalysis)
      .leftJoin(users, eq(cvAnalysis.userId, users.id))
      .where(and(eq(cvAnalysis.id, id), eq(cvAnalysis.userId, userId)))
      .limit(1);
      
      if (!result || result.length === 0) {
        return reply.notFound('CV analysis not found');
      }
      
      const cvAnalysisRecord = result[0].cvAnalysis;
      const userName = result[0].userName || 'Unknown User';
      
      // Get aspects for this analysis
      const aspects = await getCvAnalysisAspectsByAnalysisId(id);
      
      return reply.send({
        success: true,
        data: {
          id: cvAnalysisRecord.id,
          nama: userName,
          role: cvAnalysisRecord.role,
          overallScore: cvAnalysisRecord.overallScore,
          skorKecocokanRole: cvAnalysisRecord.skorKecocokanRole,
          suggestions: cvAnalysisRecord.suggestions,
          kekuatanUtama: cvAnalysisRecord.kekuatanUtama,
          gaps: cvAnalysisRecord.gaps,
          prioritasPerbaikan: cvAnalysisRecord.prioritasPerbaikan,
          aspects: aspects.map((aspect: any) => ({
            name: aspect.aspectName,
            score: aspect.score,
          })),
          createdAt: cvAnalysisRecord.createdAt.toISOString(),
        },
        message: req.i18n.t('user.cvAnalysis.uploadSuccess'),
      });

    }),
  });

  app.route({
    url: '/results/:id',
    method: 'DELETE',
    schema: {
      tags: ['CV Analysis'],
      summary: 'Delete CV analysis by ID',
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
      const { id } = req.params as { id: string };
      const userId = (req as any).session.user.id;
      
      // Check if the CV analysis belongs to the current user
      const result = await db.select({ cvAnalysis })
        .from(cvAnalysis)
        .where(and(eq(cvAnalysis.id, id), eq(cvAnalysis.userId, userId)))
        .limit(1);
      
      if (!result || result.length === 0) {
        return reply.notFound('CV analysis not found');
      }
      
      // Delete the CV analysis
      await db.delete(cvAnalysis)
        .where(eq(cvAnalysis.id, id));
      
      return reply.send({
        success: true,
        message: 'CV analysis deleted successfully',
      });
    }),
  });
}
export default cvAnalysisResultsRoute;