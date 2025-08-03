import { api } from '../lib/api';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'task_assignment' | 'task_update' | 'general';
  read: boolean;
  relatedTaskId?: string;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  status: string;
  results: number;
  data: {
    notifications: Notification[];
  };
}

export interface UnreadCountResponse {
  status: string;
  data: {
    count: number;
  };
}

class NotificationService {
  private baseUrl = '/notifications';

  async getNotifications(page = 1, limit = 10): Promise<NotificationResponse> {
    const response = await api.get(`${this.baseUrl}?page=${page}&limit=${limit}&sort=-createdAt`);
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await api.get(`${this.baseUrl}/unread-count`);
    return response.data.data.count;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`${this.baseUrl}/${notificationId}/read`);
  }

  async archiveNotification(notificationId: string): Promise<void> {
    await api.patch(`${this.baseUrl}/${notificationId}/archive`);
  }

  async markAllAsRead(): Promise<void> {
    await api.patch(`${this.baseUrl}/mark-all-read`);
  }

  // Helper method to get fresh notification data
  async refreshNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    const [notificationsResponse, unreadCount] = await Promise.all([
      this.getNotifications(1, 20), // Get first 20 notifications
      this.getUnreadCount()
    ]);

    return {
      notifications: notificationsResponse.data.notifications,
      unreadCount
    };
  }
}

export const notificationService = new NotificationService();
