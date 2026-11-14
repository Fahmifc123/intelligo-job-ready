export interface CvPersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  portfolioUrl: string;
  summary: string;
}

export interface CvExperience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface CvEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface CvCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface CvData {
  personal: CvPersonalInfo;
  experiences: CvExperience[];
  education: CvEducation[];
  skills: string[];
  certifications: CvCertification[];
}

export const emptyCvData: CvData = {
  personal: {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    portfolioUrl: "",
    summary: "",
  },
  experiences: [],
  education: [],
  skills: [],
  certifications: [],
};

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyExperience(): CvExperience {
  return {
    id: newId(),
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [""],
  };
}

export function createEmptyEducation(): CvEducation {
  return {
    id: newId(),
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
  };
}

export function createEmptyCertification(): CvCertification {
  return {
    id: newId(),
    name: "",
    issuer: "",
    date: "",
  };
}
