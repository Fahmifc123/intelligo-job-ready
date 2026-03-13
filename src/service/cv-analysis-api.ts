import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

// Types
export interface CvAnalysis {
  id: string;
  nama: string;
  role: string;
  overallScore: number;
  skorKecocokanRole: number;
  // Removed experienceLevel
  suggestions: string[];
  kekuatanUtama: string[];
  gaps: string[];
  prioritasPerbaikan: string[];
  createdAt: string;
}

export interface CvAnalysisListItem extends CvAnalysis {
  // List items only contain basic information
}

export interface CvAspect {
  name: string;
  score: number;
  feedback: string;
}

export interface CvAnalysisDetail extends CvAnalysis {
  analysisResult?: any;
  suggestions: string[];
  aspects: CvAspect[];
}

interface CvAnalysisListResponse {
  success: boolean;
  data: CvAnalysisListItem[];
  message: string;
}

interface CvAnalysisDetailResponse {
  success: boolean;
  data: CvAnalysisDetail;
  message: string;
}

// Hooks
export const useCvAnalysisUpload = () => {
  const queryClient = useQueryClient();
  
  return useMutation<CvAnalysisDetailResponse, Error, FormData>({
    mutationKey: ['cv-analysis-upload'],
    mutationFn: async (formData) => {
      return await fetchApi({
        method: "POST",
        url: `${AppApi.cvAnalysis.upload}`,
        body: formData,
        // Removed Content-Type header - let fetchApi handle it automatically for FormData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-analysis-list'] });
    },
  });
};

export const useCvAnalysisList = () => {
  return useQuery<CvAnalysisListResponse, Error>({
    queryKey: ['cv-analysis-list'],
    queryFn: async () => {
      return await fetchApi({
        method: "GET",
        url: `${AppApi.cvAnalysis.results}`,
      });
    },
  });
};

export const useCvAnalysisDetail = (id: string) => {
  return useQuery<CvAnalysisDetailResponse, Error>({
    queryKey: ['cv-analysis-detail', id],
    queryFn: async () => {
      return await fetchApi({
        method: "GET",
        url: `${AppApi.cvAnalysis.results}/${id}`,
      });
    },
    enabled: !!id,
  });
};

export const useCvAnalysisDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationKey: ['cv-analysis-delete'],
    mutationFn: async (id) => {
      return await fetchApi({
        method: "DELETE",
        url: `${AppApi.cvAnalysis.delete}/${id}`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cv-analysis-list'] });
    },
  });
};