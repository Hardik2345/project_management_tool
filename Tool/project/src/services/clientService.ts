import { api, handleApiError } from '../lib/api';
import { ApiClient, ApiResponse } from '../types';

export class ClientService {
  // Client CRUD operations
  static async getAllClients(): Promise<ApiResponse<{ clients: ApiClient[] }>> {
    try {
      const response = await api.get<ApiResponse<{ clients: ApiClient[] }>>('/clients');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async getClientById(id: string): Promise<ApiResponse<{ client: ApiClient }>> {
    try {
      const response = await api.get<ApiResponse<{ client: ApiClient }>>(`/clients/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async createClient(data: Partial<ApiClient>): Promise<ApiResponse<{ client: ApiClient }>> {
    try {
      const response = await api.post<ApiResponse<{ client: ApiClient }>>('/clients', data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async updateClient(id: string, data: Partial<ApiClient>): Promise<ApiResponse<{ client: ApiClient }>> {
    try {
      const response = await api.patch<ApiResponse<{ client: ApiClient }>>(`/clients/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  static async deleteClient(id: string): Promise<void> {
    try {
      await api.delete(`/clients/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Client filtering and search
  static async getClientsWithQuery(queryParams: Record<string, string>): Promise<ApiResponse<{ clients: ApiClient[] }>> {
    try {
      const searchParams = new URLSearchParams(queryParams);
      const response = await api.get<ApiResponse<{ clients: ApiClient[] }>>(`/clients?${searchParams.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  // Client statistics
  static async getClientStats(id: string): Promise<ApiResponse<{ stats: ClientStats }>> {
    try {
      const response = await api.get<ApiResponse<{ stats: ClientStats }>>(`/clients/${id}/stats`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

interface ClientStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalBilled: number;
  pendingInvoices: number;
}

export default ClientService;
