-- ============================================
-- MIGRATION FIX: Infinite Recursion User Roles
-- ============================================

-- 1. Create a secure function to check roles (Bypasses RLS)
CREATE OR REPLACE FUNCTION public.check_user_role(
  check_user_id UUID,
  check_society_id UUID,
  check_roles user_role[]
) RETURNS BOOLEAN AS $$
BEGIN
  -- This runs with security definer privileges, bypassing RLS
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id
      AND society_id = check_society_id
      AND role = ANY(check_roles)
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policies on user_roles
DROP POLICY IF EXISTS "Managers can view society roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- 3. Re-create policies using the secure function

-- Managers can view all roles in their society
CREATE POLICY "Managers can view society roles"
  ON public.user_roles FOR SELECT
  USING (
    public.check_user_role(auth.uid(), society_id, ARRAY['manager', 'admin']::user_role[])
  );

-- Admins can manage (insert/update/delete) roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (
    public.check_user_role(auth.uid(), society_id, ARRAY['admin']::user_role[])
  );
