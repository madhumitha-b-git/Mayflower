import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Filter,
  LogOut,
  RefreshCcw,
  Search,
  ShieldCheck,
  Users,
  XCircle,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

type StaffRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  outlet: string;
  is_active: boolean;
  joined_date: string;
  employee_code: string;
  department: string;
  employment_type: string;
  shift_timing: string;
  date_of_joining: string;
  status: string;
  shift: string;
};

type ShiftRecord = {
  id: string;
  staff_id: string;
  staff_name: string;
  outlet: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  shift_type: string;
  status: string;
};

type LeaveRequest = {
  id: string;
  staff_id: string;
  employee: string;
  role: string;
  outlet: string;
  request_type: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: string;
};

type ActivityItem = {
  id: string;
  actor_name: string;
  action: string;
  entity: string;
  outlet: string;
  created_at: string;
};

const isMissingTableError = (message?: string | null) => {
  const value = (message ?? '').toLowerCase();
  return (
    value.includes('could not find the table') ||
    value.includes('does not exist') ||
    value.includes('schema cache') ||
    (value.includes('relation') && value.includes('does not exist'))
  );
};

const safeSelect = async (table: string, columns: string, orderBy?: { column: string; ascending?: boolean }) => {
  try {
    let query = supabase.from(table).select(columns);
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
    }
    const { data, error } = await query;
    if (error) {
      if (isMissingTableError(error.message)) return [] as any[];
      throw new Error(`${table}: ${error.message}`);
    }
    return data ?? [];
  } catch (error) {
    if (error instanceof Error && isMissingTableError(error.message)) return [] as any[];
    throw error;
  }
};

const loadHRData = async () => {
  if (!isSupabaseConfigured) {
    return { staff: [], shiftSummary: [], leaveRequests: [], activities: [], outlets: [] };
  }

  const [outlets, profilesRaw, shiftsRaw, leaveRequestsRaw, activitiesRaw] = await Promise.all([
    safeSelect('outlets', 'id,name,area,is_active', { column: 'name', ascending: true }),
    safeSelect(
      'user_profiles',
      'id,name,email,role,outlet,is_active,joined_date,created_at,staffs(id,employee_code,department,employment_type,shift_timing,date_of_joining,outlet_id,outlets(name))',
      { column: 'created_at', ascending: false }
    ),
    safeSelect(
      'staff_shifts',
      'id,staff_id,staff:user_profiles!staff_shifts_staff_id_fkey(id,name),outlet,shift_date,start_time,end_time,shift_type,status',
      { column: 'shift_date', ascending: false }
    ),
    safeSelect(
      'leave_requests',
      'id,staff_id,staff:user_profiles!leave_requests_staff_id_fkey(id,name,role,outlet),request_type,from_date,to_date,reason,status',
      { column: 'created_at', ascending: false }
    ),
    safeSelect(
      'audit_logs',
      'id,actor_name,action,entity,outlet,created_at',
      { column: 'created_at', ascending: false }
    ),
  ]);

  const staff = (profilesRaw as any[]).map((row) => {
    const outletName = row.outlet ?? row.staffs?.outlets?.name ?? 'Unassigned';
    const shiftTiming = row.staffs?.shift_timing ?? 'Flexible';
    const status = row.is_active ? 'On Duty' : 'Inactive';
    const shift = shiftTiming === 'Morning' ? 'Morning (07:00-15:00)' : shiftTiming === 'Evening' ? 'Evening (15:00-23:00)' : shiftTiming === 'Split' ? 'Split Shift' : 'Flexible Duty';

    return {
      id: row.id,
      name: row.name ?? 'Unknown staff',
      email: row.email ?? '',
      role: row.role ?? 'Staff',
      outlet: outletName,
      is_active: !!row.is_active,
      joined_date: row.joined_date ?? row.created_at ?? '',
      employee_code: row.staffs?.employee_code ?? 'MF-EMP',
      department: row.staffs?.department ?? 'General',
      employment_type: row.staffs?.employment_type ?? 'Full-time',
      shift_timing: shiftTiming,
      date_of_joining: row.staffs?.date_of_joining ?? '',
      status,
      shift,
    } satisfies StaffRecord;
  });

  const shiftSummary = (shiftsRaw as any[]).map((row) => ({
    id: row.id,
    staff_id: row.staff_id,
    staff_name: row.staff?.name ?? 'Team member',
    outlet: row.outlet ?? 'Unassigned',
    shift_date: row.shift_date ?? '',
    start_time: row.start_time ?? '00:00',
    end_time: row.end_time ?? '00:00',
    shift_type: row.shift_type ?? 'Regular',
    status: row.status ?? 'Scheduled',
  }));

  const leaveRequests = (leaveRequestsRaw as any[]).map((row) => ({
    id: row.id,
    staff_id: row.staff_id,
    employee: row.staff?.name ?? 'Team member',
    role: row.staff?.role ?? 'Staff',
    outlet: row.staff?.outlet ?? 'Unassigned',
    request_type: row.request_type ?? 'Leave Request',
    from_date: row.from_date ?? '',
    to_date: row.to_date ?? '',
    reason: row.reason ?? 'No reason provided',
    status: row.status ?? 'Pending',
  }));

  const activities = (activitiesRaw as any[]).map((row) => ({
    id: row.id,
    actor_name: row.actor_name ?? 'System',
    action: row.action ?? 'Activity',
    entity: row.entity ?? 'Record',
    outlet: row.outlet ?? 'All outlets',
    created_at: row.created_at ?? '',
  }));

  return { staff, shiftSummary, leaveRequests, activities, outlets: outlets as any[] };
};

