-- ============================================
-- GATED Database Improvements
-- ============================================
-- This SQL file contains all recommended improvements
-- from the database analysis report.
-- 
-- IMPORTANT: Review each section before executing
-- Make backups before running in production
-- ============================================

-- ============================================
-- SECTION 1: MISSING TABLES
-- ============================================

-- 1.1 Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) CHECK(type IN ('info', 'warning', 'success', 'visitor', 'issue', 'announcement')) DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}', -- For additional context (visitor_id, issue_id, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1.2 Parcels Table
CREATE TABLE IF NOT EXISTS public.parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID NOT NULL REFERENCES public.societies(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  resident_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  tracking_number VARCHAR(100),
  courier_name VARCHAR(100),
  description TEXT,
  
  status VARCHAR(20) CHECK(status IN ('received', 'collected')) DEFAULT 'received',
  
  received_at TIMESTAMPTZ DEFAULT NOW(),
  received_by UUID REFERENCES public.profiles(id), -- Guard who received
  
  collected_at TIMESTAMPTZ,
  collected_by UUID REFERENCES public.profiles(id), -- Resident who collected
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_parcels_society ON parcels(society_id);
CREATE INDEX idx_parcels_unit ON parcels(unit_id);
CREATE INDEX idx_parcels_status ON parcels(status);
CREATE INDEX idx_parcels_resident ON parcels(resident_id);

-- Enable RLS
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 2: MISSING INDEXES
-- ============================================

-- 2.1 Composite Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_visitors_active_lookup 
  ON visitors(society_id, status, expected_date) 
  WHERE status IN ('pending', 'approved', 'checked-in');

CREATE INDEX IF NOT EXISTS idx_user_roles_active 
  ON user_roles(user_id, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_issues_dashboard 
  ON issues(society_id, status, priority);

-- 2.2 Lookup Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone 
  ON profiles(phone);

CREATE INDEX IF NOT EXISTS idx_blocks_society 
  ON blocks(society_id);

CREATE INDEX IF NOT EXISTS idx_unit_residents_unit 
  ON unit_residents(unit_id);

CREATE INDEX IF NOT EXISTS idx_unit_residents_user 
  ON unit_residents(user_id);

CREATE INDEX IF NOT EXISTS idx_announcements_expires 
  ON announcements(society_id, expires_at) 
  WHERE expires_at IS NOT NULL;

-- ============================================
-- SECTION 3: DATA VALIDATION CONSTRAINTS
-- ============================================

-- 3.1 Phone Number Validation
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_phone_format 
CHECK (phone ~ '^\+[1-9]\d{1,14}$');

-- 3.2 Email Validation (only if email is provided)
ALTER TABLE profiles 
ADD CONSTRAINT IF NOT EXISTS check_email_format 
CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 3.3 Date Logic Validation
ALTER TABLE visitors 
ADD CONSTRAINT IF NOT EXISTS check_checkout_after_checkin
CHECK (checked_out_at IS NULL OR checked_out_at >= checked_in_at);

ALTER TABLE visitors
ADD CONSTRAINT IF NOT EXISTS check_otp_expiry
CHECK (otp_expires_at IS NULL OR otp_expires_at > created_at);

ALTER TABLE unit_residents
ADD CONSTRAINT IF NOT EXISTS check_move_dates
CHECK (move_out_date IS NULL OR move_out_date >= move_in_date);

ALTER TABLE guard_shifts
ADD CONSTRAINT IF NOT EXISTS check_shift_times
CHECK (shift_end IS NULL OR shift_end >= shift_start);

-- 3.4 Status Transition Logic
ALTER TABLE issues
ADD CONSTRAINT IF NOT EXISTS check_resolved_fields
CHECK (
  (status IN ('resolved', 'closed') AND resolved_at IS NOT NULL AND resolved_by IS NOT NULL)
  OR
  (status NOT IN ('resolved', 'closed'))
);

ALTER TABLE parcels
ADD CONSTRAINT IF NOT EXISTS check_collected_fields
CHECK (
  (status = 'collected' AND collected_at IS NOT NULL AND collected_by IS NOT NULL)
  OR
  (status = 'received')
);

-- ============================================
-- SECTION 4: MISSING TRIGGERS
-- ============================================

-- 4.1 Add updated_at triggers to remaining tables
DROP TRIGGER IF EXISTS update_blocks_updated_at ON blocks;
CREATE TRIGGER update_blocks_updated_at BEFORE UPDATE ON blocks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON announcements;
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guard_shifts_updated_at ON guard_shifts;
CREATE TRIGGER update_guard_shifts_updated_at BEFORE UPDATE ON guard_shifts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_parcels_updated_at ON parcels;
CREATE TRIGGER update_parcels_updated_at BEFORE UPDATE ON parcels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4.2 Auto-create Profile on User Signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.phone, ''), 
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4.3 Visitor Status Change Notifications
CREATE OR REPLACE FUNCTION notify_visitor_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify when visitor checks in
  IF NEW.status = 'checked-in' AND (OLD.status IS NULL OR OLD.status != 'checked-in') THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.host_id,
      'Visitor Arrived',
      NEW.visitor_name || ' has checked in at ' || TO_CHAR(NEW.checked_in_at, 'HH24:MI'),
      'visitor',
      jsonb_build_object('visitor_id', NEW.id, 'action', 'checked-in')
    );
  END IF;
  
  -- Notify when visitor checks out
  IF NEW.status = 'checked-out' AND (OLD.status IS NULL OR OLD.status != 'checked-out') THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.host_id,
      'Visitor Departed',
      NEW.visitor_name || ' has checked out at ' || TO_CHAR(NEW.checked_out_at, 'HH24:MI'),
      'visitor',
      jsonb_build_object('visitor_id', NEW.id, 'action', 'checked-out')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS visitor_status_notification ON visitors;
