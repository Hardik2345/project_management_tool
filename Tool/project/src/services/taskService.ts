import { api, handleApiError } from "../lib/api";
import { ApiTask, ApiResponse } from "../types";

export class TaskService {
  // Task CRUD operations
  static async getAllTasks(): Promise<ApiResponse<{ tasks: ApiTask[] }>> {
    try {
      const response = await api.get<ApiResponse<{ tasks: ApiTask[] }>>(
        "/tasks"
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async getTaskById(
    id: string
  ): Promise<ApiResponse<{ task: ApiTask }>> {
    try {
      const response = await api.get<ApiResponse<{ task: ApiTask }>>(
        `/tasks/${id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async createTask(
    data: Partial<ApiTask>
  ): Promise<ApiResponse<{ task: ApiTask }>> {
    try {
      const response = await api.post<ApiResponse<{ task: ApiTask }>>(
        "/tasks",
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async updateTask(
    id: string,
    data: Partial<ApiTask>
  ): Promise<ApiResponse<{ task: ApiTask }>> {
    try {
      const response = await api.patch<ApiResponse<{ task: ApiTask }>>(
        `/tasks/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async deleteTask(id: string): Promise<void> {
    try {
      await api.delete(`/tasks/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Task filtering and search
  static async getTasksWithQuery(
    queryParams: Record<string, string>
  ): Promise<ApiTask[]> {
    try {
      const searchParams = new URLSearchParams(queryParams);
      const response = await api.get<ApiResponse<any>>(
        `/tasks?${searchParams.toString()}`
      );
      // Extract tasks from nested data.data.data
      return response.data.data?.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Task by project
  static async getTasksByProject(
    projectId: string
  ): Promise<ApiResponse<{ tasks: ApiTask[] }>> {
    try {
      const response = await api.get<ApiResponse<{ tasks: ApiTask[] }>>(
        `/tasks?project=${projectId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Task by user
  static async getTasksByUser(userId: string): Promise<ApiTask[]> {
    try {
      const response = await api.get<ApiResponse<any>>(
        `/tasks?assignedTo=${userId}`
      );
      // Extract tasks from nested data.data.data
      return response.data.data?.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Fetch tasks for a specific user using the /api/v1/users/:userId/tasks endpoint
  static async getTasksForUser(userId: string): Promise<ApiTask[]> {
    try {
      const response = await api.get<ApiResponse<{ data: ApiTask[] }>>(
        `/users/${userId}/tasks`
      );
      // Response.data.data.data holds the array of tasks
      return response.data.data?.data || [];
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Bulk task operations
  static async updateTaskStatus(
    id: string,
    status: ApiTask["status"]
  ): Promise<ApiResponse<{ task: ApiTask }>> {
    try {
      const response = await api.patch<ApiResponse<{ task: ApiTask }>>(
        `/tasks/${id}`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async bulkUpdateTasks(
    taskIds: string[],
    updates: Partial<ApiTask>
  ): Promise<ApiResponse<{ tasks: ApiTask[] }>> {
    try {
      const response = await api.patch<ApiResponse<{ tasks: ApiTask[] }>>(
        "/tasks/bulk",
        {
          taskIds,
          updates,
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

export default TaskService;
