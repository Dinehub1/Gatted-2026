# GATED Application - Database & Architecture Analysis Report

**Date:** January 11, 2026  
**Analyst:** System Architecture Review  
**Project:** GATED - Society Management System

---

## Executive Summary

The GATED application is a **React Native/Expo** mobile application with **Supabase** (PostgreSQL) backend. The analysis reveals a **well-structured foundation** with clear role-based architecture, but there are **critical gaps in RLS policies, missing database objects, and optimization opportunities**.

### Overall Assessment: ⚠️ **NEEDS IMPROVEMENT** (6.5/10)

**Strengths:**
- ✅ Clean, normalized database schema
- ✅ Good use of ENUMs for type safety
- ✅ Basic indexing in place
- ✅ Trigger-based automation (timestamps, OTP generation)
- ✅ Role-based application architecture

**Critical Issues:**
- ❌ Incomplete RLS policies (major security gap)
- ❌ Missing database tables (notifications, parcels)
- ❌ No foreign key indexing optimization
- ❌ Missing composite indexes for common queries
- ❌ No database functions for complex operations
- ❌ Insufficient triggers for audit trails

---

## 1. Database Schema Analysis

### 1.1 Tables Overview

| Table | Status | Issues | Priority |
|-------|--------|--------|----------|
| **profiles** | ✅ Good | Missing RLS policies | HIGH |
| **societies** | ✅ Good | Missing RLS policies | HIGH |
| **blocks** | ✅ Good | Missing RLS, no updated_at trigger | MEDIUM |
| **units** | ✅ Good | Missing RLS policies | HIGH |
| **user_roles** | ⚠️ Partial | Only 1 RLS policy, critical security gap | CRITICAL |
| **unit_residents** | ⚠️ Partial | Missing RLS entirely | CRITICAL |
| **visitors** | ⚠️ Partial | Only 1 RLS policy (guards only) | CRITICAL |
| **issues** | ⚠️ Partial | Missing RLS policies | HIGH |
| **announcements** | ⚠️ Partial | Missing RLS policies | HIGH |
| **announcement_reads** | ⚠️ Partial | Missing RLS policies | MEDIUM |
| **guard_shifts** | ⚠️ Partial | Missing RLS policies | MEDIUM |
| **issue_updates** | ✅ Good | Missing RLS policies | MEDIUM |
| **notifications** | ❌ **MISSING** | Not in schema, but in TypeScript types | CRITICAL |
| **parcels** | ❌ **MISSING** | Not in schema, but in TypeScript types | CRITICAL |

### 1.2 Data Type Mismatches

**Issue_Updates Table Schema Mismatch:**
- **SQL Schema:** Column `comment` (TEXT), `status_changed_to` (issue_status)
- **TypeScript Types:** `message` (string), `new_status` (issue_status)
- **Impact:** Runtime errors when inserting/updating
- **Fix Required:** Align schema or types

**unit_residents Table Schema Mismatch:**
- **SQL Schema:** `move_in_date`, `move_out_date` (DATE)
- **TypeScript Types:** `joined_at`, `left_at` (string)
- **Impact:** Code may send wrong field names
- **Fix Required:** Standardize naming

---

## 2. Row Level Security (RLS) Analysis

### 2.1 Current RLS Coverage: **15%** ⚠️

**Tables with RLS Enabled:** 10/14 tables (71%)  
**Tables with Complete Policies:** 2/14 tables (14%) ❌

### 2.2 Existing Policies

