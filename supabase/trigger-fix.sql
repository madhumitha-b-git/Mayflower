-- ============================================================
-- MAYFLOWER — TRIGGER FIX
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Replace handle_new_user so it reads all staff fields from
-- user_metadata (passed by the Edge Function) and uses
-- ON CONFLICT DO UPDATE to never block a subsequent upsert.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  meta jsonb := NEW.raw_user_meta_data;
  today text := to_char(now(), 'DD Mon YYYY');
BEGIN
  INSERT INTO public.user_profiles (
    id, name, email, phone, mobile, role, outlet,
    is_active, reward_points, tier, total_visits,
    joined_date, transactions, reservations
  ) VALUES (
    NEW.id,
    COALESCE(meta->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(meta->>'mobile', ''),
    COALESCE(meta->>'mobile', NULL),
    COALESCE(meta->>'role', 'Customer'),
    COALESCE(meta->>'outlet', NULL),
    true,
    CASE WHEN COALESCE(meta->>'role', 'Customer') = 'Customer' THEN 200 ELSE 0 END,
    'Green',
    0,
    today,
    '[]'::jsonb,
    '[]'::jsonb
  )
  ON CONFLICT (id) DO UPDATE SET
    name       = EXCLUDED.name,
    email      = EXCLUDED.email,
    phone      = EXCLUDED.phone,
    mobile     = EXCLUDED.mobile,
    role       = EXCLUDED.role,
    outlet     = EXCLUDED.outlet,
    is_active  = EXCLUDED.is_active,
    joined_date = EXCLUDED.joined_date;

  RETURN NEW;
END;
$$;
