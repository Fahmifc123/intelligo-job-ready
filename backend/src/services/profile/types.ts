import type { 
    AlumniProfile, 
    AlumniSkill, 
    AlumniWorkExperience,
    AlumniEducation, 
    AlumniCertification 
} from '../../db/schema/alumni-profile.schema.ts';

/**
 * Nested data structures for profile updates
 */
export interface WorkExperienceInput extends Omit<AlumniWorkExperience, 'id' | 'alumniProfileId' | 'createdAt'> {
  id?: string;
}

export interface EducationInput extends Omit<AlumniEducation, 'id' | 'alumniProfileId' | 'createdAt'> {
  id?: string;
}

export interface CertificationInput extends Omit<AlumniCertification, 'id' | 'alumniProfileId' | 'createdAt'> {
  id?: string;
}

export interface SkillInput extends Omit<AlumniSkill, 'id' | 'alumniProfileId' | 'createdAt'> {
  id?: string;
}

/**
 * Profile update request payload
 */
export interface UpdateProfileRequest {
  // Basic Information
  fullName?: string;
  bootcampName?: string;
  bootcampBatch?: string;
  graduationYear?: number;
  
  // Profile Settings
  isPublic?: boolean;
  
  // Social & Web Links
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  
  // Contact Details
  email?: string;
  phone?: string;
  currentLocation?: string;
  
  // Professional Info
  headline?: string;
  bio?: string;
  currentCompany?: string;
  currentRole?: string;
  employmentStatus?: string;
  salary?: string;
  yearsOfExperience?: number;
  
  // Detailed Sections (text format)
  workExperience?: string;
  education?: string;
  certifications?: string;
  testimonial?: string;
  
  // Nested Arrays for detailed management
  workExperiences?: WorkExperienceInput[];
  educationHistory?: EducationInput[];
  certificationsData?: CertificationInput[];
  skills?: SkillInput[];
}

/**
 * Profile response payload
 */
export interface ProfileResponse extends AlumniProfile {
  workExperiences?: AlumniWorkExperience[];
  educationHistory?: AlumniEducation[];
  certificationsData?: AlumniCertification[];
  skills?: AlumniSkill[];
}

/**
 * API Response format
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
