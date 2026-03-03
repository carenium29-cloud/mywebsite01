-- =============================================
-- CARENIUM — V7: DOCTOR PROFILES & SPECIALTY SYSTEM
-- =============================================

-- 1. DOCTOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    specialization TEXT NOT NULL,
    experience_years INT NOT NULL DEFAULT 0,
    qualification TEXT NOT NULL,
    license_number TEXT NOT NULL,
    department TEXT NOT NULL,
    unit TEXT,
    availability_schedule JSONB DEFAULT '{"monday":true,"tuesday":true,"wednesday":true,"thursday":true,"friday":true,"saturday":false,"sunday":false,"shift":"morning"}'::jsonb,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_doctor_profile_user UNIQUE (user_id)
);

-- Index on specialization for fast matching
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialization ON public.doctor_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON public.doctor_profiles(user_id);

-- 2. SPECIALIZATION CHANGE REQUESTS (Admin approval workflow)
CREATE TABLE IF NOT EXISTS public.specialization_change_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctor_profiles(id) ON DELETE CASCADE,
    current_specialization TEXT NOT NULL,
    requested_specialization TEXT NOT NULL,
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES auth.users(id),
    patient_id BIGINT NOT NULL REFERENCES public.patients(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 30,
    status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, rescheduled
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);

-- 4. PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id BIGINT NOT NULL REFERENCES public.patients(id),
    doctor_id UUID NOT NULL REFERENCES auth.users(id),
    medication TEXT NOT NULL,
    dosage TEXT NOT NULL,
    frequency TEXT NOT NULL,
    duration TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. DIAGNOSES TABLE
CREATE TABLE IF NOT EXISTS public.diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id BIGINT NOT NULL REFERENCES public.patients(id),
    doctor_id UUID NOT NULL REFERENCES auth.users(id),
    diagnosis TEXT NOT NULL,
    severity TEXT DEFAULT 'moderate', -- mild, moderate, severe, critical
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. LAB REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.lab_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id BIGINT NOT NULL REFERENCES public.patients(id),
    doctor_id UUID NOT NULL REFERENCES auth.users(id),
    test_name TEXT NOT NULL,
    urgency TEXT DEFAULT 'routine', -- routine, urgent, stat
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed
    results JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 7. TREATMENT PLANS TABLE
CREATE TABLE IF NOT EXISTS public.treatment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id BIGINT NOT NULL REFERENCES public.patients(id),
    doctor_id UUID NOT NULL REFERENCES auth.users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'active', -- active, completed, paused
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ADD NEW PATIENT COLUMNS
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS blood_pressure TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS ai_risk_score NUMERIC(4,1) DEFAULT 0;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS ailment TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS last_vitals_update TIMESTAMP WITH TIME ZONE;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Doctor Profiles: Own read/update, admins read all
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can read own profile" ON public.doctor_profiles;
CREATE POLICY "Doctors can read own profile" ON public.doctor_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Doctors can insert own profile" ON public.doctor_profiles;
CREATE POLICY "Doctors can insert own profile" ON public.doctor_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Doctors can update own profile" ON public.doctor_profiles;
CREATE POLICY "Doctors can update own profile" ON public.doctor_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.doctor_profiles;
CREATE POLICY "Admins can read all profiles" ON public.doctor_profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors manage own appointments" ON public.appointments;
CREATE POLICY "Doctors manage own appointments" ON public.appointments
    FOR ALL USING (auth.uid() = doctor_id);

-- Prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors manage own prescriptions" ON public.prescriptions;
CREATE POLICY "Doctors manage own prescriptions" ON public.prescriptions
    FOR ALL USING (auth.uid() = doctor_id);

-- Diagnoses
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors manage own diagnoses" ON public.diagnoses;
CREATE POLICY "Doctors manage own diagnoses" ON public.diagnoses
    FOR ALL USING (auth.uid() = doctor_id);

-- Lab Requests
ALTER TABLE public.lab_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors manage own lab requests" ON public.lab_requests;
CREATE POLICY "Doctors manage own lab requests" ON public.lab_requests
    FOR ALL USING (auth.uid() = doctor_id);

-- Treatment Plans
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors manage own treatment plans" ON public.treatment_plans;
CREATE POLICY "Doctors manage own treatment plans" ON public.treatment_plans
    FOR ALL USING (auth.uid() = doctor_id);

-- =============================================
-- AUDIT TRIGGERS
-- =============================================

CREATE OR REPLACE FUNCTION audit_doctor_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (action_type, user_id, entity, entity_id, old_data, new_data)
    VALUES (
        TG_OP,
        auth.uid(),
        'doctor_profiles',
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_doctor_profiles ON public.doctor_profiles;
CREATE TRIGGER tr_audit_doctor_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.doctor_profiles
FOR EACH ROW EXECUTE FUNCTION audit_doctor_profile_changes();

-- Prescription audit
CREATE OR REPLACE FUNCTION audit_prescription_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (action_type, user_id, entity, entity_id, old_data, new_data)
    VALUES (TG_OP, auth.uid(), 'prescriptions', COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_prescriptions ON public.prescriptions;
CREATE TRIGGER tr_audit_prescriptions
AFTER INSERT OR UPDATE OR DELETE ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION audit_prescription_changes();

-- Diagnosis audit
CREATE OR REPLACE FUNCTION audit_diagnosis_changes()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.audit_logs (action_type, user_id, entity, entity_id, old_data, new_data)
    VALUES (TG_OP, auth.uid(), 'diagnoses', COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_audit_diagnoses ON public.diagnoses;
CREATE TRIGGER tr_audit_diagnoses
AFTER INSERT OR UPDATE OR DELETE ON public.diagnoses
FOR EACH ROW EXECUTE FUNCTION audit_diagnosis_changes();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_doctor_profiles_updated_at ON public.doctor_profiles;
CREATE TRIGGER tr_doctor_profiles_updated_at
BEFORE UPDATE ON public.doctor_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_appointments_updated_at ON public.appointments;
CREATE TRIGGER tr_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_treatment_plans_updated_at ON public.treatment_plans;
CREATE TRIGGER tr_treatment_plans_updated_at
BEFORE UPDATE ON public.treatment_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
