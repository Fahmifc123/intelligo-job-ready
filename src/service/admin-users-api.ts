import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetch-api";
import { AppApi } from "@/constants/app-api";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserListResponse {
  success: boolean;
  data: User[];
  message: string;
  pagination?: {
    page: number;
    view: number;
    total: number;
    totalPages: number;
  };
}

// Add interface for pagination parameters
interface UserListParams {
  page?: number;
  view?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  role?: string;
}

interface UserResponse {
  success: boolean;
  data: User;
  message: string;
}

interface UserCreateRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface UserUpdateRequest {
  name?: string;
  role?: string;
}

interface UserDeleteRequest {
  userId: string;
}

interface ChangePasswordRequest {
  userId: string;
  newPassword: string;
}

// Hooks
export const useAdminUserList = (params?: UserListParams) => {
  return useQuery<UserListResponse, Error>({
    queryKey: ['admin-user-list', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.view) searchParams.append('view', params.view.toString());
      if (params?.sort) searchParams.append('sort', params.sort);
      if (params?.order) searchParams.append('order', params.order);
      if (params?.search) searchParams.append('search', params.search);
      if (params?.role) searchParams.append('role', params.role);
      
      const url = `${AppApi.admin.user.list}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      
      return await fetchApi({
        method: "GET",
        url,
      });
    },
  });
};

export const useAdminUserCreate = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UserResponse, Error, { body: UserCreateRequest }>({
    mutationKey: ['admin-user-create'],
    mutationFn: async ({ body }) => {
      return await fetchApi({
        method: "POST",
        url: AppApi.admin.user.create,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-list'] });
    },
  });
};

export const useAdminUserPut = () => {
  const queryClient = useQueryClient();
  
  return useMutation<UserResponse, Error, { id: string; body: UserUpdateRequest }>({
    mutationKey: ['admin-user-update'],
    mutationFn: async ({ id, body }) => {
      return await fetchApi({
        method: "PUT",
        url: `${AppApi.admin.user.update}/${id}`,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-list'] });
    },
  });
};

export const useAdminUserDelete = () => {
  const queryClient = useQueryClient();
  
  return useMutation<{ success: boolean; message: string }, Error, { body: UserDeleteRequest }>({
    mutationKey: ['admin-user-delete'],
    mutationFn: async ({ body }) => {
      return await fetchApi({
        method: "DELETE",
        url: AppApi.admin.user.delete,
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user-list'] });
    },
  });
};

export const useAdminChangePassword = () => {
  return useMutation<{ success: boolean; message: string }, Error, { body: ChangePasswordRequest }>({
    mutationKey: ['admin-user-change-password'],
    mutationFn: async ({ body }) => {
      return await fetchApi({
        method: "PUT",
        url: AppApi.admin.user.changePassword,
        body,
      });
    },
  });
};

export const useAdminUserDetail = (id: string) => {
  return useQuery<UserResponse, Error>({
    queryKey: ['admin-user-detail', id],
    queryFn: async () => {
      return await fetchApi({
        method: "GET",
        url: `${AppApi.admin.user.crud}/detail/${id}`,
      });
    },
    enabled: !!id,
  });
};