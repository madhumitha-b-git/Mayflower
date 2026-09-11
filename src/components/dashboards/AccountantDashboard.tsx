import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CreditCard,
  DollarSign,
  Filter,
  LogOut,
  RefreshCcw,
  Search,
  TrendingUp,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

type PaymentSummary = {
  method: string;
  total: number;
  count: number;
};

type OutletFinancial = {
  outlet: string;
  revenue: number;
  visits: number;
  reservations: number;
  avgTicket: number;
};

type ReportCard = {
  label: string;
  value: string;
  detail: string;
};

const currency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

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

const loadAccountantData = async () => {
  if (!isSupabaseConfigured) {
    return {
      summary: { grossSales: 0, totalPayments: 0, avgTicket: 0, reservations: 0 },
      paymentSummary: [] as PaymentSummary[],
      outletFinancials: [] as OutletFinancial[],
      reports: [] as ReportCard[],
    };
  }

  const [outlets, paymentsRaw, visitsRaw, reservationsRaw] = await Promise.all([
    safeSelect('outlets', 'id,name,area,is_active', { column: 'name', ascending: true }),
    safeSelect('customer_payments', 'id,amount,payment_method,payment_status,paid_at,outlet_id', { column: 'paid_at', ascending: false }),
    safeSelect('customer_visits', 'id,outlet_id,visit_date,amount_spent,party_size', { column: 'visit_date', ascending: false }),
    safeSelect('reservations', 'id,outlet,reservation_date,guests,status', { column: 'reservation_date', ascending: false }),
  ]);

  const outletMap = new Map((outlets as any[]).map((outlet) => [outlet.id, outlet.name]));
  const paymentSummaryMap = new Map<string, PaymentSummary>();

  for (const payment of paymentsRaw as any[]) {
    const status = payment.payment_status ?? 'Completed';
    if (status === 'Failed' || status === 'Pending') continue;
    const method = payment.payment_method ?? 'Card';
    const amount = Number(payment.amount ?? 0);
    const current = paymentSummaryMap.get(method) ?? { method, total: 0, count: 0 };
    current.total += amount;
    current.count += 1;
    paymentSummaryMap.set(method, current);
  }

  const outletRows: OutletFinancial[] = (outlets as any[]).map((outlet) => {
    const outletName = outlet.name ?? 'All';
    const visits = (visitsRaw as any[]).filter((visit) => outletMap.get(visit.outlet_id) === outletName);
    const reservations = (reservationsRaw as any[]).filter((reservation) => reservation.outlet === outletName);
    const revenue = visits.reduce((sum, visit) => sum + Number(visit.amount_spent ?? 0), 0);
    const avgTicket = visits.length > 0 ? revenue / visits.length : 0;

    return {
      outlet: outletName,
      revenue,
      visits: visits.length,
      reservations: reservations.length,
      avgTicket,
    };
  });

  const totalRevenue = outletRows.reduce((sum, row) => sum + row.revenue, 0);
  const totalPayments = Array.from(paymentSummaryMap.values()).reduce((sum, row) => sum + row.total, 0);
  const totalVisits = outletRows.reduce((sum, row) => sum + row.visits, 0);
  const totalReservations = outletRows.reduce((sum, row) => sum + row.reservations, 0);
  const avgTicket = totalVisits > 0 ? totalRevenue / totalVisits : 0;

  const paymentSummary = Array.from(paymentSummaryMap.values()).sort((a, b) => b.total - a.total);

  const reports: ReportCard[] = [
    {
      label: 'Gross revenue',
      value: currency(totalRevenue),
      detail: 'Across all outlet visits',
    },
    {
      label: 'Payment mix',
      value: paymentSummary.length > 0 ? paymentSummary[0].method : 'No data',
      detail: paymentSummary.length > 0 ? `${paymentSummary[0].method} leads the mix` : 'No payment data available',
    },
    {
      label: 'Avg. ticket',
      value: currency(avgTicket),
      detail: `${totalVisits} completed visits`,
    },
  ];

  return {
    summary: {
      grossSales: totalRevenue,
      totalPayments,
      avgTicket,
      reservations: totalReservations,
    },
    paymentSummary,
    outletFinancials: outletRows,
    reports,
  };
};

