import React from 'react';
import { Mail, Phone } from 'lucide-react';

export const WorkersPage: React.FC = () => {
  const workers = [
    { id: 1, name: 'Juan Pérez', email: 'juan.perez@lookapp.com', phone: '+51 987 654 321', status: 'Activo', routes: 12, performance: '94%' },
    { id: 2, name: 'María Gómez', email: 'maria.gomez@lookapp.com', phone: '+51 912 345 678', status: 'En Almuerzo', routes: 8, performance: '88%' },
    { id: 3, name: 'Carlos Ruíz', email: 'carlos.ruiz@lookapp.com', phone: '+51 955 444 333', status: 'Inactivo', routes: 15, performance: '91%' },
  ];

  return (
    <div className="main-content">
      <div className="header">
        <h2>Gestión de Trabajadores</h2>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1.5rem' }}>Trabajador</th>
              <th style={{ padding: '1.5rem' }}>Contacto</th>
              <th style={{ padding: '1.5rem' }}>Estado</th>
              <th style={{ padding: '1.5rem' }}>Rutas (Mes)</th>
              <th style={{ padding: '1.5rem' }}>Eficiencia</th>
              <th style={{ padding: '1.5rem' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {workers.map(w => (
              <tr key={w.id} style={{ borderTop: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1.5rem', fontWeight: 600 }}>{w.name}</td>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {w.email}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} /> {w.phone}</span>
                  </div>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <span style={{ 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem',
                    background: w.status === 'Activo' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    color: w.status === 'Activo' ? 'var(--success-color)' : 'var(--warning-color)'
                  }}>
                    {w.status}
                  </span>
                </td>
                <td style={{ padding: '1.5rem' }}>{w.routes}</td>
                <td style={{ padding: '1.5rem', fontWeight: 700, color: 'var(--primary-color)' }}>{w.performance}</td>
                <td style={{ padding: '1.5rem' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
