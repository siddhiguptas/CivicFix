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
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { authService, User as UserType } from '@/lib/auth';
import { grievanceService, Grievance, GrievanceStatus } from '@/lib/grievances';
import api, { API_ENDPOINTS } from '@/lib/api';
import { toast } from 'sonner';

export default function GrievanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminComment, setAdminComment] = useState('');

  useEffect(() => {
    const loadGrievance = async () => {
      try {
        if (typeof window === 'undefined') return;

        const currentUser = authService.getCurrentUserSync();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);

        const grievanceData = await grievanceService.getGrievance(params.id as string);
        console.log('Loaded grievance data:', grievanceData);
        console.log('Images in grievance:', grievanceData.images);
        setGrievance(grievanceData);
        setNewStatus(grievanceData.status);
      } catch (error) {
        console.error('Error loading grievance:', error);
        toast.error('Failed to load grievance details');
        router.push('/dashboard/grievances');
      } finally {
        setIsLoading(false);
      }
    };

    loadGrievance();
  }, [params.id, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_progress':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  const handleStatusUpdate = async () => {
    if (!grievance || newStatus === grievance.status) return;

    setIsUpdating(true);
    try {
      if (user?.role === 'admin' || user?.role === 'department_head') {
        // Use admin endpoint for status updates
        await api.put(API_ENDPOINTS.ADMIN.UPDATE_STATUS(grievance.id), {
          status: newStatus,
          resolution_notes: ''
        });
      } else {
        // Use regular endpoint for citizens
        await grievanceService.updateGrievance(grievance.id, { status: newStatus as GrievanceStatus });
      }
      setGrievance(prev => prev ? { ...prev, status: newStatus as GrievanceStatus } : null);
      toast.success('Status updated successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const canEdit = user && (
    user.role === 'admin' || 
    user.role === 'department_head' ||
    (user.role === 'citizen' && grievance?.citizen_id === user.id)
  );

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
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Grievance not found</h3>
        <p className="text-gray-500 mb-6">The grievance you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button asChild>
          <Link href="/dashboard/grievances">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Grievances
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/grievances">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{grievance.title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className={getStatusColor(grievance.status)}>
                {getStatusIcon(grievance.status)}
                <span className="ml-1">{grievance.status.replace('_', ' ')}</span>
              </Badge>
              <Badge className={getPriorityColor(grievance.priority)}>
                {grievance.priority} priority
              </Badge>
            </div>
          </div>
        </div>

        {canEdit && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/grievances/${grievance.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{grievance.description}</p>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                {grievance.images && grievance.images.length > 0 
                  ? `${grievance.images.length} photo${grievance.images.length !== 1 ? 's' : ''} attached`
                  : 'No photos attached'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {grievance.images && grievance.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {grievance.images.map((image, index) => {
                    console.log('Rendering image:', image);
                    return (
                      <div key={index} className="relative group">
                        <img
                          src={image.url}
                          alt={`Grievance photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image.url, '_blank')}
                          onError={(e) => {
                            console.error('Image failed to load:', image.url, e);
                            // Show a placeholder instead of hiding the image
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzVMMTI1IDEwMEgxMDBWNzVaIiBmaWxsPSIjOUI5QjlCIi8+CjxwYXRoIGQ9Ik0xMDAgMTI1TDc1IDEwMEgxMDBWMTI1WiIgZmlsbD0iIzlCOUI5QiIvPgo8L3N2Zz4K';
                            e.currentTarget.alt = 'Image failed to load';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <Camera className="h-12 w-12 mb-2" />
                  <p>No photos attached to this grievance</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments/Updates */}
          <Card>
            <CardHeader>
              <CardTitle>Updates & Comments</CardTitle>
              <CardDescription>
                Track the progress and any updates on this issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-500 italic">No updates yet</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Update (Admin/Department Head) */}
          {(user?.role === 'admin' || user?.role === 'department_head') && (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
                <CardDescription>
                  Change the status and add comments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment (Optional)</label>
                  <Textarea
                    placeholder="Add a comment about this update..."
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleStatusUpdate}
                  disabled={isUpdating || newStatus === grievance.status}
                  className="w-full"
                >
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Status
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <Badge variant="outline">{grievance.category}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Priority</span>
                <Badge className={getPriorityColor(grievance.priority)}>
                  {grievance.priority}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reported by</span>
                <span className="text-sm font-medium">User {grievance.citizen_id.slice(-4)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Reported on</span>
                <span className="text-sm">
                  {new Date(grievance.created_at).toLocaleDateString()}
                </span>
              </div>

              {grievance.assigned_to && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Assigned to</span>
                  <span className="text-sm font-medium">{grievance.assigned_to}</span>
                </div>
              )}

              {grievance.location && (
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Location</span>
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <div className="text-sm">
                      <div>{grievance.location.address}</div>
                      {grievance.location.coordinates && (
                        <div className="text-xs text-gray-500">
                          {grievance.location.coordinates[0].toFixed(6)}, {grievance.location.coordinates[1].toFixed(6)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Add Comment
              </Button>
              
              {user?.role === 'citizen' && grievance.citizen_id === user.id && (
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Report
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
