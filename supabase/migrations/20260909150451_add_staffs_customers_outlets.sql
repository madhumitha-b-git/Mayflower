-- ============================================================
-- MAYFLOWER — Migration: outlets, staffs, customers
-- Self-contained: includes jwt_user_role() definition
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 0. Ensure jwt_user_role() exists (safe to re-run)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.jwt_user_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'Customer'
  )
$$;


-- ────────────────────────────────────────────────────────────
-- 1. OUTLETS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.outlets (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  slug             text NOT NULL UNIQUE,
  badge            text NULL,
  address          text NOT NULL DEFAULT '',
  area             text NULL,
  city             text NOT NULL DEFAULT 'Chennai',
  phone            text NULL,
  email            text NULL,
  petpooja_id      text NULL UNIQUE,
  tables_count     integer NOT NULL DEFAULT 0,
  covers_count     integer NOT NULL DEFAULT 0,
  opening_time     time NULL,
  closing_time     time NULL,
  is_active        boolean NOT NULL DEFAULT true,
  manager_id       uuid NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.outlets (name, slug, badge, address, area, petpooja_id, tables_count, covers_count, opening_time, closing_time) VALUES
  ('Poes Garden Flagship',           'poes-garden',   'Flagship Hub',    'Cathedral Road / Kasturi Rangan Rd, Poes Garden', 'Poes Garden', 'PET-CH-001', 24, 96,  '11:00', '23:00'),
  ('Palavakkam ECR Seaside',         'palavakkam-ecr','Pavilion Estate', 'East Coast Road, Palavakkam Shoreline',           'ECR',         'PET-CH-002', 18, 72,  '11:00', '23:00'),
  ('Anna Nagar East Pavilion',       'anna-nagar',    'Atrium Wing',     '2nd Avenue, Anna Nagar East',                     'Anna Nagar',  'PET-CH-003', 20, 80,  '11:00', '23:00'),
  ('Velachery Lakeside Conservatory','velachery',     'Lakeside Terrace','Bypass Road, Velachery Lake Front',               'Velachery',   'PET-CH-004', 16, 64,  '11:00', '23:00')
ON CONFLICT (slug) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 2. STAFFS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.staffs (
  id                      uuid PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  employee_code           text NOT NULL UNIQUE DEFAULT '',
  outlet_id               uuid NULL REFERENCES public.outlets(id) ON DELETE SET NULL,
  department              text NOT NULL DEFAULT 'General'
                            CHECK (department IN ('Kitchen','Floor','Finance','HR','Management','General')),
  employment_type         text NOT NULL DEFAULT 'Full-time'
                            CHECK (employment_type IN ('Full-time','Part-time','Contract')),
  shift_timing            text NOT NULL DEFAULT 'Morning'
                            CHECK (shift_timing IN ('Morning','Evening','Split','Flexible')),
  date_of_joining         date NOT NULL DEFAULT CURRENT_DATE,
  emergency_contact_name  text NULL,
  emergency_contact_phone text NULL,
  salary_band             text NULL CHECK (salary_band IN ('A','B','C','D')),
  notes                   text NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

CREATE SEQUENCE IF NOT EXISTS public.employee_code_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_employee_code()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.employee_code IS NULL OR NEW.employee_code = '' THEN
    NEW.employee_code := 'MF-EMP-' || LPAD(nextval('public.employee_code_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_employee_code ON public.staffs;
CREATE TRIGGER set_employee_code
  BEFORE INSERT ON public.staffs
  FOR EACH ROW EXECUTE FUNCTION public.generate_employee_code();


-- ────────────────────────────────────────────────────────────
-- 3. CUSTOMERS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customers (
  id                    uuid PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  preferred_outlet_id   uuid NULL REFERENCES public.outlets(id) ON DELETE SET NULL,
  dietary_preferences   text[] NOT NULL DEFAULT '{}',
  allergies             text NULL,
  preferred_seating     text NULL
                          CHECK (preferred_seating IN ('Garden','Window','Main Dining','Private Space',NULL)),
  birthday              date NULL,
  anniversary           date NULL,
  notes                 text NULL,
  total_visits          integer NOT NULL DEFAULT 0,
  total_reservations    integer NOT NULL DEFAULT 0,
  total_spent           numeric(10,2) NOT NULL DEFAULT 0.00,
  average_spend         numeric(10,2) NOT NULL DEFAULT 0.00,
  last_visit_date       date NULL,
  last_visit_outlet_id  uuid NULL REFERENCES public.outlets(id) ON DELETE SET NULL,
  loyalty_tier          text NOT NULL DEFAULT 'Green'
                          CHECK (loyalty_tier IN ('Green','Gold','Sanctuary VIP')),
  loyalty_points        integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 4. CUSTOMER_VISITS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_visits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  outlet_id       uuid NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  reservation_id  uuid NULL REFERENCES public.reservations(id) ON DELETE SET NULL,
  visit_date      date NOT NULL,
  party_size      integer NOT NULL DEFAULT 1,
  amount_spent    numeric(10,2) NOT NULL DEFAULT 0.00,
  payment_method  text NULL CHECK (payment_method IN ('Cash','Card','UPI','Razorpay','Complimentary',NULL)),
  occasion        text NULL,
  rating          integer NULL CHECK (rating BETWEEN 1 AND 5),
  notes           text NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 5. CUSTOMER_PAYMENTS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.customer_payments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  visit_id        uuid NULL REFERENCES public.customer_visits(id) ON DELETE SET NULL,
  outlet_id       uuid NOT NULL REFERENCES public.outlets(id) ON DELETE CASCADE,
  amount          numeric(10,2) NOT NULL,
  payment_method  text NOT NULL CHECK (payment_method IN ('Cash','Card','UPI','Razorpay','Complimentary')),
  payment_status  text NOT NULL DEFAULT 'Completed'
                    CHECK (payment_status IN ('Pending','Completed','Refunded','Failed')),
  transaction_ref text NULL,
  paid_at         timestamptz NOT NULL DEFAULT now(),
  notes           text NULL
);


-- ────────────────────────────────────────────────────────────
-- 6. TRIGGER — update customer stats on new visit
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_customer_stats()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.customers SET
    total_visits         = (SELECT COUNT(*) FROM public.customer_visits WHERE customer_id = NEW.customer_id),
    total_spent          = (SELECT COALESCE(SUM(amount_spent), 0) FROM public.customer_visits WHERE customer_id = NEW.customer_id),
    average_spend        = (SELECT COALESCE(AVG(amount_spent), 0) FROM public.customer_visits WHERE customer_id = NEW.customer_id),
    last_visit_date      = (SELECT MAX(visit_date) FROM public.customer_visits WHERE customer_id = NEW.customer_id),
    last_visit_outlet_id = NEW.outlet_id,
    updated_at           = now()
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_customer_visit ON public.customer_visits;
CREATE TRIGGER on_customer_visit
  AFTER INSERT OR UPDATE ON public.customer_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_customer_stats();


-- ────────────────────────────────────────────────────────────
-- 7. TRIGGER — auto-create staffs/customers row on profile insert
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_role_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'Customer' THEN
    INSERT INTO public.customers (id, loyalty_tier, loyalty_points)
    VALUES (NEW.id, COALESCE(NEW.tier, 'Green'), COALESCE(NEW.reward_points, 0))
    ON CONFLICT (id) DO NOTHING;

  ELSIF NEW.role IN ('Owner','Admin','Manager','Chef','HR','Accountant') THEN
    INSERT INTO public.staffs (id, outlet_id, department)
    VALUES (
      NEW.id,
      (SELECT id FROM public.outlets WHERE name = NEW.outlet LIMIT 1),
      CASE NEW.role
        WHEN 'Chef'       THEN 'Kitchen'
        WHEN 'HR'         THEN 'HR'
        WHEN 'Accountant' THEN 'Finance'
        WHEN 'Manager'    THEN 'Floor'
        WHEN 'Owner'      THEN 'Management'
        WHEN 'Admin'      THEN 'Management'
        ELSE 'General'
      END
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_create_role_row ON public.user_profiles;
CREATE TRIGGER on_profile_create_role_row
  AFTER INSERT ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_role_profile();

-- Backfill existing users
INSERT INTO public.customers (id, loyalty_tier, loyalty_points)
SELECT id, COALESCE(tier, 'Green'), COALESCE(reward_points, 0)
FROM public.user_profiles
WHERE role = 'Customer'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.staffs (id, department)
SELECT id,
  CASE role
    WHEN 'Chef'       THEN 'Kitchen'
    WHEN 'HR'         THEN 'HR'
    WHEN 'Accountant' THEN 'Finance'
    WHEN 'Manager'    THEN 'Floor'
    WHEN 'Owner'      THEN 'Management'
    WHEN 'Admin'      THEN 'Management'
    ELSE 'General'
  END
FROM public.user_profiles
WHERE role IN ('Owner','Admin','Manager','Chef','HR','Accountant')
ON CONFLICT (id) DO NOTHING;


-- ────────────────────────────────────────────────────────────
-- 8. RLS
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.outlets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staffs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_visits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

-- Drop before recreating to avoid conflicts on re-run
DROP POLICY IF EXISTS "outlets_select"        ON public.outlets;
DROP POLICY IF EXISTS "outlets_write"         ON public.outlets;
DROP POLICY IF EXISTS "staffs_select"         ON public.staffs;
DROP POLICY IF EXISTS "staffs_write"          ON public.staffs;
DROP POLICY IF EXISTS "customers_select"      ON public.customers;
DROP POLICY IF EXISTS "customers_update_self" ON public.customers;
DROP POLICY IF EXISTS "customers_write_staff" ON public.customers;
DROP POLICY IF EXISTS "visits_select"         ON public.customer_visits;
DROP POLICY IF EXISTS "visits_insert"         ON public.customer_visits;
DROP POLICY IF EXISTS "payments_select"       ON public.customer_payments;
DROP POLICY IF EXISTS "payments_insert"       ON public.customer_payments;

CREATE POLICY "outlets_select" ON public.outlets
  FOR SELECT USING (true);

CREATE POLICY "outlets_write" ON public.outlets
  FOR ALL USING (public.jwt_user_role() IN ('SuperAdmin','Admin'));

CREATE POLICY "staffs_select" ON public.staffs
  FOR SELECT USING (
    id = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin','Owner','Admin','Manager','HR')
  );

CREATE POLICY "staffs_write" ON public.staffs
  FOR ALL USING (public.jwt_user_role() IN ('SuperAdmin','Admin','HR'));

CREATE POLICY "customers_select" ON public.customers
  FOR SELECT USING (
    id = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin','Owner','Admin','Manager','Accountant')
  );

CREATE POLICY "customers_update_self" ON public.customers
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "customers_write_staff" ON public.customers
  FOR ALL USING (public.jwt_user_role() IN ('SuperAdmin','Admin','Manager'));

CREATE POLICY "visits_select" ON public.customer_visits
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin','Owner','Admin','Manager','Accountant')
  );

CREATE POLICY "visits_insert" ON public.customer_visits
  FOR INSERT WITH CHECK (public.jwt_user_role() IN ('SuperAdmin','Admin','Manager'));

CREATE POLICY "payments_select" ON public.customer_payments
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin','Owner','Admin','Accountant')
  );

CREATE POLICY "payments_insert" ON public.customer_payments
  FOR INSERT WITH CHECK (public.jwt_user_role() IN ('SuperAdmin','Admin','Accountant','Manager'));


-- ────────────────────────────────────────────────────────────
-- 9. INDEXES
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_outlets_slug         ON public.outlets(slug);
CREATE INDEX IF NOT EXISTS idx_outlets_active       ON public.outlets(is_active);
CREATE INDEX IF NOT EXISTS idx_staffs_outlet        ON public.staffs(outlet_id);
CREATE INDEX IF NOT EXISTS idx_staffs_department    ON public.staffs(department);
CREATE INDEX IF NOT EXISTS idx_customers_outlet     ON public.customers(preferred_outlet_id);
CREATE INDEX IF NOT EXISTS idx_customers_tier       ON public.customers(loyalty_tier);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON public.customers(last_visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_visits_customer      ON public.customer_visits(customer_id);
CREATE INDEX IF NOT EXISTS idx_visits_outlet        ON public.customer_visits(outlet_id);
CREATE INDEX IF NOT EXISTS idx_visits_date          ON public.customer_visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_customer    ON public.customer_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_outlet      ON public.customer_payments(outlet_id);
CREATE INDEX IF NOT EXISTS idx_payments_paid_at     ON public.customer_payments(paid_at DESC);
