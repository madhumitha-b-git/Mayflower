import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, Store, Settings, LogOut, Users, UserPlus,
  Globe, Activity, Sparkles, Plus, Monitor, X,
  Search, Filter, ChevronDown, RefreshCw, Eye, EyeOff,
  Star, Calendar, CreditCard, ShoppingBag
} from 'lucide-react';
import { UserProfile } from '../../types';
import {
  fetchAllStaff, fetchAllCustomers, createStaffMember, fetchOutlets,
  toggleStaffActive, StaffMember, CustomerRecord, CreateStaffPayload
} from '../../lib/adminService';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

interface DbOutlet {
  id: string;
  name: string;
  slug: string;
  badge: string | null;
  area: string | null;
  petpooja_id: string | null;
  tables_count: number;
  covers_count: number;
  is_active: boolean;
  opening_time: string | null;
  closing_time: string | null;
}

interface RbacRow {
  role: string;
  tier: string;
  rootConfig: boolean;
  ledgers: boolean;
  staff: boolean;
  kds: boolean;
  pii: boolean;
  override: boolean;
  disabled?: boolean;
}

type ActiveTab = 'overview' | 'staff' | 'customers' | 'outlets' | 'rbac' | 'integrations' | 'audit';

const STAFF_ROLES = ['Owner', 'Admin', 'Manager', 'Chef', 'HR', 'Accountant'] as const;
const OUTLETS = ['Poes Garden Flagship', 'Palavakkam ECR Seaside', 'Anna Nagar East Pavilion', 'Velachery Lakeside Conservatory'];

const TIER_COLORS: Record<string, string> = {
  'Green': 'bg-emerald-50 text-emerald-700',
  'Gold': 'bg-amber-50 text-amber-700',
  'Sanctuary VIP': 'bg-purple-50 text-purple-700',
};

export const SuperAdminDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [showCreateStaffModal, setShowCreateStaffModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Staff state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All');
  const [staffSearch, setStaffSearch] = useState('');

  // Customer state
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSort, setCustomerSort] = useState<'joined' | 'points' | 'visits' | 'bookings' | 'spent'>('joined');

  // Create staff form
  const [createForm, setCreateForm] = useState<CreateStaffPayload>({
    name: '', email: '', mobile: '', password: '', role: 'Manager', outlet: OUTLETS[0],
  });
  const [createLoading, setCreateLoading] = useState(false);

  const [outlets, setOutlets] = useState<DbOutlet[]>([]);
  const [outletsLoading, setOutletsLoading] = useState(false);

  const [rbacMatrix, setRbacMatrix] = useState<RbacRow[]>([
    { role: 'Super Admin', tier: 'Tier 0 · Cluster Principal', rootConfig: true, ledgers: true, staff: true, kds: true, pii: true, override: true, disabled: true },
    { role: 'Owner', tier: 'Tier 1 · Financial & Strategy', rootConfig: false, ledgers: true, staff: true, kds: true, pii: true, override: false },
    { role: 'Admin', tier: 'Tier 2 · Operational Config', rootConfig: true, ledgers: false, staff: true, kds: true, pii: false, override: true },
    { role: 'Manager', tier: 'Tier 3 · Live Service', rootConfig: false, ledgers: false, staff: true, kds: true, pii: true, override: false },
    { role: 'Chef', tier: 'Tier 4 · Kitchen & Operations', rootConfig: false, ledgers: false, staff: false, kds: true, pii: false, override: false },
    { role: 'HR', tier: 'Tier 5 · Shifts & Attendance', rootConfig: false, ledgers: false, staff: true, kds: false, pii: false, override: false },
    { role: 'Accountant', tier: 'Tier 6 · Financials', rootConfig: false, ledgers: true, staff: false, kds: false, pii: false, override: false },
    { role: 'Customer', tier: 'Tier 7 · Guest Portal', rootConfig: false, ledgers: false, staff: false, kds: false, pii: true, override: false, disabled: true },
  ]);

  const [provisionForm, setProvisionForm] = useState({ name: '', area: '', nodeId: '', tables: '20' });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadStaff = useCallback(async () => {
    setStaffLoading(true);
    setStaffError(null);
    try {
      const data = await fetchAllStaff();
      setStaffList(data);
    } catch (e: unknown) {
      setStaffError(e instanceof Error ? e.message : 'Failed to load staff.');
    } finally {
      setStaffLoading(false);
    }
  }, []);

  const loadOutlets = useCallback(async () => {
    setOutletsLoading(true);
    try {
      const data = await fetchOutlets();
      setOutlets(data as DbOutlet[]);
    } catch { /* keep empty */ } finally {
      setOutletsLoading(false);
    }
  }, []);

  const loadCustomers = useCallback(async () => {
    setCustomerLoading(true);
    setCustomerError(null);
    try {
      const data = await fetchAllCustomers();
      setCustomers(data);
    } catch (e: unknown) {
      setCustomerError(e instanceof Error ? e.message : 'Failed to load customers.');
    } finally {
      setCustomerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'staff' || activeTab === 'overview') loadStaff();
  }, [activeTab, loadStaff]);

  useEffect(() => {
    if (activeTab === 'customers') loadCustomers();
  }, [activeTab, loadCustomers]);

  useEffect(() => {
    if (activeTab === 'outlets' || activeTab === 'overview') loadOutlets();
  }, [activeTab, loadOutlets]);

  const handleToggleRbac = (rowIndex: number, field: keyof RbacRow) => {
    if (rbacMatrix[rowIndex].disabled) return;
    setRbacMatrix(prev => prev.map((row, idx) =>
      idx === rowIndex ? { ...row, [field]: !row[field] } : row
    ));
  };

  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionForm.name) return;
    const slug = provisionForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const { error } = await (await import('../../lib/supabaseClient')).supabase
      .from('outlets')
      .insert({
        name: provisionForm.name,
        slug,
        area: provisionForm.area || null,
        petpooja_id: provisionForm.nodeId || null,
        tables_count: parseInt(provisionForm.tables) || 0,
        covers_count: (parseInt(provisionForm.tables) || 0) * 4,
        address: provisionForm.area || 'Chennai',
        is_active: true,
      });
    if (error) { showToast(`Error: ${error.message}`); return; }
    setShowProvisionModal(false);
    showToast(`Outlet "${provisionForm.name}" added.`);
    setProvisionForm({ name: '', area: '', nodeId: '', tables: '20' });
    loadOutlets();
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password || !createForm.mobile) return;
    setCreateLoading(true);
    const { error } = await createStaffMember(createForm);
    setCreateLoading(false);
    if (error) {
      showToast(`Error: ${error}`);
    } else {
      showToast(`Staff account created for ${createForm.name}.`);
      setShowCreateStaffModal(false);
      setCreateForm({ name: '', email: '', mobile: '', password: '', role: 'Manager', outlet: OUTLETS[0] });
      loadStaff();
    }
  };

  const handleToggleActive = async (s: StaffMember) => {
    const { error } = await toggleStaffActive(s.id, !s.is_active);
    if (error) showToast(`Error: ${error}`);
    else {
      showToast(`${s.name} marked as ${!s.is_active ? 'Active' : 'Inactive'}.`);
      loadStaff();
    }
  };

  const filteredStaff = staffList.filter(s => {
    const matchRole = staffRoleFilter === 'All' || s.role === staffRoleFilter;
    const matchSearch = s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(staffSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  const sortedCustomers = [...customers]
    .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(customerSearch.toLowerCase()))
    .sort((a, b) => {
      if (customerSort === 'points') return b.loyalty_points - a.loyalty_points;
      if (customerSort === 'visits') return b.total_visits - a.total_visits;
      if (customerSort === 'spent') return b.total_spent - a.total_spent;
      if (customerSort === 'bookings') return (b.reservations?.length ?? 0) - (a.reservations?.length ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const tabs: { key: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <Monitor className="w-3.5 h-3.5" /> },
    { key: 'staff', label: 'Staff', icon: <Users className="w-3.5 h-3.5" /> },
    { key: 'customers', label: 'Customers', icon: <Star className="w-3.5 h-3.5" /> },
    { key: 'outlets', label: 'Outlets', icon: <Store className="w-3.5 h-3.5" /> },
    { key: 'rbac', label: 'Roles & Permissions', icon: <Shield className="w-3.5 h-3.5" /> },
    { key: 'integrations', label: 'Integrations', icon: <Globe className="w-3.5 h-3.5" /> },
    { key: 'audit', label: 'Audit Log', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans antialiased pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#02150c] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#e4c27d]/40">
          <Sparkles className="w-5 h-5 text-[#e4c27d]" />
          <span className="text-xs font-semibold text-[#e4c27d]">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fbf9f5]/95 backdrop-blur-xl border-b border-[#e4e2de] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#02150c] text-[#e4c27d] flex items-center justify-center font-serif font-bold text-xl shadow">M</div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-[#02150c] leading-tight">Mayflower</span>
              <span className="text-[10px] font-bold text-[#745b20] uppercase tracking-widest">Sanctuaries · Chennai</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-[#f5f3ef] px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[#424844]">Petpooja POS</span>
              <span className="font-bold text-[#745b20] uppercase text-[10px]">Live Sync</span>
            </div>
            <div className="flex items-center space-x-2 bg-[#efeeea] px-3 py-1 rounded-xl text-xs">
              <span className="text-[10px] uppercase font-bold text-[#424844]">Role:</span>
              <span className="bg-red-800 text-white px-2 py-0.5 rounded-md font-bold uppercase text-[10px]">SUPER ADMIN</span>
            </div>
            <button onClick={onLogout} className="text-xs text-red-600 hover:text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 cursor-pointer">
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="max-w-7xl mx-auto px-6 border-t border-[#e4e2de]">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  activeTab === tab.key
                    ? 'bg-[#02150c] text-[#e4c27d]'
                    : 'text-[#424844] hover:bg-[#efeeea]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <>
            <div className="bg-[#02150c] rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-[#e4c27d] to-transparent" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-5 h-5 text-[#e4c27d]" />
                    <span className="text-[#e4c27d] text-xs font-bold uppercase tracking-widest">Super Admin Console</span>
                  </div>
                  <h1 className="font-serif text-3xl font-bold text-white mb-1">Mayflower Sanctuaries</h1>
                  <p className="text-[#a8b5a0] text-sm">Manage users, roles, outlets, content, operations, and integrations.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: 'Active Outlets', value: outlets.length.toString(), icon: Store },
                    { label: 'Staff Accounts', value: staffLoading ? '…' : staffList.length.toString(), icon: Users },
                    { label: 'System Status', value: 'All Online', icon: Activity },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="bg-white/10 rounded-2xl px-4 py-3 text-center min-w-[100px]">
                      <Icon className="w-4 h-4 text-[#e4c27d] mx-auto mb-1" />
                      <div className="text-lg font-bold text-white">{value}</div>
                      <div className="text-[10px] text-[#a8b5a0] uppercase tracking-wide">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#e4e2de] p-5 shadow-sm">
                <h3 className="font-serif text-base font-bold text-[#02150c] mb-3">Staff by Role</h3>
                {staffLoading ? (
                  <p className="text-xs text-[#9ca3af]">Loading…</p>
                ) : (
                  <div className="space-y-2">
                    {STAFF_ROLES.map(role => {
                      const count = staffList.filter(s => s.role === role).length;
                      return (
                        <div key={role} className="flex items-center justify-between text-sm">
                          <span className="text-[#424844]">{role}</span>
                          <span className="font-bold text-[#02150c] bg-[#efeeea] px-2 py-0.5 rounded-md text-xs">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-[#e4e2de] p-5 shadow-sm">
                <h3 className="font-serif text-base font-bold text-[#02150c] mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button onClick={() => setActiveTab('staff')} className="w-full text-left text-sm text-[#424844] hover:text-[#02150c] hover:bg-[#f5f3ef] px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer">
                    <UserPlus className="w-4 h-4 text-[#745b20]" /><span>Manage Staff Accounts</span>
                  </button>
                  <button onClick={() => setActiveTab('customers')} className="w-full text-left text-sm text-[#424844] hover:text-[#02150c] hover:bg-[#f5f3ef] px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer">
                    <Star className="w-4 h-4 text-[#745b20]" /><span>View Customer Records</span>
                  </button>
                  <button onClick={() => setActiveTab('outlets')} className="w-full text-left text-sm text-[#424844] hover:text-[#02150c] hover:bg-[#f5f3ef] px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer">
                    <Store className="w-4 h-4 text-[#745b20]" /><span>Manage Outlets</span>
                  </button>
                  <button onClick={() => setActiveTab('rbac')} className="w-full text-left text-sm text-[#424844] hover:text-[#02150c] hover:bg-[#f5f3ef] px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer">
                    <Shield className="w-4 h-4 text-[#745b20]" /><span>Configure Roles & Permissions</span>
                  </button>
                  <button onClick={() => setActiveTab('integrations')} className="w-full text-left text-sm text-[#424844] hover:text-[#02150c] hover:bg-[#f5f3ef] px-3 py-2 rounded-xl transition flex items-center space-x-2 cursor-pointer">
                    <Settings className="w-4 h-4 text-[#745b20]" /><span>Integration Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STAFF TAB ── */}
        {activeTab === 'staff' && (
          <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#e4e2de]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#02150c]">Staff Management</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">All staff accounts linked to Supabase Auth</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={loadStaff} className="flex items-center space-x-1 text-xs text-[#424844] bg-[#efeeea] px-3 py-1.5 rounded-xl hover:bg-[#e4e2de] transition cursor-pointer">
                  <RefreshCw className="w-3 h-3" /><span>Refresh</span>
                </button>
                <button
                  onClick={() => setShowCreateStaffModal(true)}
                  className="flex items-center space-x-1.5 bg-[#02150c] text-[#e4c27d] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#0a2a18] transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /><span>Add New Staff</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-[#faf9f6] border-b border-[#e4e2de]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={staffSearch}
                  onChange={e => setStaffSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e4e2de] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#745b20]/30 w-56"
                />
              </div>
              <div className="relative flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-[#9ca3af]" />
                <select
                  value={staffRoleFilter}
                  onChange={e => setStaffRoleFilter(e.target.value)}
                  className="text-xs border border-[#e4e2de] rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#745b20]/30 cursor-pointer appearance-none pr-6"
                >
                  <option value="All">All Roles</option>
                  {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9ca3af] pointer-events-none" />
              </div>
              <span className="text-xs text-[#9ca3af]">{filteredStaff.length} result{filteredStaff.length !== 1 ? 's' : ''}</span>
            </div>

            {staffLoading && <div className="px-6 py-8 text-center text-sm text-[#9ca3af]">Loading staff…</div>}
            {staffError && <div className="px-6 py-4 text-sm text-red-600 bg-red-50">{staffError}</div>}

            {!staffLoading && !staffError && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f3ef] text-[10px] uppercase tracking-widest text-[#6b7280]">
                    <tr>
                      {['Name', 'Email', 'Mobile', 'Role', 'Dept', 'Outlet', 'Emp Code', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-bold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ede8]">
                    {filteredStaff.length === 0 ? (
                      <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-[#9ca3af]">No staff found.</td></tr>
                    ) : filteredStaff.map(s => (
                      <tr key={s.id} className="hover:bg-[#faf9f6] transition">
                        <td className="px-5 py-3.5 font-semibold text-[#02150c] whitespace-nowrap">{s.name}</td>
                        <td className="px-5 py-3.5 text-[#6b7280] text-xs">{s.email}</td>
                        <td className="px-5 py-3.5 text-[#6b7280] text-xs">{s.mobile || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className="bg-[#efeeea] text-[#424844] text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">{s.role}</span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#424844]">{s.department || '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-[#424844]">{s.outlet_name || s.outlet || '—'}</td>
                        <td className="px-5 py-3.5 text-xs font-mono text-[#745b20]">{s.employee_code || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${s.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                            {s.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleToggleActive(s)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${s.is_active ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100' : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'}`}
                          >
                            {s.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ── CUSTOMERS TAB ── */}
        {activeTab === 'customers' && (
          <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-[#e4e2de]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#02150c]">Customer Records</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">{customers.length} registered customers</p>
              </div>
              <button onClick={loadCustomers} className="flex items-center space-x-1 text-xs text-[#424844] bg-[#efeeea] px-3 py-1.5 rounded-xl hover:bg-[#e4e2de] transition cursor-pointer">
                <RefreshCw className="w-3 h-3" /><span>Refresh</span>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-[#faf9f6] border-b border-[#e4e2de]">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#9ca3af]" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-[#e4e2de] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#745b20]/30 w-56"
                />
              </div>
              <div className="relative flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5 text-[#9ca3af]" />
                <select
                  value={customerSort}
                  onChange={e => setCustomerSort(e.target.value as typeof customerSort)}
                  className="text-xs border border-[#e4e2de] rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#745b20]/30 cursor-pointer appearance-none pr-6"
                >
                  <option value="joined">Sort: Date Joined</option>
                  <option value="points">Sort: Loyalty Points</option>
                  <option value="visits">Sort: Total Visits</option>
                  <option value="bookings">Sort: Total Bookings</option>
                  <option value="spent">Sort: Total Spent</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#9ca3af] pointer-events-none" />
              </div>
              <span className="text-xs text-[#9ca3af]">{sortedCustomers.length} result{sortedCustomers.length !== 1 ? 's' : ''}</span>
            </div>

            {customerLoading && <div className="px-6 py-8 text-center text-sm text-[#9ca3af]">Loading customers…</div>}
            {customerError && <div className="px-6 py-4 text-sm text-red-600 bg-red-50">{customerError}</div>}

            {!customerLoading && !customerError && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f5f3ef] text-[10px] uppercase tracking-widest text-[#6b7280]">
                    <tr>
                      {['Name', 'Email', 'Phone', 'Tier', 'Points', 'Visits', 'Bookings', 'Total Spent', 'Avg Spend', 'Last Visit', 'Joined'].map(h => (
                        <th key={h} className="px-5 py-3 text-left font-bold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0ede8]">
                    {sortedCustomers.length === 0 ? (
                      <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-[#9ca3af]">No customers found.</td></tr>
                    ) : sortedCustomers.map(c => (
                      <tr key={c.id} className="hover:bg-[#faf9f6] transition group">
                        <td className="px-5 py-3.5 font-semibold text-[#02150c] whitespace-nowrap">{c.name}</td>
                        <td className="px-5 py-3.5 text-[#6b7280] text-xs">{c.email}</td>
                        <td className="px-5 py-3.5 text-xs text-[#6b7280]">{c.phone || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${TIER_COLORS[c.loyalty_tier ?? c.tier] ?? 'bg-gray-50 text-gray-600'}`}>{c.loyalty_tier || c.tier}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-[#e4c27d]" />
                            <span className="font-bold text-[#02150c] text-xs">{(c.loyalty_points || c.reward_points).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-[#424844]">{c.total_visits}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-[#9ca3af]" />
                            <span className="text-xs font-semibold text-[#424844]">{c.reservations?.length ?? 0}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-[#02150c]">
                          {c.total_spent > 0 ? `₹${c.total_spent.toLocaleString('en-IN', { minimumFractionDigits: 0 })}` : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#6b7280]">
                          {c.average_spend > 0 ? `₹${Math.round(c.average_spend).toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-[#9ca3af] whitespace-nowrap">{c.last_visit_date || '—'}</td>
                        <td className="px-5 py-3.5 text-xs text-[#9ca3af] whitespace-nowrap">{c.joined_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Customer detail cards for bookings */}
            {!customerLoading && !customerError && sortedCustomers.length > 0 && (
              <div className="px-6 py-4 border-t border-[#e4e2de]">
                <p className="text-xs text-[#9ca3af] mb-3 font-semibold uppercase tracking-wide">Recent Booking Details</p>
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {sortedCustomers.filter(c => (c.reservations?.length ?? 0) > 0).slice(0, 10).map(c => (
                    <div key={c.id} className="border border-[#e4e2de] rounded-xl p-4 bg-[#faf9f6]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-[#02150c]">{c.name}</span>
                        <div className="flex items-center space-x-3 text-xs text-[#6b7280]">
                          <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{c.reservations.length} booking{c.reservations.length !== 1 ? 's' : ''}</span></span>
                          <span className="flex items-center space-x-1"><ShoppingBag className="w-3 h-3" /><span>{c.total_visits} visit{c.total_visits !== 1 ? 's' : ''}</span></span>
                          <span className="flex items-center space-x-1"><CreditCard className="w-3 h-3" /><span className="flex items-center"><Star className="w-2.5 h-2.5 text-[#e4c27d] mr-0.5" />{c.reward_points.toLocaleString()} pts</span></span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {c.reservations.slice(0, 3).map((r, i) => (
                          <div key={i} className="text-[10px] bg-white border border-[#e4e2de] rounded-lg px-2.5 py-1.5 text-[#424844]">
                            <span className="font-bold text-[#02150c]">{r.bookingCode}</span> · {r.outlet} · {r.date} · {r.guests} guests ·{' '}
                            <span className={r.status === 'Confirmed' ? 'text-emerald-600 font-semibold' : 'text-[#9ca3af]'}>{r.status}</span>
                          </div>
                        ))}
                        {c.reservations.length > 3 && (
                          <span className="text-[10px] text-[#9ca3af] px-2 py-1.5">+{c.reservations.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── OUTLETS TAB ── */}
        {activeTab === 'outlets' && (
          <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4e2de]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#02150c]">Outlet Management</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">All active Mayflower sanctuaries</p>
              </div>
              <button onClick={() => setShowProvisionModal(true)} className="flex items-center space-x-1.5 bg-[#02150c] text-[#e4c27d] text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#0a2a18] transition cursor-pointer">
                <Plus className="w-3.5 h-3.5" /><span>Add Outlet</span>
              </button>
            </div>
            {outletsLoading && <div className="px-6 py-8 text-center text-sm text-[#9ca3af]">Loading outlets…</div>}
            {!outletsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {outlets.map(outlet => (
                  <div key={outlet.id} className="border border-[#e4e2de] rounded-2xl p-5 hover:shadow-md transition bg-[#faf9f6]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Store className="w-4 h-4 text-[#745b20]" />
                          <span className="font-bold text-[#02150c] text-sm">{outlet.name}</span>
                        </div>
                        {outlet.badge && <span className="text-[10px] bg-[#efeeea] text-[#424844] font-bold uppercase px-2 py-0.5 rounded-md">{outlet.badge}</span>}
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${outlet.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                        {outlet.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#424844] mb-1">
                      <span>{outlet.tables_count} Tables · {outlet.covers_count} Covers</span>
                      {outlet.petpooja_id && <span className="text-[10px] text-[#9ca3af] font-mono">{outlet.petpooja_id}</span>}
                    </div>
                    {(outlet.opening_time || outlet.closing_time) && (
                      <p className="text-[10px] text-[#9ca3af] mb-2">{outlet.opening_time} – {outlet.closing_time}</p>
                    )}
                    <div className="flex items-center space-x-2 mt-3">
                      <button onClick={() => showToast(`Managing ${outlet.name}`)} className="text-[10px] font-bold text-[#745b20] bg-[#fdf6e3] border border-[#e4c27d]/40 px-2.5 py-1 rounded-lg hover:bg-[#f5e9c0] transition cursor-pointer">Manage</button>
                      <button onClick={() => showToast(`Settings for ${outlet.name}`)} className="text-[10px] font-bold text-[#424844] bg-[#efeeea] px-2.5 py-1 rounded-lg hover:bg-[#e4e2de] transition cursor-pointer">Settings</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── RBAC TAB ── */}
        {activeTab === 'rbac' && (
          <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4e2de]">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#02150c]">Roles & Permissions</h2>
                <p className="text-xs text-[#6b7280] mt-0.5">RBAC matrix — configure access per role</p>
              </div>
              <button onClick={() => showToast('RBAC configuration saved.')} className="text-xs font-bold text-[#745b20] bg-[#fdf6e3] border border-[#e4c27d]/40 px-4 py-2 rounded-xl hover:bg-[#f5e9c0] transition cursor-pointer">Save Changes</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-[#f5f3ef] text-[10px] uppercase tracking-widest text-[#6b7280]">
                  <tr>
                    <th className="px-5 py-3 text-left font-bold">Role</th>
                    <th className="px-5 py-3 text-left font-bold">Tier</th>
                    {['Root Config', 'Financials', 'Staff Mgmt', 'Operations', 'Guest PII', 'Override'].map(h => (
                      <th key={h} className="px-4 py-3 text-center font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ede8]">
                  {rbacMatrix.map((row, i) => (
                    <tr key={i} className={`hover:bg-[#faf9f6] transition ${row.disabled ? 'opacity-60' : ''}`}>
                      <td className="px-5 py-3 font-semibold text-[#02150c]">{row.role}</td>
                      <td className="px-5 py-3 text-[#6b7280]">{row.tier}</td>
                      {(['rootConfig', 'ledgers', 'staff', 'kds', 'pii', 'override'] as (keyof RbacRow)[]).map(field => (
                        <td key={field} className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleToggleRbac(i, field)}
                            disabled={row.disabled}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition cursor-pointer ${row[field] ? 'bg-[#02150c] border-[#02150c]' : 'bg-white border-[#d1cfc9]'} ${row.disabled ? 'cursor-not-allowed' : 'hover:border-[#745b20]'}`}
                          >
                            {row[field] && <span className="text-[#e4c27d] text-[10px] font-bold">✓</span>}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── INTEGRATIONS TAB ── */}
        {activeTab === 'integrations' && (
          <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6">
            <h2 className="font-serif text-lg font-bold text-[#02150c] mb-1">Integration Configuration</h2>
            <p className="text-xs text-[#6b7280] mb-5">Manage third-party service connections</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'Petpooja POS', desc: 'Menu, orders, and billing data source', status: 'Connected', color: 'emerald' },
                { name: 'Razorpay', desc: 'Payment gateway for reservations', status: 'Connected', color: 'emerald' },
                { name: 'SMS / WhatsApp', desc: 'Guest notification service', status: 'Pending', color: 'amber' },
              ].map(({ name, desc, status, color }) => (
                <div key={name} className="border border-[#e4e2de] rounded-2xl p-4 bg-[#faf9f6]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#02150c]">{name}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-${color}-50 text-${color}-700`}>{status}</span>
                  </div>
                  <p className="text-xs text-[#6b7280] mb-3">{desc}</p>
                  <button onClick={() => showToast(`Configure ${name}`)} className="text-[10px] font-bold text-[#745b20] bg-[#fdf6e3] border border-[#e4c27d]/40 px-3 py-1 rounded-lg hover:bg-[#f5e9c0] transition cursor-pointer">Configure</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── AUDIT TAB ── */}
        {activeTab === 'audit' && (
          <section className="bg-white rounded-2xl border border-[#e4e2de] shadow-sm p-6">
            <h2 className="font-serif text-lg font-bold text-[#02150c] mb-1">Activity & Audit Log</h2>
            <p className="text-xs text-[#6b7280] mb-5">Recent system and user activity</p>
            <div className="space-y-3">
              {[
                { time: '09:14', user: 'Super Admin', action: 'Updated RBAC permissions for Manager role', outlet: 'System-wide' },
                { time: '08:52', user: 'Raghavan Iyer', action: 'Approved reservation #R-2041', outlet: 'Poes Garden' },
                { time: '08:30', user: 'Super Admin', action: 'Added new outlet: Velachery Lakeside', outlet: 'System-wide' },
                { time: '07:55', user: 'Kavitha Nair', action: 'Submitted leave request', outlet: 'Velachery Lakeside' },
                { time: '07:20', user: 'System', action: 'Petpooja sync completed — 142 menu items updated', outlet: 'All Outlets' },
              ].map((entry, i) => (
                <div key={i} className="flex items-start space-x-4 py-3 border-b border-[#f0ede8] last:border-0">
                  <span className="text-[10px] font-bold text-[#9ca3af] w-10 shrink-0 mt-0.5">{entry.time}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-xs text-[#02150c]">{entry.user}</span>
                    <span className="text-xs text-[#6b7280]"> — {entry.action}</span>
                  </div>
                  <span className="text-[10px] text-[#9ca3af] shrink-0">{entry.outlet}</span>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {/* ── CREATE STAFF MODAL ── */}
      {showCreateStaffModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-[#02150c]">Add New Staff</h3>
              <button onClick={() => setShowCreateStaffModal(false)} className="text-[#6b7280] hover:text-[#02150c] transition cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Full Name</label>
                <input type="text" required value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Raghavan Iyer" className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Email (Login Credential)</label>
                <input type="email" required value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} placeholder="staff@mayflower.in" className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Mobile Number</label>
                <input type="tel" required value={createForm.mobile} onChange={e => setCreateForm(p => ({ ...p, mobile: e.target.value }))} placeholder="+91 98765 43210" className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Temporary Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} placeholder="Min. 8 characters" className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30" />
                  <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#424844] cursor-pointer">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-[#9ca3af] mt-1">Staff can reset this after first login.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Role</label>
                  <select value={createForm.role} onChange={e => setCreateForm(p => ({ ...p, role: e.target.value as CreateStaffPayload['role'] }))} className="w-full border border-[#e4e2de] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30 cursor-pointer">
                    {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Outlet</label>
                  <select value={createForm.outlet} onChange={e => setCreateForm(p => ({ ...p, outlet: e.target.value }))} className="w-full border border-[#e4e2de] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30 cursor-pointer">
                    {OUTLETS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowCreateStaffModal(false)} className="flex-1 border border-[#e4e2de] text-[#424844] text-sm font-bold py-2.5 rounded-xl hover:bg-[#f5f3ef] transition cursor-pointer">Cancel</button>
                <button type="submit" disabled={createLoading} className="flex-1 bg-[#02150c] text-[#e4c27d] text-sm font-bold py-2.5 rounded-xl hover:bg-[#0a2a18] transition cursor-pointer disabled:opacity-60">
                  {createLoading ? 'Creating…' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ADD OUTLET MODAL ── */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-bold text-[#02150c]">Add New Outlet</h3>
              <button onClick={() => setShowProvisionModal(false)} className="text-[#6b7280] hover:text-[#02150c] transition cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleProvisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Outlet Name</label>
                <input type="text" required value={provisionForm.name} onChange={e => setProvisionForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Nungambakkam Heritage" className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Area / Locality</label>
                <input type="text" value={provisionForm.area} onChange={e => setProvisionForm(p => ({ ...p, area: e.target.value }))} placeholder="e.g. Nungambakkam" className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Petpooja Integration ID</label>
                <input type="text" value={provisionForm.nodeId} onChange={e => setProvisionForm(p => ({ ...p, nodeId: e.target.value }))} placeholder="e.g. PET-CH-005" className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#424844] mb-1.5 uppercase tracking-wide">Number of Tables</label>
                <input type="number" min="1" value={provisionForm.tables} onChange={e => setProvisionForm(p => ({ ...p, tables: e.target.value }))} className="w-full border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#745b20]/30" />
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowProvisionModal(false)} className="flex-1 border border-[#e4e2de] text-[#424844] text-sm font-bold py-2.5 rounded-xl hover:bg-[#f5f3ef] transition cursor-pointer">Cancel</button>
                <button type="submit" className="flex-1 bg-[#02150c] text-[#e4c27d] text-sm font-bold py-2.5 rounded-xl hover:bg-[#0a2a18] transition cursor-pointer">Add Outlet</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SuperAdminDashboard;
