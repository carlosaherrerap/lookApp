-- Solución para el error de columna faltante en v2.2
-- Este script agrega la columna current_worker_id a la tabla clients si no existe.

ALTER TABLE clients ADD COLUMN IF NOT EXISTS current_worker_id INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- Índice para mejorar el rendimiento de las consultas por trabajador actual
CREATE INDEX IF NOT EXISTS idx_clients_worker ON clients (current_worker_id);
