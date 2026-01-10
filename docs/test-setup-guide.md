# Quick Test Setup Guide

## 📋 Overview
This guide helps you set up test data in your Supabase database to test all features of the GATED app.

## ⚡ Quick Start (3 Steps)

### Step 1: Run Basic Setup SQL
Copy and paste sections **1-3** from `test-data.sql` into Supabase SQL Editor:
- Creates test society (Green Valley Apartments)
- Creates 2 blocks (A & B)  
- Creates 8 test units

```sql
-- Run sections 1-3 from test-data.sql
-- This creates the society structure but no users yet
```

### Step 2: Create Test Users via Phone Login

Have test users login via the GATED app using these phone numbers:

| Role | Phone Number | Name |
|------|-------------|------|
| Admin | +911234567890 | Rajesh Kumar |
| Manager | +911234567891 | Priya Sharma |
| Guard | +911234567892 | Suresh Singh |
| Resident (A-101) | +911234567893 | Amit Verma |
| Resident (A-102) | +911234567894 | Sneha Patel |
| Resident (B-101) | +911234567895 | Vikram Malhotra |

**Important:** Each user must complete OTP verification in the app!

### Step 3: Get User IDs & Complete Setup

1. Go to Supabase Dashboard → Authentication → Users
2. Find each user by phone number
3. Copy their `ID` (UUID)
4. Open `test-data.sql` in a text editor
5. Replace all instances of:
   - `REPLACE-WITH-ACTUAL-USER-ID-1` with Admin's ID
   - `REPLACE-WITH-ACTUAL-USER-ID-2` with Manager's ID
   - `REPLACE-WITH-ACTUAL-USER-ID-3` with Guard's ID
   - `REPLACE-WITH-ACTUAL-USER-ID-4` with Resident 1's ID (Amit)
   - `REPLACE-WITH-ACTUAL-USER-ID-5` with Resident 2's ID (Sneha)
   - `REPLACE-WITH-ACTUAL-USER-ID-6` with Resident 3's ID (Vikram)
6. Run sections **4-9** in Supabase SQL Editor

## ✅ What You'll Get

After setup, you'll have:

### Test Users
- 1 Admin, 1 Manager, 1 Guard, 3 Residents

### Test Visitors
- **Today**: 1 expected visitor with OTP `123456`
- **Tomorrow**: 1 delivery visitor with OTP `789012`
- **Currently inside**: 1 service visitor (plumber)
- **Past**: 1 checked-out guest
- **Pending**: 1 visitor awaiting approval

### Test Issues
- 1 **High** priority (water leakage) - **Open**
- 1 **Urgent** (elevator) - **In Progress**
- 1 **Medium** (street light) - **Resolved**
- 1 **Low** (garden) - **Open**
- 1 **Medium** (parking) - **Open**

### Test Announcements
- Society-wide celebration announcement
- Block-specific water maintenance alert
- Security alert

## 🧪 Testing Scenarios

### Test Guard Flow
1. Login as Guard (+911234567892)
2. Go to "Expected Visitor"
3. Enter OTP: `123456`
4. Verify visitor "Rahul Kapoor" appears

### Test Resident Flow
1. Login as Amit (+911234567893)
2. View Dashboard - should show:
   - 1 upcoming visitor
   - 1 visitor today
   - 2 open issues
3. Go to "My Visitors" - should see 3 visitors
4. Go to "Raise Issue" - create a new issue

### Test Manager Flow
1. Login as Manager (+911234567891)
2. View all issues across society
3. Assign issues to yourself
4. Create announcements

## 🔍 Verification Queries

Run these in Supabase SQL Editor to check your data:

```sql
-- Check all users and their roles
SELECT p.full_name, ur.role, u.unit_number
FROM profiles p
JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN units u ON ur.unit_id = u.id
ORDER BY ur.role;

-- Check visitors
SELECT visitor_name, visitor_type, status, expected_date
FROM visitors
ORDER BY expected_date DESC;

-- Check issues by status
SELECT title, category, priority, status
FROM issues
ORDER BY priority DESC, created_at DESC;
```

## 🆘 Troubleshooting

**Problem**: "User not found" after login
- **Solution**: Make sure the user completed OTP verification in the app

**Problem**: "Foreign key violation" when running sections 4-9
- **Solution**: Verify you replaced ALL placeholder IDs with actual user IDs

**Problem**: Data doesn't show in app
- **Solution**: 
  1. Check Row Level Security (RLS) policies
  2. Verify user has correct role assigned
  3. Check that society_id matches in all tables

## 📱 Test Credentials Reference

Save this for quick reference:

```
Guard: +911234567892 (Suresh Singh)
Resident A-101: +911234567893 (Amit Verma)
Resident A-102: +911234567894 (Sneha Patel)
Resident B-101: +911234567895 (Vikram Malhotra)
Manager: +911234567891 (Priya Sharma)
Admin: +911234567890 (Rajesh Kumar)

Test OTPs (for expected visitors):
- 123456 (Rahul Kapoor - today)
- 789012 (Amazon Delivery - tomorrow)
```
