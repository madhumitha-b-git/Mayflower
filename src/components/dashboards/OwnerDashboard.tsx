import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

interface OutletRow {
  id: string;
  name: string;
  slug: string;
  badge: string | null;
  area: string | null;
  tables_count: number;
  covers_count: number;
  is_active: boolean;
  petpooja_id: string | null;
}

interface ReservationRow {
  id: string;
  booking_code: string;
  guests: number;
  reservation_date: string;
  time_slot: string;
  status: string;
  outlet: string | null;
  booked_at: string;
}

interface FeedbackRow {
  id: string;
  name: string;
  email: string | null;
  message: string;
  rating: number | null;
  created_at: string;
  outlet: string | null;
}

interface EscalationRow {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  outlet: string | null;
  created_at: string;
}

export const OwnerDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'active' | 'inactive'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('--:--');
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: '' });

  // Supabase data
  const [outlets, setOutlets] = useState<OutletRow[]>([]);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [escalations, setEscalations] = useState<EscalationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // KPI derived
  const [kpi, setKpi] = useState({ totalReservations: 0, pendingReservations: 0, totalCustomers: 0, totalFeedback: 0 });

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 3500);
  };

  const fetchAll = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];

      const [outletsRes, reservationsRes, feedbackRes, escalationsRes, kpiRes] = await Promise.all([
        supabase
          .from('outlets')
          .select('id, name, slug, badge, area, tables_count, covers_count, is_active, petpooja_id')
          .order('created_at', { ascending: true }),

        supabase
          .from('reservations')
          .select('id, booking_code, guests, reservation_date, time_slot, status, outlet, booked_at')
          .gte('reservation_date', today)
          .order('reservation_date', { ascending: true })
          .limit(20),

        supabase
          .from('feedback')
          .select('id, name, email, message, rating, created_at, outlet')
          .order('created_at', { ascending: false })
          .limit(10),

        supabase
          .from('escalations')
          .select('id, title, description, severity, status, outlet, created_at')
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(10),

        supabase
          .from('reservations')
          .select('status', { count: 'exact' })
          .gte('reservation_date', today),
      ]);

      if (outletsRes.error) throw new Error(outletsRes.error.message);
      if (reservationsRes.error) throw new Error(reservationsRes.error.message);
      if (feedbackRes.error) throw new Error(feedbackRes.error.message);

      setOutlets((outletsRes.data ?? []) as OutletRow[]);
      setReservations((reservationsRes.data ?? []) as unknown as ReservationRow[]);
      setFeedback((feedbackRes.data ?? []) as unknown as FeedbackRow[]);
      if (!escalationsRes.error) setEscalations((escalationsRes.data ?? []) as unknown as EscalationRow[]);

      const allRes = reservationsRes.data ?? [];
      const pending = allRes.filter((r: any) => r.status === 'Pending' || r.status === 'pending').length;
      setKpi({
        totalReservations: allRes.length,
        pendingReservations: pending,
        totalCustomers: 0,
        totalFeedback: (feedbackRes.data ?? []).length,
      });

      const now = new Date();
      setLastSyncTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} IST`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleRefresh = () => { fetchAll(); showToast('Data refreshed from Supabase'); };

  const handleResolveEscalation = async (id: string) => {
    const { error } = await supabase.from('escalations').update({ status: 'resolved' }).eq('id', id);
    if (error) { showToast('Failed to resolve escalation'); return; }
    setEscalations(prev => prev.filter(e => e.id !== id));
    showToast('Escalation marked as resolved');
  };

  const filteredOutlets = outlets.filter(o => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'active') return o.is_active;
    return !o.is_active;
  });

  const confirmedReservations = reservations.filter(r => r.status === 'Confirmed' || r.status === 'confirmed');
  const pendingReservations = reservations.filter(r => r.status === 'Pending' || r.status === 'pending');

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary-container text-on-primary px-space-lg py-space-md rounded shadow-lg flex items-center gap-space-sm animate-bounce">
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">check_circle</span>
          <span className="font-body-sm text-body-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(21,42,32,0.04)]">
        <div className="h-20 w-full px-space-md lg:px-margin-desktop flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-secondary flex items-center justify-center font-title-editorial text-xl font-bold shadow-inner">M</div>
              <div className="flex flex-col">
                <span className="font-title-editorial text-title-editorial text-primary tracking-tight font-semibold leading-none">Mayflower</span>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mt-1">Sanctuaries · Chennai</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-caption text-caption text-on-surface-variant">Supabase</span>
              <span className="font-label-caps text-label-caps text-secondary font-bold uppercase">Live</span>
            </div>
            <div className="flex items-center gap-space-sm bg-surface-container px-space-sm py-1 rounded">
              <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-primary-container text-on-primary font-bold uppercase">
                {user.role ? user.role.toUpperCase() : 'OWNER'}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
                {user.name ? user.name[0].toUpperCase() : 'O'}
              </div>
              <button onClick={onLogout} className="text-caption text-error hover:underline font-label-caps uppercase ml-1 cursor-pointer">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full pt-28 bg-background min-h-[calc(100vh-140px)] pb-16">
        <div className="w-full px-space-md lg:px-margin-desktop py-space-xl flex flex-col gap-space-2xl">

          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col gap-space-2xs">
              <div className="flex items-center gap-space-xs text-secondary font-label-caps text-label-caps tracking-widest uppercase">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                <span>Owner Dashboard · Live Data</span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Consolidated Operations Overview</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                Real-time operational overview across all Mayflower outlets. Data sourced directly from Supabase.
              </p>
            </div>
            <div className="flex items-center gap-space-sm self-start md:self-auto">
              <div className="bg-surface-container-low px-space-md py-space-xs rounded flex flex-col items-end">
                <span className="font-caption text-caption text-on-surface-variant">Last Synced</span>
                <span className="font-label-numeric text-label-numeric text-primary font-bold">{lastSyncTime}</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-space-xs bg-primary-container text-on-primary px-space-md py-2.5 rounded font-label-caps text-label-caps tracking-wider uppercase shadow-sm hover:bg-primary transition-all cursor-pointer disabled:opacity-60"
              >
                <span className={`material-symbols-outlined text-[16px] transition-transform duration-700 ${isRefreshing ? 'animate-spin' : ''}`}>sync</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-error-container text-error px-space-md py-space-sm rounded font-body-sm text-body-sm">
              {error} — showing last available data.
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
            <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Total Outlets</span>
                  <span className="font-headline-md text-headline-md text-primary font-semibold mt-1">
                    {loading ? '—' : outlets.length}
                  </span>
                </div>
                <span className="p-2 bg-surface-container text-secondary rounded">
                  <span className="material-symbols-outlined text-[20px]">store</span>
                </span>
              </div>
              <span className="font-caption text-caption text-on-surface-variant mt-2">
                {loading ? '—' : `${outlets.filter(o => o.is_active).length} active · ${outlets.filter(o => !o.is_active).length} inactive`}
              </span>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Reservations Today+</span>
                  <span className="font-headline-md text-headline-md text-primary font-semibold mt-1">
                    {loading ? '—' : kpi.totalReservations}
                  </span>
                </div>
                <span className="p-2 bg-surface-container text-primary rounded">
                  <span className="material-symbols-outlined text-[20px]">event_seat</span>
                </span>
              </div>
              <span className="font-caption text-caption text-on-surface-variant mt-2">
                {loading ? '—' : `${kpi.pendingReservations} pending confirmation`}
              </span>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Active Escalations</span>
                  <span className="font-headline-md text-headline-md text-primary font-semibold mt-1">
                    {loading ? '—' : escalations.length}
                  </span>
                </div>
                <span className="p-2 bg-surface-container text-secondary rounded">
                  <span className="material-symbols-outlined text-[20px]">warning</span>
                </span>
              </div>
              <span className="font-caption text-caption text-on-surface-variant mt-2">
                {escalations.length === 0 ? 'No open issues' : 'Requires attention'}
              </span>
            </div>

            <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Recent Feedback</span>
                  <span className="font-headline-md text-headline-md text-primary font-semibold mt-1">
                    {loading ? '—' : kpi.totalFeedback}
                  </span>
                </div>
                <span className="p-2 bg-surface-container text-primary rounded">
                  <span className="material-symbols-outlined text-[20px]">rate_review</span>
                </span>
              </div>
              <span className="font-caption text-caption text-on-surface-variant mt-2">Last 10 submissions</span>
            </div>
          </div>

          {/* Outlet Matrix */}
          <div className="flex flex-col gap-space-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-primary">Multi-Outlet Overview</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">All outlets from Supabase</p>
              </div>
              <div className="flex items-center gap-space-xs self-start">
                {(['all', 'active', 'inactive'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-space-sm py-1 rounded font-label-caps text-label-caps uppercase transition-colors cursor-pointer ${
                      activeCategory === cat ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {cat === 'all' ? `All (${outlets.length})` : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded shadow-sm overflow-x-auto border border-surface-container">
              {loading ? (
                <div className="p-space-xl text-center font-caption text-on-surface-variant">Loading outlets...</div>
              ) : filteredOutlets.length === 0 ? (
                <div className="p-space-xl text-center font-caption text-on-surface-variant">No outlets found.</div>
              ) : (
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                    <tr>
                      <th className="py-space-md px-space-lg">Outlet</th>
                      <th className="py-space-md px-space-md">Area</th>
                      <th className="py-space-md px-space-md">Tables / Covers</th>
                      <th className="py-space-md px-space-md">Petpooja ID</th>
                      <th className="py-space-md px-space-md">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container">
                    {filteredOutlets.map(outlet => (
                      <tr key={outlet.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-space-md px-space-lg">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center font-title-editorial text-caption font-bold">
                              {outlet.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-title-editorial text-title-editorial text-primary font-semibold">{outlet.name}</span>
                              {outlet.badge && <span className="font-caption text-caption text-on-surface-variant">{outlet.badge}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md font-caption text-on-surface-variant">{outlet.area ?? '—'}</td>
                        <td className="py-space-md px-space-md">
                          <span className="font-label-numeric text-label-numeric font-bold text-primary">{outlet.tables_count}</span>
                          <span className="text-on-surface-variant"> tables · </span>
                          <span className="font-label-numeric text-label-numeric font-bold text-primary">{outlet.covers_count}</span>
                          <span className="text-on-surface-variant"> covers</span>
                        </td>
                        <td className="py-space-md px-space-md font-mono text-caption text-on-surface-variant">{outlet.petpooja_id ?? '—'}</td>
                        <td className="py-space-md px-space-md">
                          {outlet.is_active
                            ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-caps text-label-caps font-bold"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>Active</span>
                            : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps font-bold"><span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>Inactive</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Reservations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
            {/* Confirmed */}
            <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Upcoming</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Confirmed Reservations</h3>
                </div>
                <span className="font-headline-md text-headline-md font-bold text-primary">{confirmedReservations.length}</span>
              </div>
              {loading ? (
                <p className="font-caption text-on-surface-variant">Loading...</p>
              ) : confirmedReservations.length === 0 ? (
                <p className="font-caption text-on-surface-variant">No confirmed reservations.</p>
              ) : (
                <div className="flex flex-col gap-space-xs overflow-y-auto max-h-72">
                  {confirmedReservations.map(r => (
                    <div key={r.id} className="p-space-sm bg-surface-container-low rounded flex items-center justify-between gap-space-sm">
                      <div className="flex flex-col">
                        <span className="font-body-sm text-body-sm text-primary font-bold">{r.booking_code}</span>
                        <span className="font-caption text-caption text-on-surface-variant">{r.outlet ?? '—'} · {r.reservation_date} · {r.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <span className="font-caption text-caption text-on-surface-variant">{r.guests} guests</span>
                        <span className="font-label-caps text-[10px] px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed-variant font-bold uppercase">{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending */}
            <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col gap-space-md border border-surface-container">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Awaiting Action</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Pending Reservations</h3>
                </div>
                <span className="font-headline-md text-headline-md font-bold text-error">{pendingReservations.length}</span>
              </div>
              {loading ? (
                <p className="font-caption text-on-surface-variant">Loading...</p>
              ) : pendingReservations.length === 0 ? (
                <p className="font-caption text-on-surface-variant">No pending reservations.</p>
              ) : (
                <div className="flex flex-col gap-space-xs overflow-y-auto max-h-72">
                  {pendingReservations.map(r => (
                    <div key={r.id} className="p-space-sm bg-surface-container-low rounded flex items-center justify-between gap-space-sm">
                      <div className="flex flex-col">
                        <span className="font-body-sm text-body-sm text-primary font-bold">{r.booking_code}</span>
                        <span className="font-caption text-caption text-on-surface-variant">{r.outlet ?? '—'} · {r.reservation_date} · {r.time_slot}</span>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <span className="font-caption text-caption text-on-surface-variant">{r.guests} guests</span>
                        <span className="font-label-caps text-[10px] px-2 py-0.5 rounded bg-error-container text-error font-bold uppercase">{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Escalations */}
          <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col gap-space-lg border border-surface-container">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Active Issues</span>
                <h3 className="font-headline-sm text-headline-sm text-primary">Open Escalations</h3>
              </div>
              <span className="font-caption text-caption text-secondary font-medium">Response SLA: ≤ 10 mins</span>
            </div>
            {loading ? (
              <p className="font-caption text-on-surface-variant">Loading...</p>
            ) : escalations.length === 0 ? (
              <div className="p-space-md bg-surface-container-low rounded text-center font-caption text-on-surface-variant">
                ✓ No open escalations. Operational status nominal.
              </div>
            ) : (
              <div className="flex flex-col gap-space-xs">
                {escalations.map(esc => (
                  <div key={esc.id} className="p-space-md bg-surface-container-low rounded flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                    <div className="flex items-start gap-space-sm">
                      <span className={`p-2 rounded-full mt-0.5 ${esc.severity === 'high' ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant'}`}>
                        <span className="material-symbols-outlined text-[18px]">{esc.severity === 'high' ? 'priority_high' : 'info'}</span>
                      </span>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-body-sm text-body-sm text-primary font-bold">{esc.title}</span>
                          <span className="font-label-caps text-caption text-secondary uppercase font-semibold">{esc.outlet ?? '—'}</span>
                        </div>
                        <span className="font-caption text-caption text-on-surface-variant">{esc.description}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResolveEscalation(esc.id)}
                      className={`px-space-sm py-1.5 rounded font-label-caps text-label-caps uppercase transition-colors cursor-pointer self-end md:self-auto ${
                        esc.severity === 'high'
                          ? 'bg-primary-container text-on-primary hover:bg-primary'
                          : 'bg-surface-container text-primary hover:bg-surface-container-high'
                      }`}
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Feedback */}
          <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col gap-space-lg border border-surface-container">
            <div>
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Customer Voice</span>
              <h3 className="font-headline-sm text-headline-sm text-primary">Recent Feedback</h3>
            </div>
            {loading ? (
              <p className="font-caption text-on-surface-variant">Loading...</p>
            ) : feedback.length === 0 ? (
              <p className="font-caption text-on-surface-variant">No feedback submissions yet.</p>
            ) : (
              <div className="flex flex-col gap-space-xs">
                {feedback.map(fb => (
                  <div key={fb.id} className="p-space-md bg-surface-container-low rounded flex flex-col gap-space-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-space-sm">
                        <span className="font-body-sm text-body-sm text-primary font-bold">{fb.name}</span>
                        {fb.outlet && (
                          <span className="font-caption text-caption text-on-surface-variant">· {fb.outlet}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {fb.rating !== null && (
                          <>
                            <span className="material-symbols-outlined text-[14px] text-secondary">star</span>
                            <span className="font-label-numeric text-caption font-bold text-primary">{fb.rating}/5</span>
                          </>
                        )}
                        <span className="font-caption text-[10px] text-on-surface-variant ml-2">
                          {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant line-clamp-2">{fb.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest py-space-2xl border-t border-surface-container">
        <div className="w-full px-space-md lg:px-margin-desktop">
          <div className="flex flex-col md:flex-row items-center justify-between gap-space-sm text-caption font-caption text-on-surface-variant">
            <div className="flex items-center gap-space-md">
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-secondary"></span>
                Supabase · Live Data
              </span>
              <span>Mayflower Sanctuaries · Chennai</span>
            </div>
            <div>© {new Date().getFullYear()} Mayflower Hospitality Group India LLP.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
