-- =============================================
-- CARENIUM — RLS RECURSION FIX
-- Resolves "infinite recursion detected in policy for relation 'users'"
-- =============================================

-- 1. SECURITY DEFINER FUNCTION
-- This function runs with the privileges of the creator (postgres), 
-- bypassing RLS checks on the users table and breaking the recursion loop.
CREATE OR REPLACE FUNCTION public.check_user_role(target_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = target_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. REBUILD USERS POLICIES
-- We drop any existing recursive policies and replace them with calls to the safe function.
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users" 
ON public.users
FOR SELECT 
USING (public.check_user_role('admin'));

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" 
ON public.users
FOR SELECT 
USING (auth.uid() = id);

-- 3. UPDATE OTHER TABLES FOR CONSISTENCY
-- While not strictly required for recursion, using the function is faster and safer.

-- Patients
DROP POLICY IF EXISTS "Admins have full access" ON public.patients;
CREATE POLICY "Admins have full access" 
ON public.patients 
FOR ALL 
USING (public.check_user_role('admin'));

-- Doctor Profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.doctor_profiles;
CREATE POLICY "Admins can read all profiles" 
ON public.doctor_profiles
FOR SELECT 
USING (public.check_user_role('admin'));
