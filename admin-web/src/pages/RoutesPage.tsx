import React, { useEffect, useState } from 'react';
import { MapPin, ChevronRight, RefreshCw, PlusCircle } from 'lucide-react';
import axios from 'axios';
import { CreateRouteModal } from './CreateRouteModal';

export const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);

  const openEditModal = (route: any) => {
    setSelectedRoute(route);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoute(null);
  };

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get('http://localhost:3009/routes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoutes(res.data);
    } catch (error) {
      console.error('Error cargando rutas', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  return (
    <div className="main-content">
      <div className="header">
        <h2>Control de Rutas</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={fetchRoutes} style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-main)', padding: '0.75rem 1rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={18} />
          </button>
          <button onClick={() => setIsModalOpen(true)} style={{ background: 'var(--primary-color)', color: 'var(--bg-color)', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={18} /> Nueva Ruta Map X
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {loading ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Cargando rutas operativas...</div>
        ) : routes.map(r => (
          <div key={r.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(146, 220, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin color="var(--primary-color)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem' }}>Ruta #{r.id} - {r.name || 'Sin Título'}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Trabajador: {r.worker?.name} • Asignada: {r.assigned_date} • {r.clients?.length || 0} Visitas Totales</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Progreso</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `0%`, height: '100%', background: 'var(--success-color)', borderRadius: '3px' }}></div>
                   </div>
                   <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>0/{r.clients?.length || 0}</span>
                </div>
              </div>

              <span style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.8rem', background: r.status === 'completed' || r.status === 'completado' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(146, 220, 229, 0.1)', color: r.status === 'completed' || r.status === 'completado' ? 'var(--success-color)' : 'var(--primary-color)', textTransform: 'capitalize' }}>
                {r.status.replace('_', ' ')}
              </span>
              
              <button onClick={() => openEditModal(r)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'var(--text-main)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                Ver/Editar
              </button>
            </div>
          </div>
        ))}

        {!loading && routes.length === 0 && (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p>Aún no hay rutas creadas.</p>
            <p>Haz clic en "Nueva Ruta Map X" para asignar una desde el Mapa Interactivo.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <CreateRouteModal 
          onClose={closeModal} 
          onSuccess={() => { closeModal(); fetchRoutes(); }} 
          initialRoute={selectedRoute}
        />
      )}
    </div>
  );
};
