-- ============================================================
-- MAYFLOWER PHASE 1 — SUPABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM (
  'SuperAdmin', 'Owner', 'Admin', 'Manager', 'Chef', 'HR', 'Accountant', 'Customer'
);

CREATE TYPE outlet_status AS ENUM ('active', 'inactive', 'coming_soon');

CREATE TYPE table_status AS ENUM ('Available', 'Reserved', 'Occupied', 'Cleaning', 'Blocked');

CREATE TYPE reservation_status AS ENUM (
  'Pending', 'Confirmed', 'Cancelled', 'Completed', 'No-show'
);

CREATE TYPE task_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Escalated');

CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');

CREATE TYPE sop_category AS ENUM (
  'Opening', 'Closing', 'Kitchen', 'Floor', 'Hygiene',
  'Equipment', 'Customer Service', 'Quality Checks', 'Other'
);

CREATE TYPE franchise_status AS ENUM (
  'New', 'Under Review', 'Contacted', 'Qualified', 'Closed'
);

CREATE TYPE feedback_status AS ENUM ('New', 'Reviewed', 'Resolved');

-- ============================================================
-- 01. USERS
-- ============================================================

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'Customer',
  outlet_id     UUID,                          -- assigned outlet for staff
  phone         TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 02. OUTLETS
-- ============================================================

