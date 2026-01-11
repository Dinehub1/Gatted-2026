-- ============================================
-- MIGRATION 01: Complete RLS Policies
-- ============================================
-- This migration implements comprehensive Row Level Security
-- across all tables in the GATED database
-- 
-- CRITICAL: This will restrict data access based on user context
-- Test thoroughly before applying to production
-- 
-- REQUIRED: Run 00_audit_current_state.sql first
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during signup)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can read profiles in their society
DROP POLICY IF EXISTS "Users can read society profiles" ON public.profiles;
CREATE POLICY "Users can read society profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur1
      JOIN user_roles ur2 ON ur1.society_id = ur2.society_id
      WHERE ur1.user_id = auth.uid()
        AND ur2.user_id = profiles.id
        AND ur1.is_active = true
    )
  );

-- ============================================
-- 2. USER_ROLES TABLE (CRITICAL - Fixes startup error)
-- ============================================

-- Users can read their own roles
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

-- Managers can view all roles in their society
DROP POLICY IF EXISTS "Managers can view society roles" ON public.user_roles;
CREATE POLICY "Managers can view society roles"
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles AS ur
      WHERE ur.user_id = auth.uid()
        AND ur.society_id = user_roles.society_id
        AND ur.role IN ('manager', 'admin')
        AND ur.is_active = true
    )
  );

-- Only admins can manage (insert/update/delete) roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND is_active = true
    )
  );

-- ============================================
-- 3. SOCIETIES TABLE
-- ============================================

-- Users can read societies they are members of
DROP POLICY IF EXISTS "Users can read their societies" ON public.societies;
CREATE POLICY "Users can read their societies"
  ON public.societies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = societies.id
        AND is_active = true
    )
  );

-- Only admins can manage societies
DROP POLICY IF EXISTS "Admins can manage societies" ON public.societies;
CREATE POLICY "Admins can manage societies"
  ON public.societies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = societies.id
        AND role = 'admin'
        AND is_active = true
    )
  );

-- ============================================
-- 4. BLOCKS TABLE
-- ============================================

-- Users can read blocks in their society
DROP POLICY IF EXISTS "Users can read society blocks" ON public.blocks;
CREATE POLICY "Users can read society blocks"
  ON public.blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = blocks.society_id
        AND is_active = true
    )
  );

-- Admins and managers can manage blocks
DROP POLICY IF EXISTS "Admins can manage blocks" ON public.blocks;
CREATE POLICY "Admins can manage blocks"
  ON public.blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = blocks.society_id
        AND role IN ('admin', 'manager')
        AND is_active = true
    )
  );

-- ============================================
-- 5. UNITS TABLE
-- ============================================

-- Users can read units in their society
DROP POLICY IF EXISTS "Users can read society units" ON public.units;
CREATE POLICY "Users can read society units"
  ON public.units FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = units.society_id
        AND is_active = true
    )
  );

-- Admins and managers can manage units
DROP POLICY IF EXISTS "Admins can manage units" ON public.units;
CREATE POLICY "Admins can manage units"
  ON public.units FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = units.society_id
        AND role IN ('admin', 'manager')
        AND is_active = true
    )
  );

-- ============================================
-- 6. UNIT_RESIDENTS TABLE
-- ============================================

-- Users can view residents in their society
DROP POLICY IF EXISTS "Users can view society residents" ON public.unit_residents;
CREATE POLICY "Users can view society residents"
  ON public.unit_residents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN units u ON u.id = unit_residents.unit_id
      WHERE ur.user_id = auth.uid()
        AND ur.society_id = u.society_id
        AND ur.is_active = true
    )
  );

-- Admins and managers can manage residents
DROP POLICY IF EXISTS "Admins can manage residents" ON public.unit_residents;
CREATE POLICY "Admins can manage residents"
  ON public.unit_residents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN units u ON u.id = unit_residents.unit_id
      WHERE ur.user_id = auth.uid()
        AND ur.society_id = u.society_id
        AND ur.role IN ('admin', 'manager')
        AND ur.is_active = true
    )
  );

-- ============================================
-- 7. VISITORS TABLE (Complete Implementation)
-- ============================================

-- Guards can view all visitors in their society
DROP POLICY IF EXISTS "Guards can view visitors" ON public.visitors;
CREATE POLICY "Guards can view visitors"
  ON public.visitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = visitors.society_id
        AND role IN ('guard', 'admin', 'manager')
        AND is_active = true
    )
  );

-- Residents can view their own visitors
DROP POLICY IF EXISTS "Residents can view own visitors" ON public.visitors;
CREATE POLICY "Residents can view own visitors"
  ON public.visitors FOR SELECT
  USING (host_id = auth.uid());

-- Residents can create (pre-approve) visitors
DROP POLICY IF EXISTS "Residents can create visitors" ON public.visitors;
CREATE POLICY "Residents can create visitors"
  ON public.visitors FOR INSERT
  WITH CHECK (host_id = auth.uid());

-- Residents can update their own pre-approved visitors
DROP POLICY IF EXISTS "Residents can update own visitors" ON public.visitors;
CREATE POLICY "Residents can update own visitors"
  ON public.visitors FOR UPDATE
  USING (
    host_id = auth.uid() 
    AND status IN ('pending', 'approved')
  );

-- Guards can create walk-in visitors
DROP POLICY IF EXISTS "Guards can create walkin visitors" ON public.visitors;
CREATE POLICY "Guards can create walkin visitors"
  ON public.visitors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = visitors.society_id
        AND role IN ('guard', 'admin', 'manager')
        AND is_active = true
    )
  );

-- Guards can update visitors (check-in/out, status changes)
DROP POLICY IF EXISTS "Guards can update visitors" ON public.visitors;
CREATE POLICY "Guards can update visitors"
  ON public.visitors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = visitors.society_id
        AND role IN ('guard', 'admin', 'manager')
        AND is_active = true
    )
  );

-- ============================================
-- 8. ISSUES TABLE
-- ============================================

-- Residents can view their own issues
DROP POLICY IF EXISTS "Residents can view own issues" ON public.issues;
CREATE POLICY "Residents can view own issues"
  ON public.issues FOR SELECT
  USING (reported_by = auth.uid());

-- Residents can create issues
DROP POLICY IF EXISTS "Residents can create issues" ON public.issues;
CREATE POLICY "Residents can create issues"
  ON public.issues FOR INSERT
  WITH CHECK (reported_by = auth.uid());

-- Staff (guards, managers, admins) can view all society issues
DROP POLICY IF EXISTS "Staff can view society issues" ON public.issues;
CREATE POLICY "Staff can view society issues"
  ON public.issues FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = issues.society_id
        AND role IN ('admin', 'manager', 'guard')
        AND is_active = true
    )
  );

-- Managers and admins can manage all issues
DROP POLICY IF EXISTS "Managers can manage issues" ON public.issues;
CREATE POLICY "Managers can manage issues"
  ON public.issues FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = issues.society_id
        AND role IN ('admin', 'manager')
        AND is_active = true
    )
  );

-- ============================================
-- 9. ISSUE_UPDATES TABLE
-- ============================================

-- Users can view updates for issues they're involved with
DROP POLICY IF EXISTS "Users can view issue updates" ON public.issue_updates;
CREATE POLICY "Users can view issue updates"
  ON public.issue_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_updates.issue_id
        AND (i.reported_by = auth.uid() OR i.assigned_to = auth.uid())
    )
  );

-- Staff can view all updates in their society
DROP POLICY IF EXISTS "Staff can view society issue updates" ON public.issue_updates;
CREATE POLICY "Staff can view society issue updates"
  ON public.issue_updates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM issues i
      JOIN user_roles ur ON ur.society_id = i.society_id
      WHERE i.id = issue_updates.issue_id
        AND ur.user_id = auth.uid()
        AND ur.role IN ('admin', 'manager', 'guard')
        AND ur.is_active = true
    )
  );

-- Users can add updates to their own issues
DROP POLICY IF EXISTS "Users can add issue updates" ON public.issue_updates;
CREATE POLICY "Users can add issue updates"
  ON public.issue_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM issues i
      WHERE i.id = issue_updates.issue_id
        AND (i.reported_by = auth.uid() OR i.assigned_to = auth.uid())
    )
  );

