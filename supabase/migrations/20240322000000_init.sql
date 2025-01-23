-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create vault schema
CREATE SCHEMA IF NOT EXISTS vault;

-- Create secrets table
CREATE TABLE IF NOT EXISTS vault.secrets (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    secret text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Create functions
CREATE OR REPLACE FUNCTION store_secret(
    secret_name text,
    secret_value text,
    secret_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS text AS $$
BEGIN
    INSERT INTO vault.secrets (name, secret, metadata)
    VALUES (secret_name, secret_value, secret_metadata)
    ON CONFLICT (name) 
    DO UPDATE SET 
        secret = EXCLUDED.secret,
        metadata = EXCLUDED.metadata,
        updated_at = CURRENT_TIMESTAMP;
    RETURN 'ok';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_secret(
    secret_name text
) RETURNS text AS $$
BEGIN
    RETURN (
        SELECT secret 
        FROM vault.secrets 
        WHERE name = secret_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE vault.secrets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own secrets"
    ON vault.secrets
    FOR SELECT
    USING ((metadata->>'user_id')::uuid = auth.uid());

CREATE POLICY "Users can insert their own secrets"
    ON vault.secrets
    FOR INSERT
    WITH CHECK ((metadata->>'user_id')::uuid = auth.uid());

CREATE POLICY "Users can update their own secrets"
    ON vault.secrets
    FOR UPDATE
    USING ((metadata->>'user_id')::uuid = auth.uid())
    WITH CHECK ((metadata->>'user_id')::uuid = auth.uid());

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA vault TO authenticated;
GRANT ALL ON vault.secrets TO authenticated;
GRANT EXECUTE ON FUNCTION store_secret TO authenticated;
GRANT EXECUTE ON FUNCTION get_secret TO authenticated; 