CREATE TRIGGER visitor_status_notification
  AFTER UPDATE ON visitors
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_visitor_status_change();

-- 4.4 Issue Assignment Notifications
CREATE OR REPLACE FUNCTION notify_issue_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify when issue is assigned
  IF NEW.assigned_to IS NOT NULL AND (OLD.assigned_to IS NULL OR OLD.assigned_to != NEW.assigned_to) THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.assigned_to,
      'New Issue Assigned',
      'You have been assigned: ' || NEW.title,
      'issue',
      jsonb_build_object('issue_id', NEW.id, 'action', 'assigned')
    );
  END IF;
  
  -- Notify reporter when issue status changes
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.reported_by IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.reported_by,
      'Issue Status Updated',
      'Your issue "' || NEW.title || '" is now ' || NEW.status,
      'issue',
      jsonb_build_object('issue_id', NEW.id, 'action', 'status_change', 'new_status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS issue_notification ON issues;
CREATE TRIGGER issue_notification
  AFTER UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION notify_issue_assignment();

-- 4.5 Parcel Received Notification
CREATE OR REPLACE FUNCTION notify_parcel_received()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify resident when parcel is received
    IF NEW.resident_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, message, type, metadata)
      VALUES (
        NEW.resident_id,
        'Parcel Received',
        'A parcel from ' || COALESCE(NEW.courier_name, 'courier') || ' has been received for you',
        'info',
        jsonb_build_object('parcel_id', NEW.id, 'action', 'received')
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS parcel_notification ON parcels;
CREATE TRIGGER parcel_notification
  AFTER INSERT ON parcels
  FOR EACH ROW
  EXECUTE FUNCTION notify_parcel_received();

-- ============================================
-- SECTION 5: DATABASE FUNCTIONS
-- ============================================

-- 5.1 Get User's Primary Society and Role
CREATE OR REPLACE FUNCTION get_user_context(user_uuid UUID)
RETURNS TABLE (
  society_id UUID,
  society_name VARCHAR(255),
  role user_role,
  unit_id UUID,
  unit_number VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.society_id,
    s.name as society_name,
    ur.role,
    ur.unit_id,
    u.unit_number
  FROM user_roles ur
  LEFT JOIN societies s ON s.id = ur.society_id
  LEFT JOIN units u ON u.id = ur.unit_id
  WHERE ur.user_id = user_uuid
    AND ur.is_active = true
  ORDER BY 
    CASE ur.role
      WHEN 'admin' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'guard' THEN 3
      WHEN 'resident' THEN 4
      WHEN 'owner' THEN 5
      WHEN 'tenant' THEN 6
    END
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.2 Check if User Has Role in Society
CREATE OR REPLACE FUNCTION user_has_role(
  user_uuid UUID, 
  role_name user_role, 
  society_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid
      AND role = role_name
      AND society_id = society_uuid
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.3 Check if User Can Access Society
CREATE OR REPLACE FUNCTION user_can_access_society(
  user_uuid UUID,
  society_uuid UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = user_uuid
      AND society_id = society_uuid
      AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.4 Atomic Visitor Check-in
CREATE OR REPLACE FUNCTION checkin_visitor(
  visitor_uuid UUID,
  guard_uuid UUID,
  otp_code VARCHAR(6) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  visitor_record RECORD;
  result JSONB;
BEGIN
  -- Get visitor record
  SELECT * INTO visitor_record FROM visitors WHERE id = visitor_uuid FOR UPDATE;
  
  -- Validation
  IF visitor_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Visitor not found');
  END IF;
  
  IF visitor_record.status = 'checked-in' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Visitor already checked in');
  END IF;
  
  -- Verify OTP if required
  IF visitor_record.visitor_type = 'expected' AND otp_code IS NOT NULL THEN
    IF visitor_record.otp IS NULL OR visitor_record.otp != otp_code THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid OTP');
    END IF;
    
    IF visitor_record.otp_expires_at < NOW() THEN
      RETURN jsonb_build_object('success', false, 'error', 'OTP expired');
    END IF;
  END IF;
  
  -- Update visitor
  UPDATE visitors
  SET 
    status = 'checked-in',
    checked_in_at = NOW(),
    checked_in_by = guard_uuid
  WHERE id = visitor_uuid;
  
  RETURN jsonb_build_object(
    'success', true, 
    'visitor_id', visitor_uuid,
    'checked_in_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.5 Atomic Visitor Check-out
CREATE OR REPLACE FUNCTION checkout_visitor(
  visitor_uuid UUID,
  guard_uuid UUID
)
RETURNS JSONB AS $$
DECLARE
  visitor_record RECORD;
BEGIN
  -- Get visitor record
  SELECT * INTO visitor_record FROM visitors WHERE id = visitor_uuid FOR UPDATE;
  
  -- Validation
  IF visitor_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Visitor not found');
  END IF;
  
  IF visitor_record.status != 'checked-in' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Visitor not checked in');
  END IF;
  
  -- Update visitor
  UPDATE visitors
  SET 
    status = 'checked-out',
    checked_out_at = NOW(),
    checked_out_by = guard_uuid
  WHERE id = visitor_uuid;
  
  RETURN jsonb_build_object(
    'success', true, 
    'visitor_id', visitor_uuid,
    'checked_out_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.6 Get Guard Dashboard Statistics
CREATE OR REPLACE FUNCTION get_guard_dashboard_stats(society_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'expected_today', (
      SELECT COUNT(*) FROM visitors
      WHERE society_id = society_uuid
        AND expected_date = CURRENT_DATE
        AND status IN ('pending', 'approved')
    ),
    'checked_in_now', (
      SELECT COUNT(*) FROM visitors
      WHERE society_id = society_uuid
        AND status = 'checked-in'
    ),
    'pending_parcels', (
      SELECT COUNT(*) FROM parcels
      WHERE society_id = society_uuid
        AND status = 'received'
    ),
    'open_issues', (
      SELECT COUNT(*) FROM issues
      WHERE society_id = society_uuid
        AND status = 'open'
    )
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 6: ROW LEVEL SECURITY POLICIES
-- ============================================

-- 6.1 Profiles Table Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to read profiles in their society
DROP POLICY IF EXISTS "Users can read society profiles" ON public.profiles;
CREATE POLICY "Users can read society profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.society_id IN (
          SELECT society_id FROM user_roles
          WHERE user_id = profiles.id
        )
    )
  );

-- 6.2 User Roles Table Policies
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
  ON public.user_roles FOR SELECT
  USING (user_id = auth.uid());

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

-- 6.3 Societies Table Policies
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

-- 6.4 Units Table Policies
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

-- 6.5 Blocks Table Policies
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

-- 6.6 Visitors Table Policies
DROP POLICY IF EXISTS "Guards can view visitors" ON public.visitors;
CREATE POLICY "Guards can view visitors"
  ON public.visitors FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = visitors.society_id
        AND role = 'guard'
        AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Residents can view own visitors" ON public.visitors;
CREATE POLICY "Residents can view own visitors"
  ON public.visitors FOR SELECT
  USING (host_id = auth.uid());

DROP POLICY IF EXISTS "Residents can create visitors" ON public.visitors;
CREATE POLICY "Residents can create visitors"
  ON public.visitors FOR INSERT
  WITH CHECK (host_id = auth.uid());

DROP POLICY IF EXISTS "Residents can update own visitors" ON public.visitors;
CREATE POLICY "Residents can update own visitors"
  ON public.visitors FOR UPDATE
  USING (host_id = auth.uid());

DROP POLICY IF EXISTS "Guards can manage visitors" ON public.visitors;
CREATE POLICY "Guards can manage visitors"
  ON public.visitors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
        AND society_id = visitors.society_id
        AND role IN ('guard', 'admin', 'manager')
        AND is_active = true
    )
  );

-- 6.7 Issues Table Policies
DROP POLICY IF EXISTS "Residents can view own issues" ON public.issues;
CREATE POLICY "Residents can view own issues"
  ON public.issues FOR SELECT
  USING (reported_by = auth.uid());

DROP POLICY IF EXISTS "Residents can create issues" ON public.issues;
CREATE POLICY "Residents can create issues"
  ON public.issues FOR INSERT
  WITH CHECK (reported_by = auth.uid());

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

-- 6.8 Announcements Table Policies
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

-- 6.9 Announcement Reads Policies
DROP POLICY IF EXISTS "Users can manage own reads" ON public.announcement_reads;
CREATE POLICY "Users can manage own reads"
  ON public.announcement_reads FOR ALL
  USING (user_id = auth.uid());

-- 6.10 Guard Shifts Policies
DROP POLICY IF EXISTS "Guards can view own shifts" ON public.guard_shifts;
CREATE POLICY "Guards can view own shifts"
  ON public.guard_shifts FOR SELECT
  USING (guard_id = auth.uid());

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

-- 6.11 Unit Residents Policies
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

-- 6.12 Issue Updates Policies
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

-- 6.13 Notifications Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true); -- Triggers can create notifications

-- 6.14 Parcels Policies
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

DROP POLICY IF EXISTS "Residents can view own parcels" ON public.parcels;
CREATE POLICY "Residents can view own parcels"
  ON public.parcels FOR SELECT
  USING (resident_id = auth.uid());

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
-- SECTION 7: MATERIALIZED VIEWS (OPTIONAL)
-- ============================================

-- 7.1 Society Statistics View
CREATE MATERIALIZED VIEW IF NOT EXISTS society_stats AS
SELECT 
  s.id as society_id,
  s.name as society_name,
  COUNT(DISTINCT u.id) as total_units,
  COUNT(DISTINCT u.id) FILTER (WHERE u.is_occupied = true) as occupied_units,
  COUNT(DISTINCT ur.user_id) FILTER (WHERE ur.role IN ('resident', 'owner', 'tenant')) as total_residents,
  COUNT(DISTINCT ur.user_id) FILTER (WHERE ur.role = 'guard') as total_guards,
  COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'checked-in') as current_visitors,
  COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'open') as open_issues,
  COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'received') as pending_parcels
FROM societies s
LEFT JOIN units u ON u.society_id = s.id
LEFT JOIN user_roles ur ON ur.society_id = s.id AND ur.is_active = true
LEFT JOIN visitors v ON v.society_id = s.id
LEFT JOIN issues i ON i.society_id = s.id
LEFT JOIN parcels p ON p.society_id = s.id
GROUP BY s.id, s.name;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_society_stats_society 
  ON society_stats(society_id);

-- Refresh function (call this periodically or on-demand)
CREATE OR REPLACE FUNCTION refresh_society_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY society_stats;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Check all indexes
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check all triggers
SELECT trigger_schema, trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check all constraints
SELECT conname, contype, conrelid::regclass AS table_name
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;

-- ============================================
-- END OF IMPROVEMENTS
-- ============================================
