import { api, API_ENDPOINTS } from './api';

// Types
export interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Grievance {
  id: string;
  citizen_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
  location: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  images: ImageMetadata[];
  assigned_department?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  ai_analysis?: {
    category: string;
    confidence: number;
    suggested_department: string;
    tags: string[];
  };
  citizen_feedback?: {
    rating: number;
    comment: string;
    submitted_at: string;
  };
}

export interface ImageMetadata {
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  size: number;
  uploaded_at: string;
}

export interface CreateGrievanceRequest {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: {
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  images?: ImageMetadata[];
}

export interface UpdateGrievanceRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'closed';
  assigned_department?: string;
  assigned_to?: string;
}

export interface GrievanceFilters {
  status?: string;
  category?: string;
  priority?: string;
  assigned_department?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GrievanceStats {
  total: number;
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  closed: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
  by_department: Record<string, number>;
}

// Grievance Service
export class GrievanceService {
  private static instance: GrievanceService;

  private constructor() {}

  public static getInstance(): GrievanceService {
    if (!GrievanceService.instance) {
      GrievanceService.instance = new GrievanceService();
    }
    return GrievanceService.instance;
  }

  // Create grievance
  async createGrievance(data: CreateGrievanceRequest): Promise<Grievance> {
    try {
      const response = await api.post(API_ENDPOINTS.GRIEVANCES.CREATE, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create grievance');
    }
  }

  // Get grievances with filters
  async getGrievances(filters: GrievanceFilters = {}): Promise<Grievance[]> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`${API_ENDPOINTS.GRIEVANCES.LIST}?${params.toString()}`);
      // Backend returns array directly
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch grievances');
    }
  }

  // Get single grievance
  async getGrievance(id: string): Promise<Grievance> {
    try {
      const response = await api.get(API_ENDPOINTS.GRIEVANCES.GET(id));
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch grievance');
    }
  }

  // Update grievance
  async updateGrievance(id: string, data: UpdateGrievanceRequest): Promise<Grievance> {
    try {
      const response = await api.put(API_ENDPOINTS.GRIEVANCES.UPDATE(id), data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update grievance');
    }
  }

  // Delete grievance
  async deleteGrievance(id: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.GRIEVANCES.DELETE(id));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete grievance');
    }
  }

  // Get grievance stats
  async getGrievanceStats(): Promise<GrievanceStats> {
    try {
      const response = await api.get('/grievances/stats/overview');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch stats');
    }
  }

  // Get admin stats
  async getAdminStats(): Promise<any> {
    try {
      const response = await api.get(API_ENDPOINTS.ADMIN.STATS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch admin stats');
    }
  }

  // Assign department
  async assignDepartment(id: string, department: string): Promise<Grievance> {
    try {
      const response = await api.post(API_ENDPOINTS.ADMIN.ASSIGN_DEPARTMENT(id), {
        department,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to assign department');
    }
  }

  // Update status
  async updateStatus(id: string, status: string): Promise<Grievance> {
    try {
      const response = await api.post(API_ENDPOINTS.ADMIN.UPDATE_STATUS(id), {
        status,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to update status');
    }
  }
}

// Export singleton instance
export const grievanceService = GrievanceService.getInstance();
