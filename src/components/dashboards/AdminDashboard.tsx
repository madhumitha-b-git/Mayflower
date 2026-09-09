import React, { useState } from 'react';
import { 
  Settings, Users, Store, FileText, LogOut, Bell, CheckCircle2, Clock, AlertTriangle,
  Shield, Key, Plus, RefreshCw, Search, Trash2, Edit3, Lock, Eye, Sparkles, X, Check,
  Download, UserPlus, Filter, AlertCircle, ArrowRight, ShieldCheck,
  Building, Calendar, DollarSign, Award, ChevronRight, Send, MessageSquare
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getStoredUsers } from '../../data/userStorage';

interface Props { 
  user: UserProfile; 
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

interface StaffRow {
  id: string;
  name: string;
  email: string;
  ext: string;
  role: string;
  outlet: string;
  station: string;
  status: 'Active' | 'On Break' | 'Off Duty';
  lastAuth: string;
  avatar: string;
}

interface ApprovalItem {
  id: string;
  code: string;
  type: string;
  title: string;
  details: string;
  amount?: string;
  requestedBy: string;
  status: 'Pending Admin Signature' | 'Approved' | 'Rejected';
  timeAgo: string;
}

export const AdminDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState('poes');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  // Form states
  const [newUserForm, setNewUserForm] = useState({ name: '', role: 'Floor Manager', outlet: 'Poes Garden', email: '' });
  const [bulletinForm, setBulletinForm] = useState({ title: '', body: '' });
  const [incidentForm, setIncidentForm] = useState({ outlet: 'Palavakkam ECR', severity: 'Moderate', details: '' });

  // Staff Table State
  const [staffList, setStaffList] = useState<StaffRow[]>([
    { id: '1', name: 'Anandita Acharya', email: 'anandita.a@mayflower.in', ext: 'Ext 201', role: 'Floor Manager', outlet: 'Poes Garden', station: 'Conservatory / Lunch', status: 'Active', lastAuth: 'Today, 11:42 AM (POS #1)', avatar: 'AA' },
    { id: '2', name: 'Chef Murugan Ramanathan', email: 'm.ramanathan@mayflower.in', ext: 'Ext 304', role: 'Sous Chef', outlet: 'Palavakkam ECR', station: 'Main Pass & Seafood Larder', status: 'Active', lastAuth: 'Today, 10:15 AM (KDS Kitchen)', avatar: 'MR' },
    { id: '3', name: 'Deepa Krishnan', email: 'd.krishnan@mayflower.in', ext: 'Cell +91 98401 22319', role: 'Sommelier', outlet: 'Poes Garden', station: 'Grand Reserve Cellar', status: 'Active', lastAuth: 'Today, 12:05 PM (Cellar Suite)', avatar: 'DK' },
    { id: '4', name: 'Sanjana Vasudevan', email: 'sanjana.v@mayflower.in', ext: 'Ext 411', role: 'Lead Hostess', outlet: 'Anna Nagar East', station: 'VIP Atrium Reception', status: 'Active', lastAuth: 'Today, 11:10 AM (Host Pod 1)', avatar: 'SV' },
    { id: '5', name: 'Raghavan Jayaram', email: 'raghavan.j@mayflower.in', ext: 'Ext 502', role: 'Cashier / POS', outlet: 'Velachery Lakeside', station: 'Front Ledger Desk', status: 'On Break', lastAuth: 'Today, 01:15 PM (Petpooja Register)', avatar: 'RJ' },
  ]);

