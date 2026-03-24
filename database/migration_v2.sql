-- Migración Schedule's v2.0

-- 1. Actualización de tabla clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS apellido_paterno VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS apellido_materno VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS documento VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ubigeo INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS fecha_visita DATE;

-- Actualizar el constraint de status si existe
DO $$ 
BEGIN 
    ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
    ALTER TABLE clients ADD CONSTRAINT clients_status_check CHECK (status IN ('pendiente', 'visitado', 'ausente', 'abandonado', 'otro', 'PROGRAMADO', 'EN CAMINO', 'REPROGRAMAR'));
EXCEPTION 
    WHEN OTHERS THEN 
        RAISE NOTICE 'Error al actualizar constraint status';
END $$;

-- 2. Tabla para Ficha Crediticia
CREATE TABLE IF NOT EXISTS client_credit_info (
    client_id INTEGER PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
    tipo_credito VARCHAR(100),
    fecha_desembolso DATE,
    monto_desembolso DECIMAL(12,2),
    moneda VARCHAR(10),
    nro_cuotas INTEGER,
    nro_cuotas_pagadas INTEGER,
    monto_cuota DECIMAL(12,2),
    condicion_contable VARCHAR(100),
    saldo_capital DECIMAL(12,2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla para Logs de Productividad y Eficiencia
CREATE TABLE IF NOT EXISTS productivity_logs (
    id SERIAL PRIMARY KEY,
    worker_id INTEGER REFERENCES users(id),
    date DATE DEFAULT CURRENT_DATE,
    tardanza_seconds INTEGER DEFAULT 0,
    idle_alerts_count INTEGER DEFAULT 0,
    UNIQUE(worker_id, date)
);

-- 4. Actualización de Visit Reports
ALTER TABLE visit_reports ADD COLUMN IF NOT EXISTS travel_time_seconds INTEGER;
ALTER TABLE visit_reports ADD COLUMN IF NOT EXISTS visit_time_seconds INTEGER;
ALTER TABLE visit_reports ADD COLUMN IF NOT EXISTS photos JSONB;
