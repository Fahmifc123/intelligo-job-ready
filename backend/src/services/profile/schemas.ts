import { Type } from '@sinclair/typebox';

/**
 * TypeBox schemas for Alumni Profile API validation
 */

// Nested Data Schemas
export const WorkExperienceSchema = Type.Object({
  id: Type.Optional(Type.String({ format: 'uuid' })),
  companyName: Type.String(),
  position: Type.String(),
  startDate: Type.String({ format: 'date-time' }),
  endDate: Type.Optional(Type.String({ format: 'date-time' })),
  isCurrent: Type.Optional(Type.Boolean()),
  description: Type.Optional(Type.String()),
});

export const EducationSchema = Type.Object({
  id: Type.Optional(Type.String({ format: 'uuid' })),
  schoolName: Type.String(),
  degree: Type.Optional(Type.String()),
  fieldOfStudy: Type.Optional(Type.String()),
  startDate: Type.Optional(Type.String({ format: 'date-time' })),
  endDate: Type.Optional(Type.String({ format: 'date-time' })),
  isCurrent: Type.Optional(Type.Boolean()),
  description: Type.Optional(Type.String()),
});

export const CertificationSchema = Type.Object({
  id: Type.Optional(Type.String({ format: 'uuid' })),
  certificationName: Type.String(),
  issuingOrganization: Type.String(),
  issueDate: Type.Optional(Type.String({ format: 'date-time' })),
  expiryDate: Type.Optional(Type.String({ format: 'date-time' })),
  credentialUrl: Type.Optional(Type.String()),
  credentialId: Type.Optional(Type.String()),
});

export const SkillSchema = Type.Object({
  id: Type.Optional(Type.String({ format: 'uuid' })),
  skillName: Type.String(),
  proficiencyLevel: Type.Optional(Type.String()),
});

/**
 * Update Profile Request Schema
 * All fields are optional for partial updates
 */
export const UpdateProfileBodySchema = Type.Object({
  // Basic Information
  fullName: Type.Optional(Type.String()),
  bootcampName: Type.Optional(Type.String()),
  bootcampBatch: Type.Optional(Type.String()),
  graduationYear: Type.Optional(Type.Integer()),

  // Profile Settings
  isPublic: Type.Optional(Type.Boolean()),

  // Social & Web Links
  portfolioUrl: Type.Optional(Type.String()),
  linkedinUrl: Type.Optional(Type.String()),
  githubUrl: Type.Optional(Type.String()),
  twitterUrl: Type.Optional(Type.String()),

  // Contact Details
  email: Type.Optional(Type.String({ format: 'email' })),
  phone: Type.Optional(Type.String()),
  currentLocation: Type.Optional(Type.String()),

  // Professional Info
  headline: Type.Optional(Type.String()),
  bio: Type.Optional(Type.String()),
  currentCompany: Type.Optional(Type.String()),
  currentRole: Type.Optional(Type.String()),
  employmentStatus: Type.Optional(Type.String()),
  salary: Type.Optional(Type.String()),
  yearsOfExperience: Type.Optional(Type.Integer()),

  // Detailed Sections (text format)
  workExperience: Type.Optional(Type.String()),
  education: Type.Optional(Type.String()),
  certifications: Type.Optional(Type.String()),
  testimonial: Type.Optional(Type.String()),

  // Nested Arrays for detailed management
  workExperiences: Type.Optional(Type.Array(WorkExperienceSchema)),
  educationHistory: Type.Optional(Type.Array(EducationSchema)),
  certificationsData: Type.Optional(Type.Array(CertificationSchema)),
  skills: Type.Optional(Type.Array(SkillSchema)),
});

/**
 * Profile Response Schema
 */
export const ProfileResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.String({ format: 'uuid' }),
  fullName: Type.String(),
  photoUrl: Type.Optional(Type.String()),
  bootcampName: Type.String(),
  bootcampBatch: Type.Optional(Type.String()),
  graduationYear: Type.Integer(),
  isPublic: Type.Boolean(),
  portfolioUrl: Type.Optional(Type.String()),
  linkedinUrl: Type.Optional(Type.String()),
  githubUrl: Type.Optional(Type.String()),
  twitterUrl: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  currentLocation: Type.Optional(Type.String()),
  headline: Type.Optional(Type.String()),
  bio: Type.Optional(Type.String()),
  workExperience: Type.Optional(Type.String()),
  education: Type.Optional(Type.String()),
  certifications: Type.Optional(Type.String()),
  testimonial: Type.Optional(Type.String()),
  currentCompany: Type.Optional(Type.String()),
  currentRole: Type.Optional(Type.String()),
  salary: Type.Optional(Type.String()),
  employmentStatus: Type.Optional(Type.String()),
  yearsOfExperience: Type.Optional(Type.Integer()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  workExperiences: Type.Optional(Type.Array(Type.Object({
    id: Type.String({ format: 'uuid' }),
    alumniProfileId: Type.String({ format: 'uuid' }),
    companyName: Type.String(),
    position: Type.String(),
    startDate: Type.String({ format: 'date-time' }),
    endDate: Type.Optional(Type.String({ format: 'date-time' })),
    isCurrent: Type.Boolean(),
    description: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
  }))),
  educationHistory: Type.Optional(Type.Array(Type.Object({
    id: Type.String({ format: 'uuid' }),
    alumniProfileId: Type.String({ format: 'uuid' }),
    schoolName: Type.String(),
    degree: Type.Optional(Type.String()),
    fieldOfStudy: Type.Optional(Type.String()),
    startDate: Type.Optional(Type.String({ format: 'date-time' })),
    endDate: Type.Optional(Type.String({ format: 'date-time' })),
    isCurrent: Type.Boolean(),
    description: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
  }))),
  certificationsData: Type.Optional(Type.Array(Type.Object({
    id: Type.String({ format: 'uuid' }),
    alumniProfileId: Type.String({ format: 'uuid' }),
    certificationName: Type.String(),
    issuingOrganization: Type.String(),
    issueDate: Type.Optional(Type.String({ format: 'date-time' })),
    expiryDate: Type.Optional(Type.String({ format: 'date-time' })),
    credentialUrl: Type.Optional(Type.String()),
    credentialId: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
  }))),
  skills: Type.Optional(Type.Array(Type.Object({
    id: Type.String({ format: 'uuid' }),
    alumniProfileId: Type.String({ format: 'uuid' }),
    skillName: Type.String(),
    proficiencyLevel: Type.Optional(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
  }))),
});

/**
 * Generic API Response Schema
 */
export const ApiResponseSchema = <T extends Record<string, any>>(dataSchema: T) =>
  Type.Object({
    success: Type.Boolean(),
    data: dataSchema as any,
    message: Type.String(),
  });
