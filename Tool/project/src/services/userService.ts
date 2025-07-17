import { api, handleApiError } from "../lib/api";
import { ApiUser, ApiTask, ApiProject, ApiResponse } from "../types";

export class UserService {
  // User CRUD operations (Admin only)
  static async getAllUsers(): Promise<ApiResponse<{ users: ApiUser[] }>> {
    try {
      // Call the unprotected endpoint for fetching all users
      const response = await api.get<ApiResponse<{ users: ApiUser[] }>>(
        "/users"
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async getUserById(
    id: string
  ): Promise<ApiResponse<{ user: ApiUser }>> {
    try {
      const response = await api.get<ApiResponse<{ user: ApiUser }>>(
        `/users/${id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async createUser(
    data: Partial<ApiUser>
  ): Promise<ApiResponse<{ data: ApiUser }>> {
    try {
      // Use admin POST /users to allow setting role
      const response = await api.post<ApiResponse<{ data: ApiUser }>>(
        "/users",
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async updateUser(
    id: string,
    data: Partial<ApiUser>
  ): Promise<ApiResponse<{ user: ApiUser }>> {
    try {
      const response = await api.patch<ApiResponse<{ user: ApiUser }>>(
        `/users/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async deleteUser(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // User tasks and projects
  static async getUserTasks(
    id: string
  ): Promise<ApiResponse<{ tasks: ApiTask[] }>> {
    try {
      const response = await api.get<ApiResponse<{ tasks: ApiTask[] }>>(
        `/users/${id}/tasks`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async getUserProjects(
    id: string
  ): Promise<ApiResponse<{ projects: ApiProject[] }>> {
    try {
      const response = await api.get<ApiResponse<{ projects: ApiProject[] }>>(
        `/users/${id}/projects`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async getMe(): Promise<ApiResponse<{ data: ApiUser }>> {
    try {
      const response = await api.get<ApiResponse<{ data: ApiUser }>>(
        "/users/me"
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export default UserService;
