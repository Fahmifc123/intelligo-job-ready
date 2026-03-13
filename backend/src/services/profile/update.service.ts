import { db } from '../../db/index.ts';
import { alumniProfiles, alumniSkills, alumniWorkExperience, alumniEducation, alumniCertifications } from '../../db/schema/alumni-profile.schema.ts';
import type { NewAlumniProfile, NewAlumniSkill, NewAlumniWorkExperience, NewAlumniEducation, NewAlumniCertification } from '../../db/schema/alumni-profile.schema.ts';
import { eq } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

/**
 * Update alumni profile with nested data (skills, work experience, education, certifications)
 */
export async function updateProfile(id: string, data: Partial<NewAlumniProfile> & { workExperiences?: (NewAlumniWorkExperience & { id?: string })[]; educationHistory?: (NewAlumniEducation & { id?: string })[]; certificationsData?: (NewAlumniCertification & { id?: string })[]; skills?: (NewAlumniSkill & { id?: string })[]; }) { const profileData: Record<string, any> = {}; const workExps = data.workExperiences; const educations = data.educationHistory; const certifications = data.certificationsData; const skills = data.skills; Object.keys(data).forEach(key => { if (!['workExperiences', 'educationHistory', 'certificationsData', 'skills'].includes(key)) profileData[key] = (data as any)[key]; }); const [result] = await db.update(alumniProfiles).set({ ...profileData, updatedAt: new Date() }).where(eq(alumniProfiles.id, id)).returning(); if (workExps && Array.isArray(workExps)) { await db.delete(alumniWorkExperience).where(eq(alumniWorkExperience.alumniProfileId, id)); for (const exp of workExps) { const { id: expId, ...expData } = exp; if (!expId) await db.insert(alumniWorkExperience).values({ ...expData, alumniProfileId: id } as NewAlumniWorkExperience); } } if (educations && Array.isArray(educations)) { await db.delete(alumniEducation).where(eq(alumniEducation.alumniProfileId, id)); for (const edu of educations) { const { id: eduId, ...eduData } = edu; if (!eduId) await db.insert(alumniEducation).values({ ...eduData, alumniProfileId: id } as NewAlumniEducation); } } if (certifications && Array.isArray(certifications)) { await db.delete(alumniCertifications).where(eq(alumniCertifications.alumniProfileId, id)); for (const cert of certifications) { const { id: certId, ...certData } = cert; if (!certId) await db.insert(alumniCertifications).values({ ...certData, alumniProfileId: id } as NewAlumniCertification); } } if (skills && Array.isArray(skills)) { await db.delete(alumniSkills).where(eq(alumniSkills.alumniProfileId, id)); for (const skill of skills) { const { id: skillId, ...skillData } = skill; if (!skillId) await db.insert(alumniSkills).values({ ...skillData, alumniProfileId: id } as NewAlumniSkill); } } return result;
}

/**
 * Save alumni profile photo
 */
export async function saveProfilePhoto(userId: string, fileBuffer: Buffer, originalName: string): Promise<string> {
  const filename = getTimestampFilename(originalName);
  const userFolder = path.resolve(process.cwd(), '../uploads', 'users', userId);
  const thumbnailFolder = path.resolve(userFolder, 'thumbnail');
  
  await fs.mkdir(userFolder, { recursive: true });
  await fs.mkdir(thumbnailFolder, { recursive: true });
  
  const filePath = path.resolve(userFolder, filename);
  
  // Save original image
  await fs.writeFile(filePath, fileBuffer);
  
  // Create thumbnail in JPEG format
  const thumbPath = path.resolve(thumbnailFolder, filename);
  await sharp(fileBuffer)
    .resize(300)
    .jpeg({ quality: 70 })
    .toFile(thumbPath);
  
  return filename;
}

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
function getTimestampFilename(originalName: string): string {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const baseName = sanitizeFilename(originalName.split('.')[0]);
  const ext = '.' + originalName.split('.').pop();
  return `${timestamp}-${baseName}${ext}`;
}