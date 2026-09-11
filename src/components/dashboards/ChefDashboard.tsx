import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Filter,
  Flame,
  ImageIcon,
  RefreshCcw,
  Search,
  ShieldCheck,
  TriangleAlert,
  Wrench,
  UtensilsCrossed,
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

type KitchenTask = {
  id: string;
  title: string;
  status: string;
  priority: string;
  outlet: string;
  due_date: string;
  description: string;
  photo_url?: string;
  assigned_role?: string;
  escalated: boolean;
};

type KitchenChecklist = {
  id: string;
  title: string;
  role: string;
  outlet: string;
  frequency: string;
  is_active: boolean;
  items: any[];
};

type KitchenIssue = {
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

  if (['open', 'pending'].includes(normalized)) return 'Open';
  if (['in progress', 'in_progress', 'working'].includes(normalized)) return 'In Progress';
  if (['done', 'completed', 'finished'].includes(normalized)) return 'Done';
  if (['escalated', 'urgent'].includes(normalized)) return 'Escalated';
  return value || 'Open';
};

const statusTone = (status?: string) => {
  switch ((status ?? '').toString().toLowerCase()) {
    case 'open':
    case 'pending':
      return 'bg-amber-50 text-amber-800 border border-amber-200';
    case 'in progress':
    case 'in_progress':
      return 'bg-sky-50 text-sky-800 border border-sky-200';
    case 'done':
    case 'completed':
      return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    case 'escalated':
    case 'urgent':
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
    if (orderBy) query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });

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

const loadChefData = async () => {
  if (!isSupabaseConfigured) {
    return { tasks: [], checklists: [], issues: [], outlets: [] };
  }

  const [outlets, tasksRaw, checklistsRaw, feedbackRaw] = await Promise.all([
    safeSelect('outlets', 'id,name,area,status,is_active', { column: 'name', ascending: true }),
    safeSelect(
      'tasks',
      'id,title,status,priority,outlet,due_date,description,photo_url,assigned_role',
      { column: 'due_date', ascending: true }
    ),
    safeSelect(
      'checklists',
      'id,title,role,outlet,frequency,is_active,items',
      { column: 'created_at', ascending: false }
    ),
    safeSelect(
      'feedback',
      'id,customer_id,customer:user_profiles!feedback_customer_id_fkey(id,name),outlet,rating,category,message,status,created_at',
      { column: 'created_at', ascending: false }
    ),
  ]);

  const tasks: KitchenTask[] = (tasksRaw as any[]).map((row) => ({
    id: row.id,
    title: row.title ?? 'Kitchen task',
    status: normalizeStatus(row.status),
    priority: row.priority ?? 'Normal',
    outlet: row.outlet ?? 'Unassigned',
    due_date: row.due_date ?? '',
    description: row.description ?? '',
    photo_url: row.photo_url ?? '',
    assigned_role: row.assigned_role ?? 'Chef',
    escalated: normalizeStatus(row.status) === 'Escalated',
  }));

  const checklists: KitchenChecklist[] = (checklistsRaw as any[]).map((row) => ({
    id: row.id,
    title: row.title ?? 'Kitchen checklist',
    role: row.role ?? 'Chef',
    outlet: row.outlet ?? 'Unassigned',
    frequency: row.frequency ?? 'Daily',
    is_active: row.is_active ?? true,
    items: Array.isArray(row.items) ? row.items : [],
  }));

  const issues: KitchenIssue[] = (feedbackRaw as any[]).map((row) => ({
    id: row.id,
    customer_name: row.customer?.name ?? 'Guest',
    outlet: row.outlet ?? 'Unassigned',
    category: row.category ?? 'General',
    rating: Number(row.rating ?? 5),
    message: row.message ?? row.comment ?? 'No issue described.',
    status: row.status ?? 'New',
  }));

  return { tasks, checklists, issues, outlets: outlets as any[] };
};

