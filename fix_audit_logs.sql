-- =============================================
-- CARENIUM — CLEAN AUDIT LOGS MIGRATION (V3)
-- Standardizes schema, fixes type conflicts & FK constraints
-- =============================================

-- 1. Create audit_logs table if it doesn't exist
-- We use TEXT for entity_id to support UUID/BIGINT
-- user_id is NOT a hard foreign key to auth.users to prevent trigger failures
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    user_id UUID, -- Removed hard REFERENCES auth.users(id)
    entity TEXT NOT NULL, -- patients, doctors, etc.
    entity_id TEXT NOT NULL, -- TEXT for safe polymorphism
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Safely apply migrations to existing tables
DO $$ 
BEGIN 
    -- Fix entity_id type conflict (BIGINT -> TEXT)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name='audit_logs' AND column_name='entity_id' AND data_type='bigint'
    ) THEN
        ALTER TABLE public.audit_logs ALTER COLUMN entity_id TYPE TEXT USING entity_id::TEXT;
    END IF;

    -- REMOVE problematic foreign key constraint on user_id
    -- This constraint often fails in triggers because 'auth.users' isn't always accessible
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'audit_logs_user_id_fkey' AND table_name = 'audit_logs'
    ) THEN
        ALTER TABLE public.audit_logs DROP CONSTRAINT audit_logs_user_id_fkey;
    END IF;

    -- Add old_data if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='audit_logs' AND column_name='old_data') THEN
        ALTER TABLE public.audit_logs ADD COLUMN old_data JSONB;
    END IF;

    -- Add new_data if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='audit_logs' AND column_name='new_data') THEN
        ALTER TABLE public.audit_logs ADD COLUMN new_data JSONB;
    END IF;

    -- Handle 'timestamp' vs 'created_at' mismatch
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='audit_logs' AND column_name='timestamp') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='audit_logs' AND column_name='created_at') THEN
            ALTER TABLE public.audit_logs DROP COLUMN timestamp;
        ELSE
            ALTER TABLE public.audit_logs RENAME COLUMN timestamp TO created_at;
        END IF;
    END IF;

    -- Final check for created_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='audit_logs' AND column_name='created_at') THEN
        ALTER TABLE public.audit_logs ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- 3. Ensure production-ready indexes exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, entity_id);

-- 4. Verification Check
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'audit_logs';
