import { supabase } from './supabaseClient';
import { SUPABASE_URL } from './adminClient';
import { UserRole } from '../types';

export interface StaffMember {
  id: string; name: string; email: string; mobile: string | null; role: UserRole; outlet: string | null; is_active: boolean; joined_date: string; created_at: string;
  employee_code: string | null; department: string | null; employment_type: string | null; shift_timing: string | null; date_of_joining: string | null; outlet_name: string | null;
}
export interface CreateStaffPayload { name: string; email: string; mobile: string; password: string; role: UserRole; outlet: string; }
export interface AdminOperationalData { staff: StaffMember[]; outlets: any[]; tables: any[]; reservations: any[]; checklists: any[]; tasks: any[]; feedback: any[]; franchiseLeads: any[]; auditLogs: any[]; }
export interface ReservationRecord { id: string; bookingCode: string; outlet: string; date: string; timeSlot: string; guests: number; status: string; bookedAt: string; }
export interface TransactionRecord { id: string; type: string; points: number; description: string; date: string; }
export interface CustomerRecord { id: string; name: string; email: string; phone: string; reward_points: number; tier: string; joined_date: string; created_at: string; reservations: ReservationRecord[]; transactions: TransactionRecord[]; dietary_preferences: string[]; allergies: string | null; preferred_seating: string | null; birthday: string | null; anniversary: string | null; notes: string | null; total_visits: number; total_reservations: number; total_spent: number; average_spend: number; last_visit_date: string | null; loyalty_tier: string; loyalty_points: number; preferred_outlet_name: string | null; last_visit_outlet_name: string | null; }
const staffRoles: UserRole[] = ['Owner', 'Admin', 'Manager', 'Chef', 'HR', 'Accountant'];

export const fetchAllStaff = async (): Promise<StaffMember[]> => {
  const { data, error } = await supabase.from('user_profiles').select('id,name,email,mobile,role,outlet,is_active,joined_date,created_at,staffs(employee_code,department,employment_type,shift_timing,date_of_joining,outlets(name))').in('role', staffRoles).order('created_at', { ascending: false });
  if (error) throw new Error(`Staff: ${error.message}`);
  return (data ?? []).map((row: any) => ({ ...row, employee_code: row.staffs?.employee_code ?? null, department: row.staffs?.department ?? null, employment_type: row.staffs?.employment_type ?? null, shift_timing: row.staffs?.shift_timing ?? null, date_of_joining: row.staffs?.date_of_joining ?? null, outlet_name: row.staffs?.outlets?.name ?? row.outlet ?? null }));
};
export const fetchAllCustomers = async (): Promise<CustomerRecord[]> => {
  const { data, error } = await supabase.from('user_profiles').select('id,name,email,phone,reward_points,tier,joined_date,created_at,reservations,transactions,customers(dietary_preferences,allergies,preferred_seating,birthday,anniversary,notes,total_visits,total_reservations,total_spent,average_spend,last_visit_date,loyalty_tier,loyalty_points,preferred_outlet:outlets!customers_preferred_outlet_id_fkey(name),last_visit_outlet:outlets!customers_last_visit_outlet_id_fkey(name))').eq('role', 'Customer').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({ ...row, reservations: row.reservations ?? [], transactions: row.transactions ?? [], dietary_preferences: row.customers?.dietary_preferences ?? [], allergies: row.customers?.allergies ?? null, preferred_seating: row.customers?.preferred_seating ?? null, birthday: row.customers?.birthday ?? null, anniversary: row.customers?.anniversary ?? null, notes: row.customers?.notes ?? null, total_visits: row.customers?.total_visits ?? 0, total_reservations: row.customers?.total_reservations ?? 0, total_spent: row.customers?.total_spent ?? 0, average_spend: row.customers?.average_spend ?? 0, last_visit_date: row.customers?.last_visit_date ?? null, loyalty_tier: row.customers?.loyalty_tier ?? row.tier, loyalty_points: row.customers?.loyalty_points ?? row.reward_points, preferred_outlet_name: row.customers?.preferred_outlet?.name ?? null, last_visit_outlet_name: row.customers?.last_visit_outlet?.name ?? null }));
};
export const fetchOutlets = async () => { const { data, error } = await supabase.from('outlets').select('id,name,slug,badge,area,petpooja_id,tables_count,covers_count,is_active,opening_time,closing_time').order('created_at', { ascending: true }); if (error) throw new Error(error.message); return data ?? []; };

export const fetchAdminOperationalData = async (): Promise<AdminOperationalData> => {
  const safe = async (request: any, source: string) => { const { data, error } = await request; if (error) { console.warn(`Admin dashboard could not load ${source}: ${error.message}`); return []; } return data ?? []; };
  const [staff, outlets, tables, reservations, checklists, tasks, feedback, franchiseLeads, auditLogs] = await Promise.all([
    fetchAllStaff(), safe(supabase.from('outlets').select('*').order('name'), 'outlets'), safe(supabase.from('tables').select('*').limit(100), 'tables'), safe(supabase.from('reservations').select('*').order('reservation_date', { ascending: false }).limit(100), 'reservations'), safe(supabase.from('checklists').select('*').order('created_at', { ascending: false }).limit(100), 'checklists'), safe(supabase.from('tasks').select('*').order('created_at', { ascending: false }).limit(100), 'tasks'), safe(supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(100), 'feedback'), safe(supabase.from('franchise_leads').select('*').order('created_at', { ascending: false }).limit(100), 'franchise enquiries'), safe(supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100), 'activity records')
  ]);
  return { staff, outlets, tables, reservations, checklists, tasks, feedback, franchiseLeads, auditLogs };
};

export const createStaffMember = async (payload: CreateStaffPayload): Promise<{ error?: string }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Not authenticated.' };
  const response = await fetch(`${SUPABASE_URL}/functions/v1/create-staff-user`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(payload) });
  const json = await response.json();
  return response.ok ? {} : { error: json.error ?? 'Failed to create staff.' };
};
export const toggleStaffActive = async (id: string, is_active: boolean): Promise<{ error?: string }> => { const { error } = await supabase.from('user_profiles').update({ is_active }).eq('id', id); return error ? { error: error.message } : {}; };
export const updateStaffAssignment = async (id: string, role: UserRole, outlet: string | null): Promise<{ error?: string }> => { const { error } = await supabase.from('user_profiles').update({ role, outlet }).eq('id', id); return error ? { error: error.message } : {}; };
