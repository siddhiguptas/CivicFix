import { api, API_ENDPOINTS } from './api';

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'citizen' | 'admin' | 'department_head' | 'moderator';
  department?: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_verified: boolean;
  profile_image?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role?: 'citizen' | 'admin' | 'department_head' | 'moderator';
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  department?: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  is_verified: boolean;
  profile_image?: string;
}

// Auth Service
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    // Only load from storage on client side
    if (typeof window !== 'undefined') {
      this.loadUserFromStorage();
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Load user from localStorage
  private loadUserFromStorage(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.currentUser = JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearAuth();
    }
  }

  // Save user to localStorage
  private saveUserToStorage(user: User): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser = user;
  }

  // Clear auth data
  private clearAuth(): void {
    if (typeof window === 'undefined') return; // Skip on server-side
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  // Register user
  async register(data: RegisterRequest): Promise<UserResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  }

  // Login user
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);
      const authData: AuthResponse = response.data;
      
      // Save token
      localStorage.setItem('access_token', authData.access_token);
      
      // Get user data
      const userResponse = await this.getCurrentUser();
      this.saveUserToStorage(userResponse);
      
      return authData;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      const userData: UserResponse = response.data;
      
      // Convert to User type
      const user: User = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role as User['role'],
        status: userData.status as User['status'],
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        last_login: userData.last_login,
        is_verified: userData.is_verified,
        profile_image: userData.profile_image,
      };
      
      this.saveUserToStorage(user);
      return user;
    } catch (error: any) {
      this.clearAuth();
      throw new Error(error.response?.data?.detail || 'Failed to get user data');
    }
  }

  // Logout user
  logout(): void {
    this.clearAuth();
    window.location.href = '/login';
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token && !!this.currentUser;
  }

  // Get current user
  getCurrentUserSync(): User | null {
    return this.currentUser;
  }

  // Check if user has specific role
  hasRole(role: User['role']): boolean {
    return this.currentUser?.role === role;
  }

  // Check if user has any of the specified roles
  hasAnyRole(roles: User['role'][]): boolean {
    return this.currentUser ? roles.includes(this.currentUser.role) : false;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Check if user is department head
  isDepartmentHead(): boolean {
    return this.hasRole('department_head');
  }

  // Check if user is citizen
  isCitizen(): boolean {
    return this.hasRole('citizen');
  }

  // Create demo users
  async createDemoUsers(): Promise<{ message: string; users: Record<string, string> }> {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.CREATE_DEMO_USERS);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to create demo users');
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
