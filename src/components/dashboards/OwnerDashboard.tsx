import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

interface OutletData {
  id: string;
  name: string;
  code: string;
  type: string;
  seats?: string;
  status: string;
  statusBg: string;
  statusText: string;
  seated: number;
  maxSeats: number;
  occupancy: string;
  revenue: string;
  syncLatency: string;
  gm: string;
  exceptionText: string;
  exceptionIcon: string;
  category: 'fine-dine' | 'coastal';
}

export const OwnerDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState('poes');
  const [activeCategory, setActiveCategory] = useState<'all' | 'fine-dine' | 'coastal'>('all');
  const [sec1, setSec1] = useState(164);
  const [sec2, setSec2] = useState(372);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('20:42 IST');
  
  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string; isSuccess: boolean }>({
    show: false,
    message: '',
    isSuccess: true,
  });

  // Modals state
  const [isDirectiveModalOpen, setIsDirectiveModalOpen] = useState(false);
  const [directiveTarget, setDirectiveTarget] = useState('All 4 Sanctuaries (Fleet-wide)');
  const [directivePriority, setDirectivePriority] = useState('Urgent Service Memo');
  const [directiveNotes, setDirectiveNotes] = useState('');

  // Escalations state
  const [escalations, setEscalations] = useState([
    {
      id: '1',
      location: 'Table 14 · Private Alcove (Poes Garden)',
      badge: 'VIP Patron',
      desc: 'Awaiting 2018 Domaine Leflaive Puligny-Montrachet decanting approval; delayed +7m.',
      timerId: 1,
      severity: 'high'
    },
    {
      id: '2',
      location: 'Veranda Pavilion 3 (ECR Coastal)',
      badge: 'Guest Request',
      desc: 'Air curtain thermal sensor draft reported at seating corner; Facilities notified.',
      timerId: 2,
      severity: 'normal'
    }
  ]);

  // SLA Countdowns
  useEffect(() => {
    const timer = setInterval(() => {
      setSec1((prev) => (prev > 0 ? prev - 1 : 0));
      setSec2((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const showToastNotification = (msg: string, isSuccess = true) => {
    setToast({ show: true, message: msg, isSuccess });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3600);
  };

  const handleSimulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} IST`;
      setLastSyncTime(timeStr);
      showToastNotification('Consolidated feeds re-synchronized with Petpooja POS in 12ms');
    }, 700);
  };

  const handleViewOutletDetail = (name: string) => {
    showToastNotification(`Opening Telemetry Console for: ${name}`);
  };

  const handleResolveEscalation = (id: string) => {
    setEscalations((prev) => prev.filter((e) => e.id !== id));
    showToastNotification(`Escalation #${id} acknowledged. Floor Captain & Head Sommelier dispatched.`);
  };

  const handleDownloadEODAudit = () => {
    showToastNotification('Compiling Consolidated FY24-Q3 EOD Dossier (PDF/XLSX)... Download begun.');
  };

  const handleAuthorizeBuyout = () => {
    showToastNotification('Buyout Token Validated: Poes Garden Conservatory reserved for Friday Gala.');
  };

  const handleSubmitDirective = () => {
    setIsDirectiveModalOpen(false);
    showToastNotification(`Directive dispatched to ${directiveTarget}`);
    setDirectiveNotes('');
  };

  const outlets: OutletData[] = [
    {
      id: 'poes',
      name: 'Poes Garden Flagship',
      code: 'PG',
      type: 'Heritage Conservatory · 94 Seats',
      status: 'Peak Service',
      statusBg: 'bg-primary-fixed text-on-primary-fixed-variant',
      statusText: 'bg-primary-container',
      seated: 88,
      maxSeats: 94,
      occupancy: '(93.6%)',
      revenue: '₹1,84,400',
      syncLatency: 'Local Sync 11ms',
      gm: 'Raghavan Iyer',
      exceptionText: 'Sommelier Tasting Table 4 VIP',
      exceptionIcon: 'info',
      category: 'fine-dine'
    },
    {
      id: 'ecr',
      name: 'Palavakkam ECR',
      code: 'EC',
      type: 'Coastal Pavilion & Cellar · 120 Seats',
      status: 'Optimal Turn',
      statusBg: 'bg-primary-fixed text-on-primary-fixed-variant',
      statusText: 'bg-primary-container',
      seated: 102,
      maxSeats: 120,
      occupancy: '(85.0%)',
      revenue: '₹1,62,180',
      syncLatency: 'Local Sync 16ms',
      gm: 'Subramaniam V.',
      exceptionText: 'Wagyu Tenderloin Low (3 units)',
      exceptionIcon: 'inventory_2',
      category: 'coastal'
    },
    {
      id: 'anna',
      name: 'Anna Nagar East',
      code: 'AN',
      type: 'Glasshouse Bistro · 76 Seats',
      status: 'Steady Service',
      statusBg: 'bg-surface-container-high text-on-surface-variant',
      statusText: 'bg-on-surface-variant',
      seated: 56,
      maxSeats: 76,
      occupancy: '(73.6%)',
      revenue: '₹84,320',
      syncLatency: 'Local Sync 14ms',
      gm: 'Meenakshi Sundaram',
      exceptionText: 'Operations Nominal',
      exceptionIcon: 'check_circle',
      category: 'fine-dine'
    },
    {
      id: 'velachery',
      name: 'Velachery Lakeside',
      code: 'VL',
      type: 'Botanical Courtyard · 70 Seats',
      status: 'Shift Rotation',
      statusBg: 'bg-secondary-container text-on-secondary-container',
      statusText: 'bg-secondary',
      seated: 48,
      maxSeats: 70,
      occupancy: '(68.5%)',
      revenue: '₹55,320',
      syncLatency: 'Local Sync 18ms',
      gm: 'Kavitha Nair',
      exceptionText: 'Operations Nominal',
      exceptionIcon: 'check_circle',
      category: 'fine-dine'
    }
  ];

  const filteredOutlets = outlets.filter((o) => {
    if (activeCategory === 'all') return true;
    return o.category === activeCategory;
  });

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Header Bar */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(21,42,32,0.04)]">
        <div className="h-20 w-full px-space-md lg:px-margin-desktop flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-secondary flex items-center justify-center font-title-editorial text-xl font-bold shadow-inner">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-title-editorial text-title-editorial text-primary tracking-tight font-semibold leading-none">Mayflower</span>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mt-1">Sanctuaries · Chennai</span>
              </div>
            </div>

            <div className="hidden xl:flex items-center bg-surface-container px-space-sm py-1.5 rounded gap-space-xs">
              <span className="font-caption text-caption text-on-surface-variant font-medium">Sanctuary:</span>
              <select
                value={selectedSanctuary}
                onChange={(e) => setSelectedSanctuary(e.target.value)}
                className="bg-transparent font-caption text-caption font-semibold text-primary focus:outline-none cursor-pointer pr-space-xs"
              >
                <option value="poes">Poes Garden Flagship</option>
                <option value="ecr">Palavakkam ECR</option>
                <option value="anna">Anna Nagar East</option>
                <option value="velachery">Velachery Lakeside</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-caption text-caption text-on-surface-variant">Petpooja POS</span>
              <span className="font-label-caps text-label-caps text-secondary font-bold uppercase">Live Sync</span>
            </div>

            <div className="flex items-center gap-space-sm bg-surface-container px-space-sm py-1 rounded">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold hidden md:inline">Active Role</span>
              <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-primary-container text-on-primary font-bold uppercase">
                {user.role ? user.role.toUpperCase() : 'OWNER'}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
                {user.name ? user.name[0].toUpperCase() : 'O'}
              </div>
              <button
                onClick={onLogout}
                className="text-caption text-error hover:underline font-label-caps uppercase ml-1 cursor-pointer"
                title="Logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Role Sub-Navigation Menu */}
        <div className="w-full bg-surface-container-low px-space-md lg:px-margin-desktop overflow-x-auto shadow-[0_1px_4px_rgba(21,42,32,0.02)]">
          <nav className="flex items-center gap-space-xs py-2 whitespace-nowrap min-w-max">
            <button
              className="px-space-sm py-1.5 transition-all bg-primary-container text-on-primary font-semibold rounded shadow-sm font-label-caps uppercase cursor-pointer"
            >
              Owner & Multi-Outlet
            </button>
            {user.role === 'SuperAdmin' && (
              <>
                <button
                  onClick={() => onSwitchRole?.('admin-suite')}
                  className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all uppercase cursor-pointer"
                >
                  System Admin
                </button>
                <button
                  onClick={() => onSwitchRole?.('manager-operations')}
                  className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all uppercase cursor-pointer"
                >
                  Floor Operations
                </button>
                <button
                  onClick={() => onSwitchRole?.('chef-kitchen')}
                  className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all uppercase cursor-pointer"
                >
                  Kitchen & HACCP
                </button>
                <button
                  onClick={() => onSwitchRole?.('hr-roster')}
                  className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all uppercase cursor-pointer"
                >
                  Staffing & HR
                </button>
                <button
                  onClick={() => onSwitchRole?.('accountant-ledger')}
                  className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all uppercase cursor-pointer"
                >
                  POS Reconciliation
                </button>
                <button
                  onClick={() => onSwitchRole?.('customer-portal')}
                  className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all uppercase cursor-pointer"
                >
                  VIP Guest Suite
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Main Operations View */}
      <main className="w-full pt-28 bg-background min-h-[calc(100vh-140px)] pb-16">
        <div className="flex flex-col w-full">
          <div className="w-full px-space-md lg:px-margin-desktop py-space-xl flex flex-col gap-space-2xl">
            
            {/* Executive Briefing & Live Clock Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-2xs">
                <div className="flex items-center gap-space-xs text-secondary font-label-caps text-label-caps tracking-widest uppercase">
                  <span className="inline-block w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                  <span>Enterprise Executive Cockpit · Live Telemetry</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Consolidated Operations Overview</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl">
                  Real-time transactional audit across 4 Chennai flagship sanctuaries. Data synced with on-premise Petpooja POS nodes, cellar IoT sensors, and table turn beacons.
                </p>
              </div>
              <div className="flex items-center gap-space-sm self-start md:self-auto">
                <div className="bg-surface-container-low px-space-md py-space-xs rounded flex flex-col items-end">
                  <span className="font-caption text-caption text-on-surface-variant">Live Financial Batch</span>
                  <span className="font-label-numeric text-label-numeric text-primary font-bold">FY24-Q3 · {lastSyncTime}</span>
                </div>
                <button
                  onClick={handleSimulateRefresh}
                  className="flex items-center gap-space-xs bg-primary-container text-on-primary px-space-md py-2.5 rounded font-label-caps text-label-caps tracking-wider uppercase shadow-sm hover:bg-primary transition-all cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[16px] transition-transform duration-700 ${isRefreshing ? 'rotate-180' : ''}`}>
                    sync
                  </span>
                  <span>Refresh Feeds</span>
                </button>
              </div>
            </div>

            {/* Section 1: KPI Command Matrix with Inline Sparklines */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
              {/* Metric 1: Gross Revenue */}
              <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Gross Daily Revenue</span>
                    <span className="font-headline-md text-headline-md text-primary font-semibold mt-1">₹4,86,220</span>
                  </div>
                  <span className="p-2 bg-surface-container text-secondary rounded">
                    <span className="material-symbols-outlined text-[20px]">currency_rupee</span>
                  </span>
                </div>
                <div className="mt-space-md flex items-center justify-between">
                  <div className="flex items-center gap-1 text-on-primary-fixed-variant bg-primary-fixed px-2 py-0.5 rounded font-label-numeric text-caption font-semibold">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    <span>+18.4% vs lw</span>
                  </div>
                  <svg className="w-24 h-7 text-secondary" viewBox="0 0 100 30" fill="none">
                    <path d="M0 24 Q 25 22, 45 14 T 80 8 T 100 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  </svg>
                </div>
                <span className="font-caption text-caption text-on-surface-variant mt-2">Target: ₹4,50,000 · 108.0% pacing</span>
              </div>

              {/* Metric 2: Covers & Avg Spend */}
              <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Covers Billed / Avg Spend</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-headline-md text-headline-md text-primary font-semibold">294</span>
                      <span className="font-body-sm text-body-sm text-secondary font-medium">/ ₹1,653 cover</span>
                    </div>
                  </div>
                  <span className="p-2 bg-surface-container text-primary rounded">
                    <span className="material-symbols-outlined text-[20px]">groups</span>
                  </span>
                </div>
                <div className="mt-space-md flex items-center justify-between">
                  <span className="font-caption text-caption text-on-surface-variant">Live Occupancy: 81.6%</span>
                  <div className="w-24 bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-primary-container h-full rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <span className="font-caption text-caption text-on-surface-variant mt-2">Peak seating window: 20:00 - 22:30</span>
              </div>

              {/* Metric 3: Blended Margin & Petpooja Sync */}
              <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Blended Gross Margin</span>
                    <span className="font-headline-md text-headline-md text-primary font-semibold mt-1">71.8%</span>
                  </div>
                  <span className="p-2 bg-surface-container text-secondary rounded">
                    <span className="material-symbols-outlined text-[20px]">analytics</span>
                  </span>
                </div>
                <div className="mt-space-md flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    <span className="font-caption text-caption text-on-surface font-medium">Petpooja API 14ms</span>
                  </div>
                  <span className="font-label-numeric text-caption text-on-surface-variant">Cost: 28.2%</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant mt-2">Wine & Beverage contribution +4.2%</span>
              </div>

              {/* Metric 4: RevPASH & Table Turns */}
              <div className="bg-surface-container-lowest p-space-lg rounded shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border border-surface-container">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">RevPASH Efficiency</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      <span className="font-headline-md text-headline-md text-primary font-semibold">₹420</span>
                      <span className="font-caption text-caption text-on-surface-variant">/ seat-hr</span>
                    </div>
                  </div>
                  <span className="p-2 bg-surface-container text-primary rounded">
                    <span className="material-symbols-outlined text-[20px]">timelapse</span>
                  </span>
                </div>
                <div className="mt-space-md flex items-center justify-between">
                  <span className="font-caption text-caption text-on-surface-variant">Table Turn Ratio</span>
                  <span className="font-label-numeric text-label-numeric text-primary font-semibold">2.34x turns</span>
                </div>
                <span className="font-caption text-caption text-on-surface-variant mt-2">Avg Table Dwell Time: 78 minutes</span>
              </div>
            </div>

            {/* Section 2: Multi-Outlet Real-time Matrix */}
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary">Multi-Sanctuary Live Matrix</h2>
                  <p class="font-body-sm text-body-sm text-on-surface-variant">Comparative telemetry across 4 estate locations in Chennai Metro & Coast</p>
                </div>
                <div className="flex items-center gap-space-xs self-start">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`px-space-sm py-1 rounded font-label-caps text-label-caps uppercase transition-colors cursor-pointer ${
                      activeCategory === 'all'
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    All Locations (4)
                  </button>
                  <button
                    onClick={() => setActiveCategory('fine-dine')}
                    className={`px-space-sm py-1 rounded font-label-caps text-label-caps uppercase transition-colors cursor-pointer ${
                      activeCategory === 'fine-dine'
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    Fine Dine
                  </button>
                  <button
                    onClick={() => setActiveCategory('coastal')}
                    className={`px-space-sm py-1 rounded font-label-caps text-label-caps uppercase transition-colors cursor-pointer ${
                      activeCategory === 'coastal'
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    Coastal Lounge
                  </button>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded shadow-sm overflow-x-auto border border-surface-container">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                    <tr>
                      <th className="py-space-md px-space-lg">Sanctuary & Type</th>
                      <th className="py-space-md px-space-md">Operational Status</th>
                      <th className="py-space-md px-space-md">Seated / Max Capacity</th>
                      <th className="py-space-md px-space-md">In-Flight Revenue</th>
                      <th className="py-space-md px-space-md">Petpooja POS Node</th>
                      <th className="py-space-md px-space-md">General Manager On Duty</th>
                      <th className="py-space-md px-space-md">Active Exception</th>
                      <th className="py-space-md px-space-lg text-right">Sanctuary Console</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-sm text-body-sm text-on-surface">
                    {filteredOutlets.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={`hover:bg-surface-container-low/60 transition-colors ${
                          idx % 2 === 1 ? 'bg-surface-container-low/30' : ''
                        }`}
                      >
                        <td className="py-space-md px-space-lg">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-8 h-8 rounded bg-primary-container text-on-primary flex items-center justify-center font-title-editorial text-caption font-bold">
                              {item.code}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-title-editorial text-title-editorial text-primary font-semibold">{item.name}</span>
                              <span className="font-caption text-caption text-on-surface-variant">{item.type}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md">
                          <span className={`inline-flex items-center gap-1.5 px-space-xs py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold ${item.statusBg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.statusText}`}></span> {item.status}
                          </span>
                        </td>
                        <td className="py-space-md px-space-md">
                          <div className="flex items-center gap-2">
                            <span className="font-label-numeric text-label-numeric font-bold text-primary">{item.seated}</span>
                            <span className="text-on-surface-variant">/ {item.maxSeats}</span>
                            <span className="text-caption text-on-surface-variant font-medium">{item.occupancy}</span>
                          </div>
                        </td>
                        <td className="py-space-md px-space-md font-label-numeric text-label-numeric text-primary font-semibold">
                          {item.revenue}
                        </td>
                        <td className="py-space-md px-space-md">
                          <span className="inline-flex items-center gap-1 text-caption text-secondary font-medium">
                            <span className="material-symbols-outlined text-[15px]">cloud_done</span> {item.syncLatency}
                          </span>
                        </td>
                        <td className="py-space-md px-space-md">
                          <span className="font-caption text-body-sm text-on-surface">{item.gm}</span>
                        </td>
                        <td className="py-space-md px-space-md">
                          <span className="inline-flex items-center gap-1 text-caption text-on-surface-variant">
                            <span className="material-symbols-outlined text-[15px] text-secondary">{item.exceptionIcon}</span> {item.exceptionText}
                          </span>
                        </td>
                        <td className="py-space-md px-space-lg text-right">
                          <button
                            onClick={() => handleViewOutletDetail(item.name)}
                            className="px-space-sm py-1 rounded bg-surface-container text-primary font-label-caps text-label-caps uppercase hover:bg-primary hover:text-on-primary transition-all cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 3 & 4: Two Column Grid (Guest Sentiment Barometer & Strategic Cellar Depletion) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
              
              {/* Left Column: Guest Sentiment & Escalation SLA (7 cols) */}
              <div className="lg:col-span-7 bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col gap-space-lg border border-surface-container">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Real-time Guest Pulse</span>
                    <h3 className="font-headline-sm text-headline-sm text-primary">Sentiment & Escalation Barometer</h3>
                  </div>
                  <div className="flex items-center gap-2 bg-surface-container-low px-space-sm py-1 rounded">
                    <span className="font-headline-md text-headline-md font-bold text-primary">94</span>
                    <span className="font-caption text-caption text-on-surface-variant">/ 100 NPS</span>
                  </div>
                </div>

                {/* Sentiment Dimension Pills */}
                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="px-3 py-1 bg-surface-container text-primary rounded-full font-caption text-caption flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Botanical Ambiance 98%
                  </span>
                  <span className="px-3 py-1 bg-surface-container text-primary rounded-full font-caption text-caption flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Single Origin Cold-Drip 96%
                  </span>
                  <span className="px-3 py-1 bg-surface-container text-primary rounded-full font-caption text-caption flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Fermented Sourdough 95%
                  </span>
                  <span className="px-3 py-1 bg-surface-container text-primary rounded-full font-caption text-caption flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Acoustic Decibel Pacing 91%
                  </span>
                </div>

                {/* Live Escalations Queue with SLA Countdown */}
                <div className="flex flex-col gap-space-xs pt-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      Unresolved Floor Escalations ({escalations.length} active)
                    </span>
                    <span className="font-caption text-caption text-secondary font-medium">Executive Response SLA: ≤ 10 mins</span>
                  </div>
                  
                  <div className="flex flex-col gap-space-xs">
                    {escalations.map((esc) => (
                      <div
                        key={esc.id}
                        className="p-space-md bg-surface-container-low rounded flex flex-col md:flex-row md:items-center justify-between gap-space-sm"
                      >
                        <div className="flex items-start gap-space-sm">
                          <span className={`p-2 rounded-full mt-0.5 ${esc.severity === 'high' ? 'bg-error-container text-error' : 'bg-surface-container text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-[18px]">
                              {esc.severity === 'high' ? 'priority_high' : 'ac_unit'}
                            </span>
                          </span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-body-sm text-body-sm text-primary font-bold">{esc.location}</span>
                              <span className="font-label-caps text-caption text-secondary uppercase font-semibold">{esc.badge}</span>
                            </div>
                            <span className="font-caption text-caption text-on-surface-variant">{esc.desc}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-space-sm self-end md:self-auto">
                          <div className="text-right">
                            <span className={`font-label-numeric text-label-numeric font-bold block ${esc.severity === 'high' ? 'text-error' : 'text-secondary'}`}>
                              {esc.timerId === 1 ? formatTime(sec1) : formatTime(sec2)}
                            </span>
                            <span className="font-caption text-[10px] text-on-surface-variant uppercase">
                              {esc.severity === 'high' ? 'SLA Breaches' : 'SLA Window'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleResolveEscalation(esc.id)}
                            className={`px-space-sm py-1.5 rounded font-label-caps text-label-caps uppercase transition-colors cursor-pointer ${
                              esc.severity === 'high'
                                ? 'bg-primary-container text-on-primary hover:bg-primary'
                                : 'bg-surface-container text-primary hover:bg-surface-container-high'
                            }`}
                          >
                            {esc.severity === 'high' ? 'Intervene' : 'Acknowledge'}
                          </button>
                        </div>
                      </div>
                    ))}
                    {escalations.length === 0 && (
                      <div className="p-space-md bg-surface-container-low rounded text-center text-caption text-on-surface-variant font-medium">
                        ✓ All floor escalations resolved. Operational status nominal.
                      </div>
                    )}
                  </div>
                </div>

                {/* Visual Estate Mood Snapshot */}
                <div className="relative w-full h-44 rounded overflow-hidden mt-space-xs">
                  <img
                    alt="Sophisticated evening service at Mayflower fine dining room"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent flex items-end p-space-md">
                    <div className="flex items-center justify-between w-full text-on-primary">
                      <div className="flex flex-col">
                        <span className="font-label-caps text-label-caps uppercase text-secondary-fixed">Sommelier & Service Directives</span>
                        <span className="font-title-editorial text-title-editorial">Evening Session 2 Acoustic Pacing: 62dB target</span>
                      </div>
                      <span className="font-caption text-caption px-2 py-1 rounded bg-surface-container/20 backdrop-blur-md">Auto-Monitored</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Cellar Depletion & High-Value Allocations (5 cols) */}
              <div className="lg:col-span-5 bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col gap-space-lg border border-surface-container">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Cellar & Larder Allocation</span>
                    <h3 className="font-headline-sm text-headline-sm text-primary">High-Value Depletion</h3>
                  </div>
                  <span className="material-symbols-outlined text-secondary text-2xl">wine_bar</span>
                </div>

                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  IoT smart cellar bottle weight scales and sub-zero locker inventory linked directly to tonight's tasting allocations.
                </p>

                {/* Critical Item Progress Cards */}
                <div className="flex flex-col gap-space-md">
                  {/* Item 1 */}
                  <div className="flex flex-col gap-space-2xs p-space-sm bg-surface-container-low rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-title-editorial text-title-editorial text-primary">Château Margaux Premier Grand Cru (2015)</span>
                      <span className="font-label-numeric text-label-numeric font-bold text-secondary">2 Bottles Left</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                      <span>Palavakkam Reserve Cellar · BIN 410</span>
                      <span className="text-error font-medium">Burn Rate: 3 btl/night</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex flex-col gap-space-2xs p-space-sm bg-surface-container-low rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-title-editorial text-title-editorial text-primary">Japanese A5 Miyazaki Striploin</span>
                      <span className="font-label-numeric text-label-numeric font-bold text-secondary">3.4 kg Stock</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary-container h-full rounded-full" style={{ width: '38%' }}></div>
                    </div>
                    <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                      <span>Anna Nagar Sub-Zero 02 · 14 portions rem.</span>
                      <span>Reorder trigger at 2.5 kg</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex flex-col gap-space-2xs p-space-sm bg-surface-container-low rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-title-editorial text-title-editorial text-primary">Périgord Black Winter Truffles</span>
                      <span className="font-label-numeric text-label-numeric font-bold text-primary">420 grams</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary-container h-full rounded-full" style={{ width: '70%' }}></div>
                    </div>
                    <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                      <span>Poes Garden Culinary Vault</span>
                      <span>Nominal for 2 more evenings</span>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="flex flex-col gap-space-2xs p-space-sm bg-surface-container-low rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-title-editorial text-title-editorial text-primary">Dom Pérignon Vintage Rosé (2008)</span>
                      <span className="font-label-numeric text-label-numeric font-bold text-secondary">4 Bottles Left</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: '33%' }}></div>
                    </div>
                    <div className="flex items-center justify-between font-caption text-caption text-on-surface-variant">
                      <span>Velachery Lakeside Cellar</span>
                      <span className="text-error font-medium">1 Reserved for Buyout</span>
                    </div>
                  </div>
                </div>

                <div className="p-space-md bg-surface-container rounded flex items-center justify-between">
                  <div className="flex items-center gap-space-xs text-primary font-caption text-caption font-semibold">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                    <span>Cellar Temperature & Humidity Variance: 0.1°C / Nominal</span>
                  </div>
                  <button
                    onClick={() => showToastNotification('Fetching Cellar Auditor Logs... Variance strictly within limits.')}
                    className="font-label-caps text-label-caps text-secondary underline uppercase font-bold cursor-pointer"
                  >
                    Auditor Log
                  </button>
                </div>
              </div>
            </div>

            {/* Section 5: Owner Action Center & Executive Directives */}
            <div className="bg-surface-container-lowest p-space-xl rounded shadow-sm flex flex-col gap-space-lg border border-surface-container">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Executive Authority</span>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Owner Action Center & Directives</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">One-tap administrative controls for instant dispatch across Chennai sanctuary managers</p>
                </div>
                <div className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-primary">security</span>
                  <span>Encrypted with Biometric Enterprise Token</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* Action Card 1: EOD Audit Export */}
                <div className="p-space-lg bg-surface-container-low rounded flex flex-col justify-between gap-space-md hover:bg-surface-container transition-colors border border-surface-container-high">
                  <div className="flex items-start gap-space-sm">
                    <span className="p-2.5 bg-surface-container text-primary rounded">
                      <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-title-editorial text-title-editorial text-primary font-semibold">Consolidated EOD Audit</span>
                      <span className="font-caption text-caption text-on-surface-variant mt-1">
                        Compile all Petpooja z-reports, merchant settlement slips, and GST schedules for all 4 outlets.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadEODAudit}
                    className="w-full py-2.5 bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary font-label-caps text-label-caps uppercase rounded tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download Audit Dossier</span>
                  </button>
                </div>

                {/* Action Card 2: Special VIP Buyout Authorization */}
                <div className="p-space-lg bg-surface-container-low rounded flex flex-col justify-between gap-space-md hover:bg-surface-container transition-colors border border-surface-container-high">
                  <div className="flex items-start gap-space-sm">
                    <span className="p-2.5 bg-secondary-container text-on-secondary-container rounded">
                      <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-title-editorial text-title-editorial text-primary font-semibold">Authorize VIP Buyout</span>
                      <span className="font-caption text-caption text-on-surface-variant mt-1">
                        Approve private estate closure request for Poes Garden Conservatory (Friday Gala, ₹12.5L minimum spend).
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleAuthorizeBuyout}
                    className="w-full py-2.5 bg-primary-container text-on-primary hover:bg-primary font-label-caps text-label-caps uppercase rounded tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">lock_open</span>
                    <span>Grant Executive Approval</span>
                  </button>
                </div>

                {/* Action Card 3: Broadcast Directive */}
                <div className="p-space-lg bg-surface-container-low rounded flex flex-col justify-between gap-space-md hover:bg-surface-container transition-colors border border-surface-container-high">
                  <div className="flex items-start gap-space-sm">
                    <span className="p-2.5 bg-surface-container text-secondary rounded">
                      <span className="material-symbols-outlined text-[24px]">campaign</span>
                    </span>
                    <div className="flex flex-col">
                      <span className="font-title-editorial text-title-editorial text-primary font-semibold">Broadcast Directive</span>
                      <span className="font-caption text-caption text-on-surface-variant mt-1">
                        Instantly push a service, sommelier pairing, or decor advisory directly to floor managers' handheld POS tablets.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDirectiveModalOpen(true)}
                    className="w-full py-2.5 bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-primary font-label-caps text-label-caps uppercase rounded tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">send</span>
                    <span>Dispatch Directive</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Interactive Modal Drawer: Executive Directive */}
      {isDirectiveModalOpen && (
        <div className="fixed inset-0 bg-primary/60 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest max-w-lg w-full p-space-xl rounded-lg shadow-xl flex flex-col gap-space-md border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Executive Broadcast</span>
                <h4 className="font-headline-sm text-headline-sm text-primary">Push Operational Directive</h4>
              </div>
              <button
                onClick={() => setIsDirectiveModalOpen(false)}
                className="text-on-surface-variant hover:text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Target Sanctuary Nodes</label>
              <select
                value={directiveTarget}
                onChange={(e) => setDirectiveTarget(e.target.value)}
                className="w-full p-2.5 bg-surface-container-low rounded font-body-sm text-body-sm text-on-surface focus:outline-none border border-surface-container-high"
              >
                <option>All 4 Sanctuaries (Fleet-wide)</option>
                <option>Poes Garden Flagship Only</option>
                <option>Palavakkam ECR Only</option>
                <option>Anna Nagar East Only</option>
                <option>Velachery Lakeside Only</option>
              </select>
            </div>

            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Priority Level</label>
              <div className="flex items-center gap-space-sm">
                <label className="flex items-center gap-2 font-caption text-caption cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={directivePriority === 'Urgent Service Memo'}
                    onChange={() => setDirectivePriority('Urgent Service Memo')}
                    className="accent-primary-container"
                  />
                  Urgent Service Memo
                </label>
                <label className="flex items-center gap-2 font-caption text-caption cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={directivePriority === 'Sommelier Pairing Shift'}
                    onChange={() => setDirectivePriority('Sommelier Pairing Shift')}
                    className="accent-primary-container"
                  />
                  Sommelier Pairing Shift
                </label>
                <label className="flex items-center gap-2 font-caption text-caption cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={directivePriority === 'HACCP Advisory'}
                    onChange={() => setDirectivePriority('HACCP Advisory')}
                    className="accent-primary-container"
                  />
                  HACCP Advisory
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-space-xs">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Directive Notes</label>
              <textarea
                value={directiveNotes}
                onChange={(e) => setDirectiveNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Ensure reserve decanters are aerated 45 minutes prior to 9 PM seating..."
                className="w-full p-space-sm bg-surface-container-low rounded font-body-sm text-body-sm text-on-surface focus:outline-none border border-surface-container-high"
              />
            </div>

            <div className="flex items-center justify-end gap-space-sm pt-space-xs">
              <button
                onClick={() => setIsDirectiveModalOpen(false)}
                className="px-space-md py-2 font-label-caps text-label-caps text-on-surface-variant uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDirective}
                className="px-space-md py-2 bg-primary-container text-on-primary font-label-caps text-label-caps uppercase rounded hover:bg-primary transition-all cursor-pointer"
              >
                Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast Container */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary-container text-on-primary px-space-lg py-space-md rounded shadow-lg flex items-center gap-space-sm transform transition-all duration-300 animate-bounce">
          <span className="material-symbols-outlined text-[20px] text-secondary-fixed">
            {toast.isSuccess ? 'check_circle' : 'info'}
          </span>
          <span className="font-body-sm text-body-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest py-space-2xl border-t border-surface-container">
        <div className="w-full px-space-md lg:px-margin-desktop">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg pb-space-lg border-b border-surface-container-low">
            <div className="flex flex-col gap-space-2xs">
              <span className="font-title-editorial text-title-editorial text-primary font-semibold">Mayflower Sanctuaries</span>
              <span className="font-caption text-caption text-on-surface-variant">Haute Gastronomy Enterprise Resource & Guest Experience Infrastructure · Chennai Flagships</span>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Switch Access Role:</span>
              <div className="flex flex-wrap gap-space-2xs">
                <button
                  onClick={() => onSwitchRole?.('owner-management')}
                  className="px-2 py-1 bg-primary-container text-on-primary font-caption text-caption rounded font-semibold cursor-pointer"
                >
                  Owner
                </button>
                <button
                  onClick={() => onSwitchRole?.('admin-suite')}
                  className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Admin
                </button>
                <button
                  onClick={() => onSwitchRole?.('manager-operations')}
                  className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Manager
                </button>
                <button
                  onClick={() => onSwitchRole?.('chef-kitchen')}
                  className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Chef
                </button>
                <button
                  onClick={() => onSwitchRole?.('hr-roster')}
                  className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  HR
                </button>
                <button
                  onClick={() => onSwitchRole?.('accountant-ledger')}
                  className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  Accountant
                </button>
                <button
                  onClick={() => onSwitchRole?.('customer-portal')}
                  className="px-2 py-1 bg-secondary-container text-on-secondary-container font-caption text-caption rounded font-semibold cursor-pointer"
                >
                  VIP Guest
                </button>
              </div>
            </div>
          </div>
          <div className="pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-sm text-caption font-caption text-on-surface-variant">
            <div className="flex items-center gap-space-md">
              <span className="flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-container"></span> Petpooja REST API v2.4 (Active 14ms)
              </span>
              <span>SOC2 Type II Certified</span>
              <span>Chennai GSTIN Compliant</span>
            </div>
            <div>© {new Date().getFullYear()} Mayflower Hospitality Group India LLP. All Privileges Reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
