import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

// API Base URL - override via VITE_API_BASE_URL in .env for production
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Retry configuration for production resilience
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Helper function to check if an error is retryable
const isRetryableError = (error: AxiosError): boolean => {
  if (!error.response) {
    // Network errors, timeouts, etc. are retryable
    return true;
  }
  
  const status = error.response.status;
  // Retry on server errors (5xx) and specific client errors
  return status >= 500 || status === 408 || status === 429;
};

// Retry wrapper for axios requests
const withRetry = async <T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error) && isRetryableError(error)) {
      console.warn(`Request failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`, error.message);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
};

// Create axios instance with default configuration
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for production cold starts
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Auth handled entirely via sameSite=none secure cookie; no client token storage
// Stubbed: accept token parameter for compatibility but do nothing (cookie-only auth)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setAuthToken = (_token?: string | null): void => {};
export const getAuthToken = (): null => null;

// No request interceptor needed; cookie auth sends JWT automatically

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      setAuthToken(null);
      // You might want to redirect to login or dispatch a logout action
      console.error("Authentication failed, please login again");
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error("Request timeout - backend may be starting up");
    } else if (!error.response) {
      console.error("Network error - no response received");
    }
    return Promise.reject(error);
  }
);

// Enhanced API wrapper with retry logic
export const apiWithRetry = {
  get: <T>(url: string, config?: any) => withRetry(() => api.get<T>(url, config)),
  post: <T>(url: string, data?: any, config?: any) => withRetry(() => api.post<T>(url, data, config)),
  put: <T>(url: string, data?: any, config?: any) => withRetry(() => api.put<T>(url, data, config)),
  patch: <T>(url: string, data?: any, config?: any) => withRetry(() => api.patch<T>(url, data, config)),
  delete: <T>(url: string, config?: any) => withRetry(() => api.delete<T>(url, config)),
};

// Helper function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

// Helper function to handle API errors
export const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      return {
        message: error.response.data?.message || "An error occurred",
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
      return {
        message: isTimeout 
          ? "Request timeout - the server may be starting up. Please try again in a moment."
          : "Network error - please check your connection",
        status: 0,
        isTimeout,
      };
    }
  }

  // Something else happened
  return {
    message:
      error instanceof Error ? error.message : "An unexpected error occurred",
    status: 0,
  };
};

export default api;
