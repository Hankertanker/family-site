'use client';

import { useState, useRef, useEffect } from 'react';
import { Input, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, name: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapPicker({ onLocationSelect, initialLat, initialLng }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  // Init map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current, {
      center: [34.26, 108.94],
      zoom: 5,
      zoomControl: true,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);
    mapInstance.current = map;

    // Click on map to select
    map.on('click', (e: L.LeafletMouseEvent) => {
      setMarker(e.latlng.lat, e.latlng.lng);
      // Reverse geocode
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json&accept-language=zh`)
        .then(r => r.json())
        .then(data => {
          const name = data.display_name?.split(',')[0] || '未知地点';
          setQuery(name);
          onLocationSelect(e.latlng.lat, e.latlng.lng, name);
        })
        .catch(() => {});
    });

    return () => { map.remove(); mapInstance.current = null; };
  }, [onLocationSelect]);

  function setMarker(lat: number, lng: number) {
    const map = mapInstance.current;
    if (!map) return;
    if (markerRef.current) markerRef.current.remove();
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    map.setView([lat, lng], 12);
  }

  // Search for address
  async function handleSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=zh`
      );
      const data = await res.json();
      if (data.length > 0) {
        const place = data[0];
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        setMarker(lat, lng);
        onLocationSelect(lat, lng, place.display_name);
        message.success(`已定位到：${place.display_name.split(',')[0]}`);
      } else {
        message.warning('未找到该地点，试试更具体的名称');
      }
    } catch {
      message.error('搜索失败');
    }
    setSearching(false);
  }

  return (
    <div className="space-y-2">
      <Input.Search
        placeholder="输入地名，如：西安钟楼、大雁塔"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onSearch={handleSearch}
        loading={searching}
        enterButton="搜索"
        className="mb-2"
      />
      <div ref={mapRef} className="rounded-xl overflow-hidden border border-stone-200" style={{ height: 250 }} />
      <p className="text-xs text-stone-400">搜索地点 或 点击地图直接选点</p>
    </div>
  );
}
