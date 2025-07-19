import axios, { AxiosInstance, AxiosResponse } from "axios";

// API Base URL - override via VITE_API_BASE_URL in .env for production
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Create axios instance with default configuration
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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
    }
    return Promise.reject(error);
  }
);

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
      return {
        message: "Network error - please check your connection",
        status: 0,
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
