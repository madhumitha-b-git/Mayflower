-- ============================================================
-- FRONTEND AUTH — user_profiles table
-- Run this in Supabase SQL Editor AFTER schema.sql
-- This table is used by the frontend via Supabase Auth (not the backend JWT system)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'Customer',
  reward_points INT DEFAULT 200,
  tier          TEXT DEFAULT 'Green',
  total_visits  INT DEFAULT 1,
  joined_date   TEXT,
  transactions  JSONB DEFAULT '[]',
  reservations  JSONB DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read and update only their own profile
CREATE POLICY "Users read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Customers must never be able to promote themselves into a staff role.
DROP POLICY IF EXISTS "Users update own profile" ON user_profiles;
CREATE POLICY "Customers update only their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'Customer');

-- Create the customer profile at the same time as the Supabase Auth account.
-- This works whether or not email confirmation is enabled.
CREATE OR REPLACE FUNCTION public.create_customer_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, name, email, role, reward_points, tier, total_visits, joined_date, transactions, reservations
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'Customer',
    200,
    'Green',
    0,
    to_char(CURRENT_DATE, 'DD Mon YYYY'),
    jsonb_build_array(jsonb_build_object(
      'id', 'signup-' || NEW.id,
      'type', 'earned_signup',
      'points', 200,
      'description', 'Welcome bonus for registering your Mayflower account',
      'date', to_char(CURRENT_DATE, 'DD Mon YYYY')
    )),
    '[]'::jsonb
  ) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_customer_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_customer_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_customer_profile();

-- Atomically saves a reservation to only the signed-in customer's account and
-- grants the required +300 points. Using an RPC avoids browser-side races.
CREATE OR REPLACE FUNCTION public.create_customer_reservation(
  reservation_record JSONB,
  transaction_record JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  updated_points INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to reserve a table';
  END IF;

  UPDATE public.user_profiles
  SET
    reservations = jsonb_build_array(reservation_record) || reservations,
    transactions = jsonb_build_array(transaction_record) || transactions,
    reward_points = reward_points + 300,
    tier = CASE
      WHEN reward_points + 300 >= 2000 THEN 'Sanctuary VIP'
      WHEN reward_points + 300 >= 800 THEN 'Gold'
      ELSE 'Green'
    END
  WHERE id = auth.uid()
  RETURNING reward_points INTO updated_points;

  IF updated_points IS NULL THEN
    RAISE EXCEPTION 'Customer profile was not found';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_customer_reservation(JSONB, JSONB) TO authenticated;

-- Back-office attendance integration: call this after a verified seated visit.
-- It is intentionally not granted to browser users, so customers cannot award
-- their own visit points.
CREATE OR REPLACE FUNCTION public.record_customer_visit(
  customer_id UUID,
  visit_points INT DEFAULT 100
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF visit_points <= 0 THEN
    RAISE EXCEPTION 'Visit points must be positive';
  END IF;

  UPDATE public.user_profiles
  SET
    total_visits = total_visits + 1,
    reward_points = reward_points + visit_points,
    transactions = jsonb_build_array(jsonb_build_object(
      'id', 'visit-' || gen_random_uuid(),
      'type', 'earned_visit',
      'points', visit_points,
      'description', 'Loyalty reward for a completed Mayflower visit',
      'date', to_char(CURRENT_DATE, 'DD Mon YYYY')
    )) || transactions,
    tier = CASE
      WHEN reward_points + visit_points >= 2000 THEN 'Sanctuary VIP'
      WHEN reward_points + visit_points >= 800 THEN 'Gold'
      ELSE 'Green'
    END
  WHERE id = customer_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_customer_visit(UUID, INT) FROM PUBLIC, anon, authenticated;

NOTIFY pgrst, 'reload schema';

-- Trigger to keep updated_at current
CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED STAFF PROFILES into user_profiles
-- Run AFTER creating staff users via Supabase Auth dashboard
-- or use the Supabase Auth API to create them first
-- ============================================================
