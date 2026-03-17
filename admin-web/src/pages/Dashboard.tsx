import React, { useState, useEffect } from 'react';
import { MapView } from '../components/MapView';
import { Users, Route, CheckCircle2, Clock } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3009'; // Ajustar puerto según .env del backend

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeWorkers: 0,
    routesCompleted: 0,
    pendingVisits: 0,
    avgTime: '0m',
  });

  const [workers, setWorkers] = useState<any[]>([]);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('tracking_update', (data) => {
      console.log('Tracking update received:', data);
      setWorkers((prev) => {
        const index = prev.findIndex(w => w.id === data.worker_id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], lat: data.lat, lng: data.lng, status: 'En Movimiento' };
          return updated;
        } else {
          // Si es nuevo o no estaba cargado
          return [...prev, { id: data.worker_id, name: `Worker ${data.worker_id}`, lat: data.lat, lng: data.lng, status: 'Activo' }];
        }
      });
      
      setStats(prev => ({ ...prev, activeWorkers: workers.length + 1 }));
    });

    socket.on('report_update', (data) => {
      console.log('Report update received:', data);
      setStats(prev => ({
        ...prev,
        pendingVisits: Math.max(0, prev.pendingVisits - 1),
        routesCompleted: prev.routesCompleted + (data.is_last ? 1 : 0),
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="main-content">
      <div className="header">
        <div>
          <h2>Panel de Operaciones</h2>
          <p style={{ color: 'var(--text-muted)' }}>Monitoreo en vivo de cuadrillas y cumplimiento de rutas</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-header">
            <span>En Campo</span>
            <Users size={20} color="var(--primary-color)" />
          </div>
          <div className="stat-value">{workers.length}</div>
        </div>
        
        <div className="stat-card glass-panel">
          <div className="stat-header">
            <span>Rutas Cerradas</span>
            <CheckCircle2 size={20} color="var(--success-color)" />
          </div>
          <div className="stat-value">{stats.routesCompleted}</div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-header">
            <span>Visitas Realizadas (Hoy)</span>
            <Route size={20} color="var(--warning-color)" />
          </div>
          <div className="stat-value">{stats.routesCompleted * 10}</div> {/* Mock ratio */}
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-header">
            <span>Alertas</span>
            <Clock size={20} color="var(--danger-color)" />
          </div>
          <div className="stat-value">0</div>
        </div>
      </div>

      <MapView workers={workers} />
    </div>
  );
};
