import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fijar el icono de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface CreateRouteProps {
  onClose: () => void;
  onSuccess: () => void;
  initialRoute?: any; // Para modo edición
}

interface NewClient {
  id?: number; // Para clientes existentes
  lat: number;
  lng: number;
  name: string;
}

const RoutingControl = ({ clients }: { clients: NewClient[] }) => {
  const map = useMap();

  useEffect(() => {
    if (clients.length < 2) return;

    const waypoints = clients.map(c => L.latLng(c.lat, c.lng));

    const routingControl = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      show: false,
      fitSelectedRoutes: false,
      lineOptions: {
        styles: [{ color: '#92dce5', weight: 4, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 1
      },
      router: L.Routing.osrmv1({
         serviceUrl: 'https://router.project-osrm.org/route/v1',
         profile: 'driving' // Usamos driving porque la data peatonal en OSRM tiene errores y da vueltas innecesarias
      })
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        try {
          // Intentar remover solo si el contenedor del mapa aún existe
          if (map.getContainer()) {
            map.removeControl(routingControl);
          }
        } catch (e) {
          // Si el mapa ya se desmontó, ignoramos el error
          console.log('Routing control ya removido o mapa inexistente');
        }
      }
    };
  }, [clients, map]);

  return null;
};

const LocationPicker = ({ onAdd }: { onAdd: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const CreateRouteModal: React.FC<CreateRouteProps> = ({ onClose, onSuccess, initialRoute }) => {
  const [routeName, setRouteName] = useState('');
  const [workerId, setWorkerId] = useState('');
  const [workers, setWorkers] = useState<any[]>([]);
  const [clients, setClients] = useState<NewClient[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWorkers = async () => {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('http://localhost:3009/users/workers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(res.data);
    };
    fetchWorkers();

    if (initialRoute) {
      setRouteName(initialRoute.name || '');
      setWorkerId(initialRoute.worker?.id?.toString() || '');
      if (initialRoute.clients) {
        const mappedClients = initialRoute.clients.map((c: any) => ({
          id: c.id,
          name: c.name,
          lat: c.location.coordinates[1],
          lng: c.location.coordinates[0]
        }));
        setClients(mappedClients);
      }
    }
  }, [initialRoute]);

  const handleAddClient = (lat: number, lng: number) => {
    setClients(prev => [...prev, { lat, lng, name: `Destino ${prev.length + 1}` }]);
  };

  const handleRemoveClient = (index: number) => {
    setClients(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateClientName = (index: number, newName: string) => {
    setClients(prev => {
      const newClients = [...prev];
      newClients[index] = { ...newClients[index], name: newName };
      return newClients;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId || clients.length === 0) return alert('Debes seleccionar un trabajador y al menos un destino');
    
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      const payload = {
        name: routeName || `Ruta ${new Date().toLocaleDateString()}`,
        assigned_date: initialRoute?.assigned_date || new Date().toISOString().split('T')[0],
        worker: { id: parseInt(workerId) },
        clients: clients.map((c, i) => ({
          id: c.id, // Importante para persistir existentes
          name: c.name,
          address: `Lat: ${c.lat.toFixed(4)}, Lng: ${c.lng.toFixed(4)}`,
          location: { type: 'Point', coordinates: [c.lng, c.lat] },
          visit_order: i + 1
        }))
      };

      if (initialRoute) {
        await axios.patch(`http://localhost:3009/routes/${initialRoute.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:3009/routes', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      onSuccess();
    } catch (err) {
      console.error(err);
      alert('Error guardando ruta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', zIndex: 1000, padding: '2rem' }}>
      <div className="glass-panel" style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 0 }}>
        
        {/* Form Sidebar */}
        <div style={{ width: '350px', background: 'rgba(0, 0, 0, 0.9)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <h3>{initialRoute ? 'Editor de Ruta' : 'Diseñador de Rutas'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {initialRoute ? 'Edita los pines existentes o añade nuevos.' : 'Haz click en el mapa para añadir pines de clientes.'}
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0 }}>
            <div>
              <label>Nombre de Ruta (opcional)</label>
              <input type="text" value={routeName} onChange={e => setRouteName(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: 'var(--surface-light)', border: 'none', color: 'var(--text-main)', borderRadius: '4px' }}/>
            </div>

            <div>
              <label>Asignar Trabajador *</label>
              <select value={workerId} onChange={e => setWorkerId(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', background: 'var(--surface-light)', border: 'none', color: 'var(--text-main)', borderRadius: '4px' }}>
                <option value="">-- Seleccionar --</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id} style={{ background: 'var(--bg-color)' }}>{w.name} ({w.email})</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', marginTop: '1rem', paddingRight: '0.5rem' }}>
              <h4>Puntos de Visita ({clients.length})</h4>
              {clients.map((c, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.05)', padding: '0.8rem', marginTop: '0.5rem', borderRadius: '4px', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>#{idx + 1}</span>
                    <button type="button" onClick={() => handleRemoveClient(idx)} style={{ background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
                  </div>
                  <input 
                    type="text" 
                    value={c.name} 
                    onChange={e => handleUpdateClientName(idx, e.target.value)} 
                    placeholder="Nombre del punto"
                    style={{ width: '100%', padding: '0.4rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--surface-border)', color: 'var(--text-main)', borderRadius: '4px', fontSize: '0.85rem' }}
                  />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexShrink: 0 }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.8rem', background: 'var(--primary-color)', border: 'none', color: 'var(--bg-color)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Guardando...' : initialRoute ? 'Actualizar' : 'Crear Ruta'}</button>
            </div>
          </form>
        </div>

        {/* Map Area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer center={[-12.0464, -77.0428]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            <LocationPicker onAdd={handleAddClient} />
            <RoutingControl clients={clients} />
            {clients.map((c, idx) => (
              <Marker key={idx} position={[c.lat, c.lng]}>
                <Popup>{c.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
