'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  MapPin, 
  Camera, 
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  Brain,
  ArrowRight
} from 'lucide-react';
import { authService, User } from '@/lib/auth';
import { grievanceService, GrievanceCategory, GrievancePriority } from '@/lib/grievances';
import { imageService } from '@/lib/images';
import api from '@/lib/api';
import { toast } from 'sonner';
import LocationMap from '@/components/location-map';

const grievanceSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['infrastructure', 'sanitation', 'transportation', 'utilities', 'safety', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number(),
    }),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: z.string().optional(),
  }),
  images: z.array(z.any()).min(1, 'At least 1 image is required').max(5, 'Maximum 5 images allowed'),
});

type GrievanceFormData = z.infer<typeof grievanceSchema>;

export default function NewGrievancePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<Record<string, unknown> | null>(null);
  const [suggestedDepartment, setSuggestedDepartment] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [location, setLocation] = useState<{ 
    lat: number; 
    lng: number; 
    address: string;
    city: string;
    state: string;
    pincode?: string;
  } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<GrievanceFormData>({
    resolver: zodResolver(grievanceSchema),
    defaultValues: {
      priority: 'medium',
      category: 'infrastructure',
    },
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const currentUser = authService.getCurrentUserSync();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  // Sync images with form validation
  useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  // Detect current location
  const detectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      setMapCenter({ lat: latitude, lng: longitude });
      setSelectedLocation({ lat: latitude, lng: longitude });
      
      // Geocode the location
      await geocodeLocation(latitude, longitude);
      
    } catch (error: unknown) {
      console.error('Error detecting location:', error);
      toast.error('Could not detect your location. Please select manually on the map.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Geocode coordinates to get address details
  const geocodeLocation = async (lat: number, lng: number) => {
    try {
      // Using a free geocoding service (you can replace with Google Maps API)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data.city && data.principalSubdivision) {
        setLocation({
          lat,
          lng,
          address: data.locality || data.city || 'Unknown Address',
          city: data.city || 'Unknown City',
          state: data.principalSubdivision || 'Unknown State',
          pincode: data.postcode || undefined,
        });
        
        // Update form values
        setValue('location.address', data.locality || data.city || 'Unknown Address');
        setValue('location.coordinates.lat', lat);
        setValue('location.coordinates.lng', lng);
        setValue('location.city', data.city || 'Unknown City');
        setValue('location.state', data.principalSubdivision || 'Unknown State');
        if (data.postcode) {
          setValue('location.pincode', data.postcode);
        }
      } else {
        throw new Error('Could not get address details');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to basic location
      setLocation({
        lat,
        lng,
        address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        city: 'Unknown City',
        state: 'Unknown State',
      });
      
      setValue('location.address', `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      setValue('location.coordinates.lat', lat);
      setValue('location.coordinates.lng', lng);
      setValue('location.city', 'Unknown City');
      setValue('location.state', 'Unknown State');
    }
  };

  // Handle map click for location selection
  const handleMapClick = async (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    await geocodeLocation(lat, lng);
  };

  // Watch form data for validation only (no automatic AI analysis)
  const watchedValues = watch();
  
  // Debug form errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('Form validation errors:', errors);
    }
  }, [errors]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast.error('Some files were invalid. Please upload only images under 5MB.');
    }

    const newImages = [...images, ...validFiles].slice(0, 5); // Max 5 images
    setImages(newImages);
    setValue('images', newImages); // Sync with form
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue('images', newImages); // Sync with form
    // Reset AI analysis when images are removed
    setAiAnalysis(null);
    setSuggestedDepartment('');
  };

  const analyzeContent = async (title: string, description: string) => {
    console.log('analyzeContent called with:', { title, description });
    setIsAnalyzing(true);
    try {
      // Call backend AI service for analysis
      const response = await api.post('/images/analyze-text', {
        title,
        description
      });
      
      const aiResult = response.data;
      console.log('Backend AI analysis result:', aiResult);
      
      setAiAnalysis({
        category: aiResult.category,
        confidence: aiResult.confidence,
        suggested_department: aiResult.suggested_department,
        auto_priority: aiResult.auto_priority,
        labels: aiResult.labels
      });
      setSuggestedDepartment(aiResult.suggested_department || 'Municipal Corporation');
      console.log('AI analysis completed successfully');
    } catch (error) {
      console.error('Error analyzing content:', error);
      // Fallback to simple keyword analysis if backend fails
      try {
        const content = `${title} ${description}`.toLowerCase();
        console.log('Content to analyze (fallback):', content);
      
      const departmentMapping = {
        // Public Works Department (PWD) - Roads, bridges, infrastructure
        'pothole': 'Public Works Department (PWD)',
        'road': 'Public Works Department (PWD)',
        'street': 'Public Works Department (PWD)',
        'bridge': 'Public Works Department (PWD)',
        'sidewalk': 'Public Works Department (PWD)',
        'footpath': 'Public Works Department (PWD)',
        'pavement': 'Public Works Department (PWD)',
        'asphalt': 'Public Works Department (PWD)',
        'concrete': 'Public Works Department (PWD)',
        'construction': 'Public Works Department (PWD)',
        'repair': 'Public Works Department (PWD)',
        'damage': 'Public Works Department (PWD)',
        
        // Electricity Department - Power, lights, electrical infrastructure
        'light': 'Electricity Department',
        'street light': 'Electricity Department',
        'lamp': 'Electricity Department',
        'power': 'Electricity Department',
        'electricity': 'Electricity Department',
        'electrical': 'Electricity Department',
        'wire': 'Electricity Department',
        'cable': 'Electricity Department',
        'pole': 'Electricity Department',
        'utility pole': 'Electricity Department',
        'transformer': 'Electricity Department',
        'fuse': 'Electricity Department',
        'outage': 'Electricity Department',
        'blackout': 'Electricity Department',
        'voltage': 'Electricity Department',
        'electrical hazard': 'Electricity Department',
        'fallen pole': 'Electricity Department',
        'broken wire': 'Electricity Department',
        'exposed wire': 'Electricity Department',
        'electrical emergency': 'Electricity Department',
        'tangled': 'Electricity Department',
        'hanging': 'Electricity Department',
        'dangerous': 'Electricity Department',
        'hazard': 'Electricity Department',
        'infrastructure': 'Electricity Department',
        'utility': 'Electricity Department',
        'power line': 'Electricity Department',
        'electrical line': 'Electricity Department',
        'overhead': 'Electricity Department',
        'downed': 'Electricity Department',
        
        // Transport Department - Traffic, signals, parking
        'traffic': 'Transport Department',
        'signal': 'Transport Department',
        'parking': 'Transport Department',
        'bus stop': 'Transport Department',
        'traffic light': 'Transport Department',
        'road sign': 'Transport Department',
        'speed bump': 'Transport Department',
        'zebra crossing': 'Transport Department',
        'traffic jam': 'Transport Department',
        'vehicle': 'Transport Department',
        
        // Municipal Corporation - Garbage, sanitation, general civic issues
        'garbage': 'Municipal Corporation',
        'trash': 'Municipal Corporation',
        'waste': 'Municipal Corporation',
        'drainage': 'Municipal Corporation',
        'sewer': 'Municipal Corporation',
        'drain': 'Municipal Corporation',
        'cleaning': 'Municipal Corporation',
        'sanitation': 'Municipal Corporation',
        'public toilet': 'Municipal Corporation',
        'community': 'Municipal Corporation',
        'civic': 'Municipal Corporation',
        'municipal': 'Municipal Corporation',
        
        // Water Supply Department - Water, pipes, leaks
        'water': 'Water Supply Department',
        'pipe': 'Water Supply Department',
        'leak': 'Water Supply Department',
        'supply': 'Water Supply Department',
        'tank': 'Water Supply Department',
        'pump': 'Water Supply Department',
        'valve': 'Water Supply Department',
        'faucet': 'Water Supply Department',
        'tap': 'Water Supply Department',
        'shortage': 'Water Supply Department',
        'pressure': 'Water Supply Department',
        
        // Police Department - Safety, accidents, emergencies
        'accident': 'Police Department',
        'safety': 'Police Department',
        'emergency': 'Police Department',
        'crime': 'Police Department',
        'theft': 'Police Department',
        'vandalism': 'Police Department',
        'security': 'Police Department',
        'crowd': 'Police Department',
        'disturbance': 'Police Department',
        'fight': 'Police Department',
        'noise': 'Police Department',
        
        // Environment Department - Pollution, trees, parks
        'pollution': 'Environment Department',
        'tree': 'Environment Department',
        'park': 'Environment Department',
        'garden': 'Environment Department',
        'air': 'Environment Department',
        'noise pollution': 'Environment Department',
        'air pollution': 'Environment Department',
        'green': 'Environment Department',
        'plant': 'Environment Department',
        'wildlife': 'Environment Department'
      };

      // Department scoring system
      const departmentScores: { [key: string]: number } = {
        'Public Works Department (PWD)': 0,
        'Electricity Department': 0,
        'Transport Department': 0,
        'Municipal Corporation': 0,
        'Water Supply Department': 0,
        'Police Department': 0,
        'Environment Department': 0
      };

      // Score each department based on keyword matches
      for (const [keyword, department] of Object.entries(departmentMapping)) {
        if (content.includes(keyword)) {
          // Give higher scores for more specific keywords
          const keywordWeight = keyword.includes(' ') ? 2 : 1; // Multi-word keywords get higher weight
          departmentScores[department] += keywordWeight;
          console.log(`Found keyword "${keyword}" for ${department}, score: ${departmentScores[department]}`);
        }
      }

      // Find the department with the highest score
      let suggestedDept = 'Municipal Corporation'; // Default fallback
      let maxScore = 0;
      let confidence = 0;

      for (const [department, score] of Object.entries(departmentScores)) {
        if (score > maxScore) {
          maxScore = score;
          suggestedDept = department;
        }
      }

      // Calculate confidence based on score
      if (maxScore > 0) {
        confidence = Math.min(0.9, 0.5 + (maxScore * 0.1)); // 0.5 to 0.9 based on score
      } else {
        confidence = 0.3; // Low confidence for default assignment
      }

      console.log('Department scores:', departmentScores);
      console.log('Selected department:', suggestedDept, 'with score:', maxScore, 'confidence:', confidence);

      console.log('Setting AI analysis:', { suggestedDept, confidence });
      setAiAnalysis({
        category: 'infrastructure', // Simplified
        confidence,
        suggested_department: suggestedDept
      });
      setSuggestedDepartment(suggestedDept);
      console.log('AI analysis completed successfully (fallback)');
      toast.warning('Using fallback analysis - backend AI service unavailable');
      } catch (fallbackError) {
        console.error('Error in fallback analysis:', fallbackError);
        toast.error('Failed to analyze content. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const uploadImages = async (files: File[]) => {
    if (files.length === 0) return [];

    setIsUploadingImages(true);
    try {
      const uploadPromises = files.map(file => imageService.uploadImage(file));
      const results = await Promise.all(uploadPromises);
      
      console.log('Upload results:', results);
      
      // Convert ImageUploadResponse to ImageMetadata format expected by backend
      const imageMetadata = results.map(result => {
        console.log('Processing result:', result);
        const metadata = {
          url: result.url,
          public_id: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.size,
          uploaded_at: result.created_at || new Date().toISOString() // Use Cloudinary's created_at or current timestamp
        };
        console.log('Created metadata:', metadata);
        return metadata;
      });
      
      console.log('Converted image metadata:', imageMetadata);
      return imageMetadata;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw new Error('Failed to upload images');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const onSubmit = async (data: GrievanceFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Images state:', images);
    console.log('Location state:', location);
    console.log('Selected location:', selectedLocation);
    
    setIsLoading(true);
    setError('');

    try {
      // Validate images
      if (images.length === 0) {
        throw new Error('At least 1 image is required');
      }
      if (images.length > 5) {
        throw new Error('Maximum 5 images allowed');
      }

      // Validate location
      if (!location || !selectedLocation) {
        throw new Error('Please select a location on the map');
      }

      // Upload images first
      const imageMetadata = await uploadImages(images);

      // Create grievance with location and images
      const grievanceData = {
        ...data,
        location: {
          address: location.address,
          coordinates: [selectedLocation.lng, selectedLocation.lat] as [number, number], // Note: [lng, lat] for backend
          city: location.city,
          state: location.state,
          pincode: location.pincode,
        },
        images: imageMetadata,
      };

      console.log('Final grievance data being sent:', JSON.stringify(grievanceData, null, 2));
      await grievanceService.createGrievance(grievanceData);
      toast.success('Grievance reported successfully!');
      router.push('/dashboard/grievances');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create grievance';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Report New Issue</h1>
        <p className="text-gray-600 mt-1">
          Help improve your community by reporting civic issues
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue Details</CardTitle>
                <CardDescription>
                  Provide detailed information about the issue you've encountered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Form validation errors */}
                {Object.keys(errors).length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Please fix the following errors:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {errors.title && <li>Title: {errors.title.message}</li>}
                          {errors.description && <li>Description: {errors.description.message}</li>}
                          {errors.category && <li>Category: {errors.category.message}</li>}
                          {errors.priority && <li>Priority: {errors.priority.message}</li>}
                          {errors.location && <li>Location: {errors.location.message}</li>}
                          {errors.images && <li>Images: {errors.images.message}</li>}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    {...register('title')}
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide detailed information about the issue, including when you noticed it and any relevant context"
                    rows={4}
                    {...register('description')}
                    disabled={isLoading}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={watch('category')}
                      onValueChange={(value) => setValue('category', value as GrievanceCategory)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="sanitation">Sanitation</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="safety">Safety</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority *</Label>
                    <Select
                      value={watch('priority')}
                      onValueChange={(value) => setValue('priority', value as GrievancePriority)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-sm text-red-600">{errors.priority.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Section */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  AI Analysis
                  {isAnalyzing && <Loader2 className="h-4 w-4 animate-spin" />}
                </CardTitle>
                <CardDescription>
                  {images.length > 0 
                    ? "Our AI is analyzing your issue to suggest the best department"
                    : "Upload images to enable AI analysis and department suggestion"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {images.length === 0 ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <AlertCircle className="h-5 w-5" />
                    <span>Please upload images to enable AI analysis</span>
                  </div>
                ) : isAnalyzing ? (
                  <div className="flex items-center gap-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing your issue...</span>
                  </div>
                ) : aiAnalysis && suggestedDepartment ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Analysis Complete</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Suggested Department:</p>
                        <p className="font-medium">{suggestedDepartment}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600">
                      This grievance will be automatically assigned to the suggested department for faster processing.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Brain className="h-5 w-5" />
                    <span>Click &quot;Clarify with AI Analysis&quot; button below to get department suggestion</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Image Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Photos (Required)</CardTitle>
                <CardDescription>
                  Upload 1-5 photos to help illustrate the issue and enable AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="images" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload photos
                        </span>
                        <span className="mt-1 block text-sm text-gray-500">
                          PNG, JPG, GIF up to 5MB each (Required: 1-5 images)
                        </span>
                      </Label>
                      <Input
                        id="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isLoading || isUploadingImages}
                      />
                    </div>
                  </div>
                </div>

                {images.length > 0 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                            disabled={isLoading}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Clarify Button */}
                    <div className="flex justify-center">
                      <Button
                        type="button"
                        onClick={async () => {
                          console.log('Clarify button clicked');
                          console.log('Title:', watchedValues.title);
                          console.log('Description:', watchedValues.description);
                          console.log('Images count:', images.length);
                          
                          if (watchedValues.title && watchedValues.description && images.length > 0) {
                            console.log('Starting AI analysis...');
                            await analyzeContent(watchedValues.title, watchedValues.description);
                          } else {
                            console.log('Missing requirements for analysis');
                            toast.error('Please fill in title, description, and upload images before analyzing');
                          }
                        }}
                        disabled={isAnalyzing || !watchedValues.title || !watchedValues.description || images.length === 0}
                        className="flex items-center gap-2"
                      >
                        <Brain className="h-4 w-4" />
                        {isAnalyzing ? 'Analyzing...' : 'Clarify with AI Analysis'}
                      </Button>
                    </div>
                  </div>
                )}

                {isUploadingImages && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Uploading images...</span>
                  </div>
                )}

                {/* Image validation errors */}
                {errors.images && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errors.images.message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Location & Submit */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Issue Location
                </CardTitle>
                <CardDescription>
                  Select the exact location where the issue is occurring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Interactive Map */}
                <LocationMap
                  onLocationSelect={handleMapClick}
                  selectedLocation={selectedLocation}
                  center={mapCenter}
                  className="h-80"
                />

                {/* Location Details */}
                {location && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium">Address</Label>
                      <p className="text-sm text-gray-600">{location.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">City</Label>
                      <p className="text-sm text-gray-600">{location.city}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">State</Label>
                      <p className="text-sm text-gray-600">{location.state}</p>
                    </div>
                    {location.pincode && (
                      <div>
                        <Label className="text-sm font-medium">Pincode</Label>
                        <p className="text-sm text-gray-600">{location.pincode}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Location validation errors */}
                {errors.location && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {errors.location.message || 'Please select a location on the map'}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Before submitting:</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Ensure all information is accurate</li>
                    <li>• Upload 1-5 clear photos of the issue (Required)</li>
                    <li>• Select the exact location on the map (Required)</li>
                    <li>• You'll receive updates on the resolution progress</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || isUploadingImages}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </div>
  );
}
