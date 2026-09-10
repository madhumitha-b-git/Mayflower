-- ============================================================
-- MAYFLOWER SANCTUARIES — SUPABASE DATABASE SCHEMA
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. ALTER user_profiles — add missing columns
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS mobile text NULL,
  ADD COLUMN IF NOT EXISTS outlet text NULL,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;


-- ────────────────────────────────────────────────────────────
-- 2. staff_shifts — shift schedules per staff member
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.staff_shifts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  outlet      text NOT NULL,
  shift_date  date NOT NULL,
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  shift_type  text NOT NULL DEFAULT 'Regular'
                CHECK (shift_type IN ('Regular', 'Split', 'On-Call', 'Holiday')),
  status      text NOT NULL DEFAULT 'Scheduled'
                CHECK (status IN ('Scheduled', 'Completed', 'Absent', 'Swapped')),
  notes       text NULL,
  created_at  timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 3. leave_requests — leave and shift-swap requests
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.leave_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id      uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  request_type  text NOT NULL CHECK (request_type IN ('Leave', 'Shift Swap', 'Early Out', 'Late Start')),
  from_date     date NOT NULL,
  to_date       date NOT NULL,
  reason        text NULL,
  status        text NOT NULL DEFAULT 'Pending'
                  CHECK (status IN ('Pending', 'Approved', 'Rejected')),
  reviewed_by   uuid NULL REFERENCES public.user_profiles(id),
  reviewed_at   timestamptz NULL,
  created_at    timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 4. tasks — operational tasks assigned across roles
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.tasks (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text NULL,
  assigned_to   uuid NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  assigned_role text NULL CHECK (assigned_role IN ('Owner','Admin','Manager','Chef','HR','Accountant')),
  outlet        text NULL,
  priority      text NOT NULL DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
  status        text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Done', 'Escalated')),
  due_date      date NULL,
  created_by    uuid NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 5. checklists — SOP checklists per outlet / role
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.checklists (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  role        text NOT NULL CHECK (role IN ('Manager','Chef','HR','Admin','Owner','Accountant','SuperAdmin')),
  outlet      text NULL,
  frequency   text NOT NULL DEFAULT 'Daily' CHECK (frequency IN ('Daily', 'Weekly', 'Monthly', 'One-Time')),
  items       jsonb NOT NULL DEFAULT '[]',
  -- items shape: [{ "id": "uuid", "label": "text", "done": false }]
  created_by  uuid NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.checklist_completions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id  uuid NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  completed_by  uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  outlet        text NOT NULL,
  completed_at  timestamptz DEFAULT now(),
  items_state   jsonb NOT NULL DEFAULT '[]'
  -- items_state mirrors checklist.items with done=true/false per completion
);


-- ────────────────────────────────────────────────────────────
-- 6. reservations — normalized reservation records
--    (replaces the JSONB array in user_profiles for new bookings)
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reservations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code    text NOT NULL UNIQUE,
  customer_id     uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  outlet          text NOT NULL,
  reservation_date date NOT NULL,
  time_slot       text NOT NULL,
  guests          integer NOT NULL DEFAULT 1,
  seating_area    text NULL,
  status          text NOT NULL DEFAULT 'Confirmed'
                    CHECK (status IN ('Confirmed', 'Completed', 'Cancelled', 'No-Show')),
  dietary_prefs   text NULL,
  special_occasion text NULL,
  notes           text NULL,
  table_id        text NULL,
  booked_at       timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 7. feedback — customer feedback submissions
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.feedback (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  outlet          text NOT NULL,
  reservation_id  uuid NULL REFERENCES public.reservations(id) ON DELETE SET NULL,
  rating          integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category        text NOT NULL DEFAULT 'General'
                    CHECK (category IN ('Food', 'Service', 'Ambience', 'General', 'Complaint')),
  message         text NULL,
  is_resolved     boolean NOT NULL DEFAULT false,
  resolved_by     uuid NULL REFERENCES public.user_profiles(id),
  resolved_at     timestamptz NULL,
  created_at      timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 8. audit_logs — system-wide activity log
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid NULL REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  actor_name  text NULL,
  actor_role  text NULL,
  action      text NOT NULL,
  entity      text NULL,   -- e.g. 'reservation', 'staff', 'outlet'
  entity_id   text NULL,
  outlet      text NULL,
  metadata    jsonb NULL,
  created_at  timestamptz DEFAULT now()
);


-- ────────────────────────────────────────────────────────────
-- 9. Row Level Security (RLS) policies
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all new tables
ALTER TABLE public.staff_shifts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs            ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role from user_profiles
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.user_profiles WHERE id = auth.uid()
$$;

-- user_profiles: users can read/update their own row; SuperAdmin/Owner/Admin can read all
CREATE POLICY "Own profile read" ON public.user_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR public.current_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'HR')
  );

