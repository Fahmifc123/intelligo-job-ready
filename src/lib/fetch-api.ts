import axios from 'axios'
import { useAuthStore } from '@/stores/useAuthStore'
import {APP_CONFIG} from "@/constants/config";

export const axiosInstance = axios.create({})

// Add interceptor for handling 401 errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth store (you can import directly or trigger a logout function)
      const authStore = useAuthStore.getState()
      authStore.logout()

      // Redirect to public page
      window.location.href = APP_CONFIG.path.defaultPublic
    }

    return Promise.reject(error)
  }
)

export const fetchApi = async ({
                                 method,
                                 url,
                                 body,
                                 headers,
                                 params,
                                 withCredentials = true,
                               }: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  body?: any
  headers?: Record<string, string>
  params?: Record<string, any>
  withCredentials?: boolean
}) => {
  try {
    // For FormData, let the browser set the Content-Type with proper boundary
    const isFormData = body instanceof FormData;
    
    const config: any = {
      method,
      url,
      data: body ?? null,
      params: params ?? {},
      withCredentials
    };

    // Only set Content-Type if it's not FormData
    if (!isFormData) {
      config.headers = {
        'Content-Type': 'application/json',
        ...(headers ?? {}),
      };
    } else if (headers) {
      // Still apply other headers for FormData
      config.headers = { ...headers };
    }

    const response = await axiosInstance(config);
    return response.data
  } catch (error) {
    throw error
  }
}