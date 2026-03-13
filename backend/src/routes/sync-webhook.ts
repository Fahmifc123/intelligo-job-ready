import type { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { withErrorHandler } from '../utils/withErrorHandler.ts';
import { importUsersFromCSV } from '../services/google-sheets-import.service.ts';
import env from '../config/env.config.ts';

const syncWebhookRoute: FastifyPluginAsyncTypebox = async (app) => {
  app.route({
    url: '/sync-webhook',
    method: 'POST',
    schema: {
      tags: ['Admin'],
      summary: 'Webhook receiver for Google Sheets changes',
      body: Type.Object({
        csvContent: Type.String({ description: 'CSV data from Google Sheet' }),
        timestamp: Type.String(),
        token: Type.String({ description: 'Webhook secret token' }),
      }),
      response: {
        200: Type.Object({
          success: Type.Boolean(),
          data: Type.Object({
            success: Type.Number(),
            failed: Type.Number(),
            errors: Type.Array(
              Type.Object({
                email: Type.String(),
                error: Type.String(),
              }),
            ),
          }),
          message: Type.String(),
        }),
      },
    },
    handler: withErrorHandler(async (req, reply) => {
      const { csvContent, token } = req.body as any;

      // Verify webhook token
      if (token !== env.webhook.secretToken) {
        return reply.unauthorized('Invalid webhook token');
      }

      if (!csvContent) {
        return reply.badRequest('csvContent is required');
      }

      const result = await importUsersFromCSV(csvContent, app);

      app.log.info(
        `Sync triggered: ${result.success} added, ${result.failed} failed`,
      );

      return reply.send({
        success: result.failed === 0,
        data: result,
        message: `Synced ${result.success} users, ${result.failed} failed`,
      });
    }),
  });
};

export default syncWebhookRoute;
