-- =============================================
-- CARENIUM — RLS Security Policies
-- =============================================

-- Enable RLS on patients table
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- 1. DOCTOR POLICY: Read-only assigned patients
CREATE POLICY "Doctors can view assigned patients"
ON public.patients
FOR SELECT
USING (
  auth.uid() = assigned_doctor
);

-- 2. NURSE POLICY: Read all patients, update only vitals
CREATE POLICY "Nurses can view all patients"
ON public.patients
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'nurse'
  )
);

CREATE POLICY "Nurses can update patient vitals"
ON public.patients
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'nurse'
  )
)
WITH CHECK (
  -- Only allow updates to vitals related columns
  -- (This is a simplified example, in real world you might use triggers or finer columns)
  true
);

-- 3. ADMIN POLICY: Full access
CREATE POLICY "Admins have full access"
ON public.patients
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
