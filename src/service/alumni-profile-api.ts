import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

// Types
export interface AlumniSkill {
  id: string;
  skillName: string;
  proficiencyLevel?: string;
}

export interface AlumniWorkExperience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface AlumniProfile {
  id: string;
  fullName: string;
  photoUrl?: string;
  photoThumbnailUrl?: string;
  bootcampName: string;
  bootcampBatch?: string;
  graduationYear: number;
  isPublic: boolean;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  email?: string;
  phone?: string;
  currentLocation?: string;
  headline?: string;
  bio?: string;
  workExperience?: string;
  education?: string;
  certifications?: string;
  testimonial?: string;
  currentCompany?: string;
  currentRole?: string;
  salary?: number;
  employmentStatus?: string;
  yearsOfExperience?: number;
  skills: AlumniSkill[];
  workExperiences: AlumniWorkExperience[];
  educationHistory?: AlumniEducation[];
  certificationsData?: AlumniCertification[];
}

export interface AlumniEducation {
  id: string;
  schoolName: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
}

export interface AlumniCertification {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
  credentialId?: string;
}

interface AlumniProfileResponse {
  success: boolean;
  data: AlumniProfile;
  message: string;
}

interface AlumniProfileSaveResponse {
  success: boolean;
  data: {
    id: string;
  };
  message: string;
}

interface AlumniSkillResponse {
  success: boolean;
  data: {
    id: string;
  };
  message: string;
}

// Hooks
export const useAlumniProfile = () => {
  return useQuery<AlumniProfileResponse, Error>({
    queryKey: ['alumni-profile'],
    queryFn: async () => {
      return await fetchApi({
        method: "GET",
        url: `${AppApi.alumniProfile.profile}`,
      });
    },
  });
};

export const useSaveAlumniProfile = () => { const queryClient = useQueryClient(); return useMutation<AlumniProfileSaveResponse, Error, Partial<AlumniProfile>>({ mutationKey: ['save-alumni-profile'], mutationFn: async (profileData) => { return await fetchApi({ method: "PUT", url: `${AppApi.alumniProfile.profile}`, body: profileData }); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alumni-profile'] }); }, }); };

export const useAddAlumniSkill = () => {
  const queryClient = useQueryClient();
  
  return useMutation<AlumniSkillResponse, Error, { skillName: string; proficiencyLevel?: string }>({
    mutationKey: ['add-alumni-skill'],
    mutationFn: async (skillData) => {
      return await fetchApi({
        method: "POST",
        url: `${AppApi.alumniProfile.skills}`,
        body: skillData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};

export const useRemoveAlumniSkill = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, Error, { id: string }>({
    mutationKey: ['remove-alumni-skill'],
    mutationFn: async ({ id }) => {
      return await fetchApi({
        method: "DELETE",
        url: `${AppApi.alumniProfile.skills}/${id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};

export const useUploadAlumniProfilePhoto = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    { success: boolean; data: { photoUrl: string; photoThumbnailUrl: string }; message: string },
    Error,
    FormData
  >({
    mutationKey: ['upload-alumni-photo'],
    mutationFn: async (formData) => {
      return await fetchApi({
        method: "POST",
        url: `${AppApi.alumniProfile.profile}/photo`,
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};

export const useDeleteAlumniProfilePhoto = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    { success: boolean; message: string },
    Error,
    undefined
  >({
    mutationKey: ['delete-alumni-photo'],
    mutationFn: async () => {
      return await fetchApi({
        method: "DELETE",
        url: `${AppApi.alumniProfile.profile}/photo`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};

export const useAddAlumniWorkExperience = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    { success: boolean; data: { id: string }; message: string },
    Error,
    { companyName: string; position: string; startDate: string; endDate?: string; isCurrent?: boolean; description?: string }
  >({
    mutationKey: ['add-alumni-work-experience'],
    mutationFn: async (workData) => {
      return await fetchApi({
        method: "POST",
        url: `${AppApi.alumniProfile.profile}/work-experience`,
        body: workData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};

export const useRemoveAlumniWorkExperience = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, Error, { id: string }>({
    mutationKey: ['remove-alumni-work-experience'],
    mutationFn: async ({ id }) => {
      return await fetchApi({
        method: "DELETE",
        url: `${AppApi.alumniProfile.profile}/work-experience/${id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};

export const useAddAlumniEducation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    { success: boolean; data: { id: string }; message: string },
    Error,
    { schoolName: string; degree?: string; fieldOfStudy?: string; startDate?: string; endDate?: string; isCurrent?: boolean; description?: string }
  >({
    mutationKey: ['add-alumni-education'],
    mutationFn: async (educationData) => {
      return await fetchApi({
        method: "POST",
        url: `${AppApi.alumniProfile.profile}/education`,
        body: educationData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};

export const useRemoveAlumniEducation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, Error, { id: string }>({
    mutationKey: ['remove-alumni-education'],
    mutationFn: async ({ id }) => {
      return await fetchApi({
        method: "DELETE",
        url: `${AppApi.alumniProfile.profile}/education/${id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};

export const useAddAlumniCertification = () => {
  const queryClient = useQueryClient();
  
  return useMutation<
    { success: boolean; data: { id: string }; message: string },
    Error,
    { certificationName: string; issuingOrganization: string; issueDate?: string; expiryDate?: string; credentialUrl?: string; credentialId?: string }
  >({
    mutationKey: ['add-alumni-certification'],
    mutationFn: async (certificationData) => {
      return await fetchApi({
        method: "POST",
        url: `${AppApi.alumniProfile.certifications}`,
        body: certificationData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};

export const useRemoveAlumniCertification = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, Error, { id: string }>({
    mutationKey: ['remove-alumni-certification'],
    mutationFn: async ({ id }) => {
      return await fetchApi({
        method: "DELETE",
        url: `${AppApi.alumniProfile.certifications}/${id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alumni-profile'] });
    },
  });
};