-- ============================================
-- MIGRATION 02: Performance Indexes
-- ============================================
-- This migration adds critical indexes for query optimization
-- Safe to run - indexes don't affect data, only query performance
-- 
-- REQUIRED: Run after 01_complete_rls_policies.sql
-- ============================================

-- ============================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================

-- Active visitors lookup (guard dashboard)
-- Speeds up: WHERE society_id = X AND status IN (...) AND expected_date = Y
CREATE INDEX IF NOT EXISTS idx_visitors_active_lookup 
  ON visitors(society_id, status, expected_date) 
  WHERE status IN ('pending', 'approved', 'checked-in');

-- Active user roles (app startup, permission checks)
-- Speeds up: WHERE user_id = X AND is_active = true
CREATE INDEX IF NOT EXISTS idx_user_roles_active 
  ON user_roles(user_id, is_active) 
  WHERE is_active = true;

-- Issues dashboard filtering
-- Speeds up: WHERE society_id = X AND status = Y ORDER BY priority
CREATE INDEX IF NOT EXISTS idx_issues_dashboard 
  ON issues(society_id, status, priority);

-- ============================================
-- LOOKUP INDEXES
-- ============================================

-- Phone number lookup during OTP login
CREATE INDEX IF NOT EXISTS idx_profiles_phone 
  ON profiles(phone);

-- Block lookup for unit selector component
CREATE INDEX IF NOT EXISTS idx_blocks_society 
  ON blocks(society_id);

-- Unit residents lookup (who lives where)
CREATE INDEX IF NOT EXISTS idx_unit_residents_unit 
  ON unit_residents(unit_id);

CREATE INDEX IF NOT EXISTS idx_unit_residents_user 
  ON unit_residents(user_id);

-- Announcement reads lookup
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user
  ON announcement_reads(user_id, announcement_id);

-- ============================================
-- FILTERED INDEXES (Partial Indexes)
-- ============================================

-- Active announcements (not expired)
CREATE INDEX IF NOT EXISTS idx_announcements_active 
  ON announcements(society_id, created_at DESC) 
  WHERE expires_at IS NULL OR expires_at > NOW();

-- Unread notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
  ON notifications(user_id, created_at DESC) 
  WHERE read = false;

-- Pending parcels (not collected yet)
CREATE INDEX IF NOT EXISTS idx_parcels_pending
  ON parcels(society_id, unit_id, received_at DESC)
  WHERE status = 'received';

-- Open issues (active problems)
CREATE INDEX IF NOT EXISTS idx_issues_open
  ON issues(society_id, priority, created_at DESC)
  WHERE status IN ('open', 'in-progress');

-- ============================================
-- TEXT SEARCH INDEXES (Optional - Advanced)
-- ============================================

-- Full-text search on visitor names
CREATE INDEX IF NOT EXISTS idx_visitors_name_search
  ON visitors USING gin(to_tsvector('english', visitor_name));

-- Full-text search on issue titles and descriptions
CREATE INDEX IF NOT EXISTS idx_issues_text_search
  ON issues USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- List all new indexes
SELECT 
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check index usage statistics (run after app usage)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as times_used,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- ============================================
-- PERFORMANCE TESTING
-- ============================================

-- Test visitor query performance
EXPLAIN ANALYZE
SELECT * FROM visitors 
WHERE society_id = (SELECT id FROM societies LIMIT 1)
  AND status IN ('pending', 'approved')
  AND expected_date = CURRENT_DATE;
-- Should use: idx_visitors_active_lookup

-- Test user roles query performance
EXPLAIN ANALYZE
SELECT * FROM user_roles
WHERE user_id = auth.uid()
  AND is_active = true;
-- Should use: idx_user_roles_active

-- ============================================
-- POST-MIGRATION CHECKLIST
-- ============================================
-- [ ] All indexes created successfully
-- [ ] No errors or warnings in output
-- [ ] EXPLAIN ANALYZE shows index usage
-- [ ] Monitor query performance in production
-- ============================================
