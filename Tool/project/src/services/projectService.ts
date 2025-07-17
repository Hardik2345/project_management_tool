import { api, handleApiError } from "../lib/api";
import { ApiProject, ApiResponse } from "../types";

export class ProjectService {
  // Project CRUD operations
  static async getAllProjects(): Promise<ApiProject[]> {
    try {
      const response = await api.get("/projects");
      return response.data.data?.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async getProjectById(
    id: string
  ): Promise<ApiResponse<{ project: ApiProject }>> {
    try {
      const response = await api.get<ApiResponse<{ project: ApiProject }>>(
        `/projects/${id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async createProject(
    data: Partial<ApiProject>
  ): Promise<ApiResponse<{ project: ApiProject }>> {
    try {
      const response = await api.post<ApiResponse<{ project: ApiProject }>>(
        "/projects",
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async updateProject(
    id: string,
    data: Partial<ApiProject>
  ): Promise<ApiResponse<{ project: ApiProject }>> {
    try {
      const response = await api.patch<ApiResponse<{ project: ApiProject }>>(
        `/projects/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async deleteProject(id: string): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Project filtering and search
  static async getProjectsWithQuery(
    queryParams: Record<string, string>
  ): Promise<ApiResponse<{ projects: ApiProject[] }>> {
    try {
      const searchParams = new URLSearchParams(queryParams);
      const response = await api.get<ApiResponse<{ projects: ApiProject[] }>>(
        `/projects?${searchParams.toString()}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Project statistics
  static async getProjectStats(
    id: string
  ): Promise<ApiResponse<{ stats: ProjectStats }>> {
    try {
      const response = await api.get<ApiResponse<{ stats: ProjectStats }>>(
        `/projects/${id}/stats`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalMembers: number;
  completionPercentage: number;
}

export default ProjectService;
