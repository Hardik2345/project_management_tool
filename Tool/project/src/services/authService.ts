import { api, apiWithRetry, handleApiError, setAuthToken } from '../lib/api';
import {
  ApiUser,
  LoginRequest,
  SignUpRequest,
  UpdatePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  ApiResponse,
} from '../types';

export class AuthService {
  // Authentication endpoints
  static async signUp(data: SignUpRequest): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/users/signup', data);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async signIn(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiWithRetry.post<AuthResponse>('/users/login', data);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('Login failed:', errorInfo);
      throw errorInfo;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await api.get('/users/logout');
      setAuthToken(null);
    } catch (error) {
      // Even if logout fails, clear the token locally
      setAuthToken(null);
      throw handleApiError(error);
    }
  }

  static async forgotPassword(data: ForgotPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await api.post<ApiResponse<{ message: string }>>('/users/forgotPassword', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async resetPassword(token: string, data: ResetPasswordRequest): Promise<AuthResponse> {
    try {
      const response = await api.patch<AuthResponse>(`/users/resetPassword/${token}`, data);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async updatePassword(data: UpdatePasswordRequest): Promise<AuthResponse> {
    try {
      const response = await api.patch<AuthResponse>('/users/updateMyPassword', data);
      if (response.data.token) {
        setAuthToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Google OAuth
  static getGoogleAuthUrl(): string {
    return `${api.defaults.baseURL}/users/auth/google`;
  }

  // User profile endpoints
  static async getCurrentUser(): Promise<ApiResponse<{ user: ApiUser }>> {
    try {
      const response = await apiWithRetry.get<ApiResponse<{ user: ApiUser }>>('/users/me');
      return response.data;
    } catch (error) {
      const errorInfo = handleApiError(error);
      console.error('Get current user failed:', errorInfo);
      throw errorInfo;
    }
  }

  static async updateProfile(data: FormData): Promise<ApiResponse<{ user: ApiUser }>> {
    try {
      const response = await api.patch<ApiResponse<{ user: ApiUser }>>('/users/updateMe', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async deleteAccount(): Promise<void> {
    try {
      await api.delete('/users/deleteMe');
      setAuthToken(null);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export default AuthService;
