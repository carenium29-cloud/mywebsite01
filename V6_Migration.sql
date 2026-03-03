-- CARENIUM ENTERPRISE V6 MIGRATION
-- Fixes Patient Admission and Adds Admin Control Support

-- 1. ADD MEDICAL UNIT TO PATIENTS
ALTER TABLE public.patients ADD COLUMN medical_unit VARCHAR(100);

-- 2. ENSURE ADMIN ROLE EXISTS
-- Note: Assuming roles table has IDs 1: ADMIN, 2: DOCTOR, 3: NURSE
-- If not, seeding is required.
INSERT INTO public.roles (id, name) 
VALUES (1, 'ROLE_ADMIN') 
ON CONFLICT (id) DO UPDATE SET name = 'ROLE_ADMIN';

-- 3. ENABLE AUDIT LOGS FOR NEW ACTIONS
-- The audit_logs table was already created in V5, but we ensure it's ready.
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON public.audit_logs(created_at DESC);

-- 4. DEFAULT ADMIN USER
-- Password is 'admin123' (BCrypt hashed)
-- User ID is manually set for consistency
INSERT INTO public.users (id, email, password, full_name, status)
VALUES ('a1b2c3d4-e5f6-4321-8765-43210abcdef0', 'admin@carenium.com', '$2a$10$8.UnVuG9shgD3W9tfJUXLu1QThb9m7.XNfF0p59T6ZzI2K9eO1vVq', 'System Administrator', 'ACTIVE')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_roles (user_id, role_id)
VALUES ('a1b2c3d4-e5f6-4321-8765-43210abcdef0', 1)
ON CONFLICT DO NOTHING;
