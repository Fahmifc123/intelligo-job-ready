import { db } from '../../db/index.ts'
import {
  alumniProfiles,
  alumniSkills,
  alumniWorkExperience,
  alumniEducation,
  alumniCertifications
} from '../../db/schema/alumni-profile.schema.ts'
import { eq } from 'drizzle-orm'
import envConfig from '../../config/env.config.ts'

const BASE_URL = `${envConfig.server.uploadsUrl}/${envConfig.server.uploadsUserDir}`

// Get alumni profile by user ID
export async function getProfileByUserId(userId: string) {
  const [result] = await db.select().from(alumniProfiles).where(eq(alumniProfiles.userId, userId))
  return result
}

// Get public alumni profiles
export async function getPublicProfiles(limit: number = 50) {
  const results = await db.select().from(alumniProfiles)
    .where(eq(alumniProfiles.isPublic, true))
    .limit(limit)
  return results
}

// Get alumni profile by ID
export async function getProfileById(id: string) {
  const [result] = await db.select().from(alumniProfiles).where(eq(alumniProfiles.id, id))
  return result
}

// Get skills by alumni profile ID
export async function getSkillsByProfileId(profileId: string) {
  const results = await db.select().from(alumniSkills).where(eq(alumniSkills.alumniProfileId, profileId))
  return results
}

// Get work experiences by alumni profile ID
export async function getWorkExperiencesByProfileId(profileId: string) {
  const results = await db.select().from(alumniWorkExperience)
    .where(eq(alumniWorkExperience.alumniProfileId, profileId))
    .orderBy(alumniWorkExperience.startDate)
  return results
}

// Get education by alumni profile ID
export async function getEducationByProfileId(profileId: string) {
  const results = await db.select().from(alumniEducation)
    .where(eq(alumniEducation.alumniProfileId, profileId))
    .orderBy(alumniEducation.startDate)
  return results
}

// Get certifications by alumni profile ID
export async function getCertificationsByProfileId(profileId: string) {
  const results = await db.select().from(alumniCertifications)
    .where(eq(alumniCertifications.alumniProfileId, profileId))
    .orderBy(alumniCertifications.issueDate)
  return results
}

export async function getAlumniProfileDetail(userId: string) {
  // Get the main profile
  const [profile] = await db
    .select()
    .from(alumniProfiles)
    .where(eq(alumniProfiles.userId, userId))

  if (!profile) return null

  // Get related data
  const skills = await db
    .select({
      id: alumniSkills.id,
      skillName: alumniSkills.skillName,
      proficiencyLevel: alumniSkills.proficiencyLevel,
    })
    .from(alumniSkills)
    .where(eq(alumniSkills.alumniProfileId, profile.id))

  const workExperiences = await db
    .select({
      id: alumniWorkExperience.id,
      companyName: alumniWorkExperience.companyName,
      position: alumniWorkExperience.position,
      startDate: alumniWorkExperience.startDate,
      endDate: alumniWorkExperience.endDate,
      isCurrent: alumniWorkExperience.isCurrent,
      description: alumniWorkExperience.description,
    })
    .from(alumniWorkExperience)
    .where(eq(alumniWorkExperience.alumniProfileId, profile.id))
    .orderBy(alumniWorkExperience.startDate)

  const educationHistory = await db
    .select({
      id: alumniEducation.id,
      schoolName: alumniEducation.schoolName,
      degree: alumniEducation.degree,
      fieldOfStudy: alumniEducation.fieldOfStudy,
      startDate: alumniEducation.startDate,
      endDate: alumniEducation.endDate,
      isCurrent: alumniEducation.isCurrent,
      description: alumniEducation.description,
    })
    .from(alumniEducation)
    .where(eq(alumniEducation.alumniProfileId, profile.id))
    .orderBy(alumniEducation.startDate)

  const certifications = await db
    .select({
      id: alumniCertifications.id,
      certificationName: alumniCertifications.certificationName,
      issuingOrganization: alumniCertifications.issuingOrganization,
      issueDate: alumniCertifications.issueDate,
      expiryDate: alumniCertifications.expiryDate,
      credentialUrl: alumniCertifications.credentialUrl,
      credentialId: alumniCertifications.credentialId,
    })
    .from(alumniCertifications)
    .where(eq(alumniCertifications.alumniProfileId, profile.id))
    .orderBy(alumniCertifications.issueDate)

  // Process photo URLs
  const photoUrl = profile.photoUrl ?
    (profile.photoUrl.startsWith('http') ? profile.photoUrl : `${BASE_URL}/${userId}/${profile.photoUrl}`) :
    undefined

  const photoThumbnailUrl = profile.photoUrl ?
    (profile.photoUrl.startsWith('http') ?
      profile.photoUrl.replace(/\/[^\/]*$/, `/thumbnail/${profile.photoUrl.split('/').pop()}`) :
      `${BASE_URL}/${userId}/thumbnail/${profile.photoUrl}`) :
    undefined

  return {
    ...profile,
    photoUrl,
    photoThumbnailUrl,
    skills,
    workExperiences,
    educationHistory,
    certifications
  }
}