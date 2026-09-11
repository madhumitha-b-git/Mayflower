import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ClipboardList,
  Filter,
  MapPinned,
  RefreshCcw,
  Search,
  Table2,
  TriangleAlert,
  Users,
  XCircle,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

type ReservationStatus = 'Pending' | 'Confirmed' | 'Seated' | 'Completed' | 'Cancelled' | 'No-Show';

type ReservationItem = {
  id: string;
  booking_code: string;
  guest_name: string;
  guests: number;
  outlet: string;
  reservation_date: string;
  time_slot: string;
  status: ReservationStatus | string;
  seating_area: string;
  table_name: string;
  notes: string;
  dietary_prefs: string;
  special_occasion: string;
  customer_id?: string;
  table_id?: string;
  created_at?: string;
};

type TableItem = {
  id: string;
  name: string;
  status: string;
  seats: number;
  outlet: string;
  area: string;
  is_active: boolean;
  notes: string;
};

type TaskItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  outlet: string;
  due_date: string;
  description: string;
};

type ChecklistItem = {
  id: string;
  title: string;
  role: string;
  outlet: string;
  frequency: string;
  is_active: boolean;
};

type FeedbackItem = {
  id: string;
  customer_name: string;
  outlet: string;
  category: string;
  rating: number;
  message: string;
  status: string;
};

const normalizeStatus = (status?: string | null) => {
  const value = (status ?? '').toString().trim();
  const normalized = value.toLowerCase();

  if (['pending', 'awaiting', 'queued'].includes(normalized)) return 'Pending';
  if (['confirmed', 'approved'].includes(normalized)) return 'Confirmed';
  if (['seated', 'active', 'checked_in'].includes(normalized)) return 'Seated';
  if (['completed', 'finished', 'done'].includes(normalized)) return 'Completed';
  if (['cancelled', 'canceled', 'no-show', 'no_show', 'noshow'].includes(normalized)) return 'No-Show';
  if (['rejected'].includes(normalized)) return 'Cancelled';
  return value || 'Pending';
};