const updateLeaveRequest = async (id: string, status: 'Approved' | 'Rejected') => {
  const { error } = await supabase.from('leave_requests').update({ status }).eq('id', id);
  if (error) throw new Error(error.message);
};

export const HRDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roster' | 'requests' | 'activity'>('roster');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadHRData();
      setStaff(data.staff);
      setShifts(data.shiftSummary);
      setRequests(data.leaveRequests);
      setActivities(data.activities);
      setOutlets(data.outlets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load HR data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [user.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const matchesOutlet = selectedOutlet === 'all' || member.outlet === selectedOutlet;
      const matchesQuery =
        query.trim().length === 0 ||
        `${member.name} ${member.role} ${member.outlet} ${member.department} ${member.employee_code}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesOutlet && matchesQuery;
    });
  }, [staff, selectedOutlet, query]);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesOutlet = selectedOutlet === 'all' || request.outlet === selectedOutlet;
      const matchesQuery =
        query.trim().length === 0 ||
        `${request.employee} ${request.role} ${request.outlet} ${request.reason}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesOutlet && matchesQuery;
    });
  }, [requests, selectedOutlet, query]);

  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const matchesOutlet = selectedOutlet === 'all' || shift.outlet === selectedOutlet;
      const matchesQuery =
        query.trim().length === 0 ||
        `${shift.staff_name} ${shift.outlet} ${shift.shift_type}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesOutlet && matchesQuery;
    });
  }, [shifts, selectedOutlet, query]);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesOutlet = selectedOutlet === 'all' || activity.outlet === selectedOutlet;
      const matchesQuery =
        query.trim().length === 0 ||
        `${activity.actor_name} ${activity.action} ${activity.entity} ${activity.outlet}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesOutlet && matchesQuery;
    });
  }, [activities, selectedOutlet, query]);

  const handleRequestAction = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      await updateLeaveRequest(id, status);
      setRequests((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
      setToast(`Request ${status.toLowerCase()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update request.');
    }
  };

  const metrics = useMemo(() => {
    return [
      { label: 'Team size', value: staff.length, accent: 'bg-sky-50 text-sky-700' },
      { label: 'Pending requests', value: requests.filter((request) => request.status === 'Pending').length, accent: 'bg-amber-50 text-amber-700' },
      { label: 'On-duty staff', value: staff.filter((member) => member.is_active).length, accent: 'bg-emerald-50 text-emerald-700' },
      { label: 'Shift assignments', value: shifts.length, accent: 'bg-violet-50 text-violet-700' },
    ];
  }, [staff, requests, shifts]);

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1d1e20] antialiased">
      <header className="sticky top-0 z-40 border-b border-[#e7e2d8] bg-[#fbf9f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#02150c] font-serif text-xl font-bold text-[#e4c27d]">
              H
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-[#02150c]">Mayflower</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#745b20]">HR Workforce</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchRole && (
              <select
                onChange={(event) => onSwitchRole(event.target.value)}
                defaultValue="hr-roster"
                className="rounded-lg border border-[#e7e2d8] bg-white px-2 py-1.5 text-xs text-[#1d1e20]"
              >
                <option value="hr-roster">HR workforce</option>
                <option value="manager-operations">Floor operations</option>
                <option value="admin-suite">Admin console</option>
              </select>
            )}
            <button onClick={onLogout} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
              <span className="inline-flex items-center gap-1"><LogOut className="h-3.5 w-3.5" />Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6">
        <section className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Workforce operations</div>
              <h1 className="font-serif text-3xl font-bold text-[#02150c]">Staff directory & roster</h1>
            </div>
            <button
              onClick={() => void loadData()}
              className="flex items-center gap-2 rounded-xl border border-[#e7e2d8] bg-[#f5f2ee] px-3 py-2 text-xs font-bold"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="relative block flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by staff, role, outlet, or code"
                className="w-full rounded-xl border border-[#e7e2d8] bg-[#f5f2ee] py-2 pl-9 pr-3 text-xs outline-none"
              />
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-[#e7e2d8] bg-[#f5f2ee] px-3 py-2">
              <Filter className="h-4 w-4 text-[#745b20]" />
              <select
                value={selectedOutlet}
                onChange={(event) => setSelectedOutlet(event.target.value)}
                className="bg-transparent text-xs font-semibold outline-none"
              >
                <option value="all">All outlets</option>
                {outlets.map((outlet: any) => (
                  <option key={outlet.id ?? outlet.name} value={outlet.name}>{outlet.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className={`rounded-xl border border-[#e7e2d8] p-4 ${metric.accent}`}>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em]">{metric.label}</div>
                <div className="mt-2 text-2xl font-bold">{metric.value}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'roster', label: 'Staff roster' },
              { key: 'requests', label: 'Leave requests' },
              { key: 'activity', label: 'Employee activity' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
                  activeTab === tab.key ? 'bg-[#02150c] text-white' : 'bg-[#f5f2ee] text-[#424844]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-5">
            {activeTab === 'roster' && (
              <div className="overflow-x-auto rounded-xl border border-[#e7e2d8]">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-[#f5f2ee] text-[#424844] uppercase">
                    <tr>
                      <th className="px-3 py-3">Employee</th>
                      <th className="px-3 py-3">Role</th>
                      <th className="px-3 py-3">Outlet</th>
                      <th className="px-3 py-3">Shift</th>
                      <th className="px-3 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e7e2d8]">
                    {loading ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading staff roster…</td></tr>
                    ) : filteredStaff.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-500">No staff match your filters.</td></tr>
                    ) : (
                      filteredStaff.map((member) => (
                        <tr key={member.id}>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-[#02150c]">{member.name}</div>
                            <div className="mt-1 text-[10px] text-slate-500">{member.email || member.employee_code}</div>
                          </td>
                          <td className="px-3 py-3">{member.role}</td>
                          <td className="px-3 py-3">{member.outlet}</td>
                          <td className="px-3 py-3">{member.shift}</td>
                          <td className="px-3 py-3">
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${member.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-700'}`}>
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-3">
                {loading ? (
                  <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">Loading requests…</div>
                ) : filteredRequests.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">No leave requests match your filters.</div>
                ) : (
                  filteredRequests.map((request) => (
                    <div key={request.id} className="rounded-2xl border border-[#e7e2d8] bg-[#f9f6f3] p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[#02150c]">{request.employee}</h3>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${request.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : request.status === 'Rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                              {request.status}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-600">
                            <span>{request.role}</span>
                            <span>•</span>
                            <span>{request.outlet}</span>
                            <span>•</span>
                            <span>{request.request_type}</span>
                          </div>
                          <div className="mt-2 text-[11px] text-slate-600">
                            {request.from_date} to {request.to_date}
                          </div>
                          <div className="mt-2 text-[11px] text-slate-600">Reason: {request.reason}</div>
                        </div>

                        {request.status === 'Pending' && (
                          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                            <button
                              onClick={() => void handleRequestAction(request.id, 'Approved')}
                              className="rounded-lg bg-[#02150c] px-3 py-1.5 text-[10px] font-bold uppercase text-white"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => void handleRequestAction(request.id, 'Rejected')}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase text-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-3">
                {loading ? (
                  <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">Loading activity…</div>
                ) : filteredActivities.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">No employee activity to display.</div>
                ) : (
                  filteredActivities.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#02150c]">{item.actor_name}</div>
                          <div className="mt-1 text-[11px] text-slate-600">{item.action} • {item.entity}</div>
                        </div>
                        <div className="text-right text-[10px] text-slate-500">
                          <div>{item.outlet}</div>
                          <div>{new Date(item.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Roster summary</div>
                <h2 className="font-serif text-2xl font-bold text-[#02150c]">This week’s duties</h2>
              </div>
              <Clock3 className="h-5 w-5 text-[#745b20]" />
            </div>
            <div className="mt-4 space-y-3">
              {filteredShifts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9d2c7] p-4 text-center text-xs text-slate-500">No shift assignments found.</div>
              ) : (
                filteredShifts.slice(0, 6).map((shift) => (
                  <div key={shift.id} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-[#02150c]">{shift.staff_name}</div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                        {shift.status}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">{shift.outlet} • {shift.shift_type}</div>
                    <div className="mt-1 text-[11px] text-slate-600">{shift.shift_date} • {shift.start_time} to {shift.end_time}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Compliance</div>
                <h2 className="font-serif text-2xl font-bold text-[#02150c]">Workforce readiness</h2>
              </div>
              <ShieldCheck className="h-5 w-5 text-[#745b20]" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-[#02150c]">Active staff</div>
                  <div className="text-lg font-bold text-[#02150c]">{staff.filter((item) => item.is_active).length}</div>
                </div>
              </div>
              <div className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-[#02150c]">Pending leave requests</div>
                  <div className="text-lg font-bold text-[#02150c]">{requests.filter((item) => item.status === 'Pending').length}</div>
                </div>
              </div>
              <div className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold text-[#02150c]">Outlets covered</div>
                  <div className="text-lg font-bold text-[#02150c]">{new Set(staff.map((item) => item.outlet)).size}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#02150c] px-4 py-3 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
};
