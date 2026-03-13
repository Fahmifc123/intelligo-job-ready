/* c8 ignore start */
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, uuid, integer, timestamp, jsonb, varchar } from 'drizzle-orm/pg-core';
import { users } from './auth.schema.ts';

// CV Analysis Schema
export const cvAnalysis = pgTable('cv_analysis', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  role: varchar('role', { length: 100 }).notNull(),
  overallScore: integer('overall_score').notNull(), // 0-100
  skorKecocokanRole: integer('skor_kecocokan_role').notNull(), // 0-100
  suggestions: jsonb('suggestions').notNull(), // JSON with improvement suggestions
  kekuatanUtama: jsonb('kekuatan_utama').notNull(), // JSON array
  gaps: jsonb('gaps').notNull(), // JSON array
  prioritasPerbaikan: jsonb('prioritas_perbaikan').notNull(), // JSON array
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export type CvAnalysis = InferSelectModel<typeof cvAnalysis>;
export type NewCvAnalysis = InferInsertModel<typeof cvAnalysis>;

// CV Analysis Aspects Schema
export const cvAnalysisAspects = pgTable('cv_analysis_aspects', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  cvAnalysisId: uuid('cv_analysis_id')
    .notNull()
    .references(() => cvAnalysis.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  aspectName: varchar('aspect_name', { length: 100 }).notNull(), // e.g., "Structure", "Experience", "Skills"
  score: integer('score').notNull(), // 0-100
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type CvAnalysisAspect = InferSelectModel<typeof cvAnalysisAspects>;
export type NewCvAnalysisAspect = InferInsertModel<typeof cvAnalysisAspects>;