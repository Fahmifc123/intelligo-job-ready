import { useState, useEffect } from 'react';

export interface AlumniFormData {
  fullName: string;
  photoUrl: string;
  bootcampName: string;
  bootcampBatch: string;
  graduationYear: number;
  currentRole: string;
  currentCompany: string;
  yearsOfExperience: number;
  employmentStatus: string;
  salary: number;
  isPublic: boolean;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  twitterUrl: string;
  email: string;
  phone: string;
  currentLocation: string;
  headline: string;
  bio: string;
  testimonial: string;
}

const DEFAULT_FORM_DATA: AlumniFormData = {
  fullName: '',
  photoUrl: '',
  bootcampName: '',
  bootcampBatch: '',
  graduationYear: new Date().getFullYear(),
  currentRole: '',
  currentCompany: '',
  yearsOfExperience: 0,
  employmentStatus: '',
  salary: 0,
  isPublic: false,
  portfolioUrl: '',
  linkedinUrl: '',
  githubUrl: '',
  twitterUrl: '',
  email: '',
  phone: '',
  currentLocation: '',
  headline: '',
  bio: '',
  testimonial: '',
};

export const useAlumniProfileForm = (profile: any) => {
  const [formData, setFormData] = useState<AlumniFormData>(DEFAULT_FORM_DATA);
  const [tempPhotoThumbnailUrl, setTempPhotoThumbnailUrl] = useState<string | null>(null);

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile?.data) {
      setFormData({
        fullName: profile.data.fullName,
        photoUrl: profile.data.photoUrl || '',
        bootcampName: profile.data.bootcampName,
        bootcampBatch: profile.data.bootcampBatch || '',
        graduationYear: profile.data.graduationYear,
        currentRole: profile.data.currentRole || '',
        currentCompany: profile.data.currentCompany || '',
        yearsOfExperience: profile.data.yearsOfExperience || 0,
        employmentStatus: profile.data.employmentStatus || '',
        salary: profile.data.salary || 0,
        isPublic: profile.data.isPublic,
        portfolioUrl: profile.data.portfolioUrl || '',
        linkedinUrl: profile.data.linkedinUrl || '',
        githubUrl: profile.data.githubUrl || '',
        twitterUrl: profile.data.twitterUrl || '',
        email: profile.data.email || '',
        phone: profile.data.phone || '',
        currentLocation: profile.data.currentLocation || '',
        headline: profile.data.headline || '',
        bio: profile.data.bio || '',
        testimonial: profile.data.testimonial || '',
      });

      if (profile.data.photoThumbnailUrl) {
        setTempPhotoThumbnailUrl(profile.data.photoThumbnailUrl);
      }
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    setFormData(prev => ({
      ...prev,
      [name]: ['yearsOfExperience', 'salary', 'graduationYear'].includes(name) ? Number(value) : value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isPublic: checked,
    }));
  };

  const calculateProfileStrength = () => {
    if (!profile?.data) return 0;

    const fields = [
      profile.data.fullName,
      profile.data.headline,
      profile.data.bio,
      profile.data.email,
      profile.data.phone,
      profile.data.currentLocation,
      profile.data.currentRole,
      profile.data.currentCompany,
      profile.data.yearsOfExperience,
      profile.data.employmentStatus,
      profile.data.salary,
      profile.data.portfolioUrl,
      profile.data.linkedinUrl,
      profile.data.githubUrl,
      profile.data.twitterUrl,
      profile.data.bootcampName,
      profile.data.bootcampBatch,
      profile.data.graduationYear,
      profile.data.workExperience,
      profile.data.education,
      profile.data.certifications,
      profile.data.testimonial,
      profile.data.photoUrl,
      profile.data.skills?.length,
      profile.data.workExperiences?.length,
      profile.data.educationHistory?.length,
      profile.data.certificationsData?.length,
    ];

    const filledFields = fields.filter(field => field && field !== 0).length;
    const percentage = Math.round((filledFields / fields.length) * 100);
    return percentage;
  };

  return {
    formData,
    setFormData,
    tempPhotoThumbnailUrl,
    setTempPhotoThumbnailUrl,
    handleInputChange,
    handleSwitchChange,
    calculateProfileStrength,
  };
};