export const AccountantDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [outletFinancials, setOutletFinancials] = useState<OutletFinancial[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary[]>([]);
  const [reports, setReports] = useState<ReportCard[]>([]);
  const [summary, setSummary] = useState({ grossSales: 0, totalPayments: 0, avgTicket: 0, reservations: 0 });
  const [outlets, setOutlets] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadAccountantData();
      setOutletFinancials(data.outletFinancials);
      setPaymentSummary(data.paymentSummary);
      setReports(data.reports);
      setSummary(data.summary);
      setOutlets((await safeSelect('outlets', 'id,name,area,is_active', { column: 'name', ascending: true })) as any[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load financial overview.');
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

  const filteredOutlets = useMemo(() => {
    return outletFinancials.filter((row) => {
      const matchesOutlet = selectedOutlet === 'all' || row.outlet === selectedOutlet;
      const matchesSearch =
        query.trim().length === 0 ||
        `${row.outlet}`.toLowerCase().includes(query.toLowerCase());
      return matchesOutlet && matchesSearch;
    });
  }, [outletFinancials, selectedOutlet, query]);

  const filteredPayments = useMemo(() => {
    return paymentSummary.filter((payment) => {
      const matchesSearch =
        query.trim().length === 0 ||
        payment.method.toLowerCase().includes(query.toLowerCase());
      return matchesSearch;
    });
  }, [paymentSummary, query]);

  const metrics = useMemo(
    () => [
      { label: 'Gross sales', value: currency(summary.grossSales), accent: 'bg-emerald-50 text-emerald-700' },
      { label: 'Completed payments', value: currency(summary.totalPayments), accent: 'bg-sky-50 text-sky-700' },
      { label: 'Avg. ticket', value: currency(summary.avgTicket), accent: 'bg-violet-50 text-violet-700' },
      { label: 'Reservations', value: String(summary.reservations), accent: 'bg-amber-50 text-amber-700' },
    ],
    [summary]
  );

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1d1e20] antialiased">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#02150c] px-4 py-3 text-xs text-white shadow-xl">
          {toast}
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-[#e7e2d8] bg-[#fbf9f5]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#02150c] font-serif text-xl font-bold text-[#e4c27d]">
              A
            </div>
            <div>
              <div className="font-serif text-lg font-bold text-[#02150c]">Mayflower</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#745b20]">Financial overview</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchRole && (
              <select
                onChange={(event) => onSwitchRole(event.target.value)}
                defaultValue="accountant-ledger"
                className="rounded-lg border border-[#e7e2d8] bg-white px-2 py-1.5 text-xs text-[#1d1e20]"
              >
                <option value="accountant-ledger">Finance overview</option>
                <option value="manager-operations">Floor operations</option>
                <option value="admin-suite">Admin suite</option>
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
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Petpooja reporting</div>
              <h1 className="font-serif text-3xl font-bold text-[#02150c]">Business performance</h1>
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
              <span>{error}</span>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="relative block flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search outlet, payment method, report..."
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

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          {reports.map((report) => (
            <div key={report.label} className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">{report.label}</div>
                <BarChart3 className="h-4 w-4 text-[#745b20]" />
              </div>
              <div className="mt-3 text-2xl font-bold text-[#02150c]">{report.value}</div>
              <div className="mt-1 text-xs text-slate-600">{report.detail}</div>
            </div>
          ))}
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Outlet revenue</div>
                <h2 className="font-serif text-2xl font-bold text-[#02150c]">Outlet-wise financial snapshot</h2>
              </div>
              <Building2 className="h-5 w-5 text-[#745b20]" />
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#e7e2d8]">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-[#f5f2ee] text-[#424844] uppercase">
                  <tr>
                    <th className="px-3 py-3">Outlet</th>
                    <th className="px-3 py-3">Revenue</th>
                    <th className="px-3 py-3">Visits</th>
                    <th className="px-3 py-3">Reservations</th>
                    <th className="px-3 py-3">Avg. ticket</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7e2d8]">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading financial data…</td></tr>
                  ) : filteredOutlets.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No outlets match your filters.</td></tr>
                  ) : (
                    filteredOutlets.map((row) => (
                      <tr key={row.outlet}>
                        <td className="px-3 py-3 font-semibold text-[#02150c]">{row.outlet}</td>
                        <td className="px-3 py-3">{currency(row.revenue)}</td>
                        <td className="px-3 py-3">{row.visits}</td>
                        <td className="px-3 py-3">{row.reservations}</td>
                        <td className="px-3 py-3">{currency(row.avgTicket)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Payment summary</div>
                <h2 className="font-serif text-2xl font-bold text-[#02150c]">Method mix</h2>
              </div>
              <CreditCard className="h-5 w-5 text-[#745b20]" />
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">Loading payment summary…</div>
              ) : filteredPayments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">No payment data found.</div>
              ) : (
                filteredPayments.map((payment) => (
                  <div key={payment.method} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-[#02150c]">{payment.method}</div>
                        <div className="text-[11px] text-slate-600">{payment.count} completed payments</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-[#02150c]">
                        {currency(payment.total)}
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Basic reports</div>
              <h2 className="font-serif text-2xl font-bold text-[#02150c]">Simple financial view</h2>
            </div>
            <TrendingUp className="h-5 w-5 text-[#745b20]" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#745b20]">Sales summary</div>
              <div className="mt-2 text-2xl font-bold text-[#02150c]">{currency(summary.grossSales)}</div>
              <div className="mt-1 text-xs text-slate-600">Revenue from outlet sales and payment records</div>
            </div>
            <div className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#745b20]">Payment coverage</div>
              <div className="mt-2 text-2xl font-bold text-[#02150c]">{paymentSummary.length ? paymentSummary.length : 0}</div>
              <div className="mt-1 text-xs text-slate-600">Distinct payment methods in the current dataset</div>
            </div>
            <div className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#745b20]">Operational report</div>
              <div className="mt-2 text-2xl font-bold text-[#02150c]">{summary.reservations}</div>
              <div className="mt-1 text-xs text-slate-600">Reservations across the relevant operating windows</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