export const ChefDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [query, setQuery] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [tasks, setTasks] = useState<KitchenTask[]>([]);
  const [checklists, setChecklists] = useState<KitchenChecklist[]>([]);
  const [issues, setIssues] = useState<KitchenIssue[]>([]);
  const [outlets, setOutlets] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadChefData();
      setTasks(data.tasks);
      setChecklists(data.checklists);
      setIssues(data.issues);
      setOutlets(data.outlets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load kitchen operational data.');
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

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesOutlet = selectedOutlet === 'all' || task.outlet === selectedOutlet;
      const matchesQuery =
        query.trim().length === 0 ||
        `${task.title} ${task.outlet} ${task.description} ${task.priority}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesOutlet && matchesQuery;
    });
  }, [tasks, selectedOutlet, query]);

  const filteredChecklists = useMemo(() => {
    return checklists.filter((checklist) => {
      const matchesOutlet = selectedOutlet === 'all' || checklist.outlet === selectedOutlet;
      const matchesQuery =
        query.trim().length === 0 ||
        `${checklist.title} ${checklist.outlet} ${checklist.role} ${checklist.frequency}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesOutlet && matchesQuery;
    });
  }, [checklists, selectedOutlet, query]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesOutlet = selectedOutlet === 'all' || issue.outlet === selectedOutlet;
      const matchesQuery =
        query.trim().length === 0 ||
        `${issue.customer_name} ${issue.outlet} ${issue.category} ${issue.message}`
          .toLowerCase()
          .includes(query.toLowerCase());
      return matchesOutlet && matchesQuery;
    });
  }, [issues, selectedOutlet, query]);

  const metrics = useMemo(() => {
    return [
      {
        label: 'Open tasks',
        value: tasks.filter((task) => !['Done', 'Completed'].includes(task.status)).length,
        accent: 'bg-amber-50 text-amber-700',
      },
      {
        label: 'Hygiene checks',
        value: checklists.filter((item) => item.title.toLowerCase().includes('hygiene') || item.title.toLowerCase().includes('sanit') || item.title.toLowerCase().includes('clean')).length,
        accent: 'bg-sky-50 text-sky-700',
      },
      {
        label: 'Quality checks',
        value: checklists.filter((item) => item.title.toLowerCase().includes('quality') || item.title.toLowerCase().includes('inspection')).length,
        accent: 'bg-emerald-50 text-emerald-700',
      },
      {
        label: 'Escalated items',
        value: tasks.filter((task) => task.escalated || task.status === 'Escalated').length,
        accent: 'bg-rose-50 text-rose-700',
      },
    ];
  }, [tasks, checklists]);

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      const nextStatus = normalizeStatus(status);
      const { error } = await supabase.from('tasks').update({ status: nextStatus }).eq('id', id);
      if (error) throw new Error(error.message);
      setTasks((current) => current.map((item) => (item.id === id ? { ...item, status: nextStatus, escalated: nextStatus === 'Escalated' } : item)));
      setToast(`Task marked as ${nextStatus}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update kitchen task.');
    }
  };

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
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#745b20]">Kitchen & HACCP</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchRole && (
              <select
                onChange={(event) => onSwitchRole(event.target.value)}
                defaultValue="chef-kitchen"
                className="rounded-lg border border-[#e7e2d8] bg-white px-2 py-1.5 text-xs text-[#1d1e20]"
              >
                <option value="chef-kitchen">Kitchen & HACCP</option>
                <option value="manager-operations">Floor operations</option>
                <option value="admin-suite">Admin console</option>
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
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Kitchen operations</div>
              <h1 className="font-serif text-3xl font-bold text-[#02150c]">Kitchen SOP command</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => void loadData()}
                className="flex items-center gap-2 rounded-xl border border-[#e7e2d8] bg-[#f5f2ee] px-3 py-2 text-xs font-bold"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
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
                placeholder="Search task, checklist, urgency, outlet, issue"
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

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          <section className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#e7e2d8] pb-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Kitchen tasks</div>
                <h2 className="font-serif text-2xl font-bold text-[#02150c]">Assigned kitchen tasks</h2>
              </div>
              <Flame className="h-5 w-5 text-[#745b20]" />
            </div>

            <div className="mt-4 space-y-3">
              {loading ? (
                <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">
                  Loading kitchen operations…
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#d9d2c7] p-8 text-center text-xs text-slate-500">
                  No kitchen tasks found.
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-[#e7e2d8] bg-[#f9f6f3] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[#02150c]">{task.title}</h3>
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusTone(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-600">
                          <span>{task.outlet}</span>
                          <span>•</span>
                          <span>{task.priority}</span>
                          <span>•</span>
                          <span>{task.assigned_role}</span>
                          <span>•</span>
                          <span>{task.due_date || 'No due date'}</span>
                        </div>
                        {task.description && <div className="mt-2 text-[11px] text-slate-600">{task.description}</div>}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <button onClick={() => updateTaskStatus(task.id, 'In Progress')} className="rounded-lg bg-[#02150c] px-3 py-1.5 text-[10px] font-bold uppercase text-white">
                          In progress
                        </button>
                        <button onClick={() => updateTaskStatus(task.id, 'Done')} className="rounded-lg bg-[#e6f5ef] px-3 py-1.5 text-[10px] font-bold uppercase text-[#0c5d42]">
                          Complete
                        </button>
                        <button onClick={() => updateTaskStatus(task.id, 'Escalated')} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase text-red-700">
                          Escalate
                        </button>
                      </div>
                    </div>

                    {task.photo_url && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-[#e7e2d8] bg-white p-2">
                        <img src={task.photo_url} alt={task.title} className="h-32 w-full rounded-lg object-cover" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">SOP compliance</div>
                  <h2 className="font-serif text-2xl font-bold text-[#02150c]">Kitchen checklists</h2>
                </div>
                <ClipboardCheck className="h-5 w-5 text-[#745b20]" />
              </div>

              <div className="mt-4 space-y-3">
                {filteredChecklists.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d9d2c7] p-4 text-center text-xs text-slate-500">
                    No kitchen checklists available.
                  </div>
                ) : (
                  filteredChecklists.slice(0, 5).map((checklist) => (
                    <div key={checklist.id} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-[#02150c]">{checklist.title}</div>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                          {checklist.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-600">{checklist.outlet} • {checklist.frequency} • {checklist.role}</div>
                      {checklist.items.length > 0 && (
                        <div className="mt-2 text-[11px] text-slate-600">
                          {checklist.items.slice(0, 3).map((item: any, index: number) => (
                            <div key={`${checklist.id}-${index}`}>{item.label ?? item.name ?? 'Checklist item'}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-[#e7e2d8] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Operational issues</div>
                  <h2 className="font-serif text-2xl font-bold text-[#02150c]">Guest escalations</h2>
                </div>
                <TriangleAlert className="h-5 w-5 text-[#745b20]" />
              </div>

              <div className="mt-4 space-y-3">
                {filteredIssues.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d9d2c7] p-4 text-center text-xs text-slate-500">
                    No kitchen-related escalations.
                  </div>
                ) : (
                  filteredIssues.slice(0, 4).map((issue) => (
                    <div key={issue.id} className="rounded-xl border border-[#e7e2d8] bg-[#f9f6f3] p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-[#02150c]">{issue.customer_name}</div>
                        <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase text-amber-700">
                          {issue.status}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-slate-600">{issue.outlet} • {issue.category} • {issue.rating}/5</div>
                      <div className="mt-2 text-[11px] text-slate-600">{issue.message}</div>
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
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#745b20]">Evidence & operations</div>
              <h2 className="font-serif text-2xl font-bold text-[#02150c]">Photo evidence & equipment checks</h2>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ImageIcon className="h-4 w-4" />
              {tasks.filter((task) => !!task.photo_url).length} evidence items
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {tasks.filter((task) => !!task.photo_url).length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d9d2c7] p-6 text-center text-xs text-slate-500 md:col-span-2 xl:col-span-3">
                No photo evidence uploaded yet.
              </div>
            ) : (
              tasks.filter((task) => !!task.photo_url).slice(0, 6).map((task) => (
                <div key={task.id} className="overflow-hidden rounded-xl border border-[#e7e2d8] bg-[#f9f6f3]">
                  <img src={task.photo_url} alt={task.title} className="h-36 w-full object-cover" />
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-[#02150c]">{task.title}</div>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusTone(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600">{task.outlet}</div>
                  </div>
                </div>
              ))
            )}
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
