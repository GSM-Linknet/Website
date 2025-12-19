import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";

/**
 * Custom error class for API-related issues.
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

/**
 * Configure standard Axios instance with production-ready patterns.
 */
export const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Useful for adding authentication tokens or global headers.
 */
apiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // In a real app, you would add the token here
    // const token = localStorage.getItem('auth_token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Centralizes error handling and data transformation.
 */
apiInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (error: AxiosError) => {
    const status = error.response?.status || 500;
    const message = (error.response?.data as any)?.message || error.message || "An unexpected error occurred";
    
    // Log error to a monitoring service like Sentry
    console.error(`[API Error] ${status}: ${message}`);
    
    return Promise.reject(new ApiError(status, message, error.response?.data));
  }
);

/**
 * Standardized API Client wrapper for feature-based services.
 */
export const apiClient = {
  get: <T>(url: string, config = {}) => apiInstance.get<any, T>(url, config),
  post: <T>(url: string, data = {}, config = {}) => apiInstance.post<any, T>(url, data, config),
  put: <T>(url: string, data = {}, config = {}) => apiInstance.put<any, T>(url, data, config),
  patch: <T>(url: string, data = {}, config = {}) => apiInstance.patch<any, T>(url, data, config),
  delete: <T>(url: string, config = {}) => apiInstance.delete<any, T>(url, config),
};
