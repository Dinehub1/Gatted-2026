-- FIX for Infinite Recursion (Error 42P17)

-- 1. Create a "Security Definer" function.
-- This allows checking admin status without triggering RLS policies recursively.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
$$;

-- 2. Update 'user_roles' policies to use this safe function

-- Allow users to read their OWN role, OR Admins to read ALL roles
DROP POLICY IF EXISTS "Admins can view all user_roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON user_roles; -- Cleanup old if exists
DROP POLICY IF EXISTS "Access user_roles" ON user_roles; -- Cleanup collision

CREATE POLICY "Access user_roles"
ON user_roles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR is_admin()
);

-- Allow Admins to UPDATE roles
DROP POLICY IF EXISTS "Admins can update user_roles" ON user_roles;
CREATE POLICY "Admins can update user_roles"
ON user_roles FOR UPDATE
TO authenticated
USING ( is_admin() );

-- Allow Admins to INSERT roles
DROP POLICY IF EXISTS "Admins can insert user_roles" ON user_roles;
CREATE POLICY "Admins can insert user_roles"
ON user_roles FOR INSERT
TO authenticated
WITH CHECK ( is_admin() );

-- 3. Update 'profiles' policy as well (safer to use the function)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Access profiles" ON profiles; -- Cleanup collision

CREATE POLICY "Access profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR is_admin()
);
