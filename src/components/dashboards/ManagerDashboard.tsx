import React, { useState } from 'react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

interface ReservationItem {
  id: string;
  ref: string;
  guestName: string;
  badge?: string;
  badgeBg?: string;
  guests: number;
  time: string;
  area: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled';
  statusLabel: string;
  statusBg: string;
  table?: string;
  pref?: string;
  tags?: string[];
  courseInfo?: string;
  note?: string;
}

export const ManagerDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState('poes');
  const [activeQueueTab, setActiveQueueTab] = useState<'all' | 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled'>('all');
  
  // Modals & Toast State
  const [isWalkinModalOpen, setIsWalkinModalOpen] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinSize, setWalkinSize] = useState('2 Guests');
  const [walkinZone, setWalkinZone] = useState('The Conservatory (Table C3)');
  const [walkinNotes, setWalkinNotes] = useState('');

  const [inspectTableInfo, setInspectTableInfo] = useState<string | null>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // Reservation pipeline data state
  const [reservations, setReservations] = useState<ReservationItem[]>([
    {
      id: 'res-1',
      ref: '#MF-7729',
      guestName: 'Dr. Kalanithi Maran',
      badge: 'VIP Patron',
      badgeBg: 'bg-secondary/15 text-secondary',
      guests: 4,
      time: 'Today, 1:15 PM (In 20m)',
      area: 'Poes Conservatory Bay',
      status: 'pending',
      statusLabel: 'Pending Manager Review',
      statusBg: 'bg-amber-100 text-amber-900',
      table: 'Table Unassigned',
      pref: 'Prefers Quiet Alcove',
      tags: ['No Shellfish', 'Vintage Champagne Pairing', 'Anniversary Protocol'],
    },
    {
      id: 'res-2',
      ref: '#MF-8103',
      guestName: 'Ananya & Siddharth Rao',
      badge: 'Standard Guest',
      badgeBg: 'bg-surface-container text-on-surface-variant',
      guests: 2,
      time: 'Today, 1:30 PM',
      area: 'Verandah Garden',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      statusBg: 'bg-emerald-100 text-emerald-900',
      table: 'Table V2',
      pref: 'Locked by Captain Vignesh',
      tags: ['Vegetarian Degustation', 'No Alliums (Jain)'],
    },
    {
      id: 'res-3',
      ref: '#MF-6691',
      guestName: 'Sundaram Estate Group (Hosted by Rajiv)',
      badge: 'Corporate Host',
      badgeBg: 'bg-secondary/15 text-secondary',
      guests: 6,
      time: 'Seated 12:28 PM (44m)',
      area: 'Table G3 (Glasshouse Center)',
      status: 'seated',
      statusLabel: 'Seated · Active',
      statusBg: 'bg-primary-container text-on-primary',
      table: 'Course 3 of 7 Fired',
      pref: 'POS KOT #4029',
      courseInfo: 'Pan-seared Bay of Bengal Black Bass, Curry Leaf Emulsion',
    },
    {
      id: 'res-4',
      ref: '#MF-8114',
      guestName: 'Meera Chandran',
      badge: 'Club 100',
      badgeBg: 'bg-secondary/15 text-secondary',
      guests: 2,
      time: 'Today, 2:00 PM',
      area: 'Conservatory Window',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      statusBg: 'bg-emerald-100 text-emerald-900',
      table: 'Table C1',
      pref: 'Bespoke Floral Placed',
      note: 'Birthday celebration; prefers chilled sparkling water on arrival',
    },
  ]);

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleSyncPos = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Synchronizing Petpooja REST Gateway... 14ms latency OK.');
    }, 800);
  };

  const handleApprove = (id: string, assignedTable: string) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'confirmed',
            statusLabel: 'Confirmed',
            statusBg: 'bg-emerald-100 text-emerald-900',
            table: `Table ${assignedTable}`,
          };
        }
        return r;
      })
    );
    showToast(`Reservation Approved & Locked to Table ${assignedTable}. Synced with Petpooja.`);
  };

  const handleSeatGuest = (id: string, table: string) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'seated',
            statusLabel: 'Seated · Active',
            statusBg: 'bg-primary-container text-on-primary',
          };
        }
        return r;
      })
    );
    showToast(`Guest seated at ${table}. Opening KOT ledger...`);
  };

  const handleCompleteService = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'completed',
            statusLabel: 'Completed',
            statusBg: 'bg-surface-container text-primary',
          };
        }
        return r;
      })
    );
    showToast('Service completed. Table flagged for turnover inspection.');
  };

  const handleNoShow = (id: string) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: 'cancelled',
            statusLabel: 'No-Show',
            statusBg: 'bg-rose-100 text-error',
          };
        }
        return r;
      })
    );
    showToast('Booking marked as No-Show. Table released to Walk-in pool.');
  };

  const handleDecline = (id: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    showToast('Reservation rejected & notification dispatched to concierge.');
  };

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsWalkinModalOpen(false);
    showToast(`Walk-in for ${walkinName || 'Guest'} seated successfully. KOT terminal initialized.`);
    setWalkinName('');
    setWalkinNotes('');
  };

  const filteredReservations = reservations.filter((r) => {
    if (activeQueueTab === 'all') return true;
    return r.status === activeQueueTab;
  });

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Top Header Bar */}
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
                {user.role ? user.role.toUpperCase() : 'MANAGER'}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
                {user.name ? user.name[0].toUpperCase() : 'M'}
              </div>
              <button onClick={onLogout} className="text-caption text-error hover:underline font-label-caps uppercase ml-1 cursor-pointer">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation */}
        {onSwitchRole && (
          <div className="w-full bg-surface-container-low px-space-md lg:px-margin-desktop overflow-x-auto shadow-[0_1px_4px_rgba(21,42,32,0.02)]">
            <nav className="flex items-center gap-space-xs py-2 whitespace-nowrap min-w-max">
              <button onClick={() => onSwitchRole?.('owner-management')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                Owner & Multi-Outlet
              </button>
              <button onClick={() => onSwitchRole?.('admin-suite')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                System Admin
              </button>
              <button onClick={() => onSwitchRole?.('manager-operations')} className="px-space-sm py-1.5 transition-all bg-primary-container text-on-primary font-semibold rounded shadow-sm font-label-caps uppercase cursor-pointer">
                Floor Operations
              </button>
              <button onClick={() => onSwitchRole?.('chef-kitchen')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                Kitchen & HACCP
              </button>
              <button onClick={() => onSwitchRole?.('hr-roster')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                Staffing & HR
              </button>
              <button onClick={() => onSwitchRole?.('accountant-ledger')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                POS Reconciliation
              </button>
              <button onClick={() => onSwitchRole?.('customer-portal')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                VIP Guest Suite
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Operational Canvas */}
      <main className="w-full pt-28 bg-background min-h-[calc(100vh-140px)] pb-16">
        <div className="flex flex-col w-full">
          
          {/* Top Operational Banner & Live Status Ribbon */}
          <section className="w-full px-space-md lg:px-margin-desktop py-space-xl">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-lg">
              <div>
                <div className="flex items-center gap-space-xs mb-space-2xs">
                  <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest">Live Floor Command</span>
                  <span className="text-on-surface-variant font-caption text-caption">·</span>
                  <span className="font-caption text-caption text-on-surface-variant font-medium">Petpooja Terminal Node #04 (Poes Garden Ground Floor)</span>
                </div>
                <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Poes Garden Service Deck</h1>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm">
                <button
                  onClick={handleSyncPos}
                  className="flex items-center gap-space-xs px-space-sm py-2 bg-surface-container hover:bg-surface-container-high transition-all text-on-surface rounded shadow-sm cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[18px] text-secondary ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                  <span className="font-label-caps text-label-caps uppercase tracking-wider">Sync POS Ledger</span>
                </button>
                <button
                  onClick={() => setIsWalkinModalOpen(true)}
                  className="flex items-center gap-space-xs px-space-md py-2 bg-primary-container hover:bg-primary text-on-primary transition-all rounded shadow-md cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span className="font-label-caps text-label-caps uppercase tracking-wider">Rapid Walk-In</span>
                </button>
              </div>
            </div>

            {/* Metric Ribbons Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {/* Card 1 */}
              <div className="bg-surface-container-lowest p-space-md rounded shadow-sm relative overflow-hidden flex flex-col justify-between border border-surface-container">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Active Shift Cadence</span>
                    <span className="font-title-editorial text-title-editorial text-primary mt-1">Midday Luncheon</span>
                  </div>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-secondary">
                    <span className="material-symbols-outlined text-[18px]">restaurant</span>
                  </span>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <div className="flex items-center justify-between text-body-sm font-body-sm text-on-surface">
                    <span className="font-medium">Slot: 12:00 PM – 3:30 PM</span>
                    <span className="font-label-caps text-label-caps text-secondary font-bold uppercase">72m elapsed</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5">Captain on Duty: Vignesh Ramanathan</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col justify-between border border-surface-container">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Floor Saturation</span>
                    <div className="flex items-baseline gap-space-xs mt-1">
                      <span className="font-headline-md text-headline-md text-primary font-bold">18</span>
                      <span className="font-body-md text-body-md text-on-surface-variant">/ 24 Covers</span>
                    </div>
                  </div>
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path className="text-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                      <path className="text-secondary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3.5" />
                    </svg>
                    <span className="absolute font-label-numeric text-label-numeric text-primary font-bold">75%</span>
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary-container h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="font-caption text-caption text-on-surface-variant">Conservatory: 8/10</span>
                    <span className="font-caption text-caption text-on-surface-variant">Glasshouse: 10/14</span>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col justify-between border border-surface-container">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Arrival Waitlist</span>
                    <div className="flex items-baseline gap-space-xs mt-1">
                      <span className="font-headline-md text-headline-md text-primary font-bold">2</span>
                      <span className="font-body-md text-body-md text-on-surface-variant">Parties</span>
                    </div>
                  </div>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-secondary">
                    <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                  </span>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <div className="flex items-center justify-between text-body-sm font-body-sm">
                    <span className="text-on-surface">Average Dwell:</span>
                    <span className="font-label-numeric text-label-numeric text-secondary font-bold">12 mins pace</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5">Next table release expected: C2 (4 min)</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-surface-container-lowest p-space-md rounded shadow-sm flex flex-col justify-between border border-surface-container">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">KDS Pass Velocity</span>
                    <div className="flex items-baseline gap-space-xs mt-1">
                      <span className="font-headline-md text-headline-md text-primary font-bold">4</span>
                      <span className="font-body-md text-body-md text-on-surface-variant">KOTs Pending</span>
                    </div>
                  </div>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container text-primary">
                    <span className="material-symbols-outlined text-[18px]">skillet</span>
                  </span>
                </div>
                <div className="mt-space-md pt-space-xs">
                  <div className="flex items-center justify-between text-body-sm font-body-sm">
                    <span className="text-on-surface">Service Tempo:</span>
                    <span className="font-label-numeric text-label-numeric text-primary font-bold">11m ticket time</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant mt-0.5">Executive Chef: Chef Senthil on Expo</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Operational Grid: Workflow Queue & Side Panels */}
          <section className="w-full px-space-md lg:px-margin-desktop pb-space-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              
              {/* Left 8 Columns: Live Reservation Management Workflow */}
              <div className="lg:col-span-8 flex flex-col gap-space-md">
                
                {/* Queue Filter Tabs & Header */}
                <div className="bg-surface-container-lowest p-space-md rounded shadow-sm border border-surface-container">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm">
                    <div>
                      <h2 className="font-title-editorial text-title-editorial text-primary">Reservation Lifecycle Pipeline</h2>
                      <p className="font-caption text-caption text-on-surface-variant mt-0.5">Petpooja sync stream · Guest concierge review & seating flow</p>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                      <span className="font-caption text-caption text-secondary font-medium">Real-time polling active</span>
                    </div>
                  </div>

                  {/* Dynamic Tabs */}
                  <div className="flex items-center gap-space-xs overflow-x-auto pt-space-xs">
                    {(['all', 'pending', 'confirmed', 'seated', 'completed', 'cancelled'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveQueueTab(tab)}
                        className={`px-3 py-1.5 font-label-caps text-label-caps rounded uppercase transition-all whitespace-nowrap cursor-pointer ${
                          activeQueueTab === tab
                            ? 'bg-primary-container text-on-primary font-bold shadow-xs'
                            : 'bg-surface-container text-on-surface-variant hover:text-primary'
                        }`}
                      >
                        {tab === 'all' && `All (${reservations.length})`}
                        {tab === 'pending' && `Pending Approval (${reservations.filter((r) => r.status === 'pending').length})`}
                        {tab === 'confirmed' && `Confirmed (${reservations.filter((r) => r.status === 'confirmed').length})`}
                        {tab === 'seated' && `Seated (${reservations.filter((r) => r.status === 'seated').length})`}
                        {tab === 'completed' && `Completed (${reservations.filter((r) => r.status === 'completed').length})`}
                        {tab === 'cancelled' && `No-Show (${reservations.filter((r) => r.status === 'cancelled').length})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reservation List Container */}
                <div className="flex flex-col gap-space-md">
                  {filteredReservations.map((item) => (
                    <div
                      key={item.id}
                      className="bg-surface-container-lowest p-space-md rounded shadow-sm hover:shadow-md transition-shadow border border-surface-container"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-sm pb-space-xs">
                        <div className="flex items-start gap-space-sm">
                          <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-title-editorial text-title-editorial font-bold">
                            {item.guestName[0]}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-space-xs">
                              <h3 className="font-title-editorial text-title-editorial text-primary font-semibold">{item.guestName}</h3>
                              {item.badge && (
                                <span className={`px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold ${item.badgeBg}`}>
                                  {item.badge}
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold ${item.statusBg}`}>
                                {item.statusLabel}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-space-sm mt-1 text-caption font-caption text-on-surface-variant">
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">group</span> {item.guests} Guests</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">schedule</span> {item.time}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">deck</span> {item.area}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right flex md:flex-col items-center md:items-end justify-between">
                          <span className="font-label-numeric text-label-numeric text-primary font-semibold">{item.table}</span>
                          <span className="font-caption text-caption text-secondary">{item.pref}</span>
                        </div>
                      </div>

                      {/* Culinary Tags / Notes */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="bg-surface-container-low p-space-xs rounded my-space-xs flex flex-wrap items-center gap-space-xs">
                          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Tasting Profile:</span>
                          {item.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-surface-container-highest text-primary font-caption text-caption">
                              {tag}
                            </span>
                          ))}
                          <span className="ml-auto text-caption font-caption text-on-surface-variant italic">{item.ref}</span>
                        </div>
                      )}

                      {item.courseInfo && (
                        <div className="bg-surface-container-low p-space-xs rounded my-space-xs flex flex-wrap items-center gap-space-xs">
                          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Active Course:</span>
                          <span className="font-body-sm text-body-sm text-primary font-medium">{item.courseInfo}</span>
                          <span className="ml-auto text-caption font-caption text-secondary font-semibold">Sommelier Pairing En Route</span>
                        </div>
                      )}

                      {item.note && (
                        <div className="bg-surface-container-low p-space-xs rounded my-space-xs flex flex-wrap items-center gap-space-xs">
                          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Guest Intention:</span>
                          <span className="font-body-sm text-body-sm text-on-surface">{item.note}</span>
                          <span className="ml-auto text-caption font-caption text-on-surface-variant italic">{item.ref}</span>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="pt-space-xs flex flex-wrap items-center justify-between gap-space-xs">
                        {item.status === 'pending' && (
                          <>
                            <div className="flex items-center gap-space-xs">
                              <select className="h-9 px-space-xs bg-surface-container text-body-sm font-body-sm text-primary rounded focus:outline-none cursor-pointer border border-surface-container-high">
                                <option value="C4">Allocate: Table C4 (Corner Conservatory, 4p)</option>
                                <option value="C2">Allocate: Table C2 (Conservatory Window, 4p)</option>
                                <option value="G1">Allocate: Table G1 (Glasshouse, 6p)</option>
                              </select>
                              <button
                                onClick={() => handleApprove(item.id, 'C4')}
                                className="h-9 px-space-sm bg-primary-container hover:bg-primary text-on-primary font-label-caps text-label-caps uppercase rounded transition-colors shadow-sm cursor-pointer"
                              >
                                Approve & Assign
                              </button>
                            </div>
                            <div className="flex items-center gap-space-xs">
                              <button
                                onClick={() => showToast(`Adjusting booking parameters for ${item.guestName}`)}
                                className="h-9 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase rounded transition-colors cursor-pointer"
                              >
                                Modify
                              </button>
                              <button
                                onClick={() => handleDecline(item.id)}
                                className="h-9 px-3 bg-rose-50 hover:bg-rose-100 text-error font-label-caps text-label-caps uppercase rounded transition-colors cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          </>
                        )}

                        {item.status === 'confirmed' && (
                          <>
                            <div className="flex items-center gap-space-xs">
                              <button
                                onClick={() => handleSeatGuest(item.id, item.table || 'Table')}
                                className="h-9 px-space-sm bg-primary-container hover:bg-primary text-on-primary font-label-caps text-label-caps uppercase rounded transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">chair_alt</span>
                                Mark Seated
                              </button>
                              <button
                                onClick={() => showToast('Opening Floor Matrix to reassign covers...')}
                                className="h-9 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-caps text-label-caps uppercase rounded transition-colors cursor-pointer"
                              >
                                Re-table
                              </button>
                            </div>
                            <div className="flex items-center gap-space-xs">
                              <button
                                onClick={() => handleNoShow(item.id)}
                                className="h-9 px-3 bg-rose-50 hover:bg-rose-100 text-error font-label-caps text-label-caps uppercase rounded transition-colors cursor-pointer"
                              >
                                No-Show
                              </button>
                            </div>
                          </>
                        )}

                        {item.status === 'seated' && (
                          <>
                            <div className="flex items-center gap-space-xs">
                              <button
                                onClick={() => handleCompleteService(item.id)}
                                className="h-9 px-space-sm bg-surface-container hover:bg-surface-container-high text-primary font-label-caps text-label-caps uppercase rounded transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                                Generate POS Bill
                              </button>
                              <button className="h-9 px-3 bg-surface-container-low hover:bg-surface-container text-on-surface font-label-caps text-label-caps uppercase rounded transition-colors cursor-pointer">
                                Add Course Note
                              </button>
                            </div>
                            <span className="font-caption text-caption text-on-surface-variant">Captain: Vignesh R.</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 4 Columns: Operational Checklists, Escalation Feed & Table Matrix */}
              <div className="lg:col-span-4 flex flex-col gap-space-md">
                
                {/* Shift SOP & Inspection Checklist */}
                <div className="bg-surface-container-lowest p-space-md rounded shadow-sm border border-surface-container">
                  <div className="flex items-center justify-between pb-space-xs">
                    <h2 className="font-title-editorial text-title-editorial text-primary">Shift SOP Progress</h2>
                    <span className="font-label-caps text-label-caps px-2 py-0.5 rounded bg-surface-container text-primary font-bold uppercase">Lunch Audit</span>
                  </div>
                  <div className="flex flex-col gap-space-sm mt-space-sm">
                    <div className="p-space-xs bg-surface-container-low rounded flex items-start justify-between gap-space-xs">
                      <div className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">check_circle</span>
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm text-primary font-semibold">Morning Mise-en-place</span>
                          <span className="font-caption text-caption text-on-surface-variant">Verified by Executive Chef Senthil</span>
                        </div>
                      </div>
                      <span className="font-label-numeric text-label-numeric text-secondary font-bold">100%</span>
                    </div>

                    <div className="p-space-xs bg-surface-container-low rounded flex items-start justify-between gap-space-xs">
                      <div className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-amber-600 text-[20px] mt-0.5">pending</span>
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm text-primary font-semibold">Bar & Cellar Pre-flight</span>
                          <span className="font-caption text-caption text-on-surface-variant">Tonic & botanical syrups restock</span>
                        </div>
                      </div>
                      <span className="font-label-numeric text-label-numeric text-amber-700 font-bold">88%</span>
                    </div>

                    <div className="p-space-xs bg-surface-container-low rounded flex items-start justify-between gap-space-xs">
                      <div className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">check_circle</span>
                        <div className="flex flex-col">
                          <span className="font-body-sm text-body-sm text-primary font-semibold">Conservatory Climate & Lux</span>
                          <span className="font-caption text-caption text-on-surface-variant">HVAC calibrated to 22.5°C, 65% RH</span>
                        </div>
                      </div>
                      <span className="font-label-numeric text-label-numeric text-secondary font-bold">100%</span>
                    </div>
                  </div>
                </div>

                {/* Live Floor Incident & Escalation Feed */}
                <div className="bg-surface-container-lowest p-space-md rounded shadow-sm border border-surface-container">
                  <div className="flex items-center justify-between pb-space-xs">
                    <h2 className="font-title-editorial text-title-editorial text-primary">Live Floor Escalations</h2>
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                  </div>
                  <div className="flex flex-col gap-space-sm mt-space-sm">
                    <div className="p-space-xs bg-surface-container-low rounded flex items-start gap-space-xs">
                      <div className="p-1.5 rounded-full bg-surface-container text-secondary">
                        <span className="material-symbols-outlined text-[18px]">local_florist</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="font-body-sm text-body-sm text-primary font-semibold">Floral Setup Done</span>
                          <span className="font-caption text-caption text-on-surface-variant">6m ago</span>
                        </div>
                        <p className="font-caption text-caption text-on-surface-variant mt-0.5">Anniversary tuberoses placed on Table C4 for Dr. Maran.</p>
                      </div>
                    </div>

                    <div className="p-space-xs bg-surface-container-low rounded flex items-start gap-space-xs">
                      <div className="p-1.5 rounded-full bg-surface-container text-primary">
                        <span className="material-symbols-outlined text-[18px]">wine_bar</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="font-body-sm text-body-sm text-primary font-semibold">Sommelier Flight</span>
                          <span className="font-caption text-caption text-on-surface-variant">14m ago</span>
                        </div>
                        <p className="font-caption text-caption text-on-surface-variant mt-0.5">Table G3 requested premier cru pairing consult.</p>
                      </div>
                    </div>

                    <div className="p-space-xs bg-surface-container-low rounded flex items-start gap-space-xs">
                      <div className="p-1.5 rounded-full bg-surface-container text-amber-700">
                        <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between">
                          <span className="font-body-sm text-body-sm text-primary font-semibold">Wagyu Tenderloin 86 Alert</span>
                          <span className="font-caption text-caption text-on-surface-variant">22m ago</span>
                        </div>
                        <p className="font-caption text-caption text-on-surface-variant mt-0.5">Chef Senthil flagged only 3 portions remaining for lunch.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botanical Table Matrix Visual Mini-Map */}
                <div className="bg-surface-container-lowest p-space-md rounded shadow-sm border border-surface-container">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div>
                      <h2 className="font-title-editorial text-title-editorial text-primary">Zone Allocation Map</h2>
                      <span className="font-caption text-caption text-on-surface-variant">Poes Garden Sanctuary</span>
                    </div>
                    <span className="font-caption text-caption text-secondary font-medium">Click node to inspect</span>
                  </div>

                  <div className="p-space-md bg-surface-container rounded mt-space-sm flex flex-col gap-space-md">
                    {/* Zone 1 */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-label-caps text-label-caps uppercase text-primary font-bold">The Conservatory</span>
                        <span className="font-caption text-caption text-on-surface-variant">4 Tables · 80% Full</span>
                      </div>
                      <div className="grid grid-cols-4 gap-space-xs">
                        <button
                          onClick={() => setInspectTableInfo('C1: Occupied by Meera Chandran (2p) · Slot: 12:45 PM')}
                          className="p-2 rounded bg-primary-container text-on-primary text-center transition-transform hover:scale-105 cursor-pointer"
                        >
                          <div className="font-label-numeric text-label-numeric font-bold">C1</div>
                          <div className="font-caption text-[10px] opacity-80">2p · Occ</div>
                        </button>
                        <button
                          onClick={() => setInspectTableInfo('C2: Closing Check (4p) · Slot: 12:00 PM')}
                          className="p-2 rounded bg-secondary-container text-on-secondary-container text-center transition-transform hover:scale-105 cursor-pointer"
                        >
                          <div className="font-label-numeric text-label-numeric font-bold">C2</div>
                          <div className="font-caption text-[10px] font-semibold">4p · Bill</div>
                        </button>
                        <button
                          onClick={() => setInspectTableInfo('C3: Reserved for 2:15 PM (2p)')}
                          className="p-2 rounded bg-surface-container-lowest text-primary text-center transition-transform hover:scale-105 cursor-pointer"
                        >
                          <div className="font-label-numeric text-label-numeric font-bold">C3</div>
                          <div className="font-caption text-[10px] text-on-surface-variant">2p · Free</div>
                        </button>
                        <button
                          onClick={() => setInspectTableInfo('C4: Allocated: Dr. Maran (4p) · Slot: 1:15 PM')}
                          className="p-2 rounded bg-amber-100 text-amber-950 text-center transition-transform hover:scale-105 cursor-pointer"
                        >
                          <div className="font-label-numeric text-label-numeric font-bold">C4</div>
                          <div className="font-caption text-[10px] font-bold">4p · Hold</div>
                        </button>
                      </div>
                    </div>

                    {/* Zone 2 */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-label-caps text-label-caps uppercase text-primary font-bold">The Glasshouse Bay</span>
                        <span className="font-caption text-caption text-on-surface-variant">3 Tables · 66% Full</span>
                      </div>
                      <div className="grid grid-cols-3 gap-space-xs">
                        <button
                          onClick={() => setInspectTableInfo('G1: Available for VIP allocation')}
                          className="p-2 rounded bg-surface-container-lowest text-primary text-center transition-transform hover:scale-105 cursor-pointer"
                        >
                          <div className="font-label-numeric text-label-numeric font-bold">G1</div>
                          <div className="font-caption text-[10px] text-on-surface-variant">6p · Free</div>
                        </button>
                        <button
                          onClick={() => setInspectTableInfo('G2: Occupied (4p) · Slot: 12:30 PM')}
                          className="p-2 rounded bg-primary-container text-on-primary text-center transition-transform hover:scale-105 cursor-pointer"
                        >
                          <div className="font-label-numeric text-label-numeric font-bold">G2</div>
                          <div className="font-caption text-[10px] opacity-80">4p · Occ</div>
                        </button>
                        <button
                          onClick={() => setInspectTableInfo('G3: Sundaram Estate (6p) · Slot: 12:28 PM')}
                          className="p-2 rounded bg-primary-container text-on-primary text-center transition-transform hover:scale-105 cursor-pointer"
                        >
                          <div className="font-label-numeric text-label-numeric font-bold">G3</div>
                          <div className="font-caption text-[10px] opacity-80">6p · Occ</div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inspection Banner */}
                  {inspectTableInfo && (
                    <div className="mt-space-sm p-space-xs bg-surface-container-low rounded flex items-center justify-between text-caption font-caption">
                      <span className="text-primary font-medium">{inspectTableInfo}</span>
                      <button onClick={() => setInspectTableInfo(null)} className="text-on-surface-variant hover:text-primary cursor-pointer">
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* Atmosphere Card */}
                <div className="bg-surface-container-lowest p-space-md rounded shadow-sm relative overflow-hidden border border-surface-container">
                  <div className="relative h-44 rounded overflow-hidden mb-space-sm">
                    <img
                      alt="Warm sunlight filtering through Victorian glasshouse dining hall"
                      className="w-full h-full object-cover"
                      src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent flex items-end p-space-sm">
                      <span className="font-title-editorial text-title-editorial text-on-primary">Poes Garden Flagship</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant">
                    <span>Air Temp: 22.4°C</span>
                    <span>Acoustic: 52 dB (Quiet)</span>
                    <span>Petpooja Ping: 14ms</span>
                  </div>
                </div>

              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Rapid Walk-in Modal Overlay */}
      {isWalkinModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded p-space-lg shadow-xl relative border border-surface-container">
            <div className="flex items-center justify-between pb-space-sm">
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps uppercase text-secondary font-bold">Petpooja Fast-Lane</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-semibold">Immediate Table Allocation</h3>
              </div>
              <button onClick={() => setIsWalkinModalOpen(false)} className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-primary flex items-center justify-center cursor-pointer">
                ✕
              </button>
            </div>
            <form onSubmit={handleWalkInSubmit} className="flex flex-col gap-space-sm mt-space-sm">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Guest / Host Full Name</label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Vikramaditya Reddy"
                  className="h-10 px-space-xs bg-surface-container rounded text-body-sm font-body-sm text-primary focus:outline-none border border-surface-container-high"
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Party Size</label>
                  <select
                    value={walkinSize}
                    onChange={(e) => setWalkinSize(e.target.value)}
                    className="h-10 px-space-xs bg-surface-container rounded text-body-sm font-body-sm text-primary focus:outline-none border border-surface-container-high"
                  >
                    <option>2 Guests</option>
                    <option>3 Guests</option>
                    <option>4 Guests</option>
                    <option>6 Guests</option>
                    <option>8+ Private Room</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Target Sanctuary Zone</label>
                  <select
                    value={walkinZone}
                    onChange={(e) => setWalkinZone(e.target.value)}
                    className="h-10 px-space-xs bg-surface-container rounded text-body-sm font-body-sm text-primary focus:outline-none border border-surface-container-high"
                  >
                    <option>The Conservatory (Table C3)</option>
                    <option>The Glasshouse Bay (Table G1)</option>
                    <option>Verandah Garden (Table V4)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Notes & Allergens</label>
                <input
                  type="text"
                  value={walkinNotes}
                  onChange={(e) => setWalkinNotes(e.target.value)}
                  placeholder="e.g. Gluten sensitive, prefers quiet corner"
                  className="h-10 px-space-xs bg-surface-container rounded text-body-sm font-body-sm text-primary focus:outline-none border border-surface-container-high"
                />
              </div>

              <div className="pt-space-sm flex items-center justify-end gap-space-xs">
                <button
                  type="button"
                  onClick={() => setIsWalkinModalOpen(false)}
                  className="h-10 px-space-md rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-caps text-label-caps uppercase transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-space-md rounded bg-primary-container hover:bg-primary text-on-primary font-label-caps text-label-caps uppercase transition-colors shadow-sm cursor-pointer"
                >
                  Seat & Open Petpooja KOT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-space-md py-space-sm rounded shadow-lg flex items-center gap-space-sm animate-bounce">
          <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
          <span className="font-body-sm text-body-sm">{toast.message}</span>
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
                <button onClick={() => onSwitchRole?.('owner-management')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">Owner</button>
                <button onClick={() => onSwitchRole?.('admin-suite')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">Admin</button>
                <button onClick={() => onSwitchRole?.('manager-operations')} className="px-2 py-1 bg-primary-container text-on-primary font-caption text-caption rounded font-semibold cursor-pointer">Manager</button>
                <button onClick={() => onSwitchRole?.('chef-kitchen')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">Chef</button>
                <button onClick={() => onSwitchRole?.('hr-roster')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">HR</button>
                <button onClick={() => onSwitchRole?.('accountant-ledger')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">Accountant</button>
                <button onClick={() => onSwitchRole?.('customer-portal')} className="px-2 py-1 bg-secondary-container text-on-secondary-container font-caption text-caption rounded font-semibold cursor-pointer">VIP Guest</button>
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
