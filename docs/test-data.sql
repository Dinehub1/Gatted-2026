-- ============================================
-- GATED - Comprehensive Test Data Script
-- ============================================
-- This script creates complete test data for all features
-- Run this AFTER executing database-schema.sql
-- 
-- QUICK START GUIDE:
-- 1. Run sections 1-3 (society, blocks, units) immediately
-- 2. Have test users login via phone OTP in the app
-- 3. Get their auth.users IDs from Supabase dashboard
-- 4. Replace placeholder IDs in sections 4-9 and run
-- ============================================

-- Clean up existing test data (optional - uncomment if needed)
-- DELETE FROM public.visitors WHERE society_id IN (SELECT id FROM public.societies WHERE name = 'Green Valley Apartments');
-- DELETE FROM public.issues WHERE society_id IN (SELECT id FROM public.societies WHERE name = 'Green Valley Apartments');
-- DELETE FROM public.user_roles WHERE society_id IN (SELECT id FROM public.societies WHERE name = 'Green Valley Apartments');
-- DELETE FROM public.unit_residents;
-- DELETE FROM public.units WHERE society_id IN (SELECT id FROM public.societies WHERE name = 'Green Valley Apartments');
-- DELETE FROM public.societies WHERE name = 'Green Valley Apartments';

-- ============================================
-- 1. CREATE TEST SOCIETY
-- ============================================

INSERT INTO public.societies (id, name, address, city, state, pincode, total_units)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Green Valley Apartments',
  '123 MG Road, Koramangala',
  'Bangalore',
  'Karnataka',
  '560034',
  12
) ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    state = EXCLUDED.state,
    pincode = EXCLUDED.pincode,
    total_units = EXCLUDED.total_units;

-- ============================================
-- 2. CREATE BLOCKS
-- ============================================

INSERT INTO public.blocks (id, society_id, name, total_floors)
VALUES 
  ('223e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Block A', 5),
  ('223e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Block B', 5)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    total_floors = EXCLUDED.total_floors;

-- ============================================
-- 3. CREATE TEST UNITS
-- ============================================