#### ✅ Profiles Table (2 policies - GOOD)
```sql
-- Policy 1: Users can read own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 2: Users can update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

**Missing:**
- INSERT policy (for new user registration)
- No way to read other profiles (needed for guards to see visitor hosts, managers to see residents)

#### ⚠️ Visitors Table (1 policy - INCOMPLETE)
```sql
-- Policy: Guards can view visitors
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
```

**Missing:**
- Residents cannot see their own visitors ❌
- Guards cannot INSERT walk-in visitors ❌
- Guards cannot UPDATE visitor status (check-in/out) ❌
- No policies for managers/admins ❌

#### ❌ Critical Missing Policies

**user_roles table:**
- No SELECT policy → Users cannot read their own roles
- This causes "permission denied" errors on app startup

**units table:**
- No policies → Cannot query units for forms

**issues table:**
- No policies → Residents cannot raise issues
- Managers cannot view/assign issues

### 2.3 RLS Security Score: **2/10** 🔴

**Current state:** The database is essentially wide open after authentication. Any authenticated user can:
- Read/modify ANY visitor record
- Raise issues for ANY unit
- Access ANY society's data
- Modify ANY user's profile (except their own)

---

## 3. Indexes Analysis

### 3.1 Existing Indexes: **Good Coverage** ✅

```sql
-- Unit Indexes
idx_units_society ON units(society_id)         -- ✅ Good
idx_units_block ON units(block_id)             -- ✅ Good

-- User Role Indexes
idx_user_roles_user ON user_roles(user_id)     -- ✅ Good
idx_user_roles_society ON user_roles(society_id) -- ✅ Good

-- Visitor Indexes
idx_visitors_society ON visitors(society_id)    -- ✅ Good
idx_visitors_unit ON visitors(unit_id)          -- ✅ Good
idx_visitors_host ON visitors(host_id)          -- ✅ Good
idx_visitors_status ON visitors(status)         -- ✅ Good
idx_visitors_expected_date ON visitors(expected_date) -- ✅ Good

-- Issue Indexes
idx_issues_society ON issues(society_id)        -- ✅ Good
idx_issues_status ON issues(status)             -- ✅ Good
idx_issues_reporter ON issues(reported_by)      -- ✅ Good

-- Other Indexes
idx_announcements_society ON announcements(society_id) -- ✅ Good
idx_guard_shifts_society ON guard_shifts(society_id)   -- ✅ Good
idx_guard_shifts_guard ON guard_shifts(guard_id)       -- ✅ Good
```

### 3.2 Missing Indexes: **Performance Gaps** ⚠️

#### Critical Missing Indexes:

1. **Composite Index for Active Visitors Query:**
```sql
-- MISSING: Guards frequently query: society + status + date
CREATE INDEX idx_visitors_active_lookup 
  ON visitors(society_id, status, expected_date) 
  WHERE status IN ('pending', 'approved', 'checked-in');
```

2. **Composite Index for User Authentication:**
```sql
-- MISSING: App startup query: user_id + is_active
CREATE INDEX idx_user_roles_active 
  ON user_roles(user_id, is_active) 
  WHERE is_active = true;
```

3. **Issues by Status and Society:**
```sql
-- MISSING: Dashboard queries
CREATE INDEX idx_issues_dashboard 
  ON issues(society_id, status, priority);
```

4. **Profiles Phone Lookup:**
```sql
-- MISSING: Phone lookup during OTP login
CREATE INDEX idx_profiles_phone 
  ON profiles(phone);
```

5. **Blocks Society Lookup:**
```sql
-- MISSING: Unit selector needs this
CREATE INDEX idx_blocks_society 
  ON blocks(society_id);
```

6. **Unit Residents Lookup:**
```sql
-- MISSING: Checking who lives in a unit
CREATE INDEX idx_unit_residents_unit 
  ON unit_residents(unit_id);

CREATE INDEX idx_unit_residents_user 
  ON unit_residents(user_id);
```

### 3.3 Index Optimization Score: **6/10** 🟡

---

## 4. Triggers Analysis

### 4.1 Existing Triggers: **Basic Coverage** ⚠️

#### ✅ Updated_at Timestamp Triggers (5 triggers)
```sql
-- Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Applied to:
update_profiles_updated_at ON profiles         -- ✅
update_societies_updated_at ON societies       -- ✅
update_units_updated_at ON units               -- ✅
update_visitors_updated_at ON visitors         -- ✅
update_issues_updated_at ON issues             -- ✅
```

**Missing on:**
- blocks ❌
- announcements ❌
- guard_shifts ❌

#### ✅ OTP Generation Trigger
```sql
CREATE OR REPLACE FUNCTION generate_visitor_otp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.visitor_type = 'expected' AND NEW.otp IS NULL THEN
    NEW.otp = LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    NEW.otp_expires_at = NOW() + INTERVAL '24 hours';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_otp_on_insert BEFORE INSERT ON visitors
  FOR EACH ROW EXECUTE FUNCTION generate_visitor_otp();
