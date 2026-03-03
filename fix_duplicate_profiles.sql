-- =============================================
-- CARENIUM — CLEANUP DUPLICATE DOCTOR PROFILES
-- Ensures unique, single-row profiles per user
-- =============================================

DO $$ 
BEGIN 
    -- 1. CLEANUP DUPLICATE DOCTOR PROFILES
    -- Keeps only the most recently created record for each user
    DELETE FROM public.doctor_profiles a
    WHERE a.id IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as row_num
            FROM public.doctor_profiles
        ) t
        WHERE t.row_num > 1
    );

    -- 2. ENSURE UNIQUE CONSTRAINT EXISTS
    -- If the unique constraint was missing, add it now
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_doctor_profile_user'
    ) THEN
        ALTER TABLE public.doctor_profiles ADD CONSTRAINT uq_doctor_profile_user UNIQUE (user_id);
    END IF;

    -- 3. CLEANUP DUPLICATE DOCTORS (If any)
    -- In some schemas 'doctors' might have duplicates by ID
    DELETE FROM public.doctors a
    WHERE a.id IN (
        SELECT id FROM (
            SELECT id, ctid, ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) as row_num
            FROM public.doctors
        ) t
        WHERE t.row_num > 1
    );

    -- 4. ENSURE DOCTORS ID IS PRIMARY KEY
    -- If the PK was missing or invalid, enforce it
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'doctors_pkey'
    ) THEN
        -- Safely attempt to add PK if not already present
        -- Check if any PK exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'doctors' AND constraint_type = 'PRIMARY KEY') THEN
            ALTER TABLE public.doctors ADD PRIMARY KEY (id);
        END IF;
    END IF;

END $$;