CREATE TABLE outlets (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  address       TEXT,
  city          TEXT DEFAULT 'Chennai',
  phone         TEXT,
  email         TEXT,
  opening_hours JSONB,                         -- { mon: "11:00-22:00", ... }
  description   TEXT,
  images        TEXT[],                        -- array of image URLs
  status        outlet_status DEFAULT 'active',
  published     BOOLEAN DEFAULT FALSE,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Add FK for users.outlet_id after outlets table exists
ALTER TABLE users ADD CONSTRAINT fk_users_outlet
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL;

-- ============================================================
-- 03. FLOORS / SECTIONS
-- ============================================================

CREATE TABLE floors (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id  UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,                    -- e.g. "Glasshouse", "Garden"
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 04. TABLES
-- ============================================================

CREATE TABLE tables (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id            UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  floor_id             UUID REFERENCES floors(id) ON DELETE SET NULL,
  name                 TEXT NOT NULL,          -- e.g. "T1", "Window Table 2"
  seats                INT NOT NULL DEFAULT 2,
  status               table_status DEFAULT 'Available',
  is_active            BOOLEAN DEFAULT TRUE,
  position_x           FLOAT,                 -- for floor map rendering
  position_y           FLOAT,
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 05. RESERVATIONS
-- ============================================================

CREATE TABLE reservations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_code        TEXT UNIQUE NOT NULL,    -- e.g. MF-4821
  customer_id         UUID NOT NULL REFERENCES users(id),
  outlet_id           UUID NOT NULL REFERENCES outlets(id),
  table_id            UUID REFERENCES tables(id) ON DELETE SET NULL,
  date                DATE NOT NULL,
  time_slot           TEXT NOT NULL,           -- e.g. "7:00 PM"
  guests              INT NOT NULL DEFAULT 2,
  status              reservation_status DEFAULT 'Pending',
  seating_area        TEXT,
  dietary_preferences TEXT,
  special_occasion    TEXT,
  special_notes       TEXT,
  assigned_by         UUID REFERENCES users(id),  -- manager who assigned table
  confirmed_at        TIMESTAMPTZ,
  cancelled_at        TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 06. MENU ITEMS
-- ============================================================

CREATE TABLE menu_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id    UUID REFERENCES outlets(id) ON DELETE SET NULL,  -- NULL = all outlets
  category     TEXT NOT NULL,
  name         TEXT NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL,
  image_url    TEXT,
  is_veg       BOOLEAN DEFAULT TRUE,
  is_available BOOLEAN DEFAULT TRUE,
  is_chef_pick BOOLEAN DEFAULT FALSE,
  sort_order   INT DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 07. SOP CHECKLISTS
-- ============================================================

CREATE TABLE sop_checklists (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id     UUID REFERENCES outlets(id) ON DELETE CASCADE,
  category      sop_category NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  assigned_role user_role,
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    UUID REFERENCES users(id),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 08. TASKS
-- ============================================================

CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  checklist_id    UUID REFERENCES sop_checklists(id) ON DELETE CASCADE,
  outlet_id       UUID REFERENCES outlets(id) ON DELETE CASCADE,
  assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  priority        task_priority DEFAULT 'Medium',
  status          task_status DEFAULT 'Pending',
  due_date        DATE,
  photo_url       TEXT,                        -- Supabase Storage URL
  geo_lat         FLOAT,
  geo_lng         FLOAT,
  remarks         TEXT,
  completed_at    TIMESTAMPTZ,
  escalated_at    TIMESTAMPTZ,
  escalated_to    UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 09. CUSTOMER FEEDBACK
-- ============================================================

CREATE TABLE feedback (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  outlet_id   UUID REFERENCES outlets(id) ON DELETE CASCADE,
  rating      INT CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  status      feedback_status DEFAULT 'New',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. FRANCHISE ENQUIRIES
-- ============================================================

CREATE TABLE franchise_leads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  city          TEXT,
  message       TEXT,
  status        franchise_status DEFAULT 'New',
  documents     TEXT[],                        -- Supabase Storage URLs
  internal_notes TEXT,
  assigned_to   UUID REFERENCES users(id),
  reviewed_by   UUID REFERENCES users(id),
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 11. LOYALTY
-- ============================================================

CREATE TABLE loyalty_accounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id     UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points          INT DEFAULT 0,
  tier            TEXT DEFAULT 'Green',        -- Green, Gold, Sanctuary VIP
  provider_ref    TEXT,                        -- external loyalty provider ID
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id  UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,                   -- earned_signup, earned_visit, redeemed
  points      INT NOT NULL,
  description TEXT,
  ref_id      UUID,                            -- reservation_id or gift_card_id
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. OTP TOKENS
-- ============================================================

CREATE TABLE otp_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      TEXT NOT NULL,
  otp        TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. AUDIT LOGS
-- ============================================================

CREATE TABLE audit_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,                    -- e.g. "reservation.confirmed"
  entity     TEXT,                             -- e.g. "reservations"
  entity_id  UUID,
  meta       JSONB,                            -- extra context
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. INTEGRATION CONFIG
-- ============================================================

CREATE TABLE integration_config (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT UNIQUE NOT NULL,             -- e.g. "petpooja", "loyalty"
  config     JSONB,                            -- encrypted/masked config
  is_active  BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_reservations_outlet    ON reservations(outlet_id);
CREATE INDEX idx_reservations_customer  ON reservations(customer_id);
CREATE INDEX idx_reservations_date      ON reservations(date);
CREATE INDEX idx_reservations_status    ON reservations(status);
CREATE INDEX idx_tables_outlet          ON tables(outlet_id);
CREATE INDEX idx_tasks_outlet           ON tasks(outlet_id);
CREATE INDEX idx_tasks_assigned_to      ON tasks(assigned_to);
CREATE INDEX idx_tasks_status           ON tasks(status);
CREATE INDEX idx_feedback_outlet        ON feedback(outlet_id);
CREATE INDEX idx_audit_logs_user        ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity      ON audit_logs(entity, entity_id);
CREATE INDEX idx_otp_email              ON otp_tokens(email);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_outlets_updated_at
  BEFORE UPDATE ON outlets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tables_updated_at
  BEFORE UPDATE ON tables FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_reservations_updated_at
  BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_menu_updated_at
  BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_franchise_updated_at
  BEFORE UPDATE ON franchise_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_loyalty_updated_at
  BEFORE UPDATE ON loyalty_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables            ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_checklists    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks             ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback          ENABLE ROW LEVEL SECURITY;
ALTER TABLE franchise_leads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_accounts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (used by backend API)
-- All API calls use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS
-- RLS policies below are for direct client access safety

-- Outlets: public can read published outlets
CREATE POLICY "Public read published outlets"
  ON outlets FOR SELECT USING (published = TRUE AND status = 'active');

-- Menu: public can read available items
CREATE POLICY "Public read menu items"
  ON menu_items FOR SELECT USING (is_available = TRUE);

-- Reservations: customers see only their own
CREATE POLICY "Customers see own reservations"
  ON reservations FOR SELECT
  USING (auth.uid()::text = customer_id::text);

-- Feedback: customers see only their own
CREATE POLICY "Customers see own feedback"
  ON feedback FOR SELECT
  USING (auth.uid()::text = customer_id::text);

-- Loyalty: customers see only their own
CREATE POLICY "Customers see own loyalty"
  ON loyalty_accounts FOR SELECT
  USING (auth.uid()::text = customer_id::text);

-- ============================================================
-- SEED DATA — OUTLETS
-- ============================================================

INSERT INTO outlets (id, name, slug, address, phone, status, published) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Poes Garden',  'poes-garden',  '3, Khader Nawaz Khan Rd, Poes Garden, Chennai', '+91 44 4892 7700', 'active', TRUE),
  ('a1000000-0000-0000-0000-000000000002', 'Anna Nagar',   'anna-nagar',   '2nd Ave, Anna Nagar, Chennai',                  '+91 44 4892 7701', 'active', TRUE),
  ('a1000000-0000-0000-0000-000000000003', 'Egmore',       'egmore',       'Egmore, Chennai',                               '+91 44 4892 7702', 'active', TRUE),
  ('a1000000-0000-0000-0000-000000000004', 'Palavakkam',   'palavakkam',   'ECR, Palavakkam, Chennai',                      '+91 44 4892 7703', 'active', TRUE);

-- ============================================================
-- SEED DATA — STAFF USERS (passwords are bcrypt of role@1234)
-- Run: node -e "const b=require('bcryptjs');console.log(b.hashSync('superadmin@1234',10))"
-- Replace hashes below after generating them
-- ============================================================

INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Super Admin', 'superadmin@gmail.com', '$REPLACE_WITH_BCRYPT_HASH', 'SuperAdmin'),
  ('b1000000-0000-0000-0000-000000000002', 'Owner',       'owner@gmail.com',       '$REPLACE_WITH_BCRYPT_HASH', 'Owner'),
  ('b1000000-0000-0000-0000-000000000003', 'Admin',       'admin@gmail.com',       '$REPLACE_WITH_BCRYPT_HASH', 'Admin'),
  ('b1000000-0000-0000-0000-000000000004', 'Manager',     'manager@gmail.com',     '$REPLACE_WITH_BCRYPT_HASH', 'Manager'),
  ('b1000000-0000-0000-0000-000000000005', 'Chef',        'chef@gmail.com',        '$REPLACE_WITH_BCRYPT_HASH', 'Chef'),
  ('b1000000-0000-0000-0000-000000000006', 'HR',          'hr@gmail.com',          '$REPLACE_WITH_BCRYPT_HASH', 'HR'),
  ('b1000000-0000-0000-0000-000000000007', 'Accountant',  'accountant@gmail.com',  '$REPLACE_WITH_BCRYPT_HASH', 'Accountant');
