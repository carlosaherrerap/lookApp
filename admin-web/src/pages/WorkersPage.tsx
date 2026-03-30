import React, { useEffect, useState } from 'react';
import { Mail, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export const WorkersPage: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);

  const fetchWorkers = async (searchTerm = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res = await axios.get(`${API_BASE_URL}/users/workers?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(res.data);
    } catch (error) {
      console.error('Error cargando trabajadores', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${API_BASE_URL}/users`, newWorker, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsModalOpen(false);
      setNewWorker({ name: '', email: '', password: '' });
      fetchWorkers(search);
    } catch (error) {
      alert('Error creando trabajador');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkers(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="main-content">
      <div className="header">
        <h2>Gestión de Trabajadores</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'var(--surface-color)', border: '1px solid var(--surface-border)', color: 'var(--text-main)', padding: '0.6rem 1rem', borderRadius: '10px', width: '300px' }}
          />
          <button onClick={() => setIsModalOpen(true)} style={{ background: 'var(--primary-color)', color: 'var(--bg-color)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
            + Nuevo Trabajador
          </button>
          <button onClick={() => fetchWorkers(search)} style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-main)', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer' }}>
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1.5rem' }}>ID & Trabajador</th>
              <th style={{ padding: '1.5rem' }}>Contacto</th>
              <th style={{ padding: '1.5rem' }}>Rol</th>
              <th style={{ padding: '1.5rem' }}>Registro</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td></tr>
            ) : workers.map(w => (
              <tr key={w.id} style={{ borderTop: '1px solid var(--surface-border)' }}>
                <td style={{ padding: '1.5rem', fontWeight: 600 }}>#{w.id} - {w.name}</td>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} /> {w.email}</span>
                  </div>
                </td>
                <td style={{ padding: '1.5rem', textTransform: 'capitalize' }}>{w.role}</td>
                <td style={{ padding: '1.5rem' }}>{new Date(w.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && workers.length === 0 && (
              <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>No hay trabajadores creados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
            <h3>Nuevo Trabajador</h3>
            <form onSubmit={handleCreateWorker} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label>Nombre Completo</label>
                <input required type="text" value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} style={{ width: '100%', padding: '0.7rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'var(--text-main)', borderRadius: '8px' }}/>
              </div>
              <div>
                <label>Correo Electrónico</label>
                <input required type="email" value={newWorker.email} onChange={e => setNewWorker({...newWorker, email: e.target.value})} style={{ width: '100%', padding: '0.7rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'var(--text-main)', borderRadius: '8px' }}/>
              </div>
              <div>
                <label>Contraseña Provisional</label>
                <input required type="password" value={newWorker.password} onChange={e => setNewWorker({...newWorker, password: e.target.value})} style={{ width: '100%', padding: '0.7rem', marginTop: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--surface-border)', color: 'var(--text-main)', borderRadius: '8px' }}/>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" disabled={saving} style={{ flex: 1, padding: '0.8rem', background: 'var(--primary-color)', border: 'none', color: 'var(--bg-color)', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {saving ? 'Guardando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
