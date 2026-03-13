import { type Static, Type } from '@sinclair/typebox';
import envSchema from 'env-schema';

export const LogLevel = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
} as const;

const schema = Type.Object({
  PROTOCOL: Type.String({ default: 'http' }),
  POSTGRES_HOST: Type.String(),
  POSTGRES_USER: Type.String(),
  POSTGRES_PASSWORD: Type.String(),
  POSTGRES_DB: Type.String(),
  POSTGRES_PORT: Type.Number({ default: 5432 }),
  LOG_LEVEL: Type.Enum(LogLevel),
  HOST: Type.String({ default: 'localhost' }),
  PORT: Type.Number({ default: 5000 }),
  COOKIE_PREFIX: Type.String({ default: 'cookie' }),
  BETTER_AUTH_SECRET: Type.String({ default: 'secret' }),
  FRONTEND_URL: Type.String({ default: 'http://localhost:3001' }),
  CV_ANALYSIS_API_URL: Type.String({ default: 'http://202.155.94.147:8001/analyze_cv' }),
  WEBHOOK_SECRET_TOKEN: Type.String({ default: 'webhook-secret-key' }),
  GOOGLE_SHEET_ID: Type.Optional(Type.String()),
  GOOGLE_SHEET_NAME: Type.String({ default: 'Sheet1' }),
  SYNC_INTERVAL_MINUTES: Type.String({ default: '5' }),
});

const env = envSchema<Static<typeof schema>>({
  // dotenv: true, // load .env if it is there, default: false
  dotenv: {
    path: process.env.NODE_ENV === 'development' ? '.env.dev' : '.env'
  },
  schema,
});

export default {
  /* c8 ignore next */
  version: process.env.npm_package_version ?? '0.0.0',
  log: {
    level: env.LOG_LEVEL,
  },
  server: {
    cookiePrefix: env.COOKIE_PREFIX,
    secretKey: env.BETTER_AUTH_SECRET,
    host: env.HOST,
    port: env.PORT,
    frontendUrl: env.FRONTEND_URL,
    uploadsUrl: process.env.NODE_ENV === 'development' ?
      `${env.PROTOCOL}://${env.HOST}:${env.PORT}/uploads` : `${env.PROTOCOL}://${env.FRONTEND_URL}/uploads`,
    uploadsUserDir: 'users',
    trustedOrigins: [
      env.HOST,
      `${env.PROTOCOL}://${env.HOST}:${env.PORT}`,
      `${env.PROTOCOL}://${env.FRONTEND_URL}`,
    ],
  },
  db: {
    url: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}?sslmode=disable`,
  },
  // Export CV Analysis API URL
  cvAnalysis: {
    apiUrl: env.CV_ANALYSIS_API_URL,
  },
  webhook: {
    secretToken: env.WEBHOOK_SECRET_TOKEN,
  },
  googleSheets: {
    sheetId: env.GOOGLE_SHEET_ID,
    sheetName: env.GOOGLE_SHEET_NAME,
    syncIntervalMinutes: parseInt(env.SYNC_INTERVAL_MINUTES),
  },
};