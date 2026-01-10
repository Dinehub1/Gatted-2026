# Supabase Setup for GATED

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Set project details:
   - **Name**: gated-production (or your choice)
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your target users (e.g., `ap-south-1` Mumbai for India)
4. Wait for project initialization (~2 minutes)

## 2. Get API Credentials

After project creation, navigate to **Settings > API**:

- **Project URL**: `https://[your-project].supabase.co`
- **Anon/Public Key**: `eyJhbG...` (used in client app)
- **Service Role Key**: `eyJhbG...` (used in admin operations, keep secret)

## 3. Run Database Schema

1. Navigate to **SQL Editor** in Supabase dashboard
2. Copy the entire contents of `docs/database-schema.sql`
3. Paste into SQL Editor
4. Click "Run" to execute
5. Verify tables are created in **Table Editor**

## 4. Configure Authentication

1. Go to **Authentication > Providers**
2. Enable **Phone** provider:
   - Toggle "Enable Phone Sign-in"
   - Configure SMS provider:
     - **Twilio** (recommended for production)
     - **Supabase** (default, works for testing)
   - Set rate limiting appropriately

3. Configure **Auth Settings**:
   - **Site URL**: `exp://localhost:19000` (for Expo dev)
   - **Redirect URLs**: Add production URLs later
   - **JWT Expiry**: 3600 (1 hour)
   - **Refresh Token Expiry**: 2592000 (30 days)

## 5. Setup Storage Buckets

Go to **Storage** and create the following buckets:

1. **visitor-photos**
   - Public: No
   - Allowed MIME types: `image/jpeg, image/png, image/webp`
   - Max file size: 5 MB

2. **issue-attachments**
   - Public: No
   - Max file size: 10 MB

3. **announcements**
   - Public: Yes (for images in announcements)
   - Max file size: 5 MB

### Storage Policies

For each bucket, add RLS policies:

```sql
-- visitor-photos: Allow guards and hosts to upload
CREATE POLICY "Allow uploads"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'visitor-photos' AND
    auth.role() = 'authenticated'
  );

-- Allow users to view photos for their society
CREATE POLICY "Allow viewing"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'visitor-photos');
```

## 6. Environment Variables

Create `.env.local` in your project root:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...

# For server-side operations (keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

> **Important**: Never commit `.env.local` to version control!

## 7. Seed Sample Data (Optional for Testing)

Run this SQL to create sample data:

```sql
-- Insert a test society
INSERT INTO public.societies (id, name, address, city, state, total_units)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'Green Valley Apartments',
  '123 Main Street',
  'Bangalore',
  'Karnataka',
  50
);

-- Insert test blocks
INSERT INTO public.blocks (society_id, name, total_floors)
VALUES 
  ('123e4567-e89b-12d3-a456-426614174000', 'Block A', 10),
  ('123e4567-e89b-12d3-a456-426614174000', 'Block B', 10);

-- Insert test units
INSERT INTO public.units (society_id, block_id, unit_number, floor, type)
SELECT 
  '123e4567-e89b-12d3-a456-426614174000',
  b.id,
  b.name || '-' || generate_series(1, 20),
  (generate_series(1, 20) - 1) / 2 + 1,
  '2BHK'
FROM public.blocks b
WHERE b.society_id = '123e4567-e89b-12d3-a456-426614174000';
```

## 8. Enable Realtime (Optional)

For real-time updates (visitor arrivals, announcements):

1. Go to **Database > Replication**
2. Enable replication for tables:
   - `visitors`
   - `announcements`
   - `issues`

## 9. Testing Connection

Test your Supabase connection:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Test query
const { data, error } = await supabase
  .from('societies')
  .select('*')
  .limit(1);

console.log('Connection test:', { data, error });
```

## 10. Production Checklist

Before going live:

- [ ] Enable MFA for all admin accounts
- [ ] Review and tighten RLS policies
- [ ] Setup SMS provider (Twilio)
- [ ] Configure custom domain (optional)
- [ ] Setup monitoring and alerts
- [ ] Backup strategy configured
- [ ] Rate limiting tested
- [ ] Load testing completed

