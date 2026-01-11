-- ============================================
-- MIGRATION 04: Helper Functions & Automation
-- ============================================
-- This migration adds powerful database functions to simplify
-- application logic and ensure data integrity.
-- 
-- INCLUDES:
-- 1. User Context Helper (get_user_context)
-- 2. Atomic Visitor Operations (checkin/checkout)
-- 3. Automation Triggers (Notifications)
-- ============================================

-- ============================================
-- 1. USER CONTEXT HELPER
-- ============================================
-- Simplifies fetching user's role, society, and unit details
-- Returns the most privileged active role for the user

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
    s.name,
    ur.role,
    ur.unit_id,
    u.unit_number
  FROM user_roles ur
  LEFT JOIN societies s ON s.id = ur.society_id
  LEFT JOIN units u ON u.id = ur.unit_id
  WHERE ur.user_id = user_uuid AND ur.is_active = true
  ORDER BY 
    CASE ur.role
      WHEN 'admin' THEN 1
      WHEN 'manager' THEN 2
      WHEN 'guard' THEN 3
      ELSE 4
    END
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. ATOMIC VISITOR OPERATIONS
-- ============================================
-- Handles complex logic for visitor check-in ensuring data integrity

CREATE OR REPLACE FUNCTION checkin_visitor(
  visitor_uuid UUID,
  guard_uuid UUID,
  otp_code VARCHAR(6) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  visitor_record RECORD;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT * INTO visitor_record FROM visitors WHERE id = visitor_uuid FOR UPDATE;
  
  IF visitor_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Visitor not found');
  END IF;
  
  IF visitor_record.status = 'checked-in' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already checked in');
  END IF;
  
  -- Verify OTP for expected visitors
  IF visitor_record.visitor_type = 'expected' AND otp_code IS NOT NULL THEN
    IF visitor_record.otp IS NULL OR visitor_record.otp != otp_code THEN
      RETURN jsonb_build_object('success', false, 'error', 'Invalid OTP');
    END IF;
    IF visitor_record.otp_expires_at < NOW() THEN
      RETURN jsonb_build_object('success', false, 'error', 'OTP expired');
    END IF;
  END IF;
  
  -- Perform the update
  UPDATE visitors
  SET 
    status = 'checked-in', 
    checked_in_at = NOW(), 
    checked_in_by = guard_uuid
  WHERE id = visitor_uuid;
  
  RETURN jsonb_build_object('success', true, 'visitor_id', visitor_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Checkout function
CREATE OR REPLACE FUNCTION checkout_visitor(
  visitor_uuid UUID,
  guard_uuid UUID
)
RETURNS JSONB AS $$
DECLARE
  visitor_record RECORD;
BEGIN
  SELECT * INTO visitor_record FROM visitors WHERE id = visitor_uuid FOR UPDATE;
  
  IF visitor_record IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Visitor not found');
  END IF;
  
  IF visitor_record.status = 'checked-out' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already checked out');
  END IF;
  
  UPDATE visitors
  SET 
    status = 'checked-out', 
    checked_out_at = NOW(), 
    checked_out_by = guard_uuid
  WHERE id = visitor_uuid;
  
  RETURN jsonb_build_object('success', true, 'visitor_id', visitor_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. NOTIFICATION TRIGGERS
-- ============================================
-- Automatically create notifications for key events

-- Function to handle visitor status changes
CREATE OR REPLACE FUNCTION notify_visitor_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify host when visitor checks in
  IF NEW.status = 'checked-in' AND (OLD.status IS NULL OR OLD.status != 'checked-in') THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.host_id,
      'Visitor Arrived',
      NEW.visitor_name || ' has checked in',
      'visitor',
      jsonb_build_object('visitor_id', NEW.id, 'action', 'checked-in')
    );
  END IF;
  
  -- Notify host when visitor checks out
  IF NEW.status = 'checked-out' AND (OLD.status IS NULL OR OLD.status != 'checked-out') THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.host_id,
      'Visitor Departed',
      NEW.visitor_name || ' has checked out',
      'visitor',
      jsonb_build_object('visitor_id', NEW.id, 'action', 'checked-out')
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for visitor notifications
DROP TRIGGER IF EXISTS visitor_status_notification ON visitors;
CREATE TRIGGER visitor_status_notification
  AFTER UPDATE ON visitors
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_visitor_status_change();

-- Function to handle issue updates
CREATE OR REPLACE FUNCTION notify_issue_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify staff when issue is assigned to them
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
  
  -- Notify reporter when status changes (if not changed by themselves)
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.reported_by IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.reported_by,
      'Issue Status Updated',
      'Your issue "' || NEW.title || '" is now ' || NEW.status,
      'issue',
      jsonb_build_object('issue_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for issue notifications
DROP TRIGGER IF EXISTS issue_notification ON issues;
CREATE TRIGGER issue_notification
  AFTER UPDATE ON issues
  FOR EACH ROW
  EXECUTE FUNCTION notify_issue_changes();

-- Function to handle parcel receipt
CREATE OR REPLACE FUNCTION notify_parcel_received()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.resident_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, metadata)
    VALUES (
      NEW.resident_id,
      'Parcel Received',
      'A parcel has been received for you',
      'info',
      jsonb_build_object('parcel_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for parcel notifications
DROP TRIGGER IF EXISTS parcel_notification ON parcels;
CREATE TRIGGER parcel_notification
  AFTER INSERT ON parcels
  FOR EACH ROW
  EXECUTE FUNCTION notify_parcel_received();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- List all functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_context', 'checkin_visitor', 'checkout_visitor');

-- List all triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
  AND trigger_name IN ('visitor_status_notification', 'issue_notification', 'parcel_notification');
