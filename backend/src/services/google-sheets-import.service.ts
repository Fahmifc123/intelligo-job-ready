import { parse } from 'csv-parse/sync';
import { db } from '../db/index.ts';
import { users } from '../db/schema/auth.schema.ts';
import { getAuthInstance } from '../decorators/auth.decorator.ts';
import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';

interface ImportRow {
  email: string;
  name: string;
  password: string;
  role?: string;
  certificateId?: string;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    email: string;
    error: string;
  }>;
}

export async function importUsersFromCSV(
  csvContent: string,
  fastify: FastifyInstance,
): Promise<ImportResult> {
  const records: ImportRow[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
  };

  const auth = getAuthInstance(fastify);

  for (const record of records) {
    try {
      // Validate required fields
      if (!record.email || !record.name || !record.password) {
        throw new Error('Missing required fields: email, name, password');
      }

      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, record.email),
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create user via better-auth
      const newUser = await auth.api.signUpEmail({
        body: {
          email: record.email,
          password: record.password,
          name: record.name,
        },
      });

      // Update role and certificateId if specified
      const updateData: any = {};
      if (record.role && record.role !== 'user') {
        updateData.role = record.role as 'admin' | 'user';
      }
      if (record.certificateId) {
        updateData.certificateId = record.certificateId;
      }

      if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.id, newUser.user.id));
      }

      result.success++;
    } catch (error) {
      result.failed++;
      result.errors.push({
        email: record.email || 'Unknown',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
}

export async function importUsersFromGoogleSheetsAPI(
  sheetId: string,
  sheetName: string = 'Sheet1',
  fastify: FastifyInstance,
): Promise<ImportResult> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
    const response = await fetch(url);
    const csvContent = await response.text();
    return importUsersFromCSV(csvContent, fastify);
  } catch (error) {
    throw new Error(
      `Failed to fetch Google Sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
