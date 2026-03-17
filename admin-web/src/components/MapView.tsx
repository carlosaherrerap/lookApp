import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fijar el icono de Leaflet para Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker for Workers
const workerIcon = L.divIcon({
  className: 'custom-marker',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapViewProps {
  workers?: Array<{ id: number, name: string, lat: number, lng: number, status: string }>;
}

export const MapView: React.FC<MapViewProps> = ({ workers = [] }) => {
  // Centro por defecto (Puede ser Lima, Perú o la ubicación central de la empresa)
  const defaultCenter: [number, number] = [-12.0464, -77.0428];

  return (
    <div className="map-container glass-panel">
      <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {workers.map(w => (
          <Marker key={w.id} position={[w.lat, w.lng]} icon={workerIcon}>
            <Popup>
              <strong>{w.name}</strong><br />
              Status: {w.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