```

**Improvement needed:** Should also generate QR code

### 4.2 Missing Critical Triggers: ⚠️

1. **Profile Auto-Creation Trigger** (Best Practice for Supabase)
```sql
-- MISSING: Auto-create profile on user signup
CREATE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (new.id, new.phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

2. **Visitor Status Change Notifications**
```sql
-- MISSING: Notify resident when visitor checks in
CREATE FUNCTION notify_visitor_checkin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'checked-in' AND OLD.status != 'checked-in' THEN
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (
      NEW.host_id,
      'Visitor Arrived',
      NEW.visitor_name || ' has checked in',
      'visitor'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

3. **Issue Assignment Notifications**
```sql
-- MISSING: Notify when issue is assigned
```

4. **Announcement Read Tracking**
```sql
-- MISSING: Auto-track unread announcements
```

### 4.3 Trigger Coverage Score: **4/10** 🟡

---

## 5. Database Functions Analysis

### 5.1 Existing Functions: **2 Functions** ⚠️

1. `update_updated_at_column()` - Timestamp updater ✅
2. `generate_visitor_otp()` - OTP generator ✅

### 5.2 Missing Critical Functions:

1. **Get User Society Context**
```sql
-- MISSING: Returns user's current society based on role
CREATE FUNCTION get_user_society(user_uuid UUID)
RETURNS TABLE (
  society_id UUID,
  role user_role,
  unit_id UUID
);
```

2. **Visitor Check-in/out Operations**
```sql
-- MISSING: Atomic check-in with validation
CREATE FUNCTION checkin_visitor(
  visitor_uuid UUID,
  guard_uuid UUID,
  otp_code VARCHAR(6)
) RETURNS BOOLEAN;
```

3. **Dashboard Statistics**
```sql
-- MISSING: Pre-calculated statistics
CREATE FUNCTION get_guard_dashboard_stats(society_uuid UUID)
RETURNS JSON;
```

4. **Batch RLS Helpers**
```sql
-- MISSING: Check if user has role in society
CREATE FUNCTION user_has_role(user_uuid UUID, role_name user_role, society_uuid UUID)
RETURNS BOOLEAN;
```

### 5.3 Functions Score: **2/10** 🔴

---

## 6. Schema Design Quality

### 6.1 Normalization: **Excellent** ✅ (9/10)

- Proper 3NF normalization
- Clear entity relationships
- No significant redundancy

### 6.2 Foreign Keys: **Complete** ✅ (10/10)

All relationships properly defined with:
- ON DELETE CASCADE where appropriate
- ON DELETE SET NULL for optional references
- Referential integrity enforced

### 6.3 Data Types: **Good** ✅ (8/10)

- Appropriate use of UUID for IDs
- ENUM types for constrained values
- TIMESTAMPTZ for all timestamps (timezone-aware) ✅
- TEXT[] for arrays (photos, attachments) ✅

**Minor issues:**
- `settings` in societies uses JSONB → should have schema validation
- No CHECK constraints for phone number format
- No CHECK constraints for email format

### 6.4 Naming Conventions: **Consistent** ✅ (9/10)

- snake_case throughout ✅
- Clear, descriptive names ✅
- Consistent suffixes (_id, _at, _by) ✅

---

## 7. Application Architecture Analysis

### 7.1 Zustand Store (auth.store.ts): **Good** ✅

**Strengths:**
- Clean separation of concerns
- Proper session management
- Auth state listeners
- Role-based routing logic
- Dev login for testing

**Issues:**
- No error boundaries
- Memory leak prevention implemented ✅
- No retry logic for failed API calls

### 7.2 Supabase Client Configuration: **Good** ✅

**Strengths:**
- Platform-aware storage (web vs native)
- Type-safe client with Database types
- Helper functions for common operations
- Proper session persistence

**Issues:**
- No connection pooling configuration
- No retry/timeout configuration
- Helper functions lack error handling

### 7.3 TypeScript Types: **Excellent** ✅

- Auto-generated from Supabase
- Comprehensive coverage
- Proper relationship typing

**Mismatch Issues:**
- `notifications` and `parcels` tables in types but not in schema ❌

---

## 8. Critical Security Issues

### 8.1 RLS Policy Gaps: **CRITICAL** 🔴

**Severity: HIGH**

Without complete RLS policies:
1. Any authenticated user can access all data
2. Users can impersonate other roles
3. No data isolation between societies
4. Visitors can be modified by wrong guards
5. Issues can be raised for any unit

### 8.2 Missing Storage Policies

The schema has RLS enabled but no storage bucket policies defined for:
- visitor-photos
- issue-attachments
- announcements

### 8.3 No Audit Trails

**Missing:**
- Change tracking for critical tables
- Login/logout logging
- Visitor entry/exit audit trail
- Issue status change history

---

## 9. Performance Concerns

### 9.1 Query Optimization Issues

1. **N+1 Query Problem in Visitors:**
   - Fetching visitor → then unit → then host separately
   - Should use joins or materialized views

2. **No Pagination:**
   - `getExpectedVisitors()` fetches all visitors
   - `getIssues()` fetches all issues
   - Should implement cursor-based pagination

3. **No Caching Strategy:**
   - Static data (societies, units) fetched repeatedly
   - Should implement client-side caching

### 9.2 Missing Materialized Views

For better performance on common aggregations:
```sql
-- MISSING: Pre-aggregated statistics
CREATE MATERIALIZED VIEW society_stats AS
SELECT 
  s.id,
  COUNT(DISTINCT u.id) as total_units,
  COUNT(DISTINCT ur.user_id) FILTER (WHERE ur.role = 'resident') as total_residents,
  COUNT(DISTINCT v.id) FILTER (WHERE v.status = 'checked-in') as current_visitors
FROM societies s
LEFT JOIN units u ON u.society_id = s.id
LEFT JOIN user_roles ur ON ur.society_id = s.id
LEFT JOIN visitors v ON v.society_id = s.id
GROUP BY s.id;
```

---

## 10. Data Integrity Issues

### 10.1 Missing Constraints

1. **Phone Number Validation:**
```sql
-- MISSING
ALTER TABLE profiles 
ADD CONSTRAINT check_phone_format 
CHECK (phone ~ '^\+[1-9]\d{1,14}$');
```

2. **Email Validation:**
```sql
-- MISSING
ALTER TABLE profiles 
ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
```

3. **Date Logic Validation:**
```sql
-- MISSING: Ensure check-out is after check-in
ALTER TABLE visitors 
ADD CONSTRAINT check_checkout_after_checkin
CHECK (checked_out_at IS NULL OR checked_out_at >= checked_in_at);
```

4. **OTP Expiry Validation:**
```sql
-- MISSING
ALTER TABLE visitors
ADD CONSTRAINT check_otp_expiry
CHECK (otp_expires_at IS NULL OR otp_expires_at > created_at);
```

### 10.2 Missing Unique Constraints

1. **Society Name per City:**
```sql
-- CONSIDERATION: Should society names be unique per city?
CREATE UNIQUE INDEX idx_unique_society_per_city
ON societies(name, city);
```

---

## 11. Missing Features in Database

### 11.1 Notifications Table ❌

**Required by:** TypeScript types, notifications screen

```sql
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) CHECK(type IN ('info', 'warning', 'success', 'visitor')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = false;
```

### 11.2 Parcels Table ❌

**Required by:** TypeScript types, parcels screen

```sql
CREATE TABLE public.parcels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
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
```

---

## 12. Recommendations

### 12.1 CRITICAL Priority (Must Fix Immediately) 🔴

1. **Implement Complete RLS Policies** (2-3 days)
   - Create policies for all 14 tables
   - Test each role's access patterns
   - Document policy logic

2. **Add Missing Tables** (1 day)
   - Create `notifications` table
   - Create `parcels` table
   - Update TypeScript types

3. **Fix Schema-TypeScript Mismatches** (2 hours)
   - Align `issue_updates` column names
   - Align `unit_residents` column names

### 12.2 HIGH Priority (Fix Within Sprint) 🟡

4. **Add Critical Indexes** (2 hours)
   - Composite indexes for common queries
   - Phone number lookup index
   - Active user roles index

5. **Implement Data Validation** (1 day)
   - Phone number constraints
   - Email constraints
   - Date logic constraints

6. **Add Critical Triggers** (1 day)
   - Auto-create profile on signup
   - Visitor status notifications
   - Issue assignment notifications

7. **Create Essential Functions** (2 days)
   - User context helpers
   - Visitor check-in/out atomic operations
   - Dashboard statistics

### 12.3 MEDIUM Priority (Next Sprint) 🟢

8. **Implement Audit Trails** (2 days)
   - Create audit log table
   - Add triggers for critical changes
   - Implement login tracking

9. **Add Materialized Views** (1 day)
   - Society statistics
   - Dashboard aggregations
   - Performance monitoring

10. **Optimize Queries** (2 days)
    - Implement pagination
    - Add query result caching
    - Optimize N+1 queries

11. **Storage Bucket Policies** (1 day)
    - Visitor photos access control
    - Issue attachments policies
    - Announcements policies

### 12.4 LOW Priority (Future) 🔵

12. **Advanced Features**
    - Full-text search indexes
    - Soft deletes for critical tables
    - Database backup automation
    - Query performance monitoring
    - Real-time subscriptions optimization

---

## 13. Implementation Plan

### Phase 1: Security & Data Integrity (Week 1)
- [ ] Complete all RLS policies
- [ ] Add missing tables (notifications, parcels)
- [ ] Fix schema mismatches
- [ ] Add data validation constraints

### Phase 2: Performance & Indexes (Week 2)
- [ ] Add composite indexes
- [ ] Create database functions
- [ ] Implement critical triggers
- [ ] Add materialized views

### Phase 3: Features & Optimization (Week 3-4)
- [ ] Implement audit trails
- [ ] Add storage policies
- [ ] Implement pagination
- [ ] Add full-text search
- [ ] Performance testing

---

## 14. Testing Recommendations

### 14.1 RLS Testing
```sql
-- Test as different users
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "user-id-here"}';

