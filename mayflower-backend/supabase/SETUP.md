# Mayflower — Supabase Database Setup Guide

## Step 1 — Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) → **New Project**
2. Set:
   - **Name**: `mayflower-phase1`
   - **Database Password**: save this securely
   - **Region**: `Southeast Asia (Singapore)` — closest to Chennai
3. Wait ~2 minutes for provisioning

---

## Step 2 — Get Your Keys

Go to **Project Settings → API**:

| Key | Where to use |
|-----|-------------|
| `Project URL` | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon / public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` (keep secret, backend only) |

Paste these into `mayflower-backend/.env.local`.

---

## Step 3 — Run the Schema

1. In Supabase dashboard → **SQL Editor** → **New Query**
2. Open `mayflower-backend/supabase/schema.sql`
3. Paste the entire contents → click **Run**
4. You should see: *"Success. No rows returned"*

---

## Step 4 — Generate Password Hashes

Before running seed.sql you must replace the placeholder hashes.

**Option A — Online (quick)**
Go to [https://bcrypt-generator.com](https://bcrypt-generator.com), set rounds to **10**, and hash each password:

| User | Password |
|------|----------|
| Super Admin | `superadmin@1234` |
| Owner | `owner@1234` |
| Admin | `admin@1234` |
| Manager | `manager@1234` |
| Chef | `chef@1234` |
| HR | `hr@1234` |
| Accountant | `accountant@1234` |

**Option B — Terminal (after `npm install` in mayflower-backend)**
```bash
node -e "
const b = require('bcryptjs');
['superadmin','owner','admin','manager','chef','hr','accountant']
  .forEach(r => console.log(r + ': ' + b.hashSync(r+'@1234', 10)));
"
```

Copy each hash and replace the corresponding `$2b$10$REPLACE_..._HASH` placeholder in `seed.sql`.

---

## Step 5 — Run the Seed

1. Open `mayflower-backend/supabase/seed.sql`
2. Paste into **SQL Editor → New Query** → **Run**

This inserts:
- 8 staff users (SuperAdmin → Accountant)
- 4 outlets with floors and tables (Poes Garden, Anna Nagar, Egmore, Palavakkam)
- 55 menu items across all categories
- 11 SOP checklists
- Integration config rows

---

## Step 6 — Enable Storage Bucket (for task photos)

1. Supabase dashboard → **Storage** → **New Bucket**
2. Name: `task-photos` — set to **Private**
3. Create another bucket: `outlet-images` — set to **Public**

Add this storage policy for `task-photos` (SQL Editor):
```sql
CREATE POLICY "Staff can upload task photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'task-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Staff can read task photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'task-photos');
```

---

## Step 7 — Configure .env.local

```env
# mayflower-backend/.env.local

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

JWT_SECRET=mayflower-phase1-super-secret-jwt-key-2024

FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000

RESEND_API_KEY=re_your_key_here
EMAIL_FROM=noreply@mayflower.in
```

---

## Step 8 — Start the Backend

```bash
cd mayflower-backend
npm install
npm run dev
# Runs on http://localhost:4000
```

---

## Step 9 — Verify

Test the API is connected:

```bash
# Should return 4 outlets
curl http://localhost:4000/api/outlets

# Login as admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mayflower.in","password":"admin@1234"}'
```

---

## Database Tables Summary

| Table | Rows after seed |
|-------|----------------|
| `outlets` | 4 |
| `floors` | 12 |
| `tables` | 33 |
| `menu_items` | 55 |
| `users` | 8 staff |
| `sop_checklists` | 11 |
| `integration_config` | 4 |

---

## Resetting the Database

To wipe and re-run from scratch (SQL Editor):
```sql
-- Drop all tables and re-run schema.sql + seed.sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```
