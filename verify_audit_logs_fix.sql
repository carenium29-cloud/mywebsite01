-- =============================================
-- CARENIUM — AUDIT LOGS VERIFICATION SQL
-- Verifies type and polymorphic IDs
-- =============================================

-- 1. Check column types
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
AND column_name IN ('entity_id', 'old_data', 'new_data', 'created_at');

-- 2. Test Polymorphic Insertion (Safe Test)
-- Support BIGINT (Legacy Patients)
INSERT INTO public.audit_logs (action_type, entity, entity_id, new_data)
VALUES ('INSERT', 'patients', '123456789', '{"test": "bigint"}'::jsonb);

-- Support UUID (Modern Doctors)
INSERT INTO public.audit_logs (action_type, entity, entity_id, new_data)
VALUES ('INSERT', 'doctor_profiles', '550e8400-e29b-41d4-a716-446655440000', '{"test": "uuid"}'::jsonb);

-- 3. Verify inserted data
SELECT id, entity, entity_id, created_at 
FROM public.audit_logs 
ORDER BY created_at DESC 
LIMIT 2;

-- 4. Clean up test records (Optional)
-- DELETE FROM public.audit_logs WHERE entity_id IN ('123456789', '550e8400-e29b-41d4-a716-446655440000');
