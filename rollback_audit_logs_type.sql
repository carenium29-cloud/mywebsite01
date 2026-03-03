-- =============================================
-- CARENIUM — AUDIT LOGS ROLLBACK SQL
-- Reverts entity_id to BIGINT (Unsafe if UUIDs exist)
-- =============================================

-- ⚠️ WARNING: This rollback is UNSAFE if any UUIDs have been inserted 
-- into the entity_id column. UUIDs cannot be cast back to BIGINT.

DO $$ 
BEGIN 
    -- Only attempt rollback if column is currently TEXT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name='audit_logs' AND column_name='entity_id' AND data_type='text'
    ) THEN
        -- Attempt to cast back to BIGINT
        -- This will FAIL if any UUID strings are present
        ALTER TABLE public.audit_logs ALTER COLUMN entity_id TYPE BIGINT USING entity_id::BIGINT;
    END IF;

    -- Note: We do NOT rename created_at back to timestamp as created_at is the modern standard.
END $$;
