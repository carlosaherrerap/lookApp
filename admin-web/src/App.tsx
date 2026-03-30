import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { WorkersPage } from './pages/WorkersPage';
import { RoutesPage } from './pages/RoutesPage';
import { LoginPage } from './pages/LoginPage';
import { useState } from 'react';
import './index.css';

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));

  if (!token) {
    return (
      <LoginPage
        onLogin={(t: string, userData: any) => {
          localStorage.setItem('admin_token', t);
          localStorage.setItem('user_data', JSON.stringify(userData));
          setToken(t);
        }}
      />
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
