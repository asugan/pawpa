import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { ENV } from '../config/env';

// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request interceptor for debugging
const requestInterceptor = (config: any) => {
  if (__DEV__) {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data) {
      console.log('📤 Request data:', config.data);
    }
  }
  return config;
};

// Response interceptor for debugging and error handling
const responseInterceptor = (response: AxiosResponse) => {
  if (__DEV__) {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('📥 Response data:', response.data);
  }
  return response;
};

// Error interceptor
const errorInterceptor = (error: AxiosError) => {
  if (__DEV__) {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.error('Error details:', error.response?.data || error.message);
  }

  // Handle network errors
  if (!error.response) {
    throw new ApiError(
      'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
      'NETWORK_ERROR',
      0
    );
  }

  // Handle API errors
  const { status, data } = error.response;
  const apiData = data as any;

  throw new ApiError(
    apiData?.error?.message || apiData?.message || 'Bilinmeyen hata',
    apiData?.error?.code || 'UNKNOWN_ERROR',
    status,
    apiData?.error?.details
  );
};

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: ENV.API_BASE_URL,
    timeout: ENV.TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Add interceptors
  client.interceptors.request.use(requestInterceptor);
  client.interceptors.response.use(responseInterceptor, errorInterceptor);

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();

// Export utility functions
export const api = {
  // GET request
  get: async <T = any>(url: string, params?: any): Promise<ApiResponse<T>> => {
    const response = await apiClient.get<ApiResponse<T>>(url, { params });
    return response.data;
  },

  // POST request
  post: async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data);
    return response.data;
  },

  // PUT request
  put: async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(url: string): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete<ApiResponse<T>>(url);
    return response.data;
  },

  // File upload (multipart/form-data)
  upload: async <T = any>(url: string, formData: FormData): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;