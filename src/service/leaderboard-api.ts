import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

// Types
export interface LeaderboardCategory {
  id: string;
  name: string;
  description?: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalScore: number;
  cvScore: number;
}

export interface LeaderboardData {
  category: LeaderboardCategory;
  entries: LeaderboardEntry[];
}

interface LeaderboardCategoriesResponse {
  success: boolean;
  data: LeaderboardCategory[];
  message: string;
}

interface LeaderboardEntriesResponse {
  success: boolean;
  data: LeaderboardData;
  message: string;
}

interface UserPositionResponse {
  success: boolean;
  data: {
    position: number;
    totalScore: number;
    cvScore: number;
    projectScore?: number;
    attendanceScore?: number;
    certificationScore?: number;
  };
  message: string;
}

// Hooks
export const useLeaderboardCategories = () => {
  return useQuery<LeaderboardCategoriesResponse, Error>({
    queryKey: ['leaderboard-categories'],
    queryFn: async () => {
      return await fetchApi({
        method: "GET",
        url: `${AppApi.leaderboard.categories}`,
      });
    },
  });
};

export const useLeaderboardEntries = (categoryId: string, limit: number = 50) => {
  return useQuery<LeaderboardEntriesResponse, Error>({
    queryKey: ['leaderboard-entries', categoryId, limit],
    queryFn: async () => {
      return await fetchApi({
        method: "GET",
        url: `${AppApi.leaderboard.entries}/${categoryId}?limit=${limit}`,
      });
    },
    enabled: !!categoryId,
  });
};

export const useUserPosition = (categoryId: string) => {
  return useQuery<UserPositionResponse, Error>({
    queryKey: ['user-position', categoryId],
    queryFn: async () => {
      return await fetchApi({
        method: "GET",
        url: `${AppApi.leaderboard.position}/${categoryId}`,
      });
    },
    enabled: !!categoryId,
  });
};