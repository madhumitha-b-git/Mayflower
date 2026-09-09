import React, { useState } from 'react';
import { 
  Shield, Users, Store, Settings, BarChart3, LogOut, ChevronRight, Bell, 
  Globe, Lock, Database, Activity, Sparkles, Plus, Search, RefreshCw, Key,
  CheckCircle2, AlertTriangle, Monitor, Server, Cpu, Fingerprint, MessageSquare,
  Thermometer, X, Eye, Terminal, FileText, Check, AlertCircle, ArrowRight
} from 'lucide-react';
import { UserProfile } from '../../types';

interface Props { 
  user: UserProfile; 
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

interface NodeOutlet {
  id: string;
  name: string;
  badge: string;
  address: string;
  nodeId: string;
  inventory: string;
  gatewayIp: string;
  syncDrift: string;
  status: string;
  icon: string;
}

interface RbacRow {
  role: string;
  tier: string;
  rootConfig: boolean;
  dbRw: boolean;
  tokens: boolean;
  ledgers: boolean;
  staff: boolean;
  kds: boolean;
  pii: boolean;
  override: boolean;
  disabled?: boolean;
}

export const SuperAdminDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState('poes');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // Outlets List State
  const [outlets, setOutlets] = useState<NodeOutlet[]>([
    {
      id: 'out-1',
      name: 'Poes Garden Flagship',
      badge: 'Flagship Hub',
      address: 'Cathedral Road / Kasturi Rangan Rd · Zone 09',
      nodeId: 'PET-CH-001',
      inventory: '24 Tables · 96 Covers',
      gatewayIp: '10.14.2.1',
      syncDrift: '± 4ms (Petpooja v2.4)',
      status: 'Live Sync',
      icon: 'villa'
    },
    {
      id: 'out-2',
      name: 'Palavakkam ECR Seaside',
      badge: 'Pavilion Estate',
      address: 'East Coast Road, Palavakkam Shoreline',
      nodeId: 'PET-CH-002',
      inventory: '18 Tables · 72 Covers',
      gatewayIp: '10.14.3.1',
      syncDrift: '± 8ms (Edge Node)',
      status: 'Online',
      icon: 'water'
    },
    {
      id: 'out-3',
      name: 'Anna Nagar East Pavilion',
      badge: 'Atrium Wing',
      address: '2nd Avenue, Anna Nagar East',
      nodeId: 'PET-CH-003',
      inventory: '20 Tables · 80 Covers',
      gatewayIp: '10.14.4.1',
      syncDrift: '± 6ms (Edge Node)',
      status: 'Online',
      icon: 'park'
    },
    {
      id: 'out-4',
      name: 'Velachery Lakeside Conservatory',
      badge: 'Lakeside Terrace',
      address: 'Bypass Road, Velachery Lake Front',
      nodeId: 'PET-CH-004',
      inventory: '16 Tables · 64 Covers',
      gatewayIp: '10.14.5.1',
      syncDrift: '± 11ms (Edge Node)',
      status: 'Online',
      icon: 'deck'
    }
  ]);

  // RBAC Matrix State
  const [rbacMatrix, setRbacMatrix] = useState<RbacRow[]>([
    { role: 'Super Admin (Root)', tier: 'Tier 0 · Cluster Principal', rootConfig: true, dbRw: true, tokens: true, ledgers: true, staff: true, kds: true, pii: true, override: true, disabled: true },
    { role: 'Owner & Executive', tier: 'Tier 1 · Financial & Strategy', rootConfig: false, dbRw: true, tokens: false, ledgers: true, staff: true, kds: true, pii: true, override: false },
    { role: 'System Admin', tier: 'Tier 2 · Operational Config', rootConfig: true, dbRw: true, tokens: true, ledgers: false, staff: true, kds: true, pii: false, override: true },
    { role: 'Outlet Floor Manager', tier: 'Tier 3 · Live Service & Maitre D', rootConfig: false, dbRw: false, tokens: false, ledgers: false, staff: true, kds: true, pii: true, override: false },
    { role: 'Executive Chef', tier: 'Tier 4 · KDS, HACCP & Cold-Chain', rootConfig: false, dbRw: false, tokens: false, ledgers: false, staff: false, kds: true, pii: false, override: false },
    { role: 'HR & Roster Administrator', tier: 'Tier 5 · Payroll, Shifts & Attendance', rootConfig: false, dbRw: false, tokens: false, ledgers: false, staff: true, kds: false, pii: false, override: false },
    { role: 'Accountant & Settlement', tier: 'Tier 6 · POS Reconciliation & GST', rootConfig: false, dbRw: false, tokens: false, ledgers: true, staff: false, kds: false, pii: false, override: false },
    { role: 'VIP Patron & Dining Guest', tier: 'Tier 7 · Sovereign Dining Portal', rootConfig: false, dbRw: false, tokens: false, ledgers: false, staff: false, kds: false, pii: true, override: false, disabled: true },
  ]);