const statusTone = (status?: string) => {
  switch ((status ?? '').toString().toLowerCase()) {
    case 'pending':
    case 'awaiting':
      return 'bg-amber-50 text-amber-800 border border-amber-200';
    case 'confirmed':
    case 'approved':
      return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    case 'seated':
    case 'active':
      return 'bg-sky-50 text-sky-800 border border-sky-200';
    case 'completed':
    case 'finished':
      return 'bg-violet-50 text-violet-800 border border-violet-200';
    case 'cancelled':
    case 'no-show':
    case 'rejected':
      return 'bg-rose-50 text-rose-800 border border-rose-200';
    default:
      return 'bg-stone-100 text-stone-700 border border-stone-200';
  }
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

const emptyReservation = (row: any): ReservationItem => ({
  id: row.id ?? crypto.randomUUID(),
  booking_code: row.booking_code ?? row.bookingCode ?? 'MF-N/A',
  guest_name: row.customer_name ?? row.guest_name ?? row.name ?? row.customer?.name ?? 'Walk-in Guest',
  guests: Number(row.guests ?? row.guest_count ?? 2),
  outlet: row.outlet ?? row.outlet_name ?? row?.outlets?.name ?? 'Unassigned',
  reservation_date: row.reservation_date ?? row.date ?? new Date().toISOString().slice(0, 10),
  time_slot: row.time_slot ?? row.timeSlot ?? 'Flexible',
  status: normalizeStatus(row.status),
  seating_area: row.seating_area ?? row.area ?? 'Main Dining',
  table_name: row.table_name ?? row.table?.name ?? row.Table?.name ?? row.table_number ?? 'Unassigned',
  notes: row.notes ?? row.special_notes ?? row.special_occasion ?? '',
  dietary_prefs: row.dietary_prefs ?? row.dietary_preferences ?? '',
  special_occasion: row.special_occasion ?? '',
  customer_id: row.customer_id ?? row.customer?.id,
  table_id: row.table_id ?? row.table?.id,
  created_at: row.created_at ?? row.booked_at,
});

const loadManagerData = async (user: UserProfile) => {
  if (!isSupabaseConfigured) {
    return { reservations: [], tables: [], tasks: [], checklists: [], feedback: [], outlets: [] };
  }

  const outletFilter = (user as any)?.outlet ?? '';

  const [outlets, reservationsRaw, tablesRaw, tasksRaw, checklistsRaw, feedbackRaw] = await Promise.all([
    safeSelect('outlets', 'id,name,area,status,is_active,opening_time,closing_time', { column: 'name', ascending: true }),
    safeSelect(
      'reservations',
      'id,booking_code,customer_id,customer:user_profiles!reservations_customer_id_fkey(id,name),outlet,outlet_id,reservation_date,date,time_slot,guests,status,seating_area,notes,dietary_prefs,special_occasion,table_id,table:tables!reservations_table_id_fkey(id,name),booked_at,updated_at',
      { column: 'reservation_date', ascending: false }
    ),
    safeSelect('tables', 'id,name,status,seats,outlet,outlet_id,area,is_active,notes', { column: 'name', ascending: true }),
    safeSelect('tasks', 'id,title,status,priority,outlet,due_date,description,assigned_role', { column: 'due_date', ascending: true }),
    safeSelect('checklists', 'id,title,role,outlet,frequency,is_active', { column: 'created_at', ascending: false }),
    safeSelect('feedback', 'id,customer_id,customer:user_profiles!feedback_customer_id_fkey(id,name),outlet,rating,category,message,status,created_at', { column: 'created_at', ascending: false }),
  ]);

  const reservations = (reservationsRaw as any[]).map((row) => {
    const item = emptyReservation(row);
    if (!item.outlet && row.outlet_id) {
      const matchingOutlet = outlets.find((outlet: any) => String(outlet.id) === String(row.outlet_id));
      item.outlet = matchingOutlet?.name ?? 'Unassigned';
    }
    return item;
  });

  const tables = (tablesRaw as any[]).map((row) => ({
    id: row.id,
    name: row.name ?? row.table_number ?? 'Table',
    status: row.status ?? 'Available',
    seats: Number(row.seats ?? row.capacity ?? 2),
    outlet: row.outlet ?? (row.outlet_id ? outlets.find((outlet: any) => String(outlet.id) === String(row.outlet_id))?.name : '') ?? 'Unassigned',
    area: row.area ?? row.seating_area ?? 'Main Dining',
    is_active: row.is_active ?? true,
    notes: row.notes ?? '',
  }));

  const tasks = (tasksRaw as any[]).map((row) => ({
    id: row.id,
    title: row.title ?? 'Operational task',
    status: row.status ?? 'Open',
    priority: row.priority ?? 'Normal',
    outlet: row.outlet ?? 'Unassigned',
    due_date: row.due_date ?? '',
    description: row.description ?? '',
  }));

  const checklists = (checklistsRaw as any[]).map((row) => ({
    id: row.id,
    title: row.title ?? 'Checklist',
    role: row.role ?? 'Manager',
    outlet: row.outlet ?? 'Unassigned',
    frequency: row.frequency ?? 'Daily',
    is_active: row.is_active ?? true,
  }));

  const feedback = (feedbackRaw as any[]).map((row) => ({
    id: row.id,
    customer_name: row.customer?.name ?? row.customer_name ?? 'Guest',
    outlet: row.outlet ?? 'Unassigned',
    category: row.category ?? 'General',
    rating: Number(row.rating ?? 5),
    message: row.message ?? row.comment ?? 'No issue description provided.',
    status: row.status ?? 'New',
  }));

  const filteredReservations = outletFilter
    ? reservations.filter((row) => row.outlet === outletFilter || row.outlet === 'Unassigned')
    : reservations;

  return {
    reservations: filteredReservations,
    tables,
    tasks,
    checklists,
    feedback,
    outlets: outlets as any[],
  };
};

const updateReservationStatus = async (id: string, updates: Record<string, any>) => {
  const { error } = await supabase.from('reservations').update(updates).eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
};

export const ManagerDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [query, setQuery] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled'>('all');
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [checklists, setChecklists] = useState<ChecklistItem[]>([]);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadManagerData(user);
      setReservations(data.reservations);
      setTables(data.tables);
      setTasks(data.tasks);
      setChecklists(data.checklists);
      setFeedback(data.feedback);
      setOutlets(data.outlets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load operational data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [user.id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((reservation) => {
      const matchesOutlet = selectedOutlet === 'all' || reservation.outlet === selectedOutlet;
      const matchesTab = activeTab === 'all' || normalizeStatus(reservation.status).toLowerCase() === activeTab;
      const matchesQuery =
        query.trim().length === 0 ||
        `${reservation.booking_code} ${reservation.guest_name} ${reservation.outlet} ${reservation.time_slot} ${reservation.table_name}`
          .toLowerCase()
          .includes(query.toLowerCase());

      return matchesOutlet && matchesTab && matchesQuery;
    });
  }, [reservations, selectedOutlet, activeTab, query]);

  const filteredTables = useMemo(() => {
    return tables.filter((table) => selectedOutlet === 'all' || table.outlet === selectedOutlet);
  }, [tables, selectedOutlet]);

  const todayDate = new Date().toISOString().slice(0, 10);

  const metrics = useMemo(() => {
    return [
      {
        label: 'Today’s reservations',
        value: reservations.filter((row) => row.reservation_date === todayDate).length,
        accent: 'bg-sky-50 text-sky-700',
      },
      {
        label: 'Pending approvals',
        value: reservations.filter((row) => normalizeStatus(row.status) === 'Pending').length,
        accent: 'bg-amber-50 text-amber-700',
      },
      {
        label: 'Tables in service',
        value: filteredTables.filter((table) => ['Reserved', 'Occupied', 'Cleaning'].includes(table.status)).length,
        accent: 'bg-emerald-50 text-emerald-700',
      },
      {
        label: 'Open tasks',
        value: tasks.filter((task) => !['Completed', 'Done'].includes(task.status)).length,
        accent: 'bg-violet-50 text-violet-700',
      },
    ];
  }, [reservations, filteredTables, tasks, todayDate]);

  const handleStatusChange = async (id: string, status: ReservationStatus | 'Cancelled') => {
    try {
      const nextStatus = normalizeStatus(status);
      await updateReservationStatus(id, { status: nextStatus });
      setReservations((current) => current.map((row) => (row.id === id ? { ...row, status: nextStatus } : row)));
      setToast(nextStatus === 'Cancelled' ? 'Reservation cancelled and table released.' : `Reservation marked as ${nextStatus}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update reservation status.');
    }
  };

  const handleTableStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('tables').update({ status }).eq('id', id);
      if (error) throw new Error(error.message);
      setTables((current) => current.map((row) => (row.id === id ? { ...row, status } : row)));
      setToast(`Table marked as ${status}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update table status.');
    }
  };

  const handleWalkIn = async (event: React.FormEvent) => {
    event.preventDefault();

    const form = new FormData(event.target as HTMLFormElement);
    const name = String(form.get('guestName') || 'Walk-in Guest').trim();
    const guests = Number(form.get('guests') || 2);
    const venue = String(form.get('outlet') || 'Poes Garden').trim();
    const notes = String(form.get('notes') || '').trim();
    const area = String(form.get('area') || 'Main Dining').trim();

    try {
      const bookingCode = `MF-${Math.floor(Math.random() * 9000 + 1000)}`;
      const payload = {
        booking_code: bookingCode,
        customer_id: user.id,
        outlet: venue,
        reservation_date: new Date().toISOString().slice(0, 10),
        time_slot: 'Immediate',
        guests,
        status: 'Confirmed',
        seating_area: area,
        notes,
        dietary_prefs: '',
        special_occasion: '',
        booked_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('reservations').insert([payload]);
      if (error) throw new Error(error.message);

      setReservations((current) => [{
        id: bookingCode,
        booking_code: bookingCode,
        guest_name: name,
        guests,
        outlet: venue,
        reservation_date: new Date().toISOString().slice(0, 10),
        time_slot: 'Immediate',
        status: 'Confirmed',
        seating_area: area,
        table_name: 'To be assigned',
        notes,
        dietary_prefs: '',
        special_occasion: '',
        customer_id: user.id,
        created_at: new Date().toISOString(),
      }, ...current]);
      setIsWalkInOpen(false);
      setToast(`Walk-in guest ${name} added to the reservation flow.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create walk-in reservation.');
    }
  };

  const tabs: Array<{ key: 'all' | 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled'; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'seated', label: 'Seated' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'No-show' },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1d1e20] antialiased">
      <header className="sticky top-0 z-40 border-b border-[#e7e2d8] bg-[#fbf9f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#02150c] font-serif text-xl font-bold text-[#e4c27d]">
              M
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-[#02150c]">Mayflower</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#745b20]">Manager Operations</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchRole && (
              <select
                onChange={(event) => onSwitchRole(event.target.value)}
                defaultValue="manager-operations"
                className="rounded-lg border border-[#e7e2d8] bg-white px-2 py-1.5 text-xs text-[#1d1e20]"
              >
                <option value="manager-operations">Floor operations</option>
                <option value="admin-suite">Admin console</option>
                <option value="owner-management">Owner dashboard</option>
              </select>
            )}
            <button onClick={onLogout} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-6">
        <section className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Operational overview</div>
              <h1 className="font-serif text-3xl font-bold text-[#02150c]">Outlet service command</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void loadData()}
                className="flex items-center gap-2 rounded-xl border border-[#e7e2d8] bg-[#f5f2ee] px-3 py-2 text-xs font-bold"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
              <button
                onClick={() => setIsWalkInOpen(true)}
                className="rounded-xl bg-[#02150c] px-3 py-2 text-xs font-bold text-white"
              >
                + Walk-in guest
              </button>
            </div>
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
                placeholder="Search booking, guest, outlet, table, or notes"
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
                {outlets.map((outlet) => (
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

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <section className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#e7e2d8] pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Reservation management</div>
                <h2 className="font-serif text-2xl font-bold text-[#02150c]">Service queue</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
                      activeTab === tab.key ? 'bg-[#02150c] text-white' : 'bg-[#f5f2ee] text-[#424844]'
                    }`}
                  >
                    {tab.label} ({tab.key === 'all' ? reservations.length : reservations.filter((row) => normalizeStatus(row.status).toLowerCase() === tab.key).length})
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {loading ? (
                <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">
                  Loading outlet operations…
                </div>
              ) : filteredReservations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">
                  No reservations match this outlet and filter.
                </div>
              ) : (
                filteredReservations.map((reservation) => (
                  <div key={reservation.id} className="rounded-2xl border border-[#e7e2d8] bg-[#f9f6f3] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ece3d0] font-bold text-[#02150c]">
                          {reservation.guest_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-[#02150c]">{reservation.guest_name}</h3>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusTone(reservation.status)}`}>
                              {reservation.status}
                            </span>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-600">
                            <span>{reservation.booking_code}</span>
                            <span>•</span>
                            <span>{reservation.guests} guests</span>
                            <span>•</span>
                            <span>{reservation.outlet}</span>
                            <span>•</span>
                            <span>{reservation.reservation_date}</span>
                          </div>
                          <div className="mt-1 text-[11px] text-slate-600">
                            {reservation.time_slot} • {reservation.seating_area} • Table {reservation.table_name}
                          </div>
                          {reservation.notes && <div className="mt-2 text-[11px] text-slate-600">Note: {reservation.notes}</div>}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        {normalizeStatus(reservation.status) === 'Pending' && (
                          <>
                            <button onClick={() => handleStatusChange(reservation.id, 'Confirmed')} className="rounded-lg bg-[#02150c] px-3 py-1.5 text-[10px] font-bold uppercase text-white">
                              Approve
                            </button>
                            <button onClick={() => handleStatusChange(reservation.id, 'Cancelled')} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase text-red-700">
                              Reject
                            </button>
                          </>
                        )}

                        {normalizeStatus(reservation.status) === 'Confirmed' && (
                          <button onClick={() => handleStatusChange(reservation.id, 'Seated')} className="rounded-lg bg-[#e6f5ef] px-3 py-1.5 text-[10px] font-bold uppercase text-[#0c5d42]">
                            Seat guest
                          </button>
                        )}

                        {normalizeStatus(reservation.status) === 'Seated' && (
                          <button onClick={() => handleStatusChange(reservation.id, 'Completed')} className="rounded-lg bg-[#efe7ff] px-3 py-1.5 text-[10px] font-bold uppercase text-[#4c2d9d]">
                            Complete service
                          </button>
                        )}

                        <button onClick={() => handleStatusChange(reservation.id, 'Cancelled')} className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-[10px] font-bold uppercase text-[#424844]">
                          Release table
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Table allocation</div>
                  <h2 className="font-serif text-2xl font-bold text-[#02150c]">Floor status</h2>
                </div>
                <MapPinned className="h-5 w-5 text-[#745b20]" />
              </div>

              <div className="mt-4 space-y-3">
                {filteredTables.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d9d2c7] p-4 text-center text-xs text-slate-500">
                    No table data available.
                  </div>
                ) : (
                  filteredTables.slice(0, 6).map((table) => (
                    <div key={table.id} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#02150c]">{table.name}</div>
                          <div className="text-[11px] text-slate-600">{table.area} • {table.seats} seats</div>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusTone(table.status)}`}>
                          {table.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['Available', 'Reserved', 'Occupied', 'Cleaning', 'Blocked'].map((status) => (
                          <button key={status} onClick={() => handleTableStatus(table.id, status)} className="rounded-full bg-white px-2 py-1 text-[10px] font-bold uppercase text-slate-600 border border-[#e7e2d8]">
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">SOP & tasks</div>
                  <h2 className="font-serif text-2xl font-bold text-[#02150c]">Operational compliance</h2>
                </div>
                <ClipboardList className="h-5 w-5 text-[#745b20]" />
              </div>

              <div className="mt-4 space-y-3">
                {checklists.slice(0, 4).map((checklist) => (
                  <div key={checklist.id} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-[#02150c]">{checklist.title}</div>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                        {checklist.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">{checklist.outlet} • {checklist.frequency} • {checklist.role}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Escalations</div>
                  <h2 className="font-serif text-2xl font-bold text-[#02150c]">Guest issues</h2>
                </div>
                <TriangleAlert className="h-5 w-5 text-[#745b20]" />
              </div>

              <div className="mt-4 space-y-3">
                {feedback.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d9d2c7] p-4 text-center text-xs text-slate-500">
                    No live guest feedback.
                  </div>
                ) : (
                  feedback.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-[#02150c]">{item.customer_name}</div>
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-600">{item.category} • {item.outlet} • {item.rating}/5</div>
                      <div className="mt-2 text-[11px] text-slate-600">{item.message}</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Operations tasks</div>
              <h2 className="font-serif text-2xl font-bold text-[#02150c]">Assigned task list</h2>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Users className="h-4 w-4" />
              {tasks.length} open items
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d9d2c7] p-6 text-center text-xs text-slate-500 md:col-span-2 xl:col-span-3">
                No operational tasks currently assigned.
              </div>
            ) : (
              tasks.slice(0, 6).map((task) => (
                <div key={task.id} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-[#02150c]">{task.title}</div>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusTone(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-600">{task.outlet} • {task.priority}</div>
                  <div className="mt-2 text-[11px] text-slate-600">Due: {task.due_date || 'No deadline'}</div>
                  {task.description && <div className="mt-2 text-[11px] text-slate-600">{task.description}</div>}
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {isWalkInOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Walk-in management</div>
                <h2 className="font-serif text-2xl font-bold text-[#02150c]">Add guest booking</h2>
              </div>
              <button onClick={() => setIsWalkInOpen(false)} className="rounded-full bg-[#f5f2ee] p-2">
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleWalkIn}>
              <div className="grid gap-3 md:grid-cols-2">
                <input name="guestName" placeholder="Guest name" required className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-2.5 text-xs outline-none" />
                <input name="guests" type="number" min={1} defaultValue={2} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-2.5 text-xs outline-none" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <select name="outlet" defaultValue={outlets[0]?.name ?? 'Poes Garden'} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-2.5 text-xs outline-none">
                  {outlets.map((outlet) => (
                    <option key={outlet.id ?? outlet.name} value={outlet.name}>{outlet.name}</option>
                  ))}
                </select>
                <select name="area" defaultValue="Main Dining" className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-2.5 text-xs outline-none">
                  <option>Main Dining</option>
                  <option>Garden</option>
                  <option>Window</option>
                  <option>Private Space</option>
                </select>
              </div>

              <textarea name="notes" rows={3} placeholder="Guest notes or preference" className="w-full rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-2.5 text-xs outline-none" />

              <button type="submit" className="w-full rounded-xl bg-[#02150c] py-3 text-xs font-bold uppercase tracking-[0.2em] text-white">
                Create reservation
              </button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-[#02150c] px-4 py-3 text-xs font-bold text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
};
