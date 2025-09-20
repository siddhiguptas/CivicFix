"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building2, 
  Plus, 
  Search, 
  Users, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import api, { API_ENDPOINTS } from '@/lib/api';

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

interface DepartmentFormData {
  name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  head_name: string;
  categories: string[];
  status: 'active' | 'inactive';
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DepartmentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    head_name: '',
    categories: [],
    status: 'active'
  });

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await api.get(API_ENDPOINTS.DEPARTMENTS.LIST);
      setDepartments(response.data);
      
      // Load stats for each department
      const statsPromises = response.data.map(async (dept: Department) => {
        try {
          const statsResponse = await api.get(API_ENDPOINTS.DEPARTMENTS.STATS(dept.id));
          return statsResponse.data;
        } catch (error) {
          console.error(`Error loading stats for ${dept.name}:`, error);
          return null;
        }
      });
      
      const statsResults = await Promise.all(statsPromises);
      setStats(statsResults.filter(Boolean));
    } catch (error) {
      console.error('Error loading departments:', error);
      toast.error('Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeDepartments = async () => {
    try {
      setIsInitializing(true);
      await api.post(API_ENDPOINTS.DEPARTMENTS.INITIALIZE);
      toast.success('Departments initialized successfully');
      loadDepartments();
    } catch (error) {
      console.error('Error initializing departments:', error);
      toast.error('Failed to initialize departments');
    } finally {
      setIsInitializing(false);
    }
  };

  const createDepartment = async () => {
    try {
      await api.post(API_ENDPOINTS.DEPARTMENTS.CREATE, formData);
      toast.success('Department created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadDepartments();
    } catch (error) {
      console.error('Error creating department:', error);
      toast.error('Failed to create department');
    }
  };

  const updateDepartment = async () => {
    if (!selectedDepartment) return;
    
    try {
      await api.put(API_ENDPOINTS.DEPARTMENTS.UPDATE(selectedDepartment.id), formData);
      toast.success('Department updated successfully');
      setIsEditDialogOpen(false);
      setSelectedDepartment(null);
      resetForm();
      loadDepartments();
    } catch (error) {
      console.error('Error updating department:', error);
      toast.error('Failed to update department');
    }
  };

  const deleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    try {
      await api.delete(API_ENDPOINTS.DEPARTMENTS.DELETE(departmentId));
      toast.success('Department deleted successfully');
      loadDepartments();
    } catch (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      contact_email: '',
      contact_phone: '',
      head_name: '',
      categories: [],
      status: 'active'
    });
  };

  const openEditDialog = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      contact_email: department.contact_email,
      contact_phone: department.contact_phone,
      head_name: department.head_name,
      categories: department.categories,
      status: department.status
    });
    setIsEditDialogOpen(true);
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.head_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getDepartmentStats = (departmentId: string) => {
    return stats.find(stat => stat.department_name === departments.find(d => d.id === departmentId)?.name);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-gray-600">Manage government departments and their assignments</p>
        </div>
        <div className="flex gap-2">
          {departments.length === 0 && (
            <Button onClick={initializeDepartments} disabled={isInitializing}>
              {isInitializing ? 'Initializing...' : 'Initialize Departments'}
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Department</DialogTitle>
                <DialogDescription>
                  Add a new government department to handle civic grievances
                </DialogDescription>
              </DialogHeader>
              <DepartmentForm 
                formData={formData} 
                setFormData={setFormData} 
                onSubmit={createDepartment}
                submitText="Create Department"
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => {
          const departmentStats = getDepartmentStats(department.id);
          return (
            <Card key={department.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{department.name}</CardTitle>
                  </div>
                  <Badge variant={department.status === 'active' ? 'default' : 'secondary'}>
                    {department.status}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {department.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Head:</span>
                    <span>{department.head_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Email:</span>
                    <span className="text-blue-600">{department.contact_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Phone:</span>
                    <span>{department.contact_phone}</span>
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <p className="text-sm font-medium mb-2">Categories:</p>
                  <div className="flex flex-wrap gap-1">
                    {department.categories.slice(0, 3).map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {department.categories.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{department.categories.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stats */}
                {departmentStats && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{departmentStats.total_grievances}</p>
                      <p className="text-xs text-gray-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{departmentStats.resolved_grievances}</p>
                      <p className="text-xs text-gray-600">Resolved</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(department)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteDepartment(department.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information and settings
            </DialogDescription>
          </DialogHeader>
          <DepartmentForm 
            formData={formData} 
            setFormData={setFormData} 
            onSubmit={updateDepartment}
            submitText="Update Department"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Department Form Component
function DepartmentForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  submitText 
}: {
  formData: DepartmentFormData;
  setFormData: (data: DepartmentFormData) => void;
  onSubmit: () => void;
  submitText: string;
}) {
  const [categoriesInput, setCategoriesInput] = useState('');

  const addCategory = () => {
    if (categoriesInput.trim() && !formData.categories.includes(categoriesInput.trim())) {
      setFormData({
        ...formData,
        categories: [...formData.categories, categoriesInput.trim()]
      });
      setCategoriesInput('');
    }
  };

  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c: string) => c !== category)
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Department Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Public Works Department"
          />
        </div>
        <div>
          <Label htmlFor="head_name">Head Name</Label>
          <Input
            id="head_name"
            value={formData.head_name}
            onChange={(e) => setFormData({ ...formData, head_name: e.target.value })}
            placeholder="e.g., Chief Engineer"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the department's responsibilities..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            placeholder="department@example.com"
          />
        </div>
        <div>
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            placeholder="+91-11-2345-6789"
          />
        </div>
      </div>

      <div>
        <Label>Categories</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={categoriesInput}
            onChange={(e) => setCategoriesInput(e.target.value)}
            placeholder="Add category (e.g., infrastructure)"
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          />
          <Button type="button" onClick={addCategory} size="sm">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {formData.categories.map((category: string) => (
            <Badge key={category} variant="outline" className="text-xs">
              {category}
              <button
                onClick={() => removeCategory(category)}
                className="ml-1 text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Cancel
        </Button>
        <Button onClick={onSubmit}>
          {submitText}
        </Button>
      </div>
    </div>
  );
}
