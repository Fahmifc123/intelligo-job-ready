import { db } from '../db/index.ts';
import { leaderboardCategories, leaderboardEntries } from '../db/schema/leaderboard.schema.ts';
import type { NewLeaderboardCategory, NewLeaderboardEntry } from '../db/schema/leaderboard.schema.ts';
import { eq, desc, and } from 'drizzle-orm';

export class LeaderboardService {
  // Create a new leaderboard category
  async createCategory(data: NewLeaderboardCategory) {
    const [result] = await db.insert(leaderboardCategories).values(data).returning();
    return result;
  }

  // Get all active leaderboard categories
  async getActiveCategories() {
    const results = await db.select().from(leaderboardCategories).where(eq(leaderboardCategories.isActive, true));
    return results;
  }

  // Get leaderboard category by ID
  async getCategoryById(id: string) {
    const [result] = await db.select().from(leaderboardCategories).where(eq(leaderboardCategories.id, id));
    return result;
  }

  // Create a new leaderboard entry
  async createEntry(data: NewLeaderboardEntry) {
    const [result] = await db.insert(leaderboardEntries).values(data).returning();
    return result;
  }

  // Get leaderboard entries by category ID
  async getEntriesByCategory(categoryId: string, limit: number = 100) {
    const results = await db.select().from(leaderboardEntries)
      .where(eq(leaderboardEntries.categoryId, categoryId))
      .orderBy(desc(leaderboardEntries.totalScore))
      .limit(limit);
    return results;
  }

  // Get user's position in a category
  async getUserPositionInCategory(userId: string, categoryId: string) {
    const [result] = await db.select().from(leaderboardEntries)
      .where(and(
        eq(leaderboardEntries.userId, userId),
        eq(leaderboardEntries.categoryId, categoryId)
      ));
    return result;
  }

  // Update leaderboard entry
  async updateEntry(id: string, data: Partial<NewLeaderboardEntry>) {
    const [result] = await db.update(leaderboardEntries).set(data).where(eq(leaderboardEntries.id, id)).returning();
    return result;
  }

  // Delete leaderboard entry
  async deleteEntry(id: string) {
    const result = await db.delete(leaderboardEntries).where(eq(leaderboardEntries.id, id)).returning();
    return result[0];
  }
}