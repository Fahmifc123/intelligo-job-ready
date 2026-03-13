import closeWithGrace from 'close-with-grace';

import { ajvFilePlugin } from '@fastify/multipart';
import { buildApp } from './app.ts';

import env from './config/env.config.ts';
import { startAutoSync } from './services/google-sheets-sync.service.ts';

async function startServer() {
  const app = await buildApp({
    logger: {
      level: env.log.level,
      redact: ['headers.authorization'],
    },
    routerOptions: {
      ignoreDuplicateSlashes: true,
    },
    ajv: {
      // Adds the file plugin to help @fastify/swagger schema generation
      plugins: [ajvFilePlugin],
    },
  });

  closeWithGrace(async ({ signal, err }) => {
    if (err) {
      app.log.error({ err }, 'server closing with error');
    } else {
      app.log.info(`${signal} received, server closing`);
    }
    await app.close();
  });

  // Start auto-sync if Google Sheet ID is configured
  if (env.googleSheets.sheetId) {
    startAutoSync(
      {
        sheetId: env.googleSheets.sheetId,
        sheetName: env.googleSheets.sheetName,
        intervalMinutes: env.googleSheets.syncIntervalMinutes,
      },
      app,
    );
  }

  // Start server
 try {
    await app.listen({ host: env.server.host, port: env.server.port });
    app.log.info(`Server listening on ${env.server.host}:${env.server.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

startServer();
