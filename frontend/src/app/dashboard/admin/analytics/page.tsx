'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  ArrowLeft,
  RefreshCw,
  Calendar,
  Building2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import api, { API_ENDPOINTS } from '@/lib/api';
import { authService, User as UserType } from '@/lib/auth';

interface AnalyticsData {
  total_grievances: number;
  resolved_grievances: number;
  pending_grievances: number;
  in_progress_grievances: number;
  rejected_grievances: number;
  total_users: number;
  total_departments: number;
  avg_resolution_time: number;
  grievances_by_category: Record<string, number>;
  grievances_by_priority: Record<string, number>;
  grievances_by_status: Record<string, number>;
  department_stats: Array<{
    department_name: string;
    total_grievances: number;
    resolved_grievances: number;
    avg_resolution_time: number;
  }>;
  recent_grievances: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    created_at: string;
    citizen_name: string;
  }>;
}

const defaultAnalytics: AnalyticsData = {
    total_grievances: 0,
    resolved_grievances: 0,
    pending_grievances: 0,
    in_progress_grievances: 0,
    avg_resolution_time: 0,
    grievances_by_status: {},
    grievances_by_priority: {},
    grievances_by_category: {},
    department_stats: [],
    recent_grievances: [],
    rejected_grievances: 0,
    total_users: 0,
    total_departments: 0
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const user = authService.getCurrentUserSync();
        if (!user || (user.role !== 'admin' && user.role !== 'department_head')) {
          toast.error('Access denied');
          return;
        }
        setCurrentUser(user);

        // Load analytics data
        const response = await api.get(API_ENDPOINTS.ADMIN.STATS);
        setAnalytics(response.data);
      } catch (error: any) {
        console.error('Error loading analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, [timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {currentUser?.role === 'department_head' ? 'Department Analytics' : 'System Analytics'}
          </h1>
          <p className="text-gray-600 mt-1">
            {currentUser?.role === 'department_head' 
              ? `Analytics for ${currentUser.department || 'your department'}`
              : 'Comprehensive system analytics and insights'
            }
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Grievances</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_grievances}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{analytics.resolved_grievances}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{analytics.pending_grievances}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.avg_resolution_time ? analytics.avg_resolution_time.toFixed(1) : '0.0'} days</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Grievance Status Distribution</CardTitle>
                  <CardDescription>Current status of all grievances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.grievances_by_status ? Object.entries(analytics.grievances_by_status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(status)}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </Badge>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                    )) : (
                      <p className="text-gray-500">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                  <CardDescription>Priority levels of grievances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.grievances_by_priority ? Object.entries(analytics.grievances_by_priority).map(([priority, count]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(priority)}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </Badge>
                        </div>
                        <span className="font-semibold">{count}</span>
                      </div>
                    )) : (
                      <p className="text-gray-500">No data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Grievances by Category</CardTitle>
                <CardDescription>Distribution across different issue categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.grievances_by_category ? Object.entries(analytics.grievances_by_category).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="capitalize">{category.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  )) : (
                    <p className="text-gray-500">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Performance</CardTitle>
                <CardDescription>Grievance handling performance by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.department_stats && Array.isArray(analytics.department_stats) ? analytics.department_stats.map((dept) => (
                    <div key={dept.department_name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5 text-gray-500" />
                        <div>
                          <p className="font-medium">{dept.department_name}</p>
                          <p className="text-sm text-gray-600">
                            {dept.resolved_grievances}/{dept.total_grievances} resolved
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Avg. Resolution</p>
                        <p className="font-semibold">{dept.avg_resolution_time ? dept.avg_resolution_time.toFixed(1) : '0.0'} days</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Grievances</CardTitle>
                <CardDescription>Latest grievances in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.recent_grievances && Array.isArray(analytics.recent_grievances) ? analytics.recent_grievances.map((grievance) => (
                    <div key={grievance.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{grievance.title}</p>
                        <p className="text-sm text-gray-600">by {grievance.citizen_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(grievance.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(grievance.status)}>
                          {grievance.status}
                        </Badge>
                        <Badge className={getPriorityColor(grievance.priority)}>
                          {grievance.priority}
                        </Badge>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
