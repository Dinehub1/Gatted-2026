-- ============================================
-- STEP 0: Database Audit - Current State
-- ============================================
-- Run this FIRST to understand what's already in place
-- Copy output before making any changes
-- ============================================

-- 0.1 List all tables
SELECT '=== ALL TABLES ===' as section;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 0.2 Check RLS status on all tables
SELECT '=== RLS STATUS ===' as section;
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 0.3 List all existing RLS policies
SELECT '=== EXISTING RLS POLICIES ===' as section;
SELECT 
  tablename,
  policyname,
  cmd as operation,
  CASE permissive WHEN 'PERMISSIVE' THEN 'Y' ELSE 'N' END as permissive
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Count policies per table
SELECT '=== POLICY COUNT PER TABLE ===' as section;
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

-- 0.4 List all indexes
SELECT '=== INDEXES ===' as section;
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname NOT LIKE '%pkey'  -- Exclude primary keys
ORDER BY tablename, indexname;

-- 0.5 List all triggers
SELECT '=== TRIGGERS ===' as section;
SELECT 
  event_object_table as table_name,
  trigger_name,
  action_timing || ' ' || event_manipulation as trigger_event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 0.6 List all check constraints
SELECT '=== CHECK CONSTRAINTS ===' as section;
SELECT 
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE contype = 'c' 
  AND connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;

-- 0.7 Check notifications table schema
SELECT '=== NOTIFICATIONS TABLE SCHEMA ===' as section;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'notifications'
ORDER BY ordinal_position;

-- 0.8 Check parcels table schema
SELECT '=== PARCELS TABLE SCHEMA ===' as section;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'parcels'
ORDER BY ordinal_position;

-- 0.9 Check issue_updates table schema (verify column names)
SELECT '=== ISSUE_UPDATES TABLE SCHEMA ===' as section;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'issue_updates'
ORDER BY ordinal_position;

-- 0.10 Check unit_residents table schema (verify column names)
SELECT '=== UNIT_RESIDENTS TABLE SCHEMA ===' as section;
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'unit_residents'
ORDER BY ordinal_position;

-- 0.11 List all database functions
SELECT '=== DATABASE FUNCTIONS ===' as section;
SELECT 
  routine_name as function_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 0.12 Summary
SELECT '=== SUMMARY ===' as section;
SELECT 
  'Tables' as metric,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL
SELECT 
  'RLS Enabled Tables',
  COUNT(*)
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true
UNION ALL
SELECT 
  'Total RLS Policies',
  COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'Custom Indexes',
  COUNT(*)
FROM pg_indexes 
WHERE schemaname = 'public' AND indexname NOT LIKE '%pkey'
UNION ALL
SELECT 
  'Triggers',
  COUNT(DISTINCT trigger_name)
FROM information_schema.triggers
WHERE trigger_schema = 'public'
UNION ALL
SELECT 
  'Check Constraints',
  COUNT(*)
FROM pg_constraint
WHERE contype = 'c' AND connamespace = 'public'::regnamespace;

-- ============================================
-- INSTRUCTIONS:
-- 1. Copy this entire file
-- 2. Paste into Supabase SQL Editor
-- 3. Run the query
-- 4. Save the output for reference
-- 5. This will show current state before changes
-- ============================================
