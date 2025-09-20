'use client';

import { useMapEvents } from 'react-leaflet';

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}
