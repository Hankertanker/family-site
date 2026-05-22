'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Footprint {
  id: number;
  title: string;
  latitude: number;
  longitude: number;
  color: string;
  visit_date?: string | null;
}

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView({ footprints }: { footprints: Footprint[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [34.26, 108.94], // Xi'an
      zoom: 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear old markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) layer.remove();
    });

    if (footprints.length === 0) return;

    footprints.forEach((fp) => {
      const color = fp.color || '#3B82F6';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([fp.latitude, fp.longitude], { icon }).addTo(map);
      marker.bindPopup(`<b>${fp.title}</b>${fp.visit_date ? `<br/><span style="color:#999;font-size:12px">${fp.visit_date}</span>` : ''}`);
    });

    // Fit bounds if multiple points
    if (footprints.length > 1) {
      const bounds = L.latLngBounds(footprints.map(fp => [fp.latitude, fp.longitude] as L.LatLngTuple));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView([footprints[0].latitude, footprints[0].longitude], 10);
    }
  }, [footprints]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}
