import { api } from "../lib/api";
import { ApiResponse, ApiTask } from "../types";

export const taskService = {
  async getTasksForUser(userId: string): Promise<ApiTask[]> {
    const response = await api.get<ApiResponse<{ tasks: ApiTask[] }>>(
      `/users/${userId}/tasks`
    );
    return response.data.data?.data || [];
  },
};
