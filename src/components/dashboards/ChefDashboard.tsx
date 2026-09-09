import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

interface KDSTicket {
  id: string;
  table: string;
  guests: number;
  server: string;
  type: string;
  timerStartSeconds: number;
  stage: string;
  items: { name: string; desc?: string; badge?: string; badgeColor?: string; note?: string }[];
  pairing?: { title: string; desc: string; status: string };
  nextCourse?: { name: string; status: string };
  isRush?: boolean;
  isVip?: boolean;
  vipTitle?: string;
}

export const ChefDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState('poes');
  const [serviceClock, setServiceClock] = useState('19:42:18 IST');
  const [activeKdsFilter, setActiveKdsFilter] = useState<'all' | 'degustation' | 'alacarte'>('all');
  
  // Modals & Toast State
  const [isEightySixModalOpen, setIsEightySixModalOpen] = useState(false);
  const [eightySixItem, setEightySixItem] = useState('Ooty Wild Morel Mushrooms');
  const [eightySixReason, setEightySixReason] = useState('');
  const [toast, setToast] = useState<{ show: boolean; message: string; icon: string }>({
    show: false,
    message: '',
    icon: 'info',
  });

  // Sync animation state
  const [isSyncing, setIsSyncing] = useState(false);

  // Tickets state with ticking timers
  const [tickets, setTickets] = useState<KDSTicket[]>([
    {
      id: 'ticket-c1',
      table: 'Table C1',
      guests: 4,
      server: 'Karthik',
      type: 'A La Carte',
      timerStartSeconds: 360,
      stage: 'Plating Stage',
      items: [
        {
          name: '2x Smoked Burrata Pugliese',
          desc: 'Heirloom tomato concassé, cold-pressed basil oil, crispy sourdough wafer',
          badge: 'Pass Ready',
          badgeColor: 'bg-secondary/15 text-secondary',
          note: 'Nut Allergy: Guest 2',
        },
      ],
      pairing: {
        title: 'Sommelier Pairing Fired',
        desc: '2x 2021 Domaine Dujac Morey-Saint-Denis Pinot Noir',
        status: 'Poured',
      },
    },
    {
      id: 'ticket-c5',
      table: 'Table C5',
      guests: 4,
      server: 'Arvind',
      type: 'Course 3 of 4',
      timerStartSeconds: 840,
      stage: 'Over Target (12m)',
      isRush: true,
      items: [
        {
          name: '3x Braised Nilgiri Lamb Shank',
          desc: 'Sous-vide 36hr, rosemary jus reduction, roasted baby shallots',
          badge: 'Line Firing',
          badgeColor: 'bg-error-container text-on-error-container',
          note: 'Temp: Medium-Well for Seat 3',
        },
        {
          name: '1x Morel Mushroom Risotto',
          desc: 'Acquerello carnaroli, 24mo Parmigiano Reggiano, Ooty morel froth',
          badge: 'Finishing Mantecare',
          badgeColor: 'bg-secondary/15 text-secondary',
        },
      ],
    },
    {
      id: 'ticket-g2',
      table: 'Table G2',
      guests: 4,
      server: 'Priya',
      type: '7-Course Degustation',
      timerStartSeconds: 495,
      stage: 'Course 5 of 7',
      isVip: true,
      vipTitle: "Chef's Table VIP",
      items: [
        {
          name: '2x Smoked Nilgiri Morel Risotto',
          desc: 'Garnished with edible gold leaf & winter black truffle shavings at tableside',
          badge: 'Pass Ready',
          badgeColor: 'bg-secondary text-on-secondary',
        },
      ],
      nextCourse: {
        name: 'Pan-Seared Bay of Bengal Sea Bass, Velouté & Sea Fennel',
        status: 'Pre-fire command sent to Station A (Pan Station)',
      },
    },
    {
      id: 'ticket-v1',
      table: 'Table V1',
      guests: 2,
      server: 'Deepa',
      type: 'Veranda Booth',
      timerStartSeconds: 120,
      stage: 'Fresh Order',
      items: [
        {
          name: '1x House Sourdough & Whipped Cultured Butter',
          desc: 'Maldon sea salt, roasted garlic ash infusion',
          badge: 'Larder Queued',
          badgeColor: 'bg-surface-variant text-on-surface-variant',
        },
        {
          name: '2x Seared Coromandel Sea Bass',
          desc: 'Lemongrass velouté, pickled samphire, charred leek',
          badge: 'Pending App',
          badgeColor: 'bg-surface-variant text-on-surface-variant',
        },
      ],
    },
  ]);

  // Checklist state
  const [checklists, setChecklists] = useState({
    sanitizer: true,
    boards: true,
    bainMaries: true,
    defrost: true,
  });

  // Ticking Clock and Ticket Timers
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setServiceClock(now.toLocaleTimeString('en-GB') + ' IST');
    }, 1000);

    const timerInterval = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => ({ ...t, timerStartSeconds: t.timerStartSeconds + 1 }))
      );
    }, 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(timerInterval);
    };
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const remSecs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string, icon = 'info') => {
    setToast({ show: true, message: msg, icon });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleBumpTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
    showToast(`Ticket ${id.toUpperCase()} completed and bumped to Pass`, 'check_circle');
  };

  const handleDuplicateKot = (tableName: string) => {
    showToast(`Duplicate KOT printed on Kitchen Pass Printer for ${tableName}`, 'print');
  };

  const handleNotifyExpediter = (note: string) => {
    showToast(`Expediter notified: "${note}"`, 'campaign');
  };

  const handleHoldCourse = (courseDesc: string) => {
    showToast(`HOLD signal sent to Chef Pass for ${courseDesc}`, 'pause_circle');
  };

  const handleStartCooking = (ticketId: string) => {
    showToast(`All stations fired for ${ticketId.toUpperCase()}`, 'local_fire_department');
  };

  const handleSyncPos = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Petpooja POS Menu Sync complete (Latency: 12ms)', 'sync');
    }, 800);
  };

  const handleConfirmEightySix = () => {
    setIsEightySixModalOpen(false);
    showToast(`Item "${eightySixItem}" is now 86'd. Kitchen, Bar & Floor notified.`, 'block');
    setEightySixReason('');
  };

  const filteredTickets = tickets.filter((t) => {
    if (activeKdsFilter === 'degustation') return t.isVip || t.type.includes('Degustation');
    if (activeKdsFilter === 'alacarte') return !t.isVip && !t.type.includes('Degustation');
    return true;
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
                {user.role ? user.role.toUpperCase() : 'CHEF'}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
                {user.name ? user.name[0].toUpperCase() : 'C'}
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
              <button onClick={() => onSwitchRole?.('manager-operations')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                Floor Operations
              </button>
              <button onClick={() => onSwitchRole?.('chef-kitchen')} className="px-space-sm py-1.5 transition-all bg-primary-container text-on-primary font-semibold rounded shadow-sm font-label-caps uppercase cursor-pointer">
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
          
          {/* Sub-Header Status Line */}
          <div className="w-full bg-primary text-on-primary py-space-sm px-space-md lg:px-margin-desktop flex flex-wrap items-center justify-between gap-space-md shadow-md">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-2 bg-primary-container px-3 py-1 rounded">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-secondary-fixed animate-ping"></span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary-fixed">Dinner Service Active</span>
              </div>
              <div className="flex items-center gap-2 text-on-primary-container">
                <span className="material-symbols-outlined text-sm">schedule</span>
                <span className="font-label-numeric text-label-numeric text-surface">{serviceClock}</span>
              </div>
              <span className="text-outline-variant/40 hidden md:inline">|</span>
              <div className="hidden md:flex items-center gap-2">
                <span className="font-caption text-caption text-surface-dim">Executive Chef:</span>
                <span className="font-body-sm text-body-sm font-semibold text-surface-bright">Senthil Murugan</span>
                <span className="font-label-caps text-label-caps bg-surface-tint/20 text-inverse-primary px-2 py-0.5 rounded">Pass Expediter 1</span>
              </div>
            </div>

            {/* Quick Pass Controls */}
            <div className="flex items-center gap-space-xs">
              <button
                onClick={() => showToast('Floor Runners dispatched to Pass A & B', 'directions_run')}
                className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded hover:bg-secondary/90 transition text-on-secondary font-label-caps text-label-caps uppercase cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">notifications_active</span>
                <span>Call Line Runner</span>
              </button>
              <button
                onClick={() => setIsEightySixModalOpen(true)}
                className="flex items-center gap-1.5 bg-error px-3 py-1.5 rounded hover:bg-error/90 transition text-on-error font-label-caps text-label-caps uppercase cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">block</span>
                <span>Quick 86 Trigger</span>
              </button>
              <button
                onClick={handleSyncPos}
                className="flex items-center gap-1.5 bg-surface-container-high text-primary px-3 py-1.5 rounded hover:bg-surface-container-highest transition font-label-caps text-label-caps uppercase cursor-pointer"
              >
                <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                <span>POS Auto-Sync</span>
              </button>
            </div>
          </div>

          <div className="w-full px-space-md lg:px-margin-desktop py-space-lg space-y-space-xl">
            
            {/* Pass Telemetry Overview Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {/* Active Tickets */}
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between border border-surface-container">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider block">Live Tickets on Rail</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-display-hero text-headline-lg font-bold text-primary">{tickets.length}</span>
                      <span className="font-label-caps text-label-caps text-error bg-error-container/60 px-2 py-0.5 rounded uppercase font-bold">
                        {tickets.filter((t) => t.isRush).length} Rush Order
                      </span>
                    </div>
                  </div>
                  <span className="p-2.5 bg-surface-container rounded text-primary">
                    <span className="material-symbols-outlined text-2xl">receipt_long</span>
                  </span>
                </div>
                <div className="mt-space-sm pt-space-xs flex items-center justify-between text-on-surface-variant">
                  <span className="font-caption text-caption">Total Cover Flow: <strong className="text-on-surface">26 Guests</strong></span>
                  <span className="font-label-caps text-label-caps text-secondary font-semibold">Capacity 82%</span>
                </div>
              </div>

              {/* Ticket Pace Metric with SVG Ring */}
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex items-center justify-between border border-surface-container">
                <div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider block">Average Ticket Pace</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-display-hero text-headline-lg font-bold text-primary">11<span className="text-headline-sm">m</span> 40<span class="text-headline-sm">s</span></span>
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant mt-0.5 block">Standard Target: &lt; 14m 00s</span>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path className="text-surface-container-high stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3.5" />
                    <path className="text-secondary stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray="82, 100" strokeLinecap="round" strokeWidth="3.5" />
                  </svg>
                  <span className="absolute font-label-numeric text-label-numeric font-bold text-primary">82%</span>
                </div>
              </div>

              {/* Station Status */}
              <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-sm flex flex-col justify-between border border-surface-container">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Kitchen Pass Stations</span>
                  <span className="inline-block w-2 h-2 rounded-full bg-secondary-fixed animate-pulse"></span>
                </div>
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-caption font-caption">
                    <span className="font-medium text-primary flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span> Pass A: Hot Line
                    </span>
                    <span className="font-label-numeric text-label-numeric text-error font-semibold">4 Orders Queued</span>
                  </div>
                  <div className="flex items-center justify-between text-caption font-caption">
                    <span className="font-medium text-primary flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span> Pass B: Cold & Degustation
                    </span>
                    <span className="font-label-numeric text-label-numeric text-on-surface font-semibold">2 Orders Queued</span>
                  </div>
                  <div className="flex items-center justify-between text-caption font-caption">
                    <span className="font-medium text-primary flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-surface-tint"></span> Pass C: Pastry & Soufflé
                    </span>
                    <span className="font-label-numeric text-label-numeric text-on-surface font-semibold">1 Firing</span>
                  </div>
                </div>
              </div>

              {/* HACCP Integrity Index */}
              <div className="bg-primary-container text-on-primary p-space-md rounded-lg shadow-sm flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-label-caps text-label-caps text-inverse-primary uppercase tracking-wider">HACCP Integrity Index</span>
                    <div className="text-headline-md font-bold mt-1 text-surface-bright flex items-center gap-2">
                      <span>100% OK</span>
                      <span className="material-symbols-outlined text-secondary-fixed text-xl">verified</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-surface/10 text-caption font-caption text-surface-dim">Shift Logged</span>
                </div>
                <div className="mt-2 text-caption font-caption text-surface-variant/90 flex items-center justify-between">
                  <span>All 4 Critical Control Points Normal</span>
                  <a className="text-secondary-fixed hover:underline font-label-caps text-label-caps uppercase cursor-pointer" href="#haccp-section">Inspect</a>
                </div>
              </div>
            </div>

            {/* Live KDS Ticket Firing Board */}
            <div className="space-y-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <span className="w-2.5 h-6 bg-secondary rounded-sm"></span>
                  <h2 className="font-headline-md text-headline-md text-primary">Live Course Firing Rail</h2>
                  <span className="font-label-caps text-label-caps bg-surface-container-high text-on-surface px-2.5 py-1 rounded font-bold uppercase">Petpooja KDS Sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-surface-container rounded p-0.5 text-caption font-caption">
                    <button
                      onClick={() => setActiveKdsFilter('all')}
                      className={`px-3 py-1 rounded cursor-pointer ${activeKdsFilter === 'all' ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                      All Tickets ({tickets.length})
                    </button>
                    <button
                      onClick={() => setActiveKdsFilter('degustation')}
                      className={`px-3 py-1 rounded cursor-pointer ${activeKdsFilter === 'degustation' ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                      Degustation ({tickets.filter((t) => t.isVip || t.type.includes('Degustation')).length})
                    </button>
                    <button
                      onClick={() => setActiveKdsFilter('alacarte')}
                      className={`px-3 py-1 rounded cursor-pointer ${activeKdsFilter === 'alacarte' ? 'bg-surface-container-lowest text-primary font-semibold shadow-xs' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                      A La Carte ({tickets.filter((t) => !t.isVip && !t.type.includes('Degustation')).length})
                    </button>
                  </div>
                </div>
              </div>

              {/* KDS Kanban Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
                {filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5 border border-surface-container"
                  >
                    <div>
                      {/* Ticket Header */}
                      <div className={`p-space-md flex items-center justify-between ${t.isRush ? 'bg-error-container/70 text-on-error-container' : t.isVip ? 'bg-primary-container text-on-primary' : 'bg-surface-container-high'}`}>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`font-headline-sm text-headline-sm font-bold ${t.isVip ? 'text-surface-bright' : t.isRush ? 'text-on-error-container' : 'text-primary'}`}>
                              {t.table}
                            </span>
                            <span className={`font-label-caps text-label-caps px-1.5 py-0.5 rounded uppercase font-semibold ${t.isRush ? 'bg-error text-on-error font-bold' : t.isVip ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-variant text-on-surface-variant'}`}>
                              {t.isRush ? 'RUSH TICKET' : t.isVip ? t.vipTitle : `${t.guests} Guests`}
                            </span>
                          </div>
                          <span className={`font-caption text-caption ${t.isVip ? 'text-on-primary-container' : t.isRush ? 'text-on-error-container/80' : 'text-on-surface-variant'}`}>
                            Server: {t.server} · {t.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`font-headline-sm text-headline-sm font-bold flex items-center gap-1 ${t.isRush ? 'text-error' : t.isVip ? 'text-secondary-fixed' : 'text-secondary'}`}>
                            <span className="material-symbols-outlined text-base animate-spin">timelapse</span>
                            <span>{formatTimer(t.timerStartSeconds)}</span>
                          </div>
                          <span className="font-label-caps text-label-caps uppercase">{t.stage}</span>
                        </div>
                      </div>

                      {/* Ticket Items */}
                      <div className="p-space-md space-y-space-sm">
                        {t.items.map((item, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-start justify-between">
                              <span className="font-title-editorial text-title-editorial text-primary font-medium">{item.name}</span>
                              {item.badge && (
                                <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded font-bold uppercase ${item.badgeColor}`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            {item.desc && <p className="font-body-sm text-body-sm text-on-surface-variant">{item.desc}</p>}
                            {item.note && (
                              <div className="flex items-center gap-2 pt-1 font-caption text-caption text-error font-semibold">
                                <span className="material-symbols-outlined text-sm">warning</span>
                                <span>{item.note}</span>
                              </div>
                            )}
                          </div>
                        ))}

                        {t.pairing && (
                          <div className="bg-surface-container-low p-space-sm rounded space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-title-editorial text-title-editorial text-primary">{t.pairing.title}</span>
                              <span className="font-caption text-caption text-secondary font-semibold">{t.pairing.status}</span>
                            </div>
                            <p className="font-caption text-caption text-on-surface-variant">{t.pairing.desc}</p>
                          </div>
                        )}

                        {t.nextCourse && (
                          <div className="space-y-1">
                            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Next Up (Course 6):</span>
                            <p className="font-body-sm text-body-sm text-primary font-medium">{t.nextCourse.name}</p>
                            <span className="font-caption text-caption text-secondary">{t.nextCourse.status}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-space-md bg-surface-container-low flex flex-wrap gap-2">
                      <button
                        onClick={() => handleBumpTicket(t.id)}
                        className="flex-1 bg-primary text-on-primary py-2 px-3 rounded font-label-caps text-label-caps uppercase tracking-wider font-semibold hover:bg-primary/90 transition flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        <span>{t.isVip ? 'Course 5 Complete' : 'Bump to Service'}</span>
                      </button>
                      {t.isRush && (
                        <button
                          onClick={() => handleNotifyExpediter(`${t.table}: Lamb finishing in 90 seconds`)}
                          className="bg-surface-container-highest text-primary px-3 py-2 rounded font-label-caps text-label-caps uppercase hover:bg-surface-variant transition cursor-pointer"
                        >
                          Expedite Call
                        </button>
                      )}
                      {t.isVip && (
                        <button
                          onClick={() => handleHoldCourse(`${t.table} - Course 6`)}
                          className="bg-surface-container-highest text-primary px-3 py-2 rounded font-label-caps text-label-caps uppercase hover:bg-surface-variant transition cursor-pointer"
                        >
                          Hold Course 6
                        </button>
                      )}
                      {!t.isRush && !t.isVip && t.stage === 'Fresh Order' && (
                        <button
                          onClick={() => handleStartCooking(t.id)}
                          className="bg-secondary text-on-secondary px-3 py-2 rounded font-label-caps text-label-caps uppercase hover:bg-secondary/90 transition flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">local_fire_department</span>
                          <span>Fire All</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDuplicateKot(t.table)}
                        className="bg-surface-container-highest text-primary p-2 rounded hover:bg-surface-variant transition cursor-pointer"
                        title="Print Duplicate KOT"
                      >
                        <span className="material-symbols-outlined text-sm">print</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Asymmetric Split: HACCP Digital Food Safety Log & 86 Depletion Thresholds */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl" id="haccp-section">
              
              {/* Left 7 Cols: HACCP Food Safety Compliance Ledger */}
              <div className="lg:col-span-7 bg-surface-container-lowest p-space-lg rounded-lg shadow-sm space-y-space-md border border-surface-container">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-xl">shield</span>
                      <h3 className="font-headline-sm text-headline-sm text-primary">Daily Kitchen SOPs & Digital HACCP Log</h3>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant">Food Safety and Standards Authority of India (FSSAI) & ISO 22000 Audit Log</p>
                  </div>
                  <button
                    onClick={() => showToast('Manual HACCP audit entry created & timestamped.', 'fact_check')}
                    className="self-start sm:self-auto bg-surface-container text-primary font-label-caps text-label-caps uppercase px-3 py-1.5 rounded hover:bg-surface-container-high transition flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> New Temp Reading
                  </button>
                </div>

                {/* Sensor & Equipment Readings Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                  <div className="bg-surface-container-low p-space-sm rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Walk-in Chiller 1</span>
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-headline-md text-headline-md font-bold text-primary">+2.8°C</span>
                      <span className="font-caption text-caption text-on-surface-variant">Range: 1-4°C</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between font-caption text-caption text-on-surface-variant">
                      <span>IoT Probe #04</span>
                      <span className="text-secondary font-medium">Logged 11:00 AM</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-space-sm rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Sous-Vide Basin #2</span>
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-headline-md text-headline-md font-bold text-primary">58.5°C</span>
                      <span className="font-caption text-caption text-on-surface-variant">Target: 58.5°C</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between font-caption text-caption text-on-surface-variant">
                      <span>Nilgiri Lamb Holding</span>
                      <span className="text-secondary font-medium">Calibrated</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-space-sm rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Blast Freezer</span>
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    </div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="font-headline-md text-headline-md font-bold text-primary">-18.2°C</span>
                      <span className="font-caption text-caption text-on-surface-variant">Range: &lt;-18°C</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between font-caption text-caption text-on-surface-variant">
                      <span>Station C Confection</span>
                      <span className="text-secondary font-medium">Optimal</span>
                    </div>
                  </div>
                </div>

                {/* Verification Sign-off Stamp */}
                <div className="bg-surface-container p-space-md rounded flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded bg-primary-container text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">verified_user</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-title-editorial text-title-editorial text-primary font-semibold">Morning Seafood Freshness & Sensory Sign-off</span>
                        <span className="font-label-caps text-label-caps bg-primary text-on-primary px-2 py-0.5 rounded uppercase">Passed</span>
                      </div>
                      <p className="font-caption text-caption text-on-surface-variant mt-0.5">Catch of the Day: Coromandel Sea Bass, Andaman Jumbo Scallops (Gills clear, eyes convex, core temp +1.4°C)</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant block">Verified by</span>
                    <span className="font-body-sm text-body-sm font-bold text-primary">Exec Chef Senthil M.</span>
                    <span className="font-caption text-caption text-on-surface-variant block">07:45 IST · Digital Signature Verified</span>
                  </div>
                </div>

                {/* Hygiene & Prep Roster Checkpoints */}
                <div className="space-y-2">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider block">Service Prep & Line Sanitization Checklist</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <label className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded cursor-pointer hover:bg-surface-container transition">
                      <input
                        type="checkbox"
                        checked={checklists.sanitizer}
                        onChange={() => setChecklists((p) => ({ ...p, sanitizer: !p.sanitizer }))}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface">Sanitizer bucket test strip: 200ppm quat</span>
                    </label>
                    <label className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded cursor-pointer hover:bg-surface-container transition">
                      <input
                        type="checkbox"
                        checked={checklists.boards}
                        onChange={() => setChecklists((p) => ({ ...p, boards: !p.boards }))}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface">Cutting boards sanitized & color-coded</span>
                    </label>
                    <label className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded cursor-pointer hover:bg-surface-container transition">
                      <input
                        type="checkbox"
                        checked={checklists.bainMaries}
                        onChange={() => setChecklists((p) => ({ ...p, bainMaries: !p.bainMaries }))}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface">Sauce bain-maries heated &gt; 65°C</span>
                    </label>
                    <label className="flex items-center gap-3 p-2.5 bg-surface-container-low rounded cursor-pointer hover:bg-surface-container transition">
                      <input
                        type="checkbox"
                        checked={checklists.defrost}
                        onChange={() => setChecklists((p) => ({ ...p, defrost: !p.defrost }))}
                        className="w-4 h-4 accent-primary rounded"
                      />
                      <span className="font-body-sm text-body-sm text-on-surface">Blast chiller defrost cycle executed</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: 86-List & High-Risk Inventory Depletion Monitor */}
              <div className="lg:col-span-5 bg-surface-container-lowest p-space-lg rounded-lg shadow-sm space-y-space-md flex flex-col justify-between border border-surface-container">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-xl">inventory_2</span>
                      <h3 className="font-headline-sm text-headline-sm text-primary">86-List & Depletion Alerts</h3>
                    </div>
                    <span className="font-label-caps text-label-caps bg-error-container text-on-error-container px-2 py-0.5 rounded font-bold uppercase">Petpooja Auto-Sync</span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant">Live portion depletion counter connected to front-of-house captain tablets.</p>
                </div>

                {/* Inventory Warning Items */}
                <div className="space-y-space-sm">
                  {/* Item 1 */}
                  <div className="p-space-sm bg-error-container/20 rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-body-md text-body-md font-bold text-primary">Ooty Wild Morel Mushrooms</span>
                        <span className="font-caption text-caption text-on-surface-variant block">Used in Morel Risotto & Tasting Course 5</span>
                      </div>
                      <div className="text-right">
                        <span className="font-headline-sm text-headline-sm font-bold text-error">4 portions</span>
                        <span className="font-label-caps text-label-caps text-error block uppercase font-bold">Critical Alert</span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                      <div className="bg-error h-full rounded-full transition-all duration-500" style={{ width: '16%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant">
                      <span>Floor Staff Alerted: Table 8+ cannot order</span>
                      <button
                        onClick={() => showToast('86 WARNING BROADCAST: "Ooty Wild Morel Mushrooms" disabled across POS', 'block')}
                        className="text-error hover:underline font-label-caps text-label-caps uppercase font-bold cursor-pointer"
                      >
                        Force 86 Now
                      </button>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-space-sm bg-surface-container-low rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-body-md text-body-md font-bold text-primary">Truffle Infused Cultured Butter</span>
                        <span className="font-caption text-caption text-on-surface-variant block">House Sourdough Accompaniment</span>
                      </div>
                      <div className="text-right">
                        <span className="font-headline-sm text-headline-sm font-bold text-secondary">2 jars</span>
                        <span className="font-label-caps text-label-caps text-secondary block uppercase font-bold">Low Reserve</span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                      <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: '25%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant">
                      <span>Larder reserve depleted from afternoon service</span>
                      <button
                        onClick={() => showToast('86 WARNING BROADCAST: "Truffle Infused Cultured Butter" disabled', 'block')}
                        className="text-secondary hover:underline font-label-caps text-label-caps uppercase font-bold cursor-pointer"
                      >
                        Auto 86
                      </button>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-space-sm bg-surface-container-low rounded space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-body-md text-body-md font-bold text-primary">Artisanal Burrata Pugliese</span>
                        <span className="font-caption text-caption text-on-surface-variant block">Cold Larder Starter Item</span>
                      </div>
                      <div className="text-right">
                        <span className="font-headline-sm text-headline-sm font-bold text-primary">8 portions</span>
                        <span className="font-label-caps text-label-caps text-surface-tint block uppercase font-semibold">Monitor</span>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                      <div className="bg-primary-container h-full rounded-full transition-all duration-500" style={{ width: '48%' }}></div>
                    </div>
                    <div className="flex items-center justify-between text-caption font-caption text-on-surface-variant">
                      <span>Sufficient for evening reservation quota</span>
                      <span className="font-label-numeric text-label-numeric">16 booked</span>
                    </div>
                  </div>
                </div>

                {/* Depleted Dishes Banner */}
                <div className="p-space-sm bg-surface-container rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-base">cancel</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Currently 86'd on POS Menu: <strong className="text-primary">Bay of Bengal Lobster Bisque</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => showToast('Reactivated "Lobster Bisque" in Petpooja menu catalog.', 'check_circle')}
                    className="font-label-caps text-label-caps text-primary hover:underline uppercase font-bold cursor-pointer"
                  >
                    Reactivate
                  </button>
                </div>
              </div>
            </div>

            {/* Kitchen Station Workload & Mise-en-Place Status */}
            <div className="bg-surface-container-lowest p-space-lg rounded-lg shadow-sm space-y-space-md border border-surface-container">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Mise-en-Place Readiness & Section Load</h3>
                  <p className="font-caption text-caption text-on-surface-variant">Shift brigade allocations across Hot Line, Garde Manger, Pastry, and Saucier</p>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-caption text-caption text-on-surface-variant">Kitchen Temp: <strong className="text-primary font-semibold">23.4°C</strong> (Hood exhaust 100%)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                {/* Station A */}
                <div className="p-space-md bg-surface-container-low rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-title-editorial text-title-editorial text-primary font-semibold block">Station A: Hot Line & Roasts</span>
                      <span className="font-caption text-caption text-on-surface-variant">Lead: Chef Murugan & CDP Vignesh</span>
                    </div>
                    <span className="font-label-caps text-label-caps bg-error-container text-on-error-container px-2 py-0.5 rounded font-bold uppercase">High Load</span>
                  </div>
                  <div className="space-y-1.5 text-caption font-caption text-on-surface-variant">
                    <div className="flex justify-between"><span>Sous-vide Lamb Batch:</span><span className="text-primary font-semibold">8 in water bath</span></div>
                    <div className="flex justify-between"><span>Sea Bass Portions Prepped:</span><span className="text-primary font-semibold">14 portions scaled</span></div>
                    <div className="flex justify-between"><span>Veal Demi-Glace Reduction:</span><span className="text-secondary font-semibold">At nape consistency</span></div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => showToast('Commis Runner redirected to support Station A', 'directions_run')}
                      className="w-full bg-surface-container-highest hover:bg-surface-variant text-primary py-1.5 rounded font-label-caps text-label-caps uppercase transition cursor-pointer"
                    >
                      Assign Helper Commis
                    </button>
                  </div>
                </div>

                {/* Station B */}
                <div className="p-space-md bg-surface-container-low rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-title-editorial text-title-editorial text-primary font-semibold block">Station B: Cold Larder & Crudo</span>
                      <span className="font-caption text-caption text-on-surface-variant">Lead: Demi Chef Ananya</span>
                    </div>
                    <span className="font-label-caps text-label-caps bg-surface-container text-primary px-2 py-0.5 rounded font-bold uppercase">Nominal</span>
                  </div>
                  <div className="space-y-1.5 text-caption font-caption text-on-surface-variant">
                    <div className="flex justify-between"><span>Micro-Herb Garnish Trays:</span><span className="text-primary font-semibold">Freshly misted</span></div>
                    <div className="flex justify-between"><span>Burrata Tempering:</span><span className="text-primary font-semibold">18°C ambient</span></div>
                    <div className="flex justify-between"><span>Heirloom Tomato Tartare:</span><span className="text-secondary font-semibold">12 portions seasoned</span></div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => showToast('Commis Runner redirected to support Station B', 'directions_run')}
                      className="w-full bg-surface-container-highest hover:bg-surface-variant text-primary py-1.5 rounded font-label-caps text-label-caps uppercase transition cursor-pointer"
                    >
                      Restock Crushed Ice
                    </button>
                  </div>
                </div>

                {/* Station C */}
                <div className="p-space-md bg-surface-container-low rounded space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-title-editorial text-title-editorial text-primary font-semibold block">Station C: Pastry & Petit Fours</span>
                      <span className="font-caption text-caption text-on-surface-variant">Lead: Pastry Sous Chef Farhan</span>
                    </div>
                    <span className="font-label-caps text-label-caps bg-surface-container text-primary px-2 py-0.5 rounded font-bold uppercase">Ready</span>
                  </div>
                  <div className="space-y-1.5 text-caption font-caption text-on-surface-variant">
                    <div className="flex justify-between"><span>Valrhona Soufflé Ramekins:</span><span className="text-primary font-semibold">18 buttered & sugared</span></div>
                    <div className="flex justify-between"><span>Cardamom Pod Gelato:</span><span className="text-primary font-semibold">Churned -14°C</span></div>
                    <div className="flex justify-between"><span>Gold-leaf Petit Fours:</span><span className="text-secondary font-semibold">4 VIP boxes boxed</span></div>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => showToast('Preheating Pastry Deck 2', 'local_fire_department')}
                      className="w-full bg-surface-container-highest hover:bg-surface-variant text-primary py-1.5 rounded font-label-caps text-label-caps uppercase transition cursor-pointer"
                    >
                      Preheat Pastry Deck
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Emergency 86 Modal */}
      {isEightySixModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-lg shadow-2xl p-space-lg space-y-space-md border border-surface-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-2xl">error</span>
                <h3 className="font-headline-sm text-headline-sm text-primary">Emergency 86 Item</h3>
              </div>
              <button onClick={() => setIsEightySixModalOpen(false)} className="text-on-surface-variant hover:text-primary cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Selecting an item here immediately marks it sold-out across all front-of-house waiter handhelds and disables ordering in Petpooja POS.
            </p>
            <div className="space-y-space-sm">
              <div>
                <label className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-1">Select Menu Item / Prepped Sub-Recipe</label>
                <select
                  value={eightySixItem}
                  onChange={(e) => setEightySixItem(e.target.value)}
                  className="w-full h-12 px-3 bg-surface-container-low rounded text-primary font-body-md focus:outline-hidden border border-surface-container-high"
                >
                  <option value="Ooty Wild Morel Mushrooms">Ooty Wild Morel Mushrooms (Risotto & Tasting)</option>
                  <option value="Truffle Infused Cultured Butter">Truffle Infused Cultured Butter</option>
                  <option value="Artisanal Burrata Pugliese">Artisanal Burrata Pugliese</option>
                  <option value="Coromandel Sea Bass">Coromandel Sea Bass Filets</option>
                  <option value="Valrhona Dark Chocolate Soufflé">Valrhona Dark Chocolate Soufflé</option>
                </select>
              </div>
              <div>
                <label className="font-label-caps text-label-caps uppercase text-on-surface-variant block mb-1">Reason for 86ing</label>
                <input
                  type="text"
                  value={eightySixReason}
                  onChange={(e) => setEightySixReason(e.target.value)}
                  placeholder="e.g., Depleted daily inventory allocation"
                  className="w-full h-12 px-3 bg-surface-container-low rounded text-primary font-body-md focus:outline-hidden border border-surface-container-high"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-space-xs">
              <button
                onClick={() => setIsEightySixModalOpen(false)}
                className="px-4 py-2 bg-surface-container rounded text-primary font-label-caps text-label-caps uppercase hover:bg-surface-container-high transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEightySix}
                className="px-4 py-2 bg-error text-on-error rounded font-label-caps text-label-caps uppercase hover:bg-error/90 transition flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">block</span> Broadcast 86 to All Terminals
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-secondary-fixed">{toast.icon}</span>
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
                <button onClick={() => onSwitchRole?.('manager-operations')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">Manager</button>
                <button onClick={() => onSwitchRole?.('chef-kitchen')} className="px-2 py-1 bg-primary-container text-on-primary font-caption text-caption rounded font-semibold cursor-pointer">Chef</button>
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
