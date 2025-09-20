import { api, API_ENDPOINTS } from './api';

// Types
export interface ImageUploadResponse {
  id: string;
  url: string;
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  size: number;
  created_at: string;
}

export interface ImageAnalysisResponse {
  id: string;
  url: string;
  analysis: {
    category: string;
    confidence: number;
    suggested_department: string;
    tags: string[];
    description: string;
  };
  created_at: string;
}

export interface ImageUploadOptions {
  folder?: string;
  transformation?: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
  };
}

// Image Service
export class ImageService {
  private static instance: ImageService;

  private constructor() {}

  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  // Upload image
  async uploadImage(
    file: File,
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.transformation) {
        formData.append('transformation', JSON.stringify(options.transformation));
      }

      const response = await api.post(API_ENDPOINTS.IMAGES.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to upload image');
    }
  }

  // Upload multiple images
  async uploadImages(
    files: File[],
    options: ImageUploadOptions = {}
  ): Promise<ImageUploadResponse[]> {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, options));
      return await Promise.all(uploadPromises);
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to upload images');
    }
  }

  // Analyze image
  async analyzeImage(imageId: string): Promise<ImageAnalysisResponse> {
    try {
      const response = await api.post(API_ENDPOINTS.IMAGES.ANALYZE, {
        image_id: imageId,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to analyze image');
    }
  }

  // Delete image
  async deleteImage(imageId: string): Promise<void> {
    try {
      await api.delete(API_ENDPOINTS.IMAGES.DELETE(imageId));
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || 'Failed to delete image');
    }
  }

  // Get image URL with transformations
  getImageUrl(
    publicId: string,
    transformations?: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'jpg' | 'png' | 'webp';
      crop?: 'fill' | 'fit' | 'scale' | 'crop';
      gravity?: 'auto' | 'center' | 'north' | 'south' | 'east' | 'west';
    }
  ): string {
    const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    if (!transformations) {
      return `${baseUrl}/${publicId}`;
    }

    const transformParts: string[] = [];
    
    if (transformations.width) transformParts.push(`w_${transformations.width}`);
    if (transformations.height) transformParts.push(`h_${transformations.height}`);
    if (transformations.quality) transformParts.push(`q_${transformations.quality}`);
    if (transformations.format) transformParts.push(`f_${transformations.format}`);
    if (transformations.crop) transformParts.push(`c_${transformations.crop}`);
    if (transformations.gravity) transformParts.push(`g_${transformations.gravity}`);

    const transformString = transformParts.join(',');
    return `${baseUrl}/${transformString}/${publicId}`;
  }

  // Validate file type
  validateFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return allowedTypes.includes(file.type);
  }

  // Validate file size
  validateFileSize(file: File, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  // Get file size in MB
  getFileSizeMB(file: File): number {
    return file.size / (1024 * 1024);
  }

  // Compress image before upload
  async compressImage(
    file: File,
    maxWidth: number = 1920,
    maxHeight: number = 1080,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// Export singleton instance
export const imageService = ImageService.getInstance();
