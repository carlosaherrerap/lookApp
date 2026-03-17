import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { WorkersPage } from './pages/WorkersPage';
import { RoutesPage } from './pages/RoutesPage';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workers" element={<WorkersPage />} />
            <Route path="/routes" element={<RoutesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