INSERT INTO public.units (id, society_id, block_id, unit_number, floor, type, area_sqft, is_occupied)
VALUES 
  -- Block A
  ('323e4567-e89b-12d3-a456-426614174101', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001', 'A-101', 1, '2BHK', 1200, true),
  ('323e4567-e89b-12d3-a456-426614174102', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001', 'A-102', 1, '3BHK', 1500, true),
  ('323e4567-e89b-12d3-a456-426614174201', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001', 'A-201', 2, '2BHK', 1200, true),
  ('323e4567-e89b-12d3-a456-426614174301', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001', 'A-301', 3, '2BHK', 1200, false),
  
  -- Block B
  ('323e4567-e89b-12d3-a456-426614175101', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174002', 'B-101', 1, '3BHK', 1600, true),
  ('323e4567-e89b-12d3-a456-426614175102', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174002', 'B-102', 1, '2BHK', 1100, true),
  ('323e4567-e89b-12d3-a456-426614175201', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174002', 'B-201', 2, '3BHK', 1600, true),
  ('323e4567-e89b-12d3-a456-426614175301', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174002', 'B-301', 3, '2BHK', 1150, false)
ON CONFLICT (id) DO UPDATE 
SET unit_number = EXCLUDED.unit_number,
    floor = EXCLUDED.floor,
    type = EXCLUDED.type,
    area_sqft = EXCLUDED.area_sqft,
    is_occupied = EXCLUDED.is_occupied;

-- ============================================
-- 4. CREATE TEST PROFILES
-- ============================================
-- IMPORTANT: Replace UUIDs with actual auth.users IDs
-- 
-- STEP 1: Have each test user login via phone OTP:
--   - Admin: +911234567890
--   - Manager: +911234567891
--   - Guard: +911234567892
--   - Resident 1: +911234567893
--   - Resident 2: +911234567894
--   - Resident 3: +911234567895
-- 
-- STEP 2: Get their auth.users.id from Supabase dashboard
--   Authentication > Users > Copy ID
-- 
-- STEP 3: Replace REPLACE-WITH-ACTUAL-USER-ID-X below
-- ============================================

-- Test Admin User
INSERT INTO public.profiles (id, phone, full_name, email)
VALUES (
  'REPLACE-WITH-ACTUAL-USER-ID-1',
  '+911234567890',
  'Rajesh Kumar (Admin)',
  'admin@greenvalley.com'
);

-- Test Manager User  
INSERT INTO public.profiles (id, phone, full_name, email)
VALUES (
  'REPLACE-WITH-ACTUAL-USER-ID-2',
  '+911234567891',
  'Priya Sharma (Manager)',
  'manager@greenvalley.com'
);

-- Test Guard User
INSERT INTO public.profiles (id, phone, full_name, email)
VALUES (
  'REPLACE-WITH-ACTUAL-USER-ID-3',
  '+911234567892',
  'Suresh Singh (Guard)',
  'guard@greenvalley.com'
);

-- Test Resident 1 (A-101)
INSERT INTO public.profiles (id, phone, full_name, email)
VALUES (
  'REPLACE-WITH-ACTUAL-USER-ID-4',
  '+911234567893',
  'Amit Verma',
  'amit@email.com'
);

-- Test Resident 2 (A-102)
INSERT INTO public.profiles (id, phone, full_name, email)
VALUES (
  'REPLACE-WITH-ACTUAL-USER-ID-5',
  '+911234567894',
  'Sneha Patel',
  'sneha@email.com'
);

-- Test Resident 3 (B-101)
INSERT INTO public.profiles (id, phone, full_name, email)
VALUES (
  'REPLACE-WITH-ACTUAL-USER-ID-6',
  '+911234567895',
  'Vikram Malhotra',
  'vikram@email.com'
);

-- ============================================
-- 5. ASSIGN USER ROLES
-- ============================================

-- Admin Role
INSERT INTO public.user_roles (user_id, society_id, role, is_active)
VALUES ('REPLACE-WITH-ACTUAL-USER-ID-1', '123e4567-e89b-12d3-a456-426614174000', 'admin', true);

-- Manager Role
INSERT INTO public.user_roles (user_id, society_id, role, is_active)
VALUES ('REPLACE-WITH-ACTUAL-USER-ID-2', '123e4567-e89b-12d3-a456-426614174000', 'manager', true);

-- Guard Role
INSERT INTO public.user_roles (user_id, society_id, role, is_active)
VALUES ('REPLACE-WITH-ACTUAL-USER-ID-3', '123e4567-e89b-12d3-a456-426614174000', 'guard', true);

-- Resident Roles
INSERT INTO public.user_roles (user_id, society_id, role, unit_id, is_active)
VALUES 
  ('REPLACE-WITH-ACTUAL-USER-ID-4', '123e4567-e89b-12d3-a456-426614174000', 'resident', '323e4567-e89b-12d3-a456-426614174101', true),
  ('REPLACE-WITH-ACTUAL-USER-ID-5', '123e4567-e89b-12d3-a456-426614174000', 'resident', '323e4567-e89b-12d3-a456-426614174102', true),
  ('REPLACE-WITH-ACTUAL-USER-ID-6', '123e4567-e89b-12d3-a456-426614174000', 'resident', '323e4567-e89b-12d3-a456-426614175101', true);

-- Link residents to units
INSERT INTO public.unit_residents (unit_id, user_id, resident_type, is_primary, move_in_date)
VALUES 
  ('323e4567-e89b-12d3-a456-426614174101', 'REPLACE-WITH-ACTUAL-USER-ID-4', 'owner', true, '2024-01-15'),
  ('323e4567-e89b-12d3-a456-426614174102', 'REPLACE-WITH-ACTUAL-USER-ID-5', 'owner', true, '2024-02-01'),
  ('323e4567-e89b-12d3-a456-426614175101', 'REPLACE-WITH-ACTUAL-USER-ID-6', 'tenant', true, '2024-03-10');

-- ============================================
-- 6. CREATE TEST VISITORS
-- ============================================

-- Expected Visitor (today, with OTP) - For Amit (A-101)
INSERT INTO public.visitors (
  society_id, unit_id, host_id, 
  visitor_name, visitor_phone, 
  visitor_type, purpose, 
  expected_date, expected_time,
  status, otp, otp_expires_at, qr_code
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614174101',
  'REPLACE-WITH-ACTUAL-USER-ID-4',
  'Rahul Kapoor',
  '+919876543210',
  'expected',
  'Family visit',
  CURRENT_DATE,
  '16:00:00',
  'approved',
  '123456',
  NOW() + INTERVAL '24 hours',
  'VISITOR_QR_123456'
);

-- Expected Visitor (tomorrow) - For Sneha (A-102)
INSERT INTO public.visitors (
  society_id, unit_id, host_id, 
  visitor_name, visitor_phone, 
  visitor_type, purpose, 
  expected_date, expected_time,
  status, otp, otp_expires_at
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614174102',
  'REPLACE-WITH-ACTUAL-USER-ID-5',
  'Amazon Delivery',
  '+919876543211',
  'delivery',
  'Package delivery',
  CURRENT_DATE + INTERVAL '1 day',
  '14:00:00',
  'approved',
  '789012',
  NOW() + INTERVAL '48 hours'
);

-- Walk-in Visitor (checked in) - For Vikram (B-101)
INSERT INTO public.visitors (
  society_id, unit_id, host_id, 
  visitor_name, visitor_phone, vehicle_number,
  visitor_type, purpose, 
  expected_date,
  status, checked_in_at, checked_in_by
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614175101',
  'REPLACE-WITH-ACTUAL-USER-ID-6',
  'Plumber - Ram Kumar',
  '+919876543212',
  'KA01AB1234',
  'service',
  'Bathroom leak repair',
  CURRENT_DATE,
  'checked-in',
  NOW() - INTERVAL '2 hours',
  'REPLACE-WITH-ACTUAL-USER-ID-3'
);

-- Past Visitor (checked out) - For Amit (A-101)
INSERT INTO public.visitors (
  society_id, unit_id, host_id, 
  visitor_name, visitor_phone,
  visitor_type, purpose, 
  expected_date,
  status, 
  checked_in_at, checked_in_by,
  checked_out_at, checked_out_by
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614174101',
  'REPLACE-WITH-ACTUAL-USER-ID-4',
  'Guest - Meera Shah',
  '+919876543213',
  'guest',
  'Birthday party',
  CURRENT_DATE - INTERVAL '2 days',
  'checked-out',
  NOW() - INTERVAL '2 days' - INTERVAL '3 hours',
  'REPLACE-WITH-ACTUAL-USER-ID-3',
  NOW() - INTERVAL '2 days' + INTERVAL '2 hours',
  'REPLACE-WITH-ACTUAL-USER-ID-3'
);

-- Pending Visitor (needs approval) - For Sneha (A-102)
INSERT INTO public.visitors (
  society_id, unit_id, host_id, 
  visitor_name, visitor_phone,
  visitor_type, purpose, 
  expected_date, expected_time,
  status
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614174102',
  'REPLACE-WITH-ACTUAL-USER-ID-5',
  'Electrician - Sunil',
  '+919876543214',
  'service',
  'Fan repair',
  CURRENT_DATE + INTERVAL '3 days',
  '11:00:00',
  'pending'
);

-- ============================================
-- 7. CREATE TEST ISSUES
-- ============================================

-- Open Issue - High Priority (Amit's issue)
INSERT INTO public.issues (
  society_id, unit_id, reported_by,
  title, description, category, priority, status
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614174101',
  'REPLACE-WITH-ACTUAL-USER-ID-4',
  'Water leakage in bathroom',
  'There is continuous water leakage from the ceiling of the bathroom. It has been going on for 2 days now.',
  'plumbing',
  'high',
  'open'
);

-- In Progress Issue - Urgent (Vikram's issue)
INSERT INTO public.issues (
  society_id, unit_id, reported_by,
  title, description, category, priority, status,
  assigned_to, assigned_at
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614175101',
  'REPLACE-WITH-ACTUAL-USER-ID-6',
  'Elevator not working',
  'Block B elevator has been stuck on 3rd floor since morning',
  'maintenance',
  'urgent',
  'in-progress',
  'REPLACE-WITH-ACTUAL-USER-ID-2',
  NOW() - INTERVAL '3 hours'
);

-- Resolved Issue (Sneha's issue)
INSERT INTO public.issues (
  society_id, unit_id, reported_by,
  title, description, category, priority, status,
  assigned_to, assigned_at,
  resolved_by, resolved_at, resolution_notes
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614174102',
  'REPLACE-WITH-ACTUAL-USER-ID-5',
  'Street light not working',
  'The street light near Block A parking is not working',
  'electrical',
  'medium',
  'resolved',
  'REPLACE-WITH-ACTUAL-USER-ID-2',
  NOW() - INTERVAL '5 days',
  'REPLACE-WITH-ACTUAL-USER-ID-2',
  NOW() - INTERVAL '2 days',
  'Replaced the faulty bulb and checked wiring. All fixed now.'
);

-- Low Priority Issue (Common area)
INSERT INTO public.issues (
  society_id, unit_id, reported_by,
  title, description, category, priority, status
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614174101',
  'REPLACE-WITH-ACTUAL-USER-ID-4',
  'Garden maintenance needed',
  'The garden in front of Block A needs watering and trimming',
  'maintenance',
  'low',
  'open'
);

-- Security Issue (Parking)
INSERT INTO public.issues (
  society_id, unit_id, reported_by,
  title, description, category, priority, status
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '323e4567-e89b-12d3-a456-426614175101',
  'REPLACE-WITH-ACTUAL-USER-ID-6',
  'Unauthorized parking in visitor slot',
  'Unknown vehicle parked in visitor parking for 3 days',
  'parking',
  'medium',
  'open'
);

-- ============================================
-- 8. CREATE ANNOUNCEMENTS
-- ============================================

-- Society-wide announcement
INSERT INTO public.announcements (
  society_id, title, message, target_type, created_by, expires_at
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '🎉 New Year Celebration',
  'Join us for the New Year celebration on 31st December at 8 PM in the community hall. Please RSVP by 28th December.',
  'all',
  'REPLACE-WITH-ACTUAL-USER-ID-2',
  CURRENT_DATE + INTERVAL '21 days'
);

-- Block-specific announcement
INSERT INTO public.announcements (
  society_id, title, message, 
  target_type, target_block_id, 
  created_by, expires_at
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '⚠️ Water Supply Maintenance',
  'Water supply to Block A will be interrupted tomorrow from 10 AM to 2 PM for tank cleaning.',
  'block',
  '223e4567-e89b-12d3-a456-426614174001',
  'REPLACE-WITH-ACTUAL-USER-ID-2',
  CURRENT_DATE + INTERVAL '2 days'
);

-- Urgent announcement
INSERT INTO public.announcements (
  society_id, title, message, target_type, created_by, expires_at
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '🚨 Security Alert',
  'Please ensure all visitors are registered. Recent unauthorized entries have been reported.',
  'all',
  'REPLACE-WITH-ACTUAL-USER-ID-1',
  CURRENT_DATE + INTERVAL '7 days'
);

-- ============================================
-- 9. CREATE GUARD SHIFT (Current)
-- ============================================

INSERT INTO public.guard_shifts (
  society_id, guard_id, shift_start
)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'REPLACE-WITH-ACTUAL-USER-ID-3',
  NOW() - INTERVAL '3 hours'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify data was inserted correctly

-- Check societies
SELECT id, name, city, total_units FROM public.societies;

-- Check units
SELECT unit_number, block_id, type, is_occupied FROM public.units ORDER BY unit_number;

-- Check profiles
SELECT phone, full_name, email FROM public.profiles;

-- Check user roles with details
SELECT ur.role, p.full_name, u.unit_number 
FROM public.user_roles ur
LEFT JOIN public.profiles p ON ur.user_id = p.id
LEFT JOIN public.units u ON ur.unit_id = u.id
ORDER BY ur.role;

-- Check visitors
SELECT visitor_name, visitor_type, status, expected_date, host_id 
FROM public.visitors 
ORDER BY expected_date DESC;

-- Check issues
SELECT title, category, priority, status, reported_by 
FROM public.issues 
ORDER BY created_at DESC;

-- Check announcements
SELECT title, target_type, created_at 
FROM public.announcements 
ORDER BY created_at DESC;

-- Check guard shifts
SELECT guard_id, shift_start, shift_end 
FROM public.guard_shifts 
ORDER BY shift_start DESC;
