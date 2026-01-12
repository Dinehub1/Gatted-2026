# GATED Database Schema Reference

**Generated:** January 12, 2026
**Source:** Live Supabase Metadata
**Status:** ✅ Active & Healthy

---

## 📚 Table of Contents
1. [Core Tables](#core-tables)
   - [profiles](#profiles)
   - [societies](#societies)
   - [blocks](#blocks)
   - [units](#units)
   - [user_roles](#user_roles)
2. [Feature Tables](#feature-tables)
   - [visitors](#visitors)
   - [issues](#issues)
   - [announcements](#announcements)
   - [parcels](#parcels)
   - [notifications](#notifications)
   - [guard_shifts](#guard_shifts)

---

## Core Tables

### profiles
User profile data linked to Supabase Auth.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | (Primary Key) |
| `avatar_url` | text | YES | - |
| `created_at` | timestamptz | YES | `now()` |
| `email` | text | YES | - |
| `full_name` | text | YES | - |
| `phone` | text | NO | - |
| `updated_at` | timestamptz | YES | `now()` |

**RLS Policies**
- **Public profiles are viewable by everyone**: `SELECT` (Public)
- **Users can insert their own profile**: `INSERT` (uid = id)
- **Users can update own profile**: `UPDATE` (uid = id)

**Triggers**
- `update_profiles_updated_at`: `BEFORE UPDATE` -> `update_updated_at_column()`

---

### societies
Gated communities managed by the system.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `name` | text | NO | - |
| `address` | text | YES | - |
| `city` | text | YES | - |
| `state` | text | YES | - |
| `zip_code` | text | YES | - |
| `total_blocks` | int4 | YES | 0 |
| `total_units` | int4 | YES | 0 |
| `settings` | jsonb | YES | - |
| `created_at` | timestamptz | YES | `now()` |
| `updated_at` | timestamptz | YES | `now()` |

**Triggers**
- `update_societies_updated_at`: `BEFORE UPDATE` -> `update_updated_at_column()`

---

### units
Residential units/apartments.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `society_id` | uuid | YES | (FK -> societies) |
| `block_id` | uuid | YES | (FK -> blocks) |
| `unit_number` | text | NO | - |
| `floor` | int4 | YES | - |
| `area_sqft` | numeric | YES | - |
| `unit_type` | text | YES | - |
| `created_at` | timestamptz | YES | `now()` |
| `updated_at` | timestamptz | YES | `now()` |

**Indexes**
- `idx_units_society`: `btree (society_id)`
- `idx_units_block`: `btree (block_id)`

**Triggers**
- `update_units_updated_at`: `BEFORE UPDATE` -> `update_updated_at_column()`

---

### user_roles
Maps users to societies/units with specific roles.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `user_id` | uuid | YES | (FK -> profiles) |
| `society_id` | uuid | YES | (FK -> societies) |
| `unit_id` | uuid | YES | (FK -> units) |
| `role` | user_role (enum) | NO | - |
| `is_active` | bool | YES | `true` |
| `created_at` | timestamptz | YES | `now()` |
| `updated_at` | timestamptz | YES | `now()` |

**RLS Policies**
- **Users can view their own roles**: `SELECT` (user_id = auth.uid())
- **Admins/Managers can view roles in their society**: `SELECT` (via subquery on `user_roles`)

**Indexes**
- `user_roles_user_id_society_id_role_key`: `UNIQUE btree (user_id, society_id, role)`
- `idx_user_roles_user`: `btree (user_id)`
- `idx_user_roles_society`: `btree (society_id)`

---

## Feature Tables

### visitors
Visitor tracking and history.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `society_id` | uuid | YES | (FK) |
| `unit_id` | uuid | YES | (FK) |
| `host_id` | uuid | YES | (FK) |
| `visitor_name` | text | NO | - |
| `visitor_phone` | text | YES | - |
| `vehicle_number` | text | YES | - |
| `visitor_type` | visitor_type | YES | `'expected'` |
| `status` | visitor_status | NO | `'pending'` |
| `expected_date` | date | YES | - |
| `expected_time` | time | YES | - |
| `otp` | varchar | YES | - |
| `qr_code` | text | YES | - |
| `created_at` | timestamptz | YES | `now()` |

**RLS Policies (Verified)**
- **Residents can view own visitors**: `SELECT` (host_id = auth.uid())
- **Residents can create visitors**: `INSERT` (host_id = auth.uid())
- **Residents can update own visitors**: `UPDATE` (host_id = auth.uid())
- **Staff (Guards/Managers) can view society visitors**: `SELECT` (role check)
- **Staff can update visitors (Check-in/out)**: `UPDATE` (role check)

**Indexes**
- `idx_visitors_active_lookup`: `btree (society_id, status, expected_date)`
- `idx_visitors_name_search`: `gin (to_tsvector('english', visitor_name))`
- `idx_visitors_host`: `btree (host_id)`
- `idx_visitors_unit`: `btree (unit_id)`

**Triggers**
- `generate_otp_on_insert`: `BEFORE INSERT` -> `generate_visitor_otp()`
- `visitor_status_notification`: `AFTER UPDATE` -> `notify_visitor_status_change()`
- `update_visitors_updated_at`: `BEFORE UPDATE` -> `update_updated_at_column()`

---

### issues
Maintenance and complaint tracking.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `society_id` | uuid | YES | (FK) |
| `unit_id` | uuid | YES | (FK) |
| `reported_by` | uuid | YES | (FK) |
| `assigned_to` | uuid | YES | (FK) |
| `title` | varchar | NO | - |
| `description` | text | YES | - |
| `category` | issue_category | NO | - |
| `priority` | issue_priority | NO | `'medium'` |
| `status` | issue_status | NO | `'open'` |
| `photos` | _text | YES | - |
| `created_at` | timestamptz | YES | `now()` |

**Triggers**
- `issue_notification`: `AFTER UPDATE` -> `notify_issue_changes()`
- `update_issues_updated_at`: `BEFORE UPDATE` -> `update_updated_at_column()`

---

### announcements
Society-wide or targeted announcements.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `society_id` | uuid | YES | (FK) |
| `created_by` | uuid | YES | (FK) |
| `title` | varchar | NO | - |
| `message` | text | NO | - |
| `expires_at` | timestamptz | YES | - |
| `target_type` | announcement_target | YES | `'all'` |
| `created_at` | timestamptz | YES | `now()` |

**RLS Policies**
- **Users can read society announcements**: `SELECT` (society check)
- **Staff can create/manage**: `INSERT/UPDATE/DELETE` (role check)

**Indexes**
- `idx_announcements_active`: `btree (society_id, expires_at)`
- `idx_announcements_society`: `btree (society_id)`

---

### parcels
Delivery tracking system.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `society_id` | uuid | YES | (FK) |
| `unit_id` | uuid | YES | (FK) |
| `resident_id` | uuid | YES | (FK) |
| `courier_name` | varchar | YES | - |
| `tracking_number` | varchar | YES | - |
| `status` | varchar | YES | `'received'` |
| `created_at` | timestamptz | YES | `now()` |

**Triggers**
- `parcel_notification`: `AFTER INSERT` -> `notify_parcel_received()`

---

### notifications
System notifications table.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `user_id` | uuid | YES | (FK) |
| `title` | varchar | NO | - |
| `message` | text | NO | - |
| `type` | varchar | YES | - |
| `read` | bool | YES | `false` |
| `metadata` | jsonb | YES | - |
| `created_at` | timestamptz | YES | `now()` |

---

### guard_shifts
Shift management for security personnel.

**Columns**
| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | uuid | NO | `uuid_generate_v4()` |
| `society_id` | uuid | YES | (FK) |
| `guard_id` | uuid | YES | (FK) |
| `shift_start` | timestamptz | YES | - |
| `shift_end` | timestamptz | YES | - |
| `created_at` | timestamptz | YES | `now()` |

**Indexes**
- `idx_guard_shifts_guard`: `btree (guard_id)`
- `idx_guard_shifts_active`: `btree (society_id, shift_start)`

---

*Generated by GATED Schema Documentation System*