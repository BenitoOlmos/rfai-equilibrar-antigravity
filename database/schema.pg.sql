-- Base de datos: reprogramacion_foca (PostgreSQL Version)
-- Motor: PostgreSQL 16
-- Autor: Equipo Clínico Equilibrar / Backend Architect

-- Habilitar extensión para UUIDs (si se usa Postgres < 13, para 13+ es nativo pero pgcrypto es útil)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 0. Configuración de Funciones y Tipos
-- ----------------------------------------------------------------------------

-- Función para actualizar timestamp automáticamente (Reemplazo de ON UPDATE CURRENT_TIMESTAMP)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ENUMs
CREATE TYPE user_role AS ENUM ('ADMIN', 'COORDINATOR', 'PROFESSIONAL', 'CLIENT');
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE question_type_enum AS ENUM ('text', 'scale', 'choice');

-- ----------------------------------------------------------------------------
-- 1. Tabla de Usuarios
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL,
    avatar TEXT,
    status user_status DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger para users
CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 2. Perfil de Pacientes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    current_week INTEGER DEFAULT 1 CHECK (current_week BETWEEN 1 AND 4),
    start_date DATE NOT NULL,
    next_session TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. Progreso Semanal
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_week_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_profiles(user_id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 4),
    is_locked BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    initial_test_done BOOLEAN DEFAULT FALSE,
    guide_completed BOOLEAN DEFAULT FALSE,
    audio_listened_count INTEGER DEFAULT 0,
    meeting_attended BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (client_id, week_number)
);

-- Trigger para client_week_progress
CREATE TRIGGER update_progress_modtime
    BEFORE UPDATE ON client_week_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- 4. Resultados de Tests Clínicos
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clinical_test_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_profiles(user_id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    week_number INTEGER NOT NULL,
    score_autojuicio INTEGER NOT NULL, -- Escala 6-30
    score_culpa_no_adaptativa INTEGER NOT NULL, -- Escala 5-25
    score_responsabilidad_consciente INTEGER NOT NULL, -- Escala 7-35
    score_humanizacion_error INTEGER NOT NULL -- Escala 2-10
);

-- Index para búsquedas rápidas por cliente y fecha
CREATE INDEX idx_clinical_tests_client_date ON clinical_test_results(client_id, date);

-- ----------------------------------------------------------------------------
-- 5. Estadísticas de Uso de Audio
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audio_usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_profiles(user_id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    minutes_listened INTEGER NOT NULL DEFAULT 0,
    audio_identifier TEXT NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. Guías y Preguntas
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS guide_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INTEGER NOT NULL,
    step_title VARCHAR(255),
    question_text TEXT NOT NULL,
    question_type question_type_enum NOT NULL,
    display_order INTEGER NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7. Respuestas de Clientes a Guías
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS client_guide_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES client_profiles(user_id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES guide_questions(id),
    response_text TEXT,
    response_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
