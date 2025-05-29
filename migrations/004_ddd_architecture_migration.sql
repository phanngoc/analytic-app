-- Migration: Update database schema for DDD architecture
-- This migration updates the existing schema to match the new domain models

-- Update events table to match EventModel
ALTER TABLE events 
    -- Ensure columns match new schema
    ALTER COLUMN id TYPE UUID USING id::UUID,
    ALTER COLUMN project_id TYPE UUID USING project_id::UUID,
    ALTER COLUMN user_id TYPE VARCHAR(255) USING user_id::VARCHAR(255),
    ALTER COLUMN session_id TYPE UUID USING session_id::UUID,
    ALTER COLUMN event_type TYPE VARCHAR(100) USING event_type::VARCHAR(100),
    
    -- Add new columns if they don't exist
    ADD COLUMN IF NOT EXISTS url TEXT,
    ADD COLUMN IF NOT EXISTS referrer TEXT,
    ADD COLUMN IF NOT EXISTS user_agent TEXT,
    ADD COLUMN IF NOT EXISTS ip_address INET,
    ADD COLUMN IF NOT EXISTS region VARCHAR(100),
    
    -- Rename/migrate existing columns
    DROP COLUMN IF EXISTS event_name,
    DROP COLUMN IF EXISTS page_url,
    DROP COLUMN IF EXISTS page_title,
    DROP COLUMN IF EXISTS screen_width,
    DROP COLUMN IF EXISTS screen_height,
    DROP COLUMN IF EXISTS language,
    DROP COLUMN IF EXISTS platform;

-- Update users table to match UserModel
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    anonymous_id VARCHAR(255) NOT NULL,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    language VARCHAR(10),
    timezone VARCHAR(50),
    first_seen_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_project_id ON users(project_id);
CREATE INDEX IF NOT EXISTS idx_users_anonymous_id ON users(project_id, anonymous_id);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen_at);

-- Update sessions table to match SessionModel
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE NULL,
    last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration BIGINT DEFAULT 0, -- stored as nanoseconds
    page_view_count INTEGER DEFAULT 0,
    event_count INTEGER DEFAULT 0,
    initial_referrer TEXT,
    initial_url TEXT,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(100),
    region VARCHAR(100),
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    properties JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sessions table
CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);

-- Update events table to reference the new sessions table
ALTER TABLE events 
    DROP CONSTRAINT IF EXISTS events_session_id_fkey,
    ADD CONSTRAINT events_session_id_fkey 
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

-- Update projects table to match our domain model
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
    ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
    ALTER COLUMN total_events TYPE BIGINT USING total_events::BIGINT,
    ALTER COLUMN total_sessions TYPE BIGINT USING total_sessions::BIGINT,
    ALTER COLUMN total_users TYPE BIGINT USING total_users::BIGINT;

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_country ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
DROP TRIGGER IF EXISTS trigger_update_sessions_updated_at ON sessions;
DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON events;

-- Create new triggers
CREATE TRIGGER trigger_update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