CREATE POLICY "Own profile update" ON public.user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "SuperAdmin insert profile" ON public.user_profiles
  FOR INSERT WITH CHECK (public.current_user_role() = 'SuperAdmin');

-- staff_shifts: staff see own shifts; managers/HR/admin see all in their outlet
CREATE POLICY "Staff own shifts" ON public.staff_shifts
  FOR SELECT USING (
    staff_id = auth.uid()
    OR public.current_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'Manager', 'HR')
  );

CREATE POLICY "HR manage shifts" ON public.staff_shifts
  FOR ALL USING (public.current_user_role() IN ('SuperAdmin', 'Admin', 'HR'));

-- leave_requests: staff see own; HR/Admin/SuperAdmin see all
CREATE POLICY "Own leave requests" ON public.leave_requests
  FOR SELECT USING (
    staff_id = auth.uid()
    OR public.current_user_role() IN ('SuperAdmin', 'Admin', 'HR', 'Manager')
  );

CREATE POLICY "Staff submit leave" ON public.leave_requests
  FOR INSERT WITH CHECK (staff_id = auth.uid());

CREATE POLICY "HR approve leave" ON public.leave_requests
  FOR UPDATE USING (public.current_user_role() IN ('SuperAdmin', 'Admin', 'HR'));

-- tasks: assigned user or managers/admins
CREATE POLICY "Task visibility" ON public.tasks
  FOR SELECT USING (
    assigned_to = auth.uid()
    OR public.current_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'Manager')
  );

CREATE POLICY "Manager create tasks" ON public.tasks
  FOR INSERT WITH CHECK (public.current_user_role() IN ('SuperAdmin', 'Admin', 'Manager', 'Owner'));

CREATE POLICY "Manager update tasks" ON public.tasks
  FOR UPDATE USING (public.current_user_role() IN ('SuperAdmin', 'Admin', 'Manager', 'Owner'));

-- checklists: role-based read
CREATE POLICY "Checklist read" ON public.checklists
  FOR SELECT USING (
    role = public.current_user_role()
    OR public.current_user_role() IN ('SuperAdmin', 'Admin', 'Owner')
  );

CREATE POLICY "Admin manage checklists" ON public.checklists
  FOR ALL USING (public.current_user_role() IN ('SuperAdmin', 'Admin'));

-- checklist_completions
CREATE POLICY "Own completions" ON public.checklist_completions
  FOR SELECT USING (
    completed_by = auth.uid()
    OR public.current_user_role() IN ('SuperAdmin', 'Admin', 'Manager', 'Owner')
  );

CREATE POLICY "Submit completion" ON public.checklist_completions
  FOR INSERT WITH CHECK (completed_by = auth.uid());

-- reservations: customers see own; staff see all
CREATE POLICY "Customer own reservations" ON public.reservations
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.current_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'Manager', 'Accountant')
  );

CREATE POLICY "Customer create reservation" ON public.reservations
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Manager update reservation" ON public.reservations
  FOR UPDATE USING (public.current_user_role() IN ('SuperAdmin', 'Admin', 'Manager'));

-- feedback: customers submit own; staff read all
CREATE POLICY "Customer submit feedback" ON public.feedback
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Staff read feedback" ON public.feedback
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.current_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'Manager')
  );

CREATE POLICY "Manager resolve feedback" ON public.feedback
  FOR UPDATE USING (public.current_user_role() IN ('SuperAdmin', 'Admin', 'Manager', 'Owner'));

-- audit_logs: SuperAdmin/Owner/Admin read only
CREATE POLICY "Admin read audit" ON public.audit_logs
  FOR SELECT USING (public.current_user_role() IN ('SuperAdmin', 'Owner', 'Admin'));

CREATE POLICY "System insert audit" ON public.audit_logs
  FOR INSERT WITH CHECK (true);


-- ────────────────────────────────────────────────────────────
-- 10. Indexes for common query patterns
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_user_profiles_role     ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_outlet   ON public.user_profiles(outlet);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_staff     ON public.staff_shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_date      ON public.staff_shifts(shift_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_staff   ON public.leave_requests(staff_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned         ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_outlet           ON public.tasks(outlet);
CREATE INDEX IF NOT EXISTS idx_reservations_customer  ON public.reservations(customer_id);
CREATE INDEX IF NOT EXISTS idx_reservations_outlet    ON public.reservations(outlet);
CREATE INDEX IF NOT EXISTS idx_reservations_date      ON public.reservations(reservation_date);
CREATE INDEX IF NOT EXISTS idx_feedback_outlet        ON public.feedback(outlet);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor       ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created     ON public.audit_logs(created_at DESC);
