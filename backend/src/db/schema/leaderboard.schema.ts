/* c8 ignore start */
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, uuid, integer, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { users } from './auth.schema.ts';
import { cvAnalysis } from './cv-analysis.schema.ts';

// Leaderboard Categories Schema
export const leaderboardCategories = pgTable('leaderboard_categories', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(), // e.g., "Data Science", "Machine Learning", "AI for Business"
  description: varchar('description', { length: 255 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export type LeaderboardCategory = InferSelectModel<typeof leaderboardCategories>;
export type NewLeaderboardCategory = InferInsertModel<typeof leaderboardCategories>;

// Leaderboard Entries Schema
export const leaderboardEntries = pgTable('leaderboard_entries', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  categoryId: uuid('category_id')
    .notNull()
    .references(() => leaderboardCategories.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  cvAnalysisId: uuid('cv_analysis_id')
    .notNull()
    .references(() => cvAnalysis.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  totalScore: integer('total_score').notNull(), // Combined score from CV analysis and other factors
  cvScore: integer('cv_score').notNull(), // Score from CV analysis
  projectScore: integer('project_score'), // Score from bootcamp projects
  attendanceScore: integer('attendance_score'), // Attendance/participation score
  certificationScore: integer('certification_score'), // Certification score
  rank: integer('rank').notNull(), // Position in leaderboard
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export type LeaderboardEntry = InferSelectModel<typeof leaderboardEntries>;
export type NewLeaderboardEntry = InferInsertModel<typeof leaderboardEntries>;