-- ============================================
-- Schedule's v2.2 - ESQUEMA CONSOLIDADO COMPLETO
-- ============================================
-- Nota: Este archivo inicializa la base de datos desde cero en Docker.

CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'worker')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Rutas
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id),
    name VARCHAR(255),
    assigned_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'planeado' CHECK (status IN ('planeado', 'en_progreso', 'completado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Clientes / Puntos de Visita
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    apellido_paterno VARCHAR(255),
    apellido_materno VARCHAR(255),
    documento VARCHAR(20),
    address TEXT,
    description TEXT,
    ubigeo INTEGER,
    fecha_visita DATE,
    location GEOGRAPHY(POINT, 4326),
    visit_order INTEGER,
    status VARCHAR(30) DEFAULT 'PROGRAMADO',
    collected_data JSONB,
    current_worker_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- v2.2 BLOQUEO POR TRABAJADOR
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Ficha Crediticia del Cliente
CREATE TABLE IF NOT EXISTS client_credit_info (
    client_id INTEGER PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    tipo_credito VARCHAR(100),
    fecha_desembolso DATE,
    monto_desembolso DECIMAL(12, 2),
    moneda VARCHAR(10) DEFAULT 'PEN',
    nro_cuotas INTEGER,
    cuotas_pagadas INTEGER, -- Renombrado para coincidir con el payload móvil 1:1
    monto_cuota DECIMAL(12, 2),
    condicion_contable VARCHAR(100),
    saldo_capital DECIMAL(12, 2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Reportes de Visita
CREATE TABLE IF NOT EXISTS visit_reports (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    worker_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    data JSONB,
    travel_time_seconds INTEGER DEFAULT 0,
    visit_time_seconds INTEGER DEFAULT 0,
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sync_status VARCHAR(50) DEFAULT 'sincronizado',
    location_at_report GEOGRAPHY(POINT, 4326)
);

-- 6. Registro de Jornada (Asistencia)
CREATE TABLE IF NOT EXISTS time_logs (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('start_day', 'lunch_start', 'lunch_end', 'end_day')),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    location GEOGRAPHY(POINT, 4326)
);

-- 7. Historial de Tracking (Migas de pan)
CREATE TABLE IF NOT EXISTS tracking_history (
    id BIGSERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    location GEOGRAPHY(POINT, 4326),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Logs de Productividad
CREATE TABLE IF NOT EXISTS productivity_logs (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    tardanza_seconds INTEGER DEFAULT 0,
    idle_alerts INTEGER DEFAULT 0,
    total_travel_seconds INTEGER DEFAULT 0,
    total_visit_seconds INTEGER DEFAULT 0,
    clients_visited INTEGER DEFAULT 0,
    clients_reprogrammed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES GIST Y ESTÁNDAR
CREATE INDEX IF NOT EXISTS idx_clients_location ON clients USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_tracking_location ON tracking_history USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_reports_event_time ON visit_reports (event_timestamp);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status);
CREATE INDEX IF NOT EXISTS idx_clients_fecha ON clients (fecha_visita);
CREATE INDEX IF NOT EXISTS idx_clients_worker ON clients (current_worker_id);

-- USUARIOS INICIALES (Password para todos: admin2026)
-- Hash: $2b$10$RMjiV5ejghHPF3Na8Ux4BeTSbbZlw3X/.xzJjtzP.jaa9rnjy3jJ6
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@schedules.com', '$2b$10$RMjiV5ejghHPF3Na8Ux4BeTSbbZlw3X/.xzJjtzP.jaa9rnjy3jJ6', 'Administrador Principal', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password_hash, name, role)
VALUES ('trabajador@schedules.com', '$2b$10$KoICtsDKrkfaHPf4vuP/3eYVeYJa9x0FVM/zNLpJz8AAeUSrHGU75i', 'Juan Pérez (Worker)', 'worker')
ON CONFLICT (email) DO NOTHING;
