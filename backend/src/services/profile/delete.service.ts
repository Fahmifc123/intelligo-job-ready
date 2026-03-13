import { db } from '../../db/index.ts';
import { alumniProfiles, alumniSkills, alumniWorkExperience, alumniEducation, alumniCertifications } from '../../db/schema/alumni-profile.schema.ts';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

/**
 * Delete alumni profile
 */
export async function deleteProfile(id: string) {
  const result = await db.delete(alumniProfiles).where(eq(alumniProfiles.id, id)).returning();
  return result[0];
}

/**
 * Delete skill
 */
export async function deleteSkill(skillId: string) {
  const result = await db.delete(alumniSkills)
    .where(eq(alumniSkills.id, skillId))
    .returning();
  return result[0];
}

/**
 * Delete work experience
 */
export async function deleteWorkExperience(workExpId: string) {
  const result = await db.delete(alumniWorkExperience)
    .where(eq(alumniWorkExperience.id, workExpId))
    .returning();
  return result[0];
}

/**
 * Delete education
 */
export async function deleteEducation(educationId: string) {
  const result = await db.delete(alumniEducation)
    .where(eq(alumniEducation.id, educationId))
    .returning();
  return result[0];
}

/**
 * Delete certification
 */
export async function deleteCertification(certificationId: string) {
  const result = await db.delete(alumniCertifications)
    .where(eq(alumniCertifications.id, certificationId))
    .returning();
  return result[0];
}

/**
 * Delete alumni profile photo
 */
export async function deleteProfilePhoto(userId: string, photoUrl: string): Promise<void> {
  try {
    const userFolder = path.resolve(process.cwd(), '../uploads', 'users', userId);
    const filePath = path.resolve(userFolder, photoUrl);
    const thumbPath = path.resolve(userFolder, 'thumbnail', photoUrl);
    
    await fs.unlink(filePath).catch(() => {}); // Ignore if file doesn't exist
    await fs.unlink(thumbPath).catch(() => {});
  } catch (error) {
    console.error('Error deleting profile photo:', error);
  }
}