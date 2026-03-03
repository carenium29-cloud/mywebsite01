-- =============================================
-- CARENIUM — REAL-WORLD SCHEMA V2
-- =============================================

-- 1. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    specialization TEXT,
    department TEXT,
    years_experience INT DEFAULT 0,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'off-duty', -- active, on-duty, off-duty
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. NURSES TABLE
CREATE TABLE IF NOT EXISTS public.nurses (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    department TEXT,
    shift TEXT DEFAULT 'morning', -- morning, evening, night
    years_experience INT DEFAULT 0,
    phone TEXT,
    email TEXT,
    status TEXT DEFAULT 'off-duty', -- active, on-duty, off-duty
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. LINK PATIENTS TABLE
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS assigned_nurse UUID REFERENCES auth.users(id);

-- =============================================
-- RLS POLICIES (PHASE 3)
-- =============================================

-- DOCTORS: Read own profile, read all doctors for directory
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can read all doctors" ON public.doctors;
CREATE POLICY "Doctors can read all doctors" ON public.doctors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Doctors can update own profile" ON public.doctors;
CREATE POLICY "Doctors can update own profile" ON public.doctors FOR UPDATE USING (auth.uid() = id);

-- NURSES: Read own profile, read all nurses for directory
ALTER TABLE public.nurses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nurses can read all nurses" ON public.nurses;
CREATE POLICY "Nurses can read all nurses" ON public.nurses FOR SELECT USING (true);
DROP POLICY IF EXISTS "Nurses can update own profile" ON public.nurses;
CREATE POLICY "Nurses can update own profile" ON public.nurses FOR UPDATE USING (auth.uid() = id);

-- PATIENTS: Role-based filtering
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view assigned patients" ON public.patients;
CREATE POLICY "Staff can view assigned patients" ON public.patients FOR SELECT USING (
  auth.uid() = assigned_doctor OR auth.uid() = assigned_nurse
);
