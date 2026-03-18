-- Extensión necesaria para geolocalización
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla de Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'worker')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Rutas
CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id),
    name VARCHAR(255),
    assigned_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planeado' CHECK (status IN ('planeado', 'en_progreso', 'completado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Clientes / Puntos de Visita
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    description TEXT,
    location GEOGRAPHY(POINT, 4326), -- PostGIS point (lat, lng)
    visit_order INTEGER,
    status VARCHAR(50) DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'visitado', 'ausente', 'abandonado', 'otro')),
    collected_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Reportes de Visita (Offline-First)
CREATE TABLE visit_reports (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    worker_id INTEGER REFERENCES users(id),
    data JSONB, -- Contenido dinámico del reporte
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL, -- Cuándo ocurrió en el móvil
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Cuándo llegó al servidor
    sync_status VARCHAR(50) DEFAULT 'sincronizado' CHECK (sync_status IN ('pendiente', 'sincronizando', 'sincronizado')),
    location_at_report GEOGRAPHY(POINT, 4326) -- Ubicación exacta al reportar
);

-- Registro de Jornada (Asistencia)
CREATE TABLE time_logs (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id),
    type VARCHAR(50) CHECK (type IN ('start_day', 'lunch_start', 'lunch_end', 'end_day')),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location GEOGRAPHY(POINT, 4326)
);

-- Historial de Tracking (Migas de pan)
CREATE TABLE tracking_history (
    id BIGSERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id),
    location GEOGRAPHY(POINT, 4326),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices Espaciales para optimizar búsquedas por cercanía
CREATE INDEX idx_clients_location ON clients USING GIST (location);
CREATE INDEX idx_tracking_location ON tracking_history USING GIST (location);
CREATE INDEX idx_reports_event_time ON visit_reports (event_timestamp);

-- Usuarios iniciales (password: password123)
INSERT INTO users (email, password_hash, name, role) 
VALUES ('admin@mapx.com', '$2b$10$KoICtsDKrkfaHPf4vuP/3eYVeYJa9x0FVM/zNLpJz8AAeUSrHGU75i', 'Admin MapX', 'admin');

INSERT INTO users (email, password_hash, name, role) 
VALUES ('worker@mapx.com', '$2b$10$KoICtsDKrkfaHPf4vuP/3eYVeYJa9x0FVM/zNLpJz8AAeUSrHGU75i', 'Juan Trabajador', 'worker');
