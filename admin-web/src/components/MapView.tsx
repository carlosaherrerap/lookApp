import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const workerIcon = L.divIcon({
  className: '',
  html: `<div style="width:14px;height:14px;background:#0078D4;border:2px solid #00B4D8;border-radius:50%;box-shadow:0 0 8px #0078D4"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

interface RoutePoint { latitude: number; longitude: number; }

async function fetchOsrmRoute(waypoints: { lat: number; lng: number }[]): Promise<RoutePoint[]> {
  if (waypoints.length < 2) return [];
  try {
    const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
    const json = await res.json();
    if (json.routes?.[0]) {
      return json.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng }));
    }
    return waypoints.map(w => ({ latitude: w.lat, longitude: w.lng }));
  } catch {
    return waypoints.map(w => ({ latitude: w.lat, longitude: w.lng }));
  }
}

interface MapViewProps {
  workers?: Array<{ id: number, name: string, lat: number, lng: number, status: string }>;
  routeClients?: Array<{ lat: number, lng: number, name: string }>;
}

const EMPTY_ARRAY: any[] = [];

export const MapView: React.FC<MapViewProps> = ({ workers = EMPTY_ARRAY, routeClients = EMPTY_ARRAY }) => {
  const defaultCenter: [number, number] = [-12.0464, -77.0428];
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  useEffect(() => {
    if (routeClients.length >= 2) {
      // Mostrar línea recta inmediata para evitar percepción de lentitud
      const straightPath = routeClients.map(c => [c.lat, c.lng] as [number, number]);
      setRoutePath(straightPath);

      // Cargar ruta real por calles (OSRM) en segundo plano
      fetchOsrmRoute(routeClients.map(c => ({ lat: c.lat, lng: c.lng })))
        .then(pts => {
          if (pts && pts.length > 1) {
            setRoutePath(pts.map(p => [p.latitude, p.longitude] as [number, number]));
          }
        });
    } else if (routePath.length > 0) {
      setRoutePath([]);
    }
  }, [routeClients]);

  return (
    <div className="map-container glass-panel">
      <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Route polyline via OSRM */}
        {routePath.length > 1 && (
          <Polyline positions={routePath} color="#0078D4" weight={5} opacity={0.8} />
        )}

        {/* Route client markers */}
        {routeClients.map((c, i) => (
          <Marker key={`rc-${i}`} position={[c.lat, c.lng]}>
            <Popup><strong>{c.name}</strong></Popup>
          </Marker>
        ))}

        {/* Live worker markers */}
        {workers.map(w => (
          <Marker key={w.id} position={[w.lat, w.lng]} icon={workerIcon}>
            <Popup>
              <strong>{w.name}</strong><br />
              {w.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