  // Provision Form State
  const [provisionForm, setProvisionForm] = useState({
    name: '',
    nodeId: '',
    tables: '20',
    ip: '10.14.6.1/24'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleToggleRbacCheck = (rowIndex: number, field: keyof RbacRow) => {
    if (rbacMatrix[rowIndex].disabled) return;
    setRbacMatrix(prev => prev.map((row, idx) => {
      if (idx === rowIndex) {
        return { ...row, [field]: !row[field] };
      }
      return row;
    }));
  };

  const handleCommitRbacSchema = () => {
    showToast('RBAC Matrix schema committed to database and signed with FIDO2 key');
  };

  const handleRevertRbacSchema = () => {
    showToast('Reverted all uncommitted RBAC matrix changes to last verified state');
  };

  const handleExportAuditManifest = () => {
    showToast('Exported signed audit manifest: MAYFLOWER-RBAC-AUDIT-2024.json');
  };

  const handleNodeAction = (nodeId: string, action: string) => {
    if (action === 'edit') {
      showToast(`Opening configuration drawer for Node: ${nodeId}`);
    } else if (action === 'schema') {
      showToast(`Synchronizing POS table schema for ${nodeId}... Completed.`);
    } else if (action === 'reboot') {
      showToast(`Rebooting ingestion pipeline for ${nodeId} [Zero Downtime]`);
    }
  };

  const handleAdapterAction = (adapter: string, op: string) => {
    if (op === 'rotate') {
      showToast(`Master cryptographic token rotated for ${adapter.toUpperCase()} (New expiry: 30 days)`);
    } else if (op === 'logs') {
      showToast(`Fetching latest 50 JSON webhook ingestion payloads for ${adapter}`);
    } else if (op === 'configure') {
      showToast('Launching merchant settlement routing modal');
    } else if (op === 'sync') {
      showToast('Biometric hardware polling synchronized across all terminals');
    } else if (op === 'test') {
      showToast('Test WhatsApp dispatch delivered to Super Admin key terminal');
    } else if (op === 'telemetry') {
      showToast('Displaying real-time MQTT thermal cold-chain stream');
    }
  };

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisionForm.name) return;
    const newNode: NodeOutlet = {
      id: `out-${outlets.length + 1}`,
      name: provisionForm.name,
      badge: 'New Outlet',
      address: 'Chennai Flagship Extension',
      nodeId: provisionForm.nodeId || `PET-CH-00${outlets.length + 1}`,
      inventory: `${provisionForm.tables} Tables · ${parseInt(provisionForm.tables) * 4} Covers`,
      gatewayIp: provisionForm.ip,
      syncDrift: '± 2ms (Edge Node)',
      status: 'Online',
      icon: 'store'
    };
    setOutlets([...outlets, newNode]);
    setShowProvisionModal(false);
    showToast(`Sanctuary "${provisionForm.name}" successfully initialized in cluster!`);
    setProvisionForm({ name: '', nodeId: '', tables: '20', ip: '10.14.6.1/24' });
  };

