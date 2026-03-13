import { importUsersFromGoogleSheetsAPI } from './google-sheets-import.service.ts';
import type { FastifyInstance } from 'fastify';

let syncInterval: NodeJS.Timeout | null = null;

export interface SyncConfig {
  sheetId: string;
  sheetName?: string;
  intervalMinutes?: number;
}

export function startAutoSync(
  config: SyncConfig,
  fastify: FastifyInstance,
): void {
  const intervalMs = (config.intervalMinutes || 5) * 60 * 1000;

  syncInterval = setInterval(async () => {
    try {
      fastify.log.info(`Starting auto-sync for sheet: ${config.sheetId}`);
      const result = await importUsersFromGoogleSheetsAPI(
        config.sheetId,
        config.sheetName || 'Sheet1',
        fastify,
      );

      fastify.log.info(
        `Auto-sync completed: ${result.success} added, ${result.failed} failed`,
      );

      if (result.errors.length > 0) {
        fastify.log.warn({ errors: result.errors }, 'Sync errors');
      }
    } catch (error) {
      fastify.log.error({ error }, 'Auto-sync failed');
    }
  }, intervalMs);

  fastify.log.info(
    `Auto-sync started. Will sync every ${config.intervalMinutes || 5} minutes`,
  );
}

export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
