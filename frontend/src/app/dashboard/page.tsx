'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  BarChart3,
  Users,
  MessageSquare,
  MapPin,
  Camera,
  Bell
} from 'lucide-react';
import Link from 'next/link';
import { authService, User } from '@/lib/auth';
import { grievanceService, GrievanceStats, Grievance } from '@/lib/grievances';
import { notificationService } from '@/lib/notifications';
import api, { API_ENDPOINTS } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<GrievanceStats | null>(null);
  const [recentGrievances, setRecentGrievances] = useState<Grievance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ensure recentGrievances is always an array
  const safeRecentGrievances = Array.isArray(recentGrievances) ? recentGrievances : [];

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Only load data on client side
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const currentUser = authService.getCurrentUserSync();
        setUser(currentUser);

        // Load stats (only for admin/department head)
        if (currentUser?.role === 'admin' || currentUser?.role === 'department_head') {
          const statsData = await grievanceService.getGrievanceStats();
          setStats(statsData);
        }

        // Load recent grievances based on user role
        try {
          let grievancesData;
          if (currentUser?.role === 'department_head') {
            // Department heads see only their assigned grievances
            const response = await api.get(API_ENDPOINTS.DEPARTMENTS.MY_GRIEVANCES + '?limit=5');
            grievancesData = response.data;
          } else {
            // Citizens and admins use the regular grievance service
            grievancesData = await grievanceService.getGrievances({ limit: 5 });
          }
          setRecentGrievances(grievancesData || []);
        } catch (error) {
          console.error('Error loading grievances:', error);
          setRecentGrievances([]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-blue-100">
          {user?.role === 'citizen' 
            ? 'Report civic issues and track their resolution progress.'
            : 'Manage grievances and oversee the civic issue resolution process.'
          }
        </p>
      </div>

      {/* Quick actions - Role specific */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Citizen-specific cards */}
        {user?.role === 'citizen' && (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Report Issue</p>
                    <p className="text-2xl font-bold text-gray-900">New</p>
                  </div>
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <Button asChild className="w-full mt-4">
                  <Link href="/dashboard/grievances/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Report Issue
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">My Grievances</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {safeRecentGrievances.length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/dashboard/grievances">
                    <FileText className="mr-2 h-4 w-4" />
                    View All
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        {/* Department head-specific cards */}
        {user?.role === 'department_head' && (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assigned Grievances</p>
                    <p className="text-2xl font-bold text-gray-900">{safeRecentGrievances.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-600" />
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/dashboard/admin">
                    <FileText className="mr-2 h-4 w-4" />
                    Manage Grievances
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Department Analytics</p>
                    <p className="text-2xl font-bold text-gray-900">Stats</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <Button asChild variant="outline" className="w-full mt-4">
                  <Link href="/dashboard/admin/analytics">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        )}

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chatbot</p>
                <p className="text-2xl font-bold text-gray-900">AI</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/dashboard/chatbot">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ask AI
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notifications</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notificationService.getUnreadCount()}
                </p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/dashboard/notifications">
                <Bell className="mr-2 h-4 w-4" />
                View All
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats section (for admin/department head) */}
      {(user?.role === 'admin' || user?.role === 'department_head') && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent grievances */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Grievances</CardTitle>
          <CardDescription>
            Your latest reported issues and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {safeRecentGrievances.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No grievances found</p>
              <Button asChild>
                <Link href="/dashboard/grievances/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Report Your First Issue
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {safeRecentGrievances.map((grievance) => (
                <div key={grievance.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(grievance.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{grievance.title}</h3>
                      <p className="text-sm text-gray-500">{grievance.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge className={getStatusColor(grievance.status)}>
                      {grievance.status.replace('_', ' ')}
                    </Badge>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/grievances/${grievance.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