-- ============================================
-- 10. ANNOUNCEMENTS TABLE
-- ============================================

-- Users can read announcements in their society
DROP POLICY IF EXISTS "Users can read society announcements" ON public.announcements;
CREATE POLICY "Users can read society announcements"
  ON public.announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = announcements.society_id
        AND is_active = true
    )
  );

-- Managers and admins can create announcements
DROP POLICY IF EXISTS "Staff can create announcements" ON public.announcements;
CREATE POLICY "Staff can create announcements"
  ON public.announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = announcements.society_id
        AND role IN ('admin', 'manager')
        AND is_active = true
    )
  );

-- Managers and admins can manage announcements
DROP POLICY IF EXISTS "Staff can manage announcements" ON public.announcements;
CREATE POLICY "Staff can manage announcements"
  ON public.announcements FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = announcements.society_id
        AND role IN ('admin', 'manager')
        AND is_active = true
    )
  );

-- ============================================
-- 11. ANNOUNCEMENT_READS TABLE
-- ============================================

-- Users can manage their own read status
DROP POLICY IF EXISTS "Users can manage own reads" ON public.announcement_reads;
CREATE POLICY "Users can manage own reads"
  ON public.announcement_reads FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 12. GUARD_SHIFTS TABLE
-- ============================================

-- Guards can view their own shifts
DROP POLICY IF EXISTS "Guards can view own shifts" ON public.guard_shifts;
CREATE POLICY "Guards can view own shifts"
  ON public.guard_shifts FOR SELECT
  USING (guard_id = auth.uid());

-- Staff can view all shifts in their society
DROP POLICY IF EXISTS "Staff can view society shifts" ON public.guard_shifts;
CREATE POLICY "Staff can view society shifts"
  ON public.guard_shifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = guard_shifts.society_id
        AND role IN ('admin', 'manager')
        AND is_active = true
    )
  );

-- Managers and admins can manage shifts
DROP POLICY IF EXISTS "Managers can manage shifts" ON public.guard_shifts;
CREATE POLICY "Managers can manage shifts"
  ON public.guard_shifts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = guard_shifts.society_id
        AND role IN ('admin', 'manager')
        AND is_active = true
    )
  );

-- Guards can create their own shifts
DROP POLICY IF EXISTS "Guards can create shifts" ON public.guard_shifts;
CREATE POLICY "Guards can create shifts"
  ON public.guard_shifts FOR INSERT
  WITH CHECK (guard_id = auth.uid());

-- ============================================
-- 13. NOTIFICATIONS TABLE
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- System (triggers) can create notifications for anyone
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can delete their own notifications
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- ============================================
-- 14. PARCELS TABLE
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- Guards can view all parcels in their society
DROP POLICY IF EXISTS "Guards can view society parcels" ON public.parcels;
CREATE POLICY "Guards can view society parcels"
  ON public.parcels FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = parcels.society_id
        AND role IN ('guard', 'admin', 'manager')
        AND is_active = true
    )
  );

-- Residents can view their own parcels
DROP POLICY IF EXISTS "Residents can view own parcels" ON public.parcels;
CREATE POLICY "Residents can view own parcels"
  ON public.parcels FOR SELECT
  USING (resident_id = auth.uid());

-- Guards can create parcels
DROP POLICY IF EXISTS "Guards can create parcels" ON public.parcels;
CREATE POLICY "Guards can create parcels"
  ON public.parcels FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = parcels.society_id
        AND role IN ('guard', 'admin', 'manager')
        AND is_active = true
    )
  );

-- Guards can update parcels (mark as collected)
DROP POLICY IF EXISTS "Guards can update parcels" ON public.parcels;
CREATE POLICY "Guards can update parcels"
  ON public.parcels FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = parcels.society_id
        AND role IN ('guard', 'admin', 'manager')
        AND is_active = true
    )
  );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count policies by table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Verify all tables have RLS enabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✓ Enabled' ELSE '✗ Disabled' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- POST-MIGRATION CHECKLIST
-- ============================================
-- [ ] All policies created without errors
-- [ ] Each table has multiple policies
-- [ ] RLS enabled confirmed on all tables
-- [ ] Test with different user roles
-- [ ] No "permission denied" errors in app
-- ============================================
