import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../../../../utils/withErrorHandler.ts';
import { createCvAnalysisWithFiles } from '../../../../services/cv-analysis.service.ts';
import { db } from '../../../../db/index.ts';
import { getCvAnalysisAspectsByAnalysisId } from '../../../../services/cv-analysis.service.ts';
import { users } from '../../../../db/schema/auth.schema.ts';
import { eq } from 'drizzle-orm';
import { cvAnalysis } from '../../../../db/schema/cv-analysis.schema.ts';

const cvAnalysisUploadRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/upload',
    method: 'POST',
    schema: {
      tags: ['CV Analysis'],
      summary: 'Upload CV for analysis',
      consumes: ['multipart/form-data'],
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
    handler: withErrorHandler(async (req: any, reply) => {
      // Handle multipart form data
      const fileList: Array<{buffer: Buffer, mimetype: string, originalname: string}> = [];
      const rawFields: Record<string, string> = {};

      if (typeof req.parts === 'function') {
        for await (const part of req.parts()) {
          if (part.type === 'file' && part.fieldname === 'cvFile') {
            const buffer = await part.toBuffer();
            fileList.push({
              buffer,
              mimetype: part.mimetype,
              originalname: part.filename,
            });
          } else if (part.type === 'field') {
            if (typeof part.value === 'string') {
              rawFields[part.fieldname] = part.value;
            }
          }
        }
      }

      // Check if file was uploaded
      if (fileList.length === 0) {
        return reply.badRequest(req.i18n.t('user.cvAnalysis.noFileUploaded'));
      }

      // Check if jobRole was provided
      if (!rawFields.jobRole) {
        return reply.badRequest('Job role is required');
      }

      const file = fileList[0];

      // Validate file type (PDF or DOCX)
      const allowedMimeTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return reply.badRequest(req.i18n.t('user.cvAnalysis.invalidFileType'));
      }
      
      // Get user ID and name from session
      const userId = (req as any).session.user.id;
      const userName = (req as any).session.user.name;

      // Create CV analysis with file and save to database including aspects
      const analysisResult = await createCvAnalysisWithFiles({
        userId,
        nama: userName, 
        jobRole: rawFields.jobRole,
        fileName: file.originalname,
        fileBuffer: file.buffer,
        mimeType: file.mimetype
      });

      // Get the full CV analysis record with user name
      const result = await db.select({
        cvAnalysis: cvAnalysis,
        userName: users.name
      })
      .from(cvAnalysis)
      .leftJoin(users, eq(cvAnalysis.userId, users.id))
      .where(eq(cvAnalysis.id, analysisResult.data.id))
      .limit(1);

      const cvAnalysisRecord = analysisResult.data;
      const fullName = result.length > 0 && result[0].userName ? result[0].userName : userName;

      // Get aspects for this analysis
      const aspects = await getCvAnalysisAspectsByAnalysisId(cvAnalysisRecord.id);

      // Return complete analysis result
      return reply.send({
        success: true,
        data: {
          id: cvAnalysisRecord.id,
          nama: fullName,
          role: cvAnalysisRecord.role,
          overallScore: cvAnalysisRecord.overallScore,
          skorKecocokanRole: cvAnalysisRecord.skorKecocokanRole,
          suggestions: cvAnalysisRecord.suggestions as string[],
          kekuatanUtama: cvAnalysisRecord.kekuatanUtama as string[],
          gaps: cvAnalysisRecord.gaps as string[],
          prioritasPerbaikan: cvAnalysisRecord.prioritasPerbaikan as string[],
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
};

export default cvAnalysisUploadRoute;