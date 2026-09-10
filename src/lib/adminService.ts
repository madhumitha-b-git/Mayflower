import { supabase } from './supabaseClient';
import { SUPABASE_URL } from './adminClient';
import { UserRole } from '../types';

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  role: UserRole;
  outlet: string | null;
  is_active: boolean;
  joined_date: string;
  created_at: string;
  // from staffs table
  employee_code: string | null;
  department: string | null;
  employment_type: string | null;
  shift_timing: string | null;
  date_of_joining: string | null;
  outlet_name: string | null;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  reward_points: number;
  tier: string;
  joined_date: string;
  created_at: string;
  reservations: ReservationRecord[];
  transactions: TransactionRecord[];
  // from customers table
  dietary_preferences: string[];
  allergies: string | null;
  preferred_seating: string | null;
  birthday: string | null;
  anniversary: string | null;
  notes: string | null;
  total_visits: number;
  total_reservations: number;
  total_spent: number;
  average_spend: number;
  last_visit_date: string | null;
  loyalty_tier: string;
  loyalty_points: number;
  preferred_outlet_name: string | null;
  last_visit_outlet_name: string | null;
}

export interface ReservationRecord {
  id: string;
  bookingCode: string;
  outlet: string;
  date: string;
  timeSlot: string;
  guests: number;
  status: string;
  bookedAt: string;
}

export interface TransactionRecord {
  id: string;
  type: string;
  points: number;
  description: string;
  date: string;
}

export interface CreateStaffPayload {
  name: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;
  outlet: string;
}

const STAFF_ROLES: UserRole[] = ['Owner', 'Admin', 'Manager', 'Chef', 'HR', 'Accountant'];

export const fetchAllStaff = async (): Promise<StaffMember[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      id, name, email, mobile, role, outlet, is_active, joined_date, created_at,
      staffs (
        employee_code, department, employment_type, shift_timing, date_of_joining,
        outlets ( name )
      )
    `)
    .in('role', STAFF_ROLES)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as any[]).map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    mobile: row.mobile,
    role: row.role,
    outlet: row.outlet,
    is_active: row.is_active,
    joined_date: row.joined_date,
    created_at: row.created_at,
    employee_code: row.staffs?.employee_code ?? null,
    department: row.staffs?.department ?? null,
    employment_type: row.staffs?.employment_type ?? null,
    shift_timing: row.staffs?.shift_timing ?? null,
    date_of_joining: row.staffs?.date_of_joining ?? null,
    outlet_name: row.staffs?.outlets?.name ?? row.outlet ?? null,
  }));
};

export const fetchAllCustomers = async (): Promise<CustomerRecord[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      id, name, email, phone, reward_points, tier, joined_date, created_at,
      reservations, transactions,
      customers (
        dietary_preferences, allergies, preferred_seating,
        birthday, anniversary, notes,
        total_visits, total_reservations, total_spent, average_spend,
        last_visit_date, loyalty_tier, loyalty_points,
        preferred_outlet:outlets!customers_preferred_outlet_id_fkey ( name ),
        last_visit_outlet:outlets!customers_last_visit_outlet_id_fkey ( name )
      )
    `)
    .eq('role', 'Customer')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  return ((data ?? []) as any[]).map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    reward_points: row.reward_points,
    tier: row.tier,
    joined_date: row.joined_date,
    created_at: row.created_at,
    reservations: row.reservations ?? [],
    transactions: row.transactions ?? [],
    dietary_preferences: row.customers?.dietary_preferences ?? [],
    allergies: row.customers?.allergies ?? null,
    preferred_seating: row.customers?.preferred_seating ?? null,
    birthday: row.customers?.birthday ?? null,
    anniversary: row.customers?.anniversary ?? null,
    notes: row.customers?.notes ?? null,
    total_visits: row.customers?.total_visits ?? 0,
    total_reservations: row.customers?.total_reservations ?? 0,
    total_spent: row.customers?.total_spent ?? 0,
    average_spend: row.customers?.average_spend ?? 0,
    last_visit_date: row.customers?.last_visit_date ?? null,
    loyalty_tier: row.customers?.loyalty_tier ?? row.tier,
    loyalty_points: row.customers?.loyalty_points ?? row.reward_points,
    preferred_outlet_name: row.customers?.preferred_outlet?.name ?? null,
    last_visit_outlet_name: row.customers?.last_visit_outlet?.name ?? null,
  }));
};

export const createStaffMember = async (payload: CreateStaffPayload): Promise<{ error?: string }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Not authenticated.' };

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-staff-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) return { error: json.error ?? 'Failed to create staff.' };
  return {};
};

export const toggleStaffActive = async (userId: string, is_active: boolean): Promise<{ error?: string }> => {
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_active })
    .eq('id', userId);
  if (error) return { error: error.message };
  return {};
};

export const fetchOutlets = async () => {
  const { data, error } = await supabase
    .from('outlets')
    .select('id, name, slug, badge, area, petpooja_id, tables_count, covers_count, is_active, opening_time, closing_time')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
};
