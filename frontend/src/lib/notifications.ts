import { api, API_ENDPOINTS } from './api';

// Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'grievance_update' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  data?: {
    grievance_id?: string;
    action_url?: string;
    metadata?: Record<string, unknown>;
  };
  created_at: string;
  read_at?: string;
}

export interface NotificationFilters {
  type?: string;
  priority?: string;
  is_read?: boolean;
  page?: number;
  limit?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}

// Notification Service
export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private unreadCount: number = 0;

  private constructor() {
    this.loadNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Load notifications from localStorage
  private loadNotifications(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      const notifications = localStorage.getItem('notifications');
      if (notifications) {
        this.notifications = JSON.parse(notifications);
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }

  // Save notifications to localStorage
  private saveNotifications(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Update unread count
  private updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.is_read).length;
  }

  // Get notifications
  async getNotifications(filters: NotificationFilters = {}): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`);
      const data = response.data;
      
      // Update local cache
      this.notifications = data.notifications;
      this.updateUnreadCount();
      this.saveNotifications();
      
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.detail || 'Failed to fetch notifications'
        : 'Failed to fetch notifications';
      throw new Error(errorMessage);
    }
  }

  // Get single notification
  async getNotification(id: string): Promise<Notification> {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.LIST + `/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.detail || 'Failed to fetch notification'
        : 'Failed to fetch notification';
      throw new Error(errorMessage);
    }
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await api.post(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
      const updatedNotification = response.data;
      
      // Update local cache
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications[index] = updatedNotification;
        this.updateUnreadCount();
        this.saveNotifications();
      }
      
      return updatedNotification;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.detail || 'Failed to mark notification as read'
        : 'Failed to mark notification as read';
      throw new Error(errorMessage);
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      const unreadNotifications = this.notifications.filter(n => !n.is_read);
      const promises = unreadNotifications.map(n => this.markAsRead(n.id));
      await Promise.all(promises);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.detail || 'Failed to mark all notifications as read'
        : 'Failed to mark all notifications as read';
      throw new Error(errorMessage);
    }
  }

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
      
      // Update local cache
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.updateUnreadCount();
      this.saveNotifications();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.detail || 'Failed to delete notification'
        : 'Failed to delete notification';
      throw new Error(errorMessage);
    }
  }

  // Get notification stats
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS.LIST + '/stats');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as any).response?.data?.detail || 'Failed to fetch notification stats'
        : 'Failed to fetch notification stats';
      throw new Error(errorMessage);
    }
  }

  // Get local notifications
  getLocalNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread count
  getUnreadCount(): number {
    return this.unreadCount;
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.is_read);
  }

  // Get notifications by type
  getNotificationsByType(type: string): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Get notifications by priority
  getNotificationsByPriority(priority: string): Notification[] {
    return this.notifications.filter(n => n.priority === priority);
  }

  // Add local notification (for testing or offline use)
  addLocalNotification(notification: Omit<Notification, 'id' | 'created_at'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    
    this.notifications.unshift(newNotification);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  // Clear all notifications
  clearAllNotifications(): void {
    this.notifications = [];
    this.unreadCount = 0;
    this.saveNotifications();
  }

  // Get notification icon based on type
  getNotificationIcon(type: string): string {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      grievance_update: '📝',
      system: '🔧',
    };
    return icons[type as keyof typeof icons] || '📢';
  }

  // Get notification color based on priority
  getNotificationColor(priority: string): string {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-500';
  }

  // Format notification time
  formatNotificationTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString();
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
