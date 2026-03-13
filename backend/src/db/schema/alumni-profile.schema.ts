/* c8 ignore start */
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp, varchar, boolean, integer, decimal } from 'drizzle-orm/pg-core';
import { users } from './auth.schema.ts';

// Alumni Profile Schema
export const alumniProfiles = pgTable('alumni_profiles', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  photoUrl: text('photo_url'), // Stores only the timestamped filename
  bootcampName: varchar('bootcamp_name', { length: 100 }).notNull(),
  bootcampBatch: varchar('bootcamp_batch', { length: 50 }), // Batch/cohort information
  graduationYear: integer('graduation_year').notNull(),
  isPublic: boolean('is_public').notNull().default(false), // Public or private profile
  portfolioUrl: text('portfolio_url'), // GitHub, Behance, portfolio website, etc.
  linkedinUrl: text('linkedin_url'), // LinkedIn profile
  githubUrl: text('github_url'), // GitHub profile
  twitterUrl: text('twitter_url'), // Twitter/X profile
  email: varchar('email', { length: 100 }), // Contact email
  phone: varchar('phone', { length: 20 }), // Contact phone
  currentLocation: varchar('current_location', { length: 100 }), // Current city/country
  headline: varchar('headline', { length: 255 }), // Professional headline
  bio: text('bio'), // Professional bio/summary
  workExperience: text('work_experience'), // Can be extracted from CV or manually entered
  education: text('education'), // Education details
  certifications: text('certifications'), // Professional certifications
  testimonial: text('testimonial'), // Testimonial about Intelligo ID experience
  currentCompany: varchar('current_company', { length: 100 }), // Current employer
  currentRole: varchar('current_role', { length: 100 }), // Current job role
  salary: decimal('salary', { precision: 12, scale: 2 }), // Optional salary information
  employmentStatus: varchar('employment_status', { length: 50 }), // Employed, Freelance, Job Seeking, etc.
  yearsOfExperience: integer('years_of_experience'), // Total years of professional experience
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export type AlumniProfile = InferSelectModel<typeof alumniProfiles>;
export type NewAlumniProfile = InferInsertModel<typeof alumniProfiles>;

// Alumni Skills Schema (extracted from CV analysis)
export const alumniSkills = pgTable('alumni_skills', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  alumniProfileId: uuid('alumni_profile_id')
    .notNull()
    .references(() => alumniProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  skillName: varchar('skill_name', { length: 100 }).notNull(),
  proficiencyLevel: varchar('proficiency_level', { length: 50 }), // Beginner, Intermediate, Advanced, Expert
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AlumniSkill = InferSelectModel<typeof alumniSkills>;
export type NewAlumniSkill = InferInsertModel<typeof alumniSkills>;

// Alumni Education Schema (for detailed education history)
export const alumniEducation = pgTable('alumni_education', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  alumniProfileId: uuid('alumni_profile_id')
    .notNull()
    .references(() => alumniProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  schoolName: varchar('school_name', { length: 100 }).notNull(),
  degree: varchar('degree', { length: 100 }), // Bachelor, Master, etc.
  fieldOfStudy: varchar('field_of_study', { length: 100 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  isCurrent: boolean('is_current').notNull().default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AlumniEducation = InferSelectModel<typeof alumniEducation>;
export type NewAlumniEducation = InferInsertModel<typeof alumniEducation>;

// Alumni Certifications Schema
export const alumniCertifications = pgTable('alumni_certifications', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  alumniProfileId: uuid('alumni_profile_id')
    .notNull()
    .references(() => alumniProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  certificationName: varchar('certification_name', { length: 100 }).notNull(),
  issuingOrganization: varchar('issuing_organization', { length: 100 }).notNull(),
  issueDate: timestamp('issue_date'),
  expiryDate: timestamp('expiry_date'),
  credentialUrl: text('credential_url'),
  credentialId: varchar('credential_id', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AlumniCertification = InferSelectModel<typeof alumniCertifications>;
export type NewAlumniCertification = InferInsertModel<typeof alumniCertifications>;

// Alumni Work Experience Schema
export const alumniWorkExperience = pgTable('alumni_work_experience', {
  id: uuid().primaryKey().notNull().defaultRandom(),
  alumniProfileId: uuid('alumni_profile_id')
    .notNull()
    .references(() => alumniProfiles.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  companyName: varchar('company_name', { length: 100 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  isCurrent: boolean('is_current').notNull().default(false),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type AlumniWorkExperience = InferSelectModel<typeof alumniWorkExperience>;
export type NewAlumniWorkExperience = InferInsertModel<typeof alumniWorkExperience>;