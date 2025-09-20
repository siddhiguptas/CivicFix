'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  MapPin,
  Calendar,
  User,
  Camera,
  MessageSquare,
  Loader2,
  Save,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { authService, User as UserType } from '@/lib/auth';
import { grievanceService, Grievance } from '@/lib/grievances';
import api, { API_ENDPOINTS } from '@/lib/api';
import { toast } from 'sonner';

export default function EditGrievancePage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminComment, setAdminComment] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    const loadGrievance = async () => {
      try {
        if (typeof window === 'undefined') return;

        const currentUser = authService.getCurrentUserSync();
        if (!currentUser) {
          router.push('/login');
          return;
        }

        // Check if user can edit this grievance
        if (currentUser.role === 'citizen' && grievance?.citizen_id !== currentUser.id) {
          toast.error('You can only edit your own grievances');
          router.push('/dashboard/grievances');
          return;
        }

        if (currentUser.role === 'department_head' && grievance?.assigned_department !== currentUser.department) {
          toast.error('You can only edit grievances assigned to your department');
          router.push('/dashboard/admin');
          return;
        }

        setUser(currentUser);

        const grievanceData = await grievanceService.getGrievance(params.id as string);
        console.log('Loaded grievance data:', grievanceData);
        setGrievance(grievanceData);
        setNewStatus(grievanceData.status);
        setAdminComment(grievanceData.comments?.[0]?.comment || '');
        setResolutionNotes(grievanceData.resolution_notes || '');
      } catch (error: any) {
        console.error('Error loading grievance:', error);
        toast.error('Failed to load grievance');
        router.push('/dashboard/grievances');
      } finally {
        setIsLoading(false);
      }
    };

    loadGrievance();
  }, [params.id, router]);

  const handleStatusUpdate = async () => {
    if (!grievance || !user) return;

    setIsSaving(true);
    try {
      if (user.role === 'admin' || user.role === 'department_head') {
        // Update status via admin API
        await api.put(API_ENDPOINTS.ADMIN.UPDATE_STATUS(grievance.id), {
          status: newStatus,
          resolution_notes: resolutionNotes
        });

        // Add comment if provided
        if (adminComment.trim()) {
          await api.post(`/grievances/${grievance.id}/comments`, {
            comment: adminComment,
            comment_type: 'admin'
          });
        }

        toast.success('Grievance updated successfully');
        router.push(`/dashboard/grievances/${grievance.id}`);
      } else {
        // Citizens can only update their own grievances
        await grievanceService.updateGrievance(grievance.id, {
          status: newStatus as any
        });
        toast.success('Grievance updated successfully');
        router.push(`/dashboard/grievances/${grievance.id}`);
      }
    } catch (error: any) {
      console.error('Error updating grievance:', error);
      toast.error(error.message || 'Failed to update grievance');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!grievance) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Grievance not found</h3>
        <p className="text-gray-600 mb-4">The grievance you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button asChild>
          <Link href="/dashboard/grievances">Back to Grievances</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild>
              <Link href={`/dashboard/grievances/${grievance.id}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Grievance
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Grievance</h1>
          <p className="text-gray-600 mt-1">Update grievance status and add comments</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grievance Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {grievance.title}
                  <Badge className={getStatusColor(grievance.status)}>
                    {getStatusIcon(grievance.status)}
                    <span className="ml-1 capitalize">{grievance.status}</span>
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Created by {grievance.citizen_name} on {new Date(grievance.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{grievance.description}</p>
              </CardContent>
            </Card>

            {/* Status Update */}
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>Change the status of this grievance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(user?.role === 'admin' || user?.role === 'department_head') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resolution Notes
                    </label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add resolution notes..."
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add Comment
                  </label>
                  <Textarea
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleStatusUpdate}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Grievance
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Grievance Details */}
            <Card>
              <CardHeader>
                <CardTitle>Grievance Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Citizen:</span>
                  <span className="text-sm font-medium">{grievance.citizen_name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm font-medium">
                    {new Date(grievance.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm font-medium">{grievance.location.address}</span>
                </div>

                {grievance.assigned_department && (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Department:</span>
                    <span className="text-sm font-medium">{grievance.assigned_department}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {grievance.ai_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <Badge variant="outline">{grievance.ai_analysis.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="text-sm font-medium">
                      {(grievance.ai_analysis.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <Badge variant="outline">{grievance.ai_analysis.auto_priority}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