-- Test queries that should work/fail
SELECT * FROM visitors;  -- Should only see own visitors
```

### 14.2 Performance Testing
- Use `EXPLAIN ANALYZE` on all common queries
- Monitor index usage with `pg_stat_user_indexes`
- Test with realistic data volumes (1000+ units, 10000+ visitors)

### 14.3 Integration Testing
- Test all CRUD operations with RLS enabled
- Verify cascading deletes work correctly
- Test trigger execution

---

## 15. Conclusion

### Current State Summary

| Aspect | Score | Status |
|--------|-------|--------|
| Schema Design | 9/10 | ✅ Excellent |
| Normalization | 9/10 | ✅ Excellent |
| Foreign Keys | 10/10 | ✅ Perfect |
| Indexes | 6/10 | 🟡 Good but incomplete |
| RLS Policies | 2/10 | 🔴 Critical gap |
| Triggers | 4/10 | 🟡 Basic coverage |
| Functions | 2/10 | 🔴 Minimal |
| Data Integrity | 6/10 | 🟡 Missing constraints |
| **Overall** | **6.5/10** | ⚠️ **Needs Improvement** |

### Critical Path to Production

**Blockers:**
1. RLS policies must be complete ❌
2. Missing tables must be added ❌
3. Schema mismatches must be fixed ❌

**Timeline to Production-Ready:**
- **Minimum:** 2 weeks (critical fixes only)
- **Recommended:** 4 weeks (critical + high priority)
- **Ideal:** 6 weeks (full implementation)

### Final Verdict

The GATED application has a **solid foundation** with excellent schema design, but **critical security and functionality gaps** prevent it from being production-ready. The RLS policy coverage is the **most urgent concern** and poses a significant security risk. 

**Recommendation:** Do not deploy to production until at least Phase 1 (Security & Data Integrity) is complete.

---

**Report End**
