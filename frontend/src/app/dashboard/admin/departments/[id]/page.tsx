"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  ArrowLeft, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Department {
  id: string;
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  head_name: string;
  categories: string[];
  status: 'active' | 'inactive';
  total_grievances: number;
  resolved_grievances: number;
  avg_resolution_time: number | null;
  created_at: string;
  updated_at: string;
}

interface DepartmentStats {
  department_name: string;
  total_grievances: number;
  pending_grievances: number;
  in_progress_grievances: number;
  resolved_grievances: number;
  avg_resolution_time_days: number | null;
  resolution_rate: number;
}

interface Grievance {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  citizen_name: string;
  location: {
    address: string;
  };
}

export default function DepartmentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [grievancesLoading, setGrievancesLoading] = useState(false);

  useEffect(() => {
    if (departmentId) {
      loadDepartmentDetails();
      loadDepartmentGrievances();
    }
  }, [departmentId]);

  const loadDepartmentDetails = async () => {
    try {
      setIsLoading(true);
      const [deptResponse, statsResponse] = await Promise.all([
        api.get(`/departments/${departmentId}`),
        api.get(`/departments/${departmentId}/stats`)
      ]);
      
      setDepartment(deptResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading department details:', error);
      toast.error('Failed to load department details');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDepartmentGrievances = async () => {
    try {
      setGrievancesLoading(true);
      const response = await api.get(`/departments/${departmentId}/grievances`);
      setGrievances(response.data);
    } catch (error) {
      console.error('Error loading department grievances:', error);
      toast.error('Failed to load grievances');
    } finally {
      setGrievancesLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading department details...</p>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Department not found</h3>
        <p className="text-gray-600 mb-4">The department you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">{department.name}</h1>
            <p className="text-gray-600">{department.description}</p>
          </div>
        </div>
        <Badge variant={department.status === 'active' ? 'default' : 'secondary'} className="ml-auto">
          {department.status}
        </Badge>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.total_grievances}</p>
                  <p className="text-sm text-gray-600">Total Grievances</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.resolved_grievances}</p>
                  <p className="text-sm text-gray-600">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.pending_grievances + stats.in_progress_grievances}</p>
                  <p className="text-sm text-gray-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-2xl font-bold">{stats.resolution_rate.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Resolution Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="grievances">Grievances</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Department Info */}
          <Card>
            <CardHeader>
              <CardTitle>Department Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Head of Department</h4>
                  <p className="text-gray-600">{department.head_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Email</h4>
                  <p className="text-blue-600">{department.contact_email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contact Phone</h4>
                  <p className="text-gray-600">{department.contact_phone}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Created</h4>
                  <p className="text-gray-600">
                    {new Date(department.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Categories Handled</h4>
                <div className="flex flex-wrap gap-2">
                  {department.categories.map((category) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{stats.total_grievances}</p>
                    <p className="text-sm text-gray-600">Total Grievances</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{stats.resolved_grievances}</p>
                    <p className="text-sm text-gray-600">Resolved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.avg_resolution_time_days ? `${stats.avg_resolution_time_days.toFixed(1)} days` : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Avg. Resolution Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="grievances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Grievances</CardTitle>
              <CardDescription>
                Grievances currently assigned to this department
              </CardDescription>
            </CardHeader>
            <CardContent>
              {grievancesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : grievances.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No grievances assigned</h3>
                  <p className="text-gray-600">This department doesn&apos;t have any assigned grievances yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {grievances.map((grievance) => (
                    <div key={grievance.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusIcon(grievance.status)}
                            <h4 className="font-medium">{grievance.title}</h4>
                            <Badge className={getStatusColor(grievance.status)}>
                              {grievance.status}
                            </Badge>
                            <Badge className={getPriorityColor(grievance.priority)}>
                              {grievance.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{grievance.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>By: {grievance.citizen_name}</span>
                            <span>•</span>
                            <span>{grievance.location.address}</span>
                            <span>•</span>
                            <span>{new Date(grievance.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/dashboard/grievances/${grievance.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Get in touch with this department
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-blue-600">{department.contact_email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">{department.contact_phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Head of Department</p>
                  <p className="text-gray-600">{department.head_name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Established</p>
                  <p className="text-gray-600">
                    {new Date(department.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
