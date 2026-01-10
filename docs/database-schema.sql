-- GATED Database Schema v1.1
-- PostgreSQL Schema for Supabase
-- Fixed dependency order: societies/units created before user_roles

-- ============================================
-- Core Tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS & AUTHENTICATION
-- ============================================

-- This extends Supabase's auth.users table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone VARCHAR(15) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  email VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. SOCIETY & UNIT MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS public.societies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  total_units INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  total_floors INTEGER DEFAULT 0,
  manager_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  block_id UUID REFERENCES public.blocks(id) ON DELETE SET NULL,
  unit_number VARCHAR(20) NOT NULL,
  floor INTEGER,
  type VARCHAR(50), -- 1BHK, 2BHK, etc.
  area_sqft INTEGER,
  owner_id UUID REFERENCES public.profiles(id),
  is_occupied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(society_id, block_id, unit_number)
);

CREATE INDEX IF NOT EXISTS idx_units_society ON units(society_id);
CREATE INDEX IF NOT EXISTS idx_units_block ON units(block_id);

-- ============================================
-- 3. ROLES & PERMISSIONS (Depend on Profiles & Units)
-- ============================================

-- User Roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'guard', 'resident', 'owner', 'tenant');

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, society_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_society ON user_roles(society_id);

-- Residents in Units (supports multiple residents per unit)
CREATE TABLE IF NOT EXISTS public.unit_residents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  resident_type VARCHAR(20) CHECK(resident_type IN ('owner', 'tenant', 'family')),
  is_primary BOOLEAN DEFAULT false,
  move_in_date DATE,
  move_out_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_id, user_id)
);

-- ============================================
-- 4. VISITOR MANAGEMENT
-- ============================================

CREATE TYPE visitor_type AS ENUM ('expected', 'walk-in', 'delivery', 'service', 'guest');
CREATE TYPE visitor_status AS ENUM ('pending', 'approved', 'checked-in', 'checked-out', 'denied');

CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  host_id UUID REFERENCES public.profiles(id), -- Resident who approved
  
  -- Visitor Info
  visitor_name VARCHAR(255) NOT NULL,
  visitor_phone VARCHAR(15),
  visitor_photo_url TEXT,
  vehicle_number VARCHAR(20),
  
  -- Visit Details
  visitor_type visitor_type DEFAULT 'walk-in',
  purpose TEXT,
  expected_date DATE,
  expected_time TIME,
  
  -- Status
  status visitor_status DEFAULT 'pending',
  
  -- Entry/Exit
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id), -- Guard who checked in
  checked_out_at TIMESTAMPTZ,
  checked_out_by UUID REFERENCES public.profiles(id), -- Guard who checked out
  
  -- Verification
  otp VARCHAR(6),
  otp_expires_at TIMESTAMPTZ,
  qr_code TEXT,
  
  -- Recurring visitors
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50), -- daily, weekly, monthly
  valid_until DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitors_society ON visitors(society_id);
CREATE INDEX IF NOT EXISTS idx_visitors_unit ON visitors(unit_id);
CREATE INDEX IF NOT EXISTS idx_visitors_host ON visitors(host_id);
CREATE INDEX IF NOT EXISTS idx_visitors_status ON visitors(status);
CREATE INDEX IF NOT EXISTS idx_visitors_expected_date ON visitors(expected_date);

-- ============================================
-- 5. ISSUES & MAINTENANCE
-- ============================================

CREATE TYPE issue_category AS ENUM (
  'plumbing', 'electrical', 'cleaning', 'security', 
  'maintenance', 'parking', 'noise', 'other'
);

CREATE TYPE issue_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE issue_status AS ENUM ('open', 'in-progress', 'resolved', 'closed', 'rejected');

CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  
  -- Reporter
  reported_by UUID REFERENCES public.profiles(id),
  
  -- Issue Details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category issue_category NOT NULL,
  priority issue_priority DEFAULT 'medium',
  status issue_status DEFAULT 'open',
  
  -- Attachments
  photos TEXT[], -- Array of image URLs
  
  -- Assignment
  assigned_to UUID REFERENCES public.profiles(id),
  assigned_at TIMESTAMPTZ,
  
  -- Resolution
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.profiles(id),
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issues_society ON issues(society_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_reporter ON issues(reported_by);

-- Issue Comments/Updates
CREATE TABLE IF NOT EXISTS public.issue_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID REFERENCES public.issues(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  comment TEXT,
  photos TEXT[],
  status_changed_to issue_status,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. ANNOUNCEMENTS & COMMUNICATION
-- ============================================

CREATE TYPE announcement_target AS ENUM ('all', 'block', 'unit', 'role');

CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  
  -- Content
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  attachments TEXT[], -- URLs
  
  -- Targeting
  target_type announcement_target DEFAULT 'all',
  target_block_id UUID REFERENCES public.blocks(id),
  target_unit_id UUID REFERENCES public.units(id),
  target_role user_role,
  
  -- Meta
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_announcements_society ON announcements(society_id);

-- Track who has read announcements
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- ============================================
-- 7. GUARD SHIFTS & ACTIVITY
-- ============================================

CREATE TABLE IF NOT EXISTS public.guard_shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  guard_id UUID REFERENCES public.profiles(id),
  
  shift_start TIMESTAMPTZ NOT NULL,
  shift_end TIMESTAMPTZ,
  
  -- Handover notes
  handover_notes TEXT,
  handed_over_to UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guard_shifts_society ON guard_shifts(society_id);
CREATE INDEX IF NOT EXISTS idx_guard_shifts_guard ON guard_shifts(guard_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guard_shifts ENABLE ROW LEVEL SECURITY;

-- Example RLS Policy: Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Example RLS Policy: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Example RLS Policy: Guards can see visitors for their society
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

-- ============================================
-- Functions & Triggers
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers to avoid errors if re-running
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_societies_updated_at ON societies;
DROP TRIGGER IF EXISTS update_units_updated_at ON units;
DROP TRIGGER IF EXISTS update_visitors_updated_at ON visitors;
DROP TRIGGER IF EXISTS update_issues_updated_at ON issues;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_societies_updated_at BEFORE UPDATE ON societies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate OTP
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

DROP TRIGGER IF EXISTS generate_otp_on_insert ON visitors;
CREATE TRIGGER generate_otp_on_insert BEFORE INSERT ON visitors
  FOR EACH ROW EXECUTE FUNCTION generate_visitor_otp();