  // Approvals Queue State
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    { id: 'app-1', code: 'REQ-SWAP-904', type: 'Shift Swap Endorsement', title: 'Floor Captain Exchange for Saturday VIP Dinner', details: 'Priyamvada Nambiar ⇄ Vimal Kumar', requestedBy: 'Priyamvada Nambiar', status: 'Pending Admin Signature', timeAgo: '42 mins ago' },
    { id: 'app-2', code: 'PO-VND-8915', type: 'Authorized Vendor PO', title: 'Ooty Highlands Botanical Estate', details: 'Winter Micro-Flora, Wild Sorrel & Truffle Allotment', amount: '₹92,300', requestedBy: 'Chef Murugan', status: 'Pending Admin Signature', timeAgo: 'Audited by F&B Controller' },
    { id: 'app-3', code: 'RES-HOLD-088', type: 'Banquet / Buyout Hold', title: 'Consular Delegation Harvest Banquet', details: 'Anna Nagar East Glasshouse • Friday 20:00 - 23:30', amount: '₹1,50,000 Collateral', requestedBy: 'Hostess Desk', status: 'Pending Admin Signature', timeAgo: 'Hostess Desk Verified' },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResolveApproval = (id: string, actionName: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'Approved' } : a));
    showToast(`Approval Certified: ${actionName}`);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name) return;
    const newS: StaffRow = {
      id: `usr-${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email || `${newUserForm.name.toLowerCase().replace(' ', '.')}@mayflower.in`,
      ext: 'Ext 109',
      role: newUserForm.role,
      outlet: newUserForm.outlet,
      station: 'General Station',
      status: 'Active',
      lastAuth: 'Just Now (Terminal PIN)',
      avatar: newUserForm.name.substring(0, 2).toUpperCase()
    };
    setStaffList([newS, ...staffList]);
    setShowAddUserModal(false);
    showToast(`Operational Account provisioned for ${newUserForm.name}!`);
    setNewUserForm({ name: '', role: 'Floor Manager', outlet: 'Poes Garden', email: '' });
  };

  const handlePublishBulletin = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBulletinModal(false);
    showToast(`Broadcasted directive "${bulletinForm.title}" to all 4 sanctuaries!`);
    setBulletinForm({ title: '', body: '' });
  };

  const handleLogIncident = (e: React.FormEvent) => {
    e.preventDefault();
    setShowIncidentModal(false);
    showToast(`Operational incident logged for ${incidentForm.outlet}!`);
    setIncidentForm({ outlet: 'Palavakkam ECR', severity: 'Moderate', details: '' });
  };

  const handleInspectPO = (poCode: string, vendor: string, amount: string) => {
    alert(`INSPECTING PURCHASE ORDER: ${poCode}\nVendor: ${vendor}\nAmount: ${amount}\n\nLine Items:\n- Wild Black Truffle (Grade A) 1.5kg: ₹54,000\n- Organic Micro Herbs (Nilgiris): ₹22,300\n- Cold-Pressed Walnut Oil: ₹16,000\n\nAdmin Status: Ready for authorization.`);
  };

  const filteredStaff = staffList.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans antialiased pb-16">
      {/* Toast Component */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#02150c] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#e4c27d]/40 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#e4c27d]" />
          <span className="text-xs font-semibold text-[#e4c27d]">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#fbf9f5]/95 backdrop-blur-xl border-b border-[#e4e2de] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#02150c] text-[#e4c27d] flex items-center justify-center font-serif font-bold text-xl shadow">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold text-[#02150c] leading-tight">Mayflower</span>
                <span className="text-[10px] font-bold text-[#745b20] uppercase tracking-widest">Sanctuaries · Chennai</span>
              </div>
            </div>

            <div className="hidden xl:flex items-center bg-[#efeeea] px-3 py-1.5 rounded-xl space-x-2 text-xs">
              <span className="text-[#424844] font-medium">Sanctuary:</span>
              <select 
                value={selectedSanctuary}
                onChange={(e) => setSelectedSanctuary(e.target.value)}
                className="bg-transparent font-bold text-[#02150c] focus:outline-none cursor-pointer"
              >
                <option value="poes">Poes Garden Flagship</option>
                <option value="ecr">Palavakkam ECR</option>
                <option value="anna">Anna Nagar East</option>
                <option value="velachery">Velachery Lakeside</option>
              </select>
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
              <span className="bg-[#152a20] text-white px-2 py-0.5 rounded-md font-bold uppercase text-[10px]">
                {user.role ? user.role.toUpperCase() : 'ADMIN'}
              </span>
            </div>

            {onSwitchRole && user.role === 'SuperAdmin' && (
              <select
                onChange={(e) => onSwitchRole(e.target.value)}
                defaultValue="admin-suite"
                className="bg-[#02150c] text-xs text-[#e4c27d] border border-green-800 rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none"
              >
                <option value="owner-management">👑 Owner & Multi-Outlet</option>
                <option value="admin-suite">🛡️ System Admin Console</option>
                <option value="manager-operations">💼 Floor Operations</option>
                <option value="chef-kitchen">👨‍🍳 Kitchen & HACCP</option>
                <option value="hr-roster">👥 Staffing & HR</option>
                <option value="accountant-ledger">📊 POS Reconciliation</option>
                <option value="customer-portal">🍷 VIP Guest Suite</option>
              </select>
            )}

            <button 
              onClick={onLogout} 
              className="text-xs text-red-600 hover:text-red-800 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Secondary Sub-navigation Ribbon */}
        <div className="w-full bg-[#f5f3ef] border-t border-[#e4e2de] px-6 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center space-x-1 py-2 text-xs">
            {user.role === 'SuperAdmin' && (
              <button 
                onClick={() => onSwitchRole?.('owner-management')}
                className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
              >
                Owner & Multi-Outlet
              </button>
            )}
            <button 
              className="px-3 py-1.5 font-bold bg-[#152a20] text-white rounded-lg shadow-sm whitespace-nowrap cursor-pointer"
            >
              System Admin & Governance
            </button>
            {user.role === 'SuperAdmin' && (
              <>
                <button 
                  onClick={() => onSwitchRole?.('manager-operations')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Floor Operations
                </button>
                <button 
                  onClick={() => onSwitchRole?.('chef-kitchen')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Kitchen & HACCP
                </button>
                <button 
                  onClick={() => onSwitchRole?.('hr-roster')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  Staffing & HR
                </button>
                <button 
                  onClick={() => onSwitchRole?.('accountant-ledger')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  POS Reconciliation
                </button>
                <button 
                  onClick={() => onSwitchRole?.('customer-portal')}
                  className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
                >
                  VIP Guest Suite
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-8">
        {/* Administrative Top Bar & Metric Suite */}
        <section className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#e4e2de]">
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs">
                <span className="bg-[#152a20] text-white font-bold uppercase text-[10px] px-2.5 py-0.5 rounded-full">
                  Administrative & Operational Management
                </span>
                <span className="text-[#745b20] font-bold">● Admin Console</span>
                <span className="font-mono text-gray-500">ID: ADM-MAYOPS-409</span>
              </div>
              <h1 className="text-3xl font-serif font-bold text-[#02150c]">Operational Governance & Sanctuaries Fleet</h1>
              <p className="text-xs text-[#424844] max-w-3xl">
                Supervising real-time personnel provisioning, capacity allotments, vendor procurement mandates, and SOP health indices across all 4 Chennai estates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setShowAddUserModal(true)}
                className="bg-[#02150c] hover:bg-[#152a20] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition shadow cursor-pointer flex items-center space-x-1.5"
              >
                <UserPlus className="w-4 h-4 text-[#e4c27d]" />
                <span>+ Add Staff User</span>
              </button>

              <button 
                onClick={() => setShowBulletinModal(true)}
                className="bg-[#f5f3ef] hover:bg-[#efeeea] text-[#02150c] text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl border border-[#e4e2de] transition cursor-pointer flex items-center space-x-1"
              >
                <MessageSquare className="w-4 h-4 text-[#745b20]" />
                <span>Bulletin</span>
              </button>

              <button 
                onClick={() => showToast('Generating certified PDF operations summary for Directors...')}
                className="bg-[#f5f3ef] hover:bg-[#efeeea] text-[#02150c] text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-xl border border-[#e4e2de] transition cursor-pointer flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Export Dossier</span>
              </button>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-[#f5f3ef] p-4 rounded-xl border border-[#e4e2de] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#424844]">
                <span>Operational Staff Active</span>
                <Users className="w-4 h-4 text-[#745b20]" />
              </div>
              <div className="text-2xl font-bold text-[#02150c]">64 <span className="text-xs font-normal text-gray-500">/ 68</span></div>
              <div className="text-[11px] text-[#745b20] font-bold">✓ 98.4% shift coverage today</div>
              <div className="w-full bg-[#efeeea] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#02150c] h-full rounded-full" style={{ width: '94%' }} />
              </div>
            </div>

            <div className="bg-[#f5f3ef] p-4 rounded-xl border border-[#e4e2de] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#424844]">
                <span>Pending Approvals</span>
                <Clock className="w-4 h-4 text-[#745b20]" />
              </div>
              <div className="text-2xl font-bold text-[#745b20]">{approvals.filter(a => a.status === 'Pending Admin Signature').length} <span className="text-xs font-normal text-gray-500">Actions Required</span></div>
              <p className="text-[11px] text-[#424844]">3 shift swaps • 2 vendor POs • 2 VIP holds</p>
              <a href="#approvals-queue" className="text-[10px] font-bold text-[#02150c] uppercase hover:underline block">Resolve in queue →</a>
            </div>

            <div className="bg-[#f5f3ef] p-4 rounded-xl border border-[#e4e2de] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#424844]">
                <span>Capacity Allotted</span>
                <Store className="w-4 h-4 text-[#745b20]" />
              </div>
              <div className="text-2xl font-bold text-[#02150c]">78 <span className="text-xs font-normal text-gray-500">/ 82</span></div>
              <p className="text-[11px] text-[#424844]">95% booked across Lunch & Dinner</p>
              <div className="w-full bg-[#efeeea] h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#745b20] h-full rounded-full" style={{ width: '95%' }} />
              </div>
            </div>

            <div className="bg-[#f5f3ef] p-4 rounded-xl border border-[#e4e2de] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#424844]">
                <span>Incidents / Alerts</span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-[#02150c]">2 <span className="text-xs font-bold text-[#745b20]">Minor Escalations</span></div>
              <p className="text-[11px] text-[#424844] truncate">ECR Sommelier sub • Anna Nagar truffle</p>
              <div className="text-[10px] text-[#745b20] font-bold">SOP Stability: 99.1%</div>
            </div>
          </div>
        </section>

        {/* SECTION 1: User & Staff Administration Directory */}
        <section className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Section 01 // Personnel Directives</span>
              <h2 className="text-xl font-serif font-bold text-[#02150c]">Authorised Operational Roles Directory</h2>
              <p className="text-xs text-[#424844]">Administrative provisioning, credential resets, shift floor assignments, and privilege suspension.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-[#f5f3ef] border border-[#e4e2de] text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Authorized Roles</option>
                <option value="Floor Manager">Floor Manager</option>
                <option value="Sous Chef">Sous Chef</option>
                <option value="Sommelier">Head Sommelier</option>
                <option value="Lead Hostess">Lead Hostess</option>
                <option value="Cashier / POS">Cashier & POS Lead</option>
              </select>

              <button 
                onClick={() => setShowAddUserModal(true)}
                className="bg-[#02150c] hover:bg-[#152a20] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition shadow cursor-pointer flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Provision User</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-[#f5f3ef] rounded-2xl border border-[#e4e2de]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#efeeea] text-[#424844] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Personnel & Contact</th>
                  <th className="py-3 px-4">Role Authorization</th>
                  <th className="py-3 px-4">Assigned Sanctuary</th>
                  <th className="py-3 px-4">Station & Shift</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Auth / Active</th>
                  <th className="py-3 px-4 text-right">Admin Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e2de]">
                {filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-white transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#02150c] text-[#e4c27d] flex items-center justify-center font-bold text-xs">
                          {staff.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-[#02150c] text-sm">{staff.name}</div>
                          <div className="text-[11px] text-gray-500">{staff.email} • {staff.ext}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-[#152a20]/10 text-[#152a20] font-bold px-2 py-0.5 rounded text-[11px]">
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#02150c]">{staff.outlet}</td>
                    <td className="py-3.5 px-4 text-gray-600">{staff.station}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        staff.status === 'Active' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{staff.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">{staff.lastAuth}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => showToast(`Scope updated for ${staff.name}`)}
                          className="p-1.5 rounded bg-white hover:bg-gray-100 border border-[#e4e2de] text-[#02150c]" 
                          title="Edit Scope"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => showToast(`Password/PIN reset sent to ${staff.name}`)}
                          className="p-1.5 rounded bg-white hover:bg-gray-100 border border-[#e4e2de] text-[#02150c]" 
                          title="Reset PIN"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 2: Operating Policies & Capacity */}
        <section className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Section 02 // Outlet Estate Matrix</span>
            <h2 className="text-xl font-serif font-bold text-[#02150c]">Operating Policies, Cadence & Capacity Mandates</h2>
            <p className="text-xs text-[#424844]">Adjust outlet operational windows, manage service covers limiters, and mandate weather & VIP hold protocols.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              { name: 'Poes Garden Flagship', hours: '12:00 PM – 11:00 PM', capacity: 88, cadence: 'Lunch / Degustation', policy: '48hr VIP Hold' },
              { name: 'Palavakkam ECR Seaside', hours: '12:00 PM – 11:30 PM', capacity: 120, cadence: 'Alfresco & High-Tea', policy: 'Terrace Guard' },
              { name: 'Anna Nagar East Glasshouse', hours: '12:00 PM – 10:30 PM', capacity: 76, cadence: 'Glasshouse Dinners', policy: 'Deposit Req.' },
              { name: 'Velachery Lakeside Estate', hours: '12:00 PM – 11:00 PM', capacity: 70, cadence: 'Weekend Brunch', policy: 'Brunch Ready' },
            ].map(outlet => (
              <div key={outlet.name} className="p-4 bg-[#f5f3ef] rounded-2xl border border-[#e4e2de] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-serif font-bold text-[#02150c] text-sm">{outlet.name}</h3>
                    <span className="text-[10px] text-[#745b20] font-bold uppercase">{outlet.cadence}</span>
                  </div>
                  <span className="bg-[#e4c27d] text-[#02150c] text-[10px] font-bold px-2 py-0.5 rounded">{outlet.policy}</span>
                </div>

                <div className="space-y-1.5 text-xs bg-white p-3 rounded-xl border border-[#e4e2de]">
                  <div className="flex justify-between"><span className="text-gray-500">Hours:</span><strong className="text-[#02150c]">{outlet.hours}</strong></div>
                  <div className="flex justify-between"><span className="text-gray-500">Max Capacity:</span><strong className="text-[#02150c]">{outlet.capacity} Covers</strong></div>
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button 
                    onClick={() => {
                      const newH = prompt(`Update operating hours for ${outlet.name}:`, outlet.hours);
                      if (newH) showToast(`Updated hours for ${outlet.name} to ${newH}`);
                    }}
                    className="flex-1 bg-white hover:bg-gray-100 text-[#02150c] text-[11px] font-bold py-1.5 rounded-lg border border-[#e4e2de] transition cursor-pointer"
                  >
                    Edit Policy
                  </button>
                  <button 
                    onClick={() => {
                      const newC = prompt(`Adjust max capacity for ${outlet.name}:`, outlet.capacity.toString());
                      if (newC) showToast(`${outlet.name} capacity re-calibrated to ${newC} covers.`);
                    }}
                    className="flex-1 bg-[#02150c] hover:bg-[#152a20] text-white text-[11px] font-bold py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Adjust Covers
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Operations Approvals Queue */}
        <section id="approvals-queue" className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Section 03 // Administrative Sign-off Ledger</span>
              <h2 className="text-xl font-serif font-bold text-[#02150c]">Pending Administrative Workflow Approvals</h2>
              <p className="text-xs text-[#424844]">Actions requiring Administrator authorization: staff shift reassignments, verified supplier purchase orders, and VIP hall buyout freezes.</p>
            </div>
            <span className="bg-[#02150c] text-white text-xs font-bold px-3 py-1 rounded-xl">
              {approvals.filter(a => a.status === 'Pending Admin Signature').length} Pending in Queue
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {approvals.map(app => (
              <div key={app.id} className="p-5 bg-[#f5f3ef] rounded-2xl border border-[#e4e2de] space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-[#e4e2de]">
                    <span className="bg-[#152a20]/10 text-[#152a20] font-bold px-2 py-0.5 rounded text-[10px]">{app.type}</span>
                    <span className="font-mono text-gray-500 text-[10px]">{app.code}</span>
                  </div>

                  <h3 className="font-serif font-bold text-[#02150c] text-base">{app.title}</h3>
                  <p className="text-xs text-[#424844]">{app.details}</p>
                  {app.amount && <div className="text-lg font-bold text-[#745b20]">{app.amount}</div>}
                </div>

                <div className="pt-2 border-t border-[#e4e2de] space-y-2">
                  <div className="flex justify-between text-[10px] text-gray-500">
                    <span>Status: <strong className="text-[#745b20]">{app.status}</strong></span>
                    <span>{app.timeAgo}</span>
                  </div>

                  {app.status === 'Pending Admin Signature' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleResolveApproval(app.id, app.title)}
                        className="flex-1 bg-[#02150c] hover:bg-[#152a20] text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                      >
                        Approve
                      </button>
                      {app.amount && (
                        <button
                          onClick={() => handleInspectPO(app.code, app.title, app.amount || '')}
                          className="bg-white hover:bg-gray-100 text-[#02150c] border border-[#e4e2de] font-bold px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                        >
                          Inspect
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-700 text-center bg-emerald-50 py-2 rounded-xl">
                      ✓ Approval Certified
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: Compliance & Incidents */}
        <section className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Section 04 // Operational Integrity Register</span>
              <h2 className="text-xl font-serif font-bold text-[#02150c]">Daily Hygiene Audits & Incident Escalations</h2>
              <p className="text-xs text-[#424844]">Front-of-house checklists, FSSAI certified audits, kitchen line HACCP logs, and engineering trouble tickets.</p>
            </div>

            <button 
              onClick={() => setShowIncidentModal(true)}
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl transition cursor-pointer flex items-center space-x-1"
            >
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Log Incident</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#f5f3ef] p-5 rounded-2xl border border-[#e4e2de] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e2de]">
                <h3 className="font-serif font-bold text-[#02150c] text-sm">Statutory & Food Safety Health Matrix</h3>
                <span className="bg-[#02150c] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">100% Verified</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#e4e2de]">
                  <span className="text-[10px] font-bold uppercase text-gray-500">FSSAI Health Cards</span>
                  <div className="text-xl font-bold text-[#02150c] mt-1">68 / 68</div>
                  <span className="text-[10px] text-[#745b20] font-semibold">All valid through Q4 2025</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#e4e2de]">
                  <span className="text-[10px] font-bold uppercase text-gray-500">HACCP Opening Kitchen Passes</span>
                  <div className="text-xl font-bold text-[#02150c] mt-1">4 of 4 Outlets</div>
                  <span className="text-[10px] text-[#745b20] font-semibold">Exec Chefs verified</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#f5f3ef] p-5 rounded-2xl border border-[#e4e2de] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e2de]">
                <h3 className="font-serif font-bold text-[#02150c] text-sm">Active Incident Register</h3>
                <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">Critical-2</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#e4e2de] space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-red-600">Palavakkam ECR Seaside</span>
                  <span className="font-mono text-gray-400">TKT-OPS-3301</span>
                </div>
                <div className="font-bold text-xs text-[#02150c]">HVAC Zone C Recalibration in Ocean Verandah</div>
                <p className="text-[11px] text-gray-500">Daikin facilities engineer dispatched on-site.</p>
                <div className="text-[10px] font-bold text-[#745b20]">ETA: 45 Mins (Prior to dinner service)</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Modal 1: Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddStaffSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#e4e2de]">
            <div className="flex items-center justify-between border-b border-[#e4e2de] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#745b20]">Administrative Provisioning</span>
                <h3 className="font-serif font-bold text-lg text-[#02150c]">Add Operational Personnel Account</h3>
              </div>
              <button type="button" onClick={() => setShowAddUserModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#424844] mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tarun Karthikeyan"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#424844] mb-1">Role</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Floor Manager">Floor Manager</option>
                    <option value="Sous Chef">Sous Chef</option>
                    <option value="Sommelier">Head Sommelier</option>
                    <option value="Lead Hostess">Lead Hostess</option>
                    <option value="Cashier / POS">Cashier / POS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#424844] mb-1">Sanctuary</label>
                  <select
                    value={newUserForm.outlet}
                    onChange={(e) => setNewUserForm({ ...newUserForm, outlet: e.target.value })}
                    className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  >
                    <option value="Poes Garden">Poes Garden</option>
                    <option value="Palavakkam ECR">Palavakkam ECR</option>
                    <option value="Anna Nagar East">Anna Nagar East</option>
                    <option value="Velachery Lakeside">Velachery Lakeside</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#02150c] hover:bg-[#152a20] text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer"
              >
                Authorize & Provision
              </button>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Publish Bulletin */}
      {showBulletinModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handlePublishBulletin} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#e4e2de]">
            <div className="flex items-center justify-between border-b border-[#e4e2de] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#745b20]">Fleet Announcement</span>
                <h3 className="font-serif font-bold text-lg text-[#02150c]">Publish Operational Bulletin</h3>
              </div>
              <button type="button" onClick={() => setShowBulletinModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#424844] mb-1">Bulletin Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Winter Tasting Menu Sequence Adjustments"
                  value={bulletinForm.title}
                  onChange={(e) => setBulletinForm({ ...bulletinForm, title: e.target.value })}
                  className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#424844] mb-1">Directive Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Instructions for Floor Captains, Bartenders, and Sous Chefs..."
                  value={bulletinForm.body}
                  onChange={(e) => setBulletinForm({ ...bulletinForm, body: e.target.value })}
                  className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#745b20] hover:bg-[#8e6f28] text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer"
              >
                Broadcast Bulletin
              </button>
              <button
                type="button"
                onClick={() => setShowBulletinModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal 3: Incident Modal */}
      {showIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleLogIncident} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#e4e2de]">
            <div className="flex items-center justify-between border-b border-[#e4e2de] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-red-600">Escalation Dispatch</span>
                <h3 className="font-serif font-bold text-lg text-[#02150c]">Log Operational Incident Ticket</h3>
              </div>
              <button type="button" onClick={() => setShowIncidentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#424844] mb-1">Affected Sanctuary</label>
                <select
                  value={incidentForm.outlet}
                  onChange={(e) => setIncidentForm({ ...incidentForm, outlet: e.target.value })}
                  className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                >
                  <option value="Palavakkam ECR">Palavakkam ECR Seaside</option>
                  <option value="Poes Garden">Poes Garden Flagship</option>
                  <option value="Anna Nagar East">Anna Nagar East Glasshouse</option>
                  <option value="Velachery Lakeside">Velachery Lakeside Estate</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#424844] mb-1">Incident Synopsis</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe issue, physical station affected..."
                  value={incidentForm.details}
                  onChange={(e) => setIncidentForm({ ...incidentForm, details: e.target.value })}
                  className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer"
              >
                Register & Dispatch
              </button>
              <button
                type="button"
                onClick={() => setShowIncidentModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
