-- ============================================================
-- MAYFLOWER — RLS POLICY FIX
-- Run this in: Supabase Dashboard → SQL Editor
-- This replaces the broken current_user_role() policies with
-- ones that work correctly without recursive RLS loops.
-- ============================================================

-- Drop the broken helper function and all old policies
DROP FUNCTION IF EXISTS public.current_user_role();

DROP POLICY IF EXISTS "Own profile read"           ON public.user_profiles;
DROP POLICY IF EXISTS "Own profile update"         ON public.user_profiles;
DROP POLICY IF EXISTS "SuperAdmin insert profile"  ON public.user_profiles;
DROP POLICY IF EXISTS "Staff own shifts"           ON public.staff_shifts;
DROP POLICY IF EXISTS "HR manage shifts"           ON public.staff_shifts;
DROP POLICY IF EXISTS "Own leave requests"         ON public.leave_requests;
DROP POLICY IF EXISTS "Staff submit leave"         ON public.leave_requests;
DROP POLICY IF EXISTS "HR approve leave"           ON public.leave_requests;
DROP POLICY IF EXISTS "Task visibility"            ON public.tasks;
DROP POLICY IF EXISTS "Manager create tasks"       ON public.tasks;
DROP POLICY IF EXISTS "Manager update tasks"       ON public.tasks;
DROP POLICY IF EXISTS "Checklist read"             ON public.checklists;
DROP POLICY IF EXISTS "Admin manage checklists"    ON public.checklists;
DROP POLICY IF EXISTS "Own completions"            ON public.checklist_completions;
DROP POLICY IF EXISTS "Submit completion"          ON public.checklist_completions;
DROP POLICY IF EXISTS "Customer own reservations"  ON public.reservations;
DROP POLICY IF EXISTS "Customer create reservation" ON public.reservations;
DROP POLICY IF EXISTS "Manager update reservation" ON public.reservations;
DROP POLICY IF EXISTS "Customer submit feedback"   ON public.feedback;
DROP POLICY IF EXISTS "Staff read feedback"        ON public.feedback;
DROP POLICY IF EXISTS "Manager resolve feedback"   ON public.feedback;
DROP POLICY IF EXISTS "Admin read audit"           ON public.audit_logs;
DROP POLICY IF EXISTS "System insert audit"        ON public.audit_logs;


-- ────────────────────────────────────────────────────────────
-- Helper: reads role from JWT app_metadata (set by trigger below)
-- This avoids querying user_profiles inside an RLS policy (no recursion)
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
-- Trigger: sync role into auth.users app_metadata on profile upsert
-- so jwt_user_role() always reflects the correct role
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_role_to_jwt()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', NEW.role)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_role_sync ON public.user_profiles;
CREATE TRIGGER on_profile_role_sync
  AFTER INSERT OR UPDATE OF role ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_role_to_jwt();

-- Backfill existing users' app_metadata with their role
UPDATE auth.users u
SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', p.role)
FROM public.user_profiles p
WHERE u.id = p.id;


-- ────────────────────────────────────────────────────────────
-- user_profiles policies
-- ────────────────────────────────────────────────────────────

-- Anyone can read their own row; SuperAdmin/Owner/Admin/HR can read all
CREATE POLICY "profile_select" ON public.user_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'HR')
  );

-- Users can update their own row; SuperAdmin can update any
CREATE POLICY "profile_update" ON public.user_profiles
  FOR UPDATE USING (
    id = auth.uid()
    OR public.jwt_user_role() = 'SuperAdmin'
  );

-- Only the Edge Function (service role, bypasses RLS) inserts staff rows
-- Customers self-register via supabaseRegister which uses anon key + auth.signUp
CREATE POLICY "profile_insert_self" ON public.user_profiles
  FOR INSERT WITH CHECK (id = auth.uid());


-- ────────────────────────────────────────────────────────────
-- staff_shifts policies
-- ────────────────────────────────────────────────────────────
CREATE POLICY "shifts_select" ON public.staff_shifts
  FOR SELECT USING (
    staff_id = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'Manager', 'HR')
  );

CREATE POLICY "shifts_all_hr" ON public.staff_shifts
  FOR ALL USING (public.jwt_user_role() IN ('SuperAdmin', 'Admin', 'HR'));


-- ────────────────────────────────────────────────────────────
-- leave_requests policies
-- ────────────────────────────────────────────────────────────
CREATE POLICY "leave_select" ON public.leave_requests
  FOR SELECT USING (
    staff_id = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin', 'Admin', 'HR', 'Manager')
  );

CREATE POLICY "leave_insert" ON public.leave_requests
  FOR INSERT WITH CHECK (staff_id = auth.uid());

CREATE POLICY "leave_update_hr" ON public.leave_requests
  FOR UPDATE USING (public.jwt_user_role() IN ('SuperAdmin', 'Admin', 'HR'));


-- ────────────────────────────────────────────────────────────
-- tasks policies
-- ────────────────────────────────────────────────────────────
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT USING (
    assigned_to = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'Manager')
  );

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT WITH CHECK (public.jwt_user_role() IN ('SuperAdmin', 'Admin', 'Manager', 'Owner'));

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE USING (public.jwt_user_role() IN ('SuperAdmin', 'Admin', 'Manager', 'Owner'));


-- ────────────────────────────────────────────────────────────
-- checklists policies
-- ────────────────────────────────────────────────────────────
CREATE POLICY "checklists_select" ON public.checklists
  FOR SELECT USING (
    role = public.jwt_user_role()
    OR public.jwt_user_role() IN ('SuperAdmin', 'Admin', 'Owner')
  );

CREATE POLICY "checklists_all_admin" ON public.checklists
  FOR ALL USING (public.jwt_user_role() IN ('SuperAdmin', 'Admin'));


-- ────────────────────────────────────────────────────────────
-- checklist_completions policies
-- ────────────────────────────────────────────────────────────
CREATE POLICY "completions_select" ON public.checklist_completions
  FOR SELECT USING (
    completed_by = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin', 'Admin', 'Manager', 'Owner')
  );

CREATE POLICY "completions_insert" ON public.checklist_completions
  FOR INSERT WITH CHECK (completed_by = auth.uid());


-- ────────────────────────────────────────────────────────────
-- reservations policies
-- ────────────────────────────────────────────────────────────
CREATE POLICY "reservations_select" ON public.reservations
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'Manager', 'Accountant')
  );

CREATE POLICY "reservations_insert" ON public.reservations
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "reservations_update" ON public.reservations
  FOR UPDATE USING (public.jwt_user_role() IN ('SuperAdmin', 'Admin', 'Manager'));


-- ────────────────────────────────────────────────────────────
-- feedback policies
-- ────────────────────────────────────────────────────────────
CREATE POLICY "feedback_insert" ON public.feedback
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "feedback_select" ON public.feedback
  FOR SELECT USING (
    customer_id = auth.uid()
    OR public.jwt_user_role() IN ('SuperAdmin', 'Owner', 'Admin', 'Manager')
  );

CREATE POLICY "feedback_update" ON public.feedback
  FOR UPDATE USING (public.jwt_user_role() IN ('SuperAdmin', 'Admin', 'Manager', 'Owner'));


-- ────────────────────────────────────────────────────────────
-- audit_logs policies
-- ────────────────────────────────────────────────────────────
CREATE POLICY "audit_select" ON public.audit_logs
  FOR SELECT USING (public.jwt_user_role() IN ('SuperAdmin', 'Owner', 'Admin'));

CREATE POLICY "audit_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);
