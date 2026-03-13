import { db } from '../../db/index.ts';
import { alumniProfiles, alumniSkills, alumniWorkExperience, alumniEducation, alumniCertifications } from '../../db/schema/alumni-profile.schema.ts';
import type { NewAlumniProfile, NewAlumniSkill, NewAlumniWorkExperience, NewAlumniEducation, NewAlumniCertification } from '../../db/schema/alumni-profile.schema.ts';

/**
 * Generate a timestamped filename with sanitization
 */
function sanitizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get timestamped filename for profile uploads
 */
export function getTimestampFilename(originalName: string): string {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const baseName = sanitizeFilename(originalName.split('.')[0]);
  const ext = '.' + originalName.split('.').pop();
  return `${timestamp}-${baseName}${ext}`;
}

/**
 * Create or update alumni profile
 */
export async function createProfile(userId: string, data: Omit<NewAlumniProfile, 'userId'>) {
  // Create new profile
  const [result] = await db.insert(alumniProfiles)
    .values({ ...data, userId })
    .returning();
  return result;
}

/**
 * Add skill to alumni profile
 */
export async function addSkill(data: NewAlumniSkill) {
  const [result] = await db.insert(alumniSkills).values(data).returning();
  return result;
}

/**
 * Add work experience to alumni profile
 */
export async function addWorkExperience(data: NewAlumniWorkExperience) {
  const [result] = await db.insert(alumniWorkExperience).values(data).returning();
  return result;
}

/**
 * Add education to alumni profile
 */
export async function addEducation(data: NewAlumniEducation) {
  const [result] = await db.insert(alumniEducation).values(data).returning();
  return result;
}

/**
 * Add certification to alumni profile
 */
export async function addCertification(data: NewAlumniCertification) {
  const [result] = await db.insert(alumniCertifications).values(data).returning();
  return result;
}