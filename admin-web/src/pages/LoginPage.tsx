import React, { useState } from 'react';
import axios from 'axios';

export const LoginPage: React.FC<{ onLogin: (token: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@mapx.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3009/auth/login', { email, password });
      
      if (res.data.user.role !== 'admin') {
        setError('Acceso denegado: Solo administradores pueden ingresar al portal.');
        return;
      }

      onLogin(res.data.access_token, res.data.user);
    } catch (err) {
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
      <form onSubmit={handleLogin} style={{ background: '#1e293b', padding: '2rem', borderRadius: '12px', width: '350px' }}>
        <h2 style={{ textAlign: 'center', color: '#38bdf8', marginBottom: '1.5rem' }}>Map X Admin</h2>
        {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        <input 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Email"
          style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
        />
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Password"
          style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }}
        />
        <button type="submit" style={{ width: '100%', background: '#38bdf8', color: '#0f172a', padding: '0.8rem', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          INGRESAR
        </button>
      </form>
    </div>
  );
};
