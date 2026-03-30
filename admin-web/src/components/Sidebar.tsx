import React from 'react';
import { LayoutDashboard, Users, Map as MapIcon, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1 style={{ color: '#00B4D8', letterSpacing: '1px' }}>Schedule's</h1>
      </div>
      
      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/workers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Trabajadores</span>
        </NavLink>
        <NavLink to="/routes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MapIcon size={20} />
          <span>Rutas</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Configuración</span>
        </NavLink>
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
        <button className="nav-item" style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer' }} onClick={() => {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('user_data');
          window.location.href = '/login';
        }}>
          <LogOut size={20} color="#FFFFFF" />
          <span style={{ color: '#FFFFFF' }}>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
