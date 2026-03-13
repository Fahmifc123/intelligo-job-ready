// db/schema/index.ts

import * as authSchema from './auth.schema.ts';
import * as cvAnalysisSchema from './cv-analysis.schema.ts';
import * as leaderboardSchema from './leaderboard.schema.ts';
import * as alumniProfileSchema from './alumni-profile.schema.ts';

// GROUP SCHEMA
export const schema = {
  ...authSchema,
  ...cvAnalysisSchema,
  ...leaderboardSchema,
  ...alumniProfileSchema,
};

// Export individual schemas for easier access
export * from './auth.schema.ts';
export * from './cv-analysis.schema.ts';
export * from './leaderboard.schema.ts';
export * from './alumni-profile.schema.ts';