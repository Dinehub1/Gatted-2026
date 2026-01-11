-- ============================================
-- MIGRATION 03: Data Validation Constraints
-- ============================================
-- This migration adds CHECK constraints for data quality
-- 
-- WARNING: May fail if existing data doesn't meet constraints
-- Clean invalid data first, then run this migration
-- 
-- REQUIRED: Run after 02_performance_indexes.sql
-- ============================================

-- ============================================
-- 1. PROFILES TABLE - Contact Validation
-- ============================================

-- Phone number format validation (E.164 format)
-- Format: +[country code][number] e.g., +911234567890
DO $$ 
BEGIN
  ALTER TABLE profiles 
  ADD CONSTRAINT check_phone_format 
  CHECK (phone ~ '^\+[1-9]\d{1,14}$');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Email format validation (allow NULL for optional emails)
DO $$ 
BEGIN
  ALTER TABLE profiles 
  ADD CONSTRAINT check_email_format 
  CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. VISITORS TABLE - Date & Time Logic
-- ============================================

-- Check-out must be after check-in
DO $$ 
BEGIN
  ALTER TABLE visitors 
  ADD CONSTRAINT check_checkout_after_checkin
  CHECK (checked_out_at IS NULL OR checked_out_at >= checked_in_at);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- OTP expiry must be after creation
DO $$ 
BEGIN
  ALTER TABLE visitors
  ADD CONSTRAINT check_otp_expiry
  CHECK (otp_expires_at IS NULL OR otp_expires_at > created_at);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Expected date should not be in far past
DO $$ 
BEGIN
  ALTER TABLE visitors
  ADD CONSTRAINT check_expected_date_reasonable
  CHECK (expected_date IS NULL OR expected_date >= CURRENT_DATE - INTERVAL '7 days');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Valid until date must be after created date (for recurring visitors)
DO $$ 
BEGIN
  ALTER TABLE visitors
  ADD CONSTRAINT check_valid_until_after_creation
  CHECK (valid_until IS NULL OR valid_until >= created_at::date);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 3. UNIT_RESIDENTS TABLE - Move Dates
-- ============================================

-- Move-out date must be after move-in date
DO $$ 
BEGIN
  ALTER TABLE unit_residents
  ADD CONSTRAINT check_move_dates
  CHECK (move_out_date IS NULL OR move_out_date >= move_in_date);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Move-in date should not be in far future
DO $$ 
BEGIN
  ALTER TABLE unit_residents
  ADD CONSTRAINT check_move_in_reasonable
  CHECK (move_in_date IS NULL OR move_in_date <= CURRENT_DATE + INTERVAL '90 days');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 4. GUARD_SHIFTS TABLE - Shift Times
-- ============================================

-- Shift end must be after shift start
DO $$ 
BEGIN
  ALTER TABLE guard_shifts
  ADD CONSTRAINT check_shift_times
  CHECK (shift_end IS NULL OR shift_end >= shift_start);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Shift duration should be reasonable (max 24 hours)
