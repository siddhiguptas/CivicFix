'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import MapClickHandler from './map-click-handler';

// Dynamically import the map component to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  ),
});

const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), {
  ssr: false,
});

const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), {
  ssr: false,
});

const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), {
  ssr: false,
});


interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
  center?: { lat: number; lng: number };
  className?: string;
}

export default function LocationMap({ 
  onLocationSelect, 
  selectedLocation, 
  center = { lat: 28.6139, lng: 77.2090 },
  className = "h-64"
}: LocationMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationPermission('denied');
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    try {
      setLocationPermission('prompt');
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve, 
          (error) => {
            console.error('Geolocation error:', error);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000, // 5 minutes
          }
        );
      });

      const { latitude, longitude } = position.coords;
      setMapCenter({ lat: latitude, lng: longitude });
      onLocationSelect(latitude, longitude);
      setLocationPermission('granted');
      toast.success('Location detected successfully!');
    } catch (error: any) {
      console.error('Error detecting location:', error);
      
      let errorMessage = 'Failed to detect location';
      if (error.code === 1) {
        errorMessage = 'Location access denied. Please enable location access in your browser settings.';
        setLocationPermission('denied');
      } else if (error.code === 2) {
        errorMessage = 'Location unavailable. Please check your GPS settings.';
        setLocationPermission('denied');
      } else if (error.code === 3) {
        errorMessage = 'Location request timed out. Please try again.';
        setLocationPermission('denied');
      }
      
      toast.error(errorMessage);
    }
  };

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    onLocationSelect(lat, lng);
  };

  if (!isClient) {
    return (
      <div className={`w-full ${className} bg-gray-200 rounded-lg flex items-center justify-center`}>
        <div className="text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Location Detection Button */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={detectCurrentLocation}
          className="flex items-center gap-2"
        >
          <Navigation className="h-4 w-4" />
          Use My Location
        </Button>
        
        {locationPermission === 'granted' && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <MapPin className="h-4 w-4" />
            <span>Location access granted</span>
          </div>
        )}
        
        {locationPermission === 'denied' && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Location access denied</span>
          </div>
        )}
      </div>

      {/* Map */}
      <div className={`w-full ${className} rounded-lg overflow-hidden border-2 border-gray-300`}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onLocationSelect={handleMapClick} />
          
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <p className="font-medium">Selected Location</p>
                  <p className="text-sm text-gray-600">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Click anywhere on the map to select the exact location of the issue
        </p>
        {selectedLocation && (
          <p className="text-xs text-gray-500 mt-1">
            Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        )}
      </div>

      {/* Permission Alert */}
      {locationPermission === 'denied' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Location access is required to detect your current position. Please enable location access in your browser settings and refresh the page.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
