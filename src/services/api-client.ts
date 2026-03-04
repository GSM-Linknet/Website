import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";

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
 * Standard API response structure
 */
export interface ResponseData<T> {
  status?: boolean;
  success?: boolean;
  data: T;
  message?: string;
  meta?: any;
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

// ==================== Token Refresh Logic ====================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = Cookies.get("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || "/api"}/auth/refresh`,
    { refreshToken }
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data.data;

  Cookies.set("auth_token", accessToken, { expires: 1 });
  if (newRefreshToken) {
    Cookies.set("refresh_token", newRefreshToken, { expires: 7 });
  }

  return accessToken;
};

// ==================== Interceptors ====================

/**
 * Request Interceptor - Attach auth token to requests
 */
apiInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor - Handle 401 and refresh token automatically
 */
apiInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // For blob responses, return just the data (the Blob itself)
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Attempt token refresh
    const isAuthLogin = originalRequest.url?.includes("/auth/login");
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthLogin) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens and redirect to login
        Cookies.remove("auth_token");
        Cookies.remove("refresh_token");
        localStorage.removeItem("user_profile");
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    const status = error.response?.status || 500;
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      "An unexpected error occurred";

    console.error(`[API Error] ${status}: ${message}`);
    return Promise.reject(new ApiError(status, message, error.response?.data));
  }
);

// ==================== API Client Wrapper ====================

/**
 * Standardized API Client wrapper for feature-based services.
 */
export const apiClient = {
  get: <T>(url: string, config = {}) => apiInstance.get<any, T>(url, config),
  post: <T>(url: string, data = {}, config = {}) =>
    apiInstance.post<any, T>(url, data, config),
  put: <T>(url: string, data = {}, config = {}) =>
    apiInstance.put<any, T>(url, data, config),
  patch: <T>(url: string, data = {}, config = {}) =>
    apiInstance.patch<any, T>(url, data, config),
  delete: <T>(url: string, config = {}) =>
    apiInstance.delete<any, T>(url, config),
};