DO $$ 
BEGIN
  ALTER TABLE guard_shifts
  ADD CONSTRAINT check_shift_duration
  CHECK (
    shift_end IS NULL OR 
    shift_end - shift_start <= INTERVAL '24 hours'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 5. ISSUES TABLE - Resolution Logic
-- ============================================

-- Resolved/closed issues must have resolution data
DO $$ 
BEGIN
  ALTER TABLE issues
  ADD CONSTRAINT check_resolved_fields
  CHECK (
    (status IN ('resolved', 'closed') AND resolved_at IS NOT NULL AND resolved_by IS NOT NULL)
    OR
    (status NOT IN ('resolved', 'closed'))
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Resolved date must be after creation
DO $$ 
BEGIN
  ALTER TABLE issues
  ADD CONSTRAINT check_resolved_after_creation
  CHECK (resolved_at IS NULL OR resolved_at >= created_at);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Title should not be empty
DO $$ 
BEGIN
  ALTER TABLE issues
  ADD CONSTRAINT check_title_not_empty
  CHECK (LENGTH(TRIM(title)) > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 6. PARCELS TABLE - Collection Logic
-- ============================================

-- Collected parcels must have collection data
DO $$ 
BEGIN
  ALTER TABLE parcels
  ADD CONSTRAINT check_collected_fields
  CHECK (
    (status = 'collected' AND collected_at IS NOT NULL AND collected_by IS NOT NULL)
    OR
    (status = 'received')
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Collection date must be after received date
DO $$ 
BEGIN
  ALTER TABLE parcels
  ADD CONSTRAINT check_collected_after_received
  CHECK (collected_at IS NULL OR collected_at >= received_at);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 7. ANNOUNCEMENTS TABLE - Expiry Logic
-- ============================================

-- Expiry date should be in future when created
DO $$ 
BEGIN
  ALTER TABLE announcements
  ADD CONSTRAINT check_expiry_in_future
  CHECK (expires_at IS NULL OR expires_at > created_at);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Title and message should not be empty
DO $$ 
BEGIN
  ALTER TABLE announcements
  ADD CONSTRAINT check_title_message_not_empty
  CHECK (
    LENGTH(TRIM(title)) > 0 AND 
    LENGTH(TRIM(message)) > 0
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 8. SOCIETIES TABLE - Basic Validation
-- ============================================

-- Name should not be empty
DO $$ 
BEGIN
  ALTER TABLE societies
  ADD CONSTRAINT check_name_not_empty
  CHECK (LENGTH(TRIM(name)) > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Total units should be positive
DO $$ 
BEGIN
  ALTER TABLE societies
  ADD CONSTRAINT check_total_units_positive
  CHECK (total_units IS NULL OR total_units >= 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 9. UNITS TABLE - Basic Validation
-- ============================================

-- Unit number should not be empty
DO $$ 
BEGIN
  ALTER TABLE units
  ADD CONSTRAINT check_unit_number_not_empty
  CHECK (LENGTH(TRIM(unit_number)) > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Floor should be reasonable (0-100)
DO $$ 
BEGIN
  ALTER TABLE units
  ADD CONSTRAINT check_floor_reasonable
  CHECK (floor IS NULL OR (floor >= 0 AND floor <= 100));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Area should be positive
DO $$ 
BEGIN
  ALTER TABLE units
  ADD CONSTRAINT check_area_positive
  CHECK (area_sqft IS NULL OR area_sqft > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 10. BLOCKS TABLE - Basic Validation
-- ============================================

-- Block name should not be empty
DO $$ 
BEGIN
  ALTER TABLE blocks
  ADD CONSTRAINT check_block_name_not_empty
  CHECK (LENGTH(TRIM(name)) > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Total floors should be reasonable
DO $$ 
BEGIN
  ALTER TABLE blocks
  ADD CONSTRAINT check_total_floors_reasonable
  CHECK (total_floors IS NULL OR (total_floors > 0 AND total_floors <= 200));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- List all constraints
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype = 'c' 
  AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;

-- Count constraints per table
SELECT 
  conrelid::regclass AS table_name,
  COUNT(*) as constraint_count
FROM pg_constraint
WHERE contype = 'c' 
  AND connamespace = 'public'::regnamespace
GROUP BY conrelid
ORDER BY constraint_count DESC;

-- ============================================
-- TESTING CONSTRAINTS
-- ============================================

-- Test phone validation (should fail)
-- INSERT INTO profiles (id, phone) VALUES (gen_random_uuid(), 'invalid');

-- Test email validation (should fail)
-- INSERT INTO profiles (id, phone, email) VALUES (gen_random_uuid(), '+911234567890', 'invalid-email');

-- Test checkout before checkin (should fail)
-- UPDATE visitors SET checked_in_at = NOW(), checked_out_at = NOW() - INTERVAL '1 hour' WHERE id = '...';

-- ============================================
-- POST-MIGRATION CHECKLIST
-- ============================================
-- [ ] All constraints created successfully
-- [ ] No violations in existing data
-- [ ] Test with invalid data (should reject)
-- [ ] Application handles validation errors gracefully
-- ============================================