  const handleKillSwitch = () => {
    const nextState = !killSwitchActive;
    setKillSwitchActive(nextState);
    if (nextState) {
      showToast('EMERGENCY MODE ACTIVE: Reservation intake suspended for all 4 outlets');
    } else {
      showToast('EMERGENCY MODE DEACTIVATED: Normal reservation intake resumed');
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a] font-sans antialiased pb-16">
      {/* Toast Notification */}
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
              <span className="bg-red-800 text-white px-2 py-0.5 rounded-md font-bold uppercase text-[10px]">
                SUPER ADMIN
              </span>
            </div>

            {onSwitchRole && (
              <select
                onChange={(e) => onSwitchRole(e.target.value)}
                defaultValue="SuperAdmin"
                className="bg-[#02150c] text-xs text-[#e4c27d] border border-red-800 rounded-xl px-3 py-1.5 cursor-pointer focus:outline-none"
              >
                <option value="SuperAdmin">🛡️ Super Admin Console</option>
                <option value="owner-management">👑 Owner & Multi-Outlet</option>
                <option value="admin-suite">🛡️ System Admin</option>
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
            <button 
              onClick={() => onSwitchRole?.('owner-management')}
              className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
            >
              Owner & Multi-Outlet
            </button>
            <button 
              onClick={() => onSwitchRole?.('admin-suite')}
              className="px-3 py-1.5 font-bold text-[#424844] hover:text-[#02150c] hover:bg-[#eae8e4] rounded-lg transition whitespace-nowrap cursor-pointer"
            >
              System Admin
            </button>
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-8">
        {/* Top Control Bar */}
        <section className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#e4e2de]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#152a20] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#e4c27d] animate-pulse" />
                <span>Tier 0 Root Access • Super Admin Console</span>
              </span>

              <span className="bg-[#efeeea] text-[#424844] text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center space-x-1">
                <Server className="w-3.5 h-3.5 text-gray-500" />
                <span>Production Multi-Tenant Cluster · 4 Chennai Sanctuaries</span>
              </span>

              <span className="bg-[#eae8e4] text-[#424844] text-[11px] font-semibold px-2.5 py-1 rounded-md flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-[#745b20]" />
                <span>FIDO2 Hardware Key Enforced</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => showToast('All 4 Nodes, 5 Adapters & Database Replicas operating within nominal tolerances (14ms)')}
                className="bg-[#f5f3ef] hover:bg-[#efeeea] text-[#02150c] text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer"
              >
                <Activity className="w-4 h-4 text-[#745b20]" />
                <span>Diagnostics</span>
              </button>

              <button 
                onClick={() => showToast('Hardware Root Keys rotated. Zero-trust sessions re-authenticated.')}
                className="bg-[#f5f3ef] hover:bg-[#efeeea] text-[#02150c] text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>Rotate Root Keys</span>
              </button>

              <button 
                onClick={handleKillSwitch}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer ${
                  killSwitchActive 
                    ? 'bg-red-700 text-white animate-pulse' 
                    : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{killSwitchActive ? 'Kill Switch ACTIVE' : 'Emergency Kill Switch'}</span>
              </button>

              <button 
                onClick={() => setShowProvisionModal(true)}
                className="bg-[#02150c] hover:bg-[#152a20] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow cursor-pointer flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4 text-[#e4c27d]" />
                <span>Provision Tenant</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8 space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#745b20]">Master Orchestration Framework</span>
              <h1 className="text-3xl font-serif font-bold text-[#02150c]">Super Admin Control Nexus</h1>
              <p className="text-xs text-[#424844] max-w-2xl">
                Complete cryptographic oversight, database partitions, POS gateway pipeline orchestration, and granular RBAC governance across all Tamil Nadu flagship estates.
              </p>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <div className="bg-[#f5f3ef] p-4 rounded-xl border border-[#e4e2de] flex items-center space-x-4 w-full lg:w-auto">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#424844]">Core Cluster Latency</span>
                  <div className="text-xl font-bold font-serif text-[#02150c]">14.2 ms</div>
                  <span className="text-[10px] text-[#745b20] font-semibold">Zero packet drops across all nodes</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  99%
                </div>
              </div>
            </div>
          </div>

          {/* 4 Metric KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="bg-[#f5f3ef] p-4 rounded-xl border border-[#e4e2de] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#424844]">
                <span>Sanctuaries & Outlets</span>
                <Store className="w-4 h-4 text-[#745b20]" />
              </div>
              <div className="text-2xl font-bold text-[#02150c]">4 <span className="text-xs font-bold text-[#745b20] uppercase">Live Nodes</span></div>
              <p className="text-[11px] text-[#424844]">Poes Garden, ECR, Anna Nagar, Velachery</p>
              <div className="text-[10px] text-emerald-700 font-bold">● 99.98% Uptime SLA</div>
            </div>

            <div className="bg-[#f5f3ef] p-4 rounded-xl border border-[#e4e2de] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#424844]">
                <span>Principals & RBAC Tiers</span>
                <Shield className="w-4 h-4 text-[#745b20]" />
              </div>
              <div className="text-2xl font-bold text-[#02150c]">48 <span className="text-xs font-normal text-gray-500 uppercase">Active Accts</span></div>
              <p className="text-[11px] text-[#424844]">8 Tier Levels · Strict Least Privilege</p>
              <div className="text-[10px] text-[#02150c] font-bold">Root: 2 Operators</div>
            </div>

            <div className="bg-[#f5f3ef] p-4 rounded-xl border border-[#e4e2de] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#424844]">
                <span>API & POS Stream</span>
                <Activity className="w-4 h-4 text-[#745b20]" />
              </div>
              <div className="text-2xl font-bold text-[#02150c]">18ms <span className="text-xs font-bold text-[#745b20] uppercase">Synchronized</span></div>
              <p className="text-[11px] text-[#424844]">Petpooja REST v2.4 + Webhook ingestion</p>
              <div className="text-[10px] text-emerald-700 font-bold">● 1,420 evt/min</div>
            </div>

            <div className="bg-[#f5f3ef] p-4 rounded-xl border border-[#e4e2de] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase text-[#424844]">
                <span>Global Security Posture</span>
                <Lock className="w-4 h-4 text-[#745b20]" />
              </div>
              <div className="text-2xl font-bold text-[#02150c]">100% <span className="text-xs font-bold text-[#745b20] uppercase">Compliant</span></div>
              <p className="text-[11px] text-[#424844]">Zero-Trust Architecture · Hardware 2FA</p>
              <div className="text-[10px] text-[#02150c] font-bold">SOC2 Type II Certified</div>
            </div>
          </div>
        </section>

        {/* Section 1: Multi-Outlet & Sanctuary Infrastructure Configuration */}
        <section className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Infrastructure Grid</span>
              <h2 className="text-xl font-serif font-bold text-[#02150c]">Multi-Outlet & Sanctuary Nodes</h2>
              <p className="text-xs text-[#424844]">Configure physical POS integration gateways, local failover servers, and edge table layouts.</p>
            </div>
            <button 
              onClick={() => setShowProvisionModal(true)}
              className="bg-[#02150c] hover:bg-[#152a20] text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition shadow cursor-pointer flex items-center space-x-1.5 self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Provision New Sanctuary Outlet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {outlets.map((outlet) => (
              <div key={outlet.id} className="p-5 bg-[#f5f3ef] rounded-2xl border border-[#e4e2de] space-y-4 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#02150c] text-[#e4c27d] flex items-center justify-center font-bold text-xs">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif font-bold text-[#02150c] text-base">{outlet.name}</h3>
                        <span className="text-[10px] bg-[#e4c27d] text-[#02150c] font-bold px-2 py-0.5 rounded">{outlet.badge}</span>
                      </div>
                      <div className="text-[11px] text-gray-500">{outlet.address}</div>
                      <div className="text-[10px] text-[#02150c] font-mono">Node ID: {outlet.nodeId}</div>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{outlet.status}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#e4e2de] text-xs">
                  <div><span className="text-gray-500 block text-[10px]">Inventory:</span><strong className="text-[#02150c]">{outlet.inventory}</strong></div>
                  <div><span className="text-gray-500 block text-[10px]">Gateway IP:</span><strong className="text-[#02150c] font-mono">{outlet.gatewayIp}</strong></div>
                  <div><span className="text-gray-500 block text-[10px]">Sync Drift:</span><strong className="text-[#745b20]">{outlet.syncDrift}</strong></div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleNodeAction(outlet.nodeId, 'schema')}
                      className="bg-white hover:bg-gray-100 text-[#02150c] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#e4e2de] transition cursor-pointer"
                    >
                      Sync Schema
                    </button>
                    <button 
                      onClick={() => handleNodeAction(outlet.nodeId, 'reboot')}
                      className="bg-white hover:bg-gray-100 text-[#02150c] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#e4e2de] transition cursor-pointer"
                    >
                      Reboot Stream
                    </button>
                  </div>

                  <button 
                    onClick={() => handleNodeAction(outlet.nodeId, 'edit')}
                    className="bg-[#152a20] hover:bg-[#02150c] text-white text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Edit Config</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: RBAC Matrix Governance & Master Permission Schema */}
        <section className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Access Control Architecture</span>
              <h2 className="text-xl font-serif font-bold text-[#02150c]">RBAC Master Capability Governance</h2>
              <p className="text-xs text-[#424844]">Cryptographically sealed capabilities matrix. Modify permissions per role tier; changes require confirmation with your master FIDO2 key.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={handleRevertRbacSchema}
                className="bg-[#f5f3ef] hover:bg-[#efeeea] text-[#02150c] text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl border border-[#e4e2de] transition cursor-pointer"
              >
                Revert Changes
              </button>
              <button 
                onClick={handleExportAuditManifest}
                className="bg-[#f5f3ef] hover:bg-[#efeeea] text-[#02150c] text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-xl border border-[#e4e2de] transition cursor-pointer"
              >
                Export Manifest
              </button>
              <button 
                onClick={handleCommitRbacSchema}
                className="bg-[#02150c] hover:bg-[#152a20] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition shadow cursor-pointer flex items-center space-x-1.5"
              >
                <Lock className="w-4 h-4 text-[#e4c27d]" />
                <span>Commit Schema Update</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-[#f5f3ef] rounded-2xl border border-[#e4e2de] p-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#efeeea] text-[#424844] font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Role Tier (Principal Class)</th>
                  <th className="py-3 px-2 text-center">Root System Config</th>
                  <th className="py-3 px-2 text-center">Database R/W</th>
                  <th className="py-3 px-2 text-center">Integration Tokens</th>
                  <th className="py-3 px-2 text-center">Financial Ledgers</th>
                  <th className="py-3 px-2 text-center">Biometrics & Staff</th>
                  <th className="py-3 px-2 text-center">KDS & Tables</th>
                  <th className="py-3 px-2 text-center">Guest PII Access</th>
                  <th className="py-3 px-2 text-center">Emergency Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e2de]">
                {rbacMatrix.map((row, idx) => (
                  <tr key={row.role} className="hover:bg-white transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#02150c]">{row.role}</div>
                      <div className="text-[10px] text-gray-500">{row.tier}</div>
                    </td>
                    {(['rootConfig', 'dbRw', 'tokens', 'ledgers', 'staff', 'kds', 'pii', 'override'] as const).map(field => (
                      <td key={field} className="py-3 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={row[field]}
                          disabled={row.disabled}
                          onChange={() => handleToggleRbacCheck(idx, field)}
                          className="w-4 h-4 accent-[#02150c] rounded cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Integration Connectors & API Keys */}
        <section className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Gateway Pipelines</span>
              <h2 className="text-xl font-serif font-bold text-[#02150c]">Integration Adapters & Ingestion Keys</h2>
              <p className="text-xs text-[#424844]">Live telemetry, POS event subscribers, IoT cold-chain endpoints, and settlement hooks.</p>
            </div>
            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">
              5 of 5 Connectors Healthy
            </span>
          </div>

          <div className="space-y-3">
            {/* Petpooja */}
            <div className="p-4 bg-[#f5f3ef] rounded-xl border border-[#e4e2de] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#02150c] text-white flex items-center justify-center font-bold text-xs">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-sm text-[#02150c]">Petpooja POS Cloud Bridge</span>
                    <span className="bg-[#efeeea] text-[#02150c] text-[10px] font-bold px-2 py-0.5 rounded uppercase">REST v2.4</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">14ms Polling</span>
                  </div>
                  <p className="text-xs text-[#424844] mt-1">
                    HMAC SHA-256 Webhook streaming live orders, table status, and bill generation across all 4 outlets. Token key expires in 18 days.
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleAdapterAction('petpooja', 'logs')}
                  className="bg-white hover:bg-gray-100 text-[#02150c] text-xs font-bold uppercase px-3 py-1.5 rounded-lg border border-[#e4e2de] transition cursor-pointer"
                >
                  Payload Logs
                </button>
                <button 
                  onClick={() => handleAdapterAction('petpooja', 'rotate')}
                  className="bg-[#02150c] hover:bg-[#152a20] text-white text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  Rotate Key
                </button>
              </div>
            </div>

            {/* Merchant Gateway */}
            <div className="p-4 bg-[#f5f3ef] rounded-xl border border-[#e4e2de] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#02150c] text-white flex items-center justify-center font-bold text-xs">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-sm text-[#02150c]">Razorpay & Pine Labs Settlement Pipe</span>
                    <span className="bg-[#efeeea] text-[#02150c] text-[10px] font-bold px-2 py-0.5 rounded uppercase">EDC & UPI Dual Gateway</span>
                  </div>
                  <p className="text-xs text-[#424844] mt-1">
                    Real-time transaction capture for VIP card machines and contactless table QR payments. Instant settlement ledger synchronization.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => handleAdapterAction('settlement', 'configure')}
                className="bg-[#02150c] hover:bg-[#152a20] text-white text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                Configure Webhook
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Cryptographic Root Audit Trail */}
        <section className="bg-white p-6 rounded-2xl border border-[#e4e2de] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#745b20] uppercase tracking-wider">Immutable Security Ledger</span>
              <h2 className="text-xl font-serif font-bold text-[#02150c]">Root System Audit Trail</h2>
              <p className="text-xs text-[#424844]">Cryptographically signed records of all administrative actions, key rotations, and structural mutations.</p>
            </div>
            <span className="text-xs text-gray-500 font-semibold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Streaming Live</span>
            </span>
          </div>

          <div className="overflow-x-auto bg-[#f5f3ef] rounded-2xl border border-[#e4e2de]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#efeeea] text-[#424844] font-bold uppercase">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor Principal</th>
                  <th className="py-3 px-4">Origin IP</th>
                  <th className="py-3 px-4">Action Summary</th>
                  <th className="py-3 px-4 text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e2de]">
                <tr className="hover:bg-white transition">
                  <td className="py-3.5 px-4 font-mono text-gray-500">Today, 14:32 IST</td>
                  <td className="py-3.5 px-4 font-bold text-[#02150c]">Dr. Anand Krishnamurthy <span className="text-gray-400 font-normal block text-[10px]">Super Admin (Primary)</span></td>
                  <td className="py-3.5 px-4 font-mono">103.21.144.82</td>
                  <td className="py-3.5 px-4">Updated Petpooja POS API secret token for Velachery Node</td>
                  <td className="py-3.5 px-4 text-right"><span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded">Verified (FIDO2)</span></td>
                </tr>
                <tr className="hover:bg-white transition">
                  <td className="py-3.5 px-4 font-mono text-gray-500">Today, 12:15 IST</td>
                  <td className="py-3.5 px-4 font-bold text-[#02150c]">Automated Cron Daemon <span className="text-gray-400 font-normal block text-[10px]">System Systemic</span></td>
                  <td className="py-3.5 px-4 font-mono">10.14.0.5 (Internal)</td>
                  <td className="py-3.5 px-4">Daily backup of guest reservation tables to encrypted cold vault (AES-256-GCM)</td>
                  <td className="py-3.5 px-4 text-right"><span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded">Success</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modal: Provision Tenant */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleProvisionSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#e4e2de]">
            <div className="flex items-center justify-between border-b border-[#e4e2de] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-[#745b20]">Node Onboarding</span>
                <h3 className="font-serif font-bold text-lg text-[#02150c]">Provision New Outlet Node</h3>
              </div>
              <button type="button" onClick={() => setShowProvisionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#424844] mb-1">Sanctuary Estate Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alwarpet Conservatory"
                  value={provisionForm.name}
                  onChange={(e) => setProvisionForm({ ...provisionForm, name: e.target.value })}
                  className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#424844] mb-1">Petpooja Node ID</label>
                  <input
                    type="text"
                    placeholder="PET-CH-005"
                    value={provisionForm.nodeId}
                    onChange={(e) => setProvisionForm({ ...provisionForm, nodeId: e.target.value })}
                    className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#424844] mb-1">Table Capacity</label>
                  <input
                    type="number"
                    value={provisionForm.tables}
                    onChange={(e) => setProvisionForm({ ...provisionForm, tables: e.target.value })}
                    className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#02150c] hover:bg-[#152a20] text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer"
              >
                Initialize Cluster
              </button>
              <button
                type="button"
                onClick={() => setShowProvisionModal(false)}
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
