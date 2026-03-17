import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';

export const RoutesPage: React.FC = () => {
  const routes = [
    { id: 101, worker: 'Juan Pérez', date: '2026-03-17', clients: 8, completed: 5, status: 'En Ejecución' },
    { id: 102, worker: 'María Gómez', date: '2026-03-17', clients: 12, completed: 12, status: 'Finalizada' },
    { id: 103, worker: 'Carlos Ruíz', date: '2026-03-17', clients: 10, completed: 0, status: 'Pendiente' },
  ];

  return (
    <div className="main-content">
      <div className="header">
        <h2>Control de Rutas</h2>
        <button style={{ 
          background: 'var(--primary-color)', 
          color: '#0f172a', 
          border: 'none', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '12px', 
          fontWeight: 700,
          cursor: 'pointer'
        }}>
          + Nueva Ruta
        </button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {routes.map(r => (
          <div key={r.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '12px', 
                background: 'rgba(56, 189, 248, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <MapPin color="var(--primary-color)" />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem' }}>Ruta #{r.id} - {r.worker}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fecha: {r.date} • {r.clients} Puntos de visita</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Progreso</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>
                      <div style={{ width: `${(r.completed / r.clients) * 100}%`, height: '100%', background: 'var(--success-color)', borderRadius: '3px' }}></div>
                   </div>
                   <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{r.completed}/{r.clients}</span>
                </div>
              </div>

              <span style={{ 
                padding: '0.4rem 0.8rem', 
                borderRadius: '8px', 
                fontSize: '0.8rem',
                background: r.status === 'Finalizada' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                color: r.status === 'Finalizada' ? 'var(--success-color)' : 'var(--primary-color)'
              }}>
                {r.status}
              </span>
              
              <ChevronRight size={20} color="var(--text-muted)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
