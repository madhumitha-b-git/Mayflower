import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onOpenReservations?: () => void;
  onSwitchRole?: (rolePath: string) => void;
}

export const CustomerDashboard: React.FC<Props> = ({ user, onLogout, onOpenReservations, onSwitchRole }) => {
  const [selectedSanctuary, setSelectedSanctuary] = useState('poes');
  const [liveTime, setLiveTime] = useState('18:42:10 IST');
  const [countdownSeconds, setCountdownSeconds] = useState(1 * 3600 + 48 * 60 + 12);
  
  // Modals state
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDietaryModalOpen, setIsDietaryModalOpen] = useState(false);
  const [dietaryMemo, setDietaryMemo] = useState('Vegetarian tasting tasting flights, anniversary jasmine garnishes requested.');

  // Form inputs for new reservation
  const [newOutlet, setNewOutlet] = useState('poes');
  const [newDate, setNewDate] = useState('2024-11-28');
  const [newSlot, setNewSlot] = useState('dinner');
  const [newParty, setNewParty] = useState('4');

  // Star rating
  const [rating, setRating] = useState(5);
  const [dishCritique, setDishCritique] = useState('');
  const [staffRecognition, setStaffRecognition] = useState('');
  const [chefNotes, setChefNotes] = useState('');

  // Toast State
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  useEffect(() => {
    const clockTimer = setInterval(() => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('en-GB') + ' IST');
    }, 1000);

    const countdownTimer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(countdownTimer);
    };
  }, []);

  const formatCountdown = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `T-Minus ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
  };

  const showToast = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleRequestBooking = () => {
    showToast(`Bespoke Reservation Request initiated for ${newOutlet.toUpperCase()} on ${newDate}. Concierge SMS dispatched to ${user.name}.`);
  };

  const handleCancelReservation = () => {
    if (window.confirm('Are you certain you wish to release Table C4 at Poes Garden Flagship for tonight? Your VIP hold will be returned to the open reservation pool.')) {
      showToast('Reservation #MF-8834 has been released. The Maitre d\' has been notified.');
    }
  };

  const handleSubmitFeedback = () => {
    setIsFeedbackModalOpen(false);
    showToast('Patron critique successfully transmitted to Mayflower Culinary Directors.');
    setDishCritique('');
    setStaffRecognition('');
    setChefNotes('');
  };

  const handleSaveDietaryMemo = () => {
    setIsDietaryModalOpen(false);
    showToast('Table C4 dietary directive dispatched to Kitchen Expeditor.');
  };

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
              <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-primary-container text-on-primary font-bold uppercase">VIP Guest Suite</span>
              <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
                {user.name ? user.name[0].toUpperCase() : 'G'}
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
              <button onClick={() => onSwitchRole?.('chef-kitchen')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                Kitchen & HACCP
              </button>
              <button onClick={() => onSwitchRole?.('hr-roster')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                Staffing & HR
              </button>
              <button onClick={() => onSwitchRole?.('accountant-ledger')} className="px-space-sm py-1.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary uppercase cursor-pointer">
                POS Reconciliation
              </button>
              <button onClick={() => onSwitchRole?.('customer-portal')} className="px-space-sm py-1.5 transition-all bg-primary-container text-on-primary font-semibold rounded shadow-sm font-label-caps uppercase cursor-pointer">
                VIP Guest Suite
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Operational Canvas */}
      <main className="w-full pt-28 bg-background min-h-[calc(100vh-140px)] pb-16">
        <div className="flex flex-col w-full">
          <div className="w-full px-space-md lg:px-margin-desktop py-space-xl flex flex-col gap-space-2xl">
            
            {/* Top Breadcrumb & Status Indicator */}
            <div className="flex flex-wrap items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-xs text-on-surface-variant">
                <span className="font-label-caps text-label-caps tracking-wider uppercase text-secondary">Private Patron Enclave</span>
                <span className="font-caption text-caption text-outline-variant">/</span>
                <span className="font-caption text-caption text-on-surface font-medium">Guest Dossier & Sanctuaries Concierge</span>
              </div>
              <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-1.5 rounded-full shadow-sm border border-surface-container">
                <span className="inline-block w-2 h-2 rounded-full bg-secondary-container animate-ping"></span>
                <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-widest">Floor Link: Table C4 Active Sync</span>
                <span className="font-label-numeric text-label-numeric text-on-surface-variant font-semibold">{liveTime}</span>
              </div>
            </div>

            {/* Section 1: VIP Patron Dossier & Heritage Pass */}
            <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-stretch">
              
              {/* Patron Pass Card */}
              <div className="lg:col-span-8 bg-primary text-on-primary rounded-xl p-space-lg lg:p-space-xl relative overflow-hidden shadow-xl flex flex-col justify-between">
                <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-surface-tint/10 blur-3xl pointer-events-none"></div>
                <div className="absolute right-8 bottom-6 opacity-5 pointer-events-none">
                  <span className="material-symbols-outlined text-[200px] leading-none">spa</span>
                </div>
                <div className="relative z-10 flex flex-col gap-space-lg">
                  <div className="flex flex-wrap items-start justify-between gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-title-editorial text-3xl font-bold shadow-md">
                          {user.name ? user.name[0].toUpperCase() : 'A'}
                        </div>
                        <span className="absolute bottom-0 right-0 bg-secondary text-on-secondary w-6 h-6 rounded-full flex items-center justify-center text-caption font-bold shadow-sm">
                          <span className="material-symbols-outlined text-[15px]">verified</span>
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-xs">
                          <h1 className="font-headline-md text-headline-md text-surface-bright tracking-tight">{user.name || 'Dr. Arvind Swaminathan'}</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-space-xs mt-1">
                          <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold">Heritage Connoisseur</span>
                          <span className="font-caption text-caption text-surface-variant/80">· Sanctuary Patron since {user.joinedDate || '2023'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Privilege Meta Badge */}
                    <div className="flex flex-col items-end text-right bg-primary-container/80 backdrop-blur-md px-space-md py-space-sm rounded-lg">
                      <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-wider">Sanctuary Vault</span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-headline-sm text-headline-sm text-surface-bright font-bold">{user.rewardPoints || 1450}</span>
                        <span className="font-label-caps text-label-caps text-secondary-fixed uppercase">Guild Pts</span>
                      </div>
                      <span className="font-caption text-caption text-on-primary-container">Next: Estate Tasting Flight</span>
                    </div>
                  </div>

                  {/* Preferences & Direct Contact Matrix */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
                    <div className="bg-surface-tint/15 p-space-sm rounded-lg flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-secondary-fixed uppercase font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> Preferred Sanctuary
                      </span>
                      <span className="font-body-md text-body-md text-surface-bright font-medium">Poes Garden Flagship</span>
                      <span className="font-caption text-caption text-on-primary-container">Conservatory Alcove C4</span>
                    </div>
                    <div className="bg-surface-tint/15 p-space-sm rounded-lg flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-secondary-fixed uppercase font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">eco</span> Dietary Protocol
                      </span>
                      <span className="font-body-md text-body-md text-surface-bright font-medium">Lacto-Vegetarian</span>
                      <span className="font-caption text-caption text-on-primary-container">Cold-pressed sesame, no alliums</span>
                    </div>
                    <div className="bg-surface-tint/15 p-space-sm rounded-lg flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-secondary-fixed uppercase font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">favorite</span> Celebratory Notes
                      </span>
                      <span className="font-body-md text-body-md text-surface-bright font-medium">Annual Anniversaries</span>
                      <span className="font-caption text-caption text-on-primary-container">Prefers unhurried tea service</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-space-sm mt-space-lg pt-space-md">
                  <div className="flex flex-wrap items-center gap-space-md text-caption font-caption text-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">mail</span> {user.email || 'arvind.swaminathan@consortium.org'}
                      <span className="text-secondary-fixed font-semibold">(Verified)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">phone_iphone</span> +91 98401 44829
                      <span className="text-secondary-fixed font-semibold">(VIP Direct)</span>
                    </span>
                  </div>
                  <button
                    onClick={() => showToast('Guest profile & communication dispatch preferences unlocked. Editable mode enabled.')}
                    className="px-space-md py-1.5 bg-surface-bright text-primary rounded font-label-caps text-label-caps uppercase tracking-wider font-bold hover:bg-secondary-fixed transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit_note</span> Edit Preferences
                  </button>
                </div>
              </div>

              {/* Quick Concierge & Membership Status */}
              <div className="lg:col-span-4 bg-surface-container rounded-xl p-space-lg flex flex-col justify-between shadow-sm border border-surface-container-high">
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary font-bold">House Privileges</span>
                    <span className="font-label-numeric text-label-numeric text-on-surface-variant font-semibold">Tier V</span>
                  </div>
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-title-editorial text-title-editorial text-primary font-bold">Guild Tier Progression</span>
                      <span className="font-caption text-caption text-on-surface-variant">72% to Grand Cellarer</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className="h-full bg-secondary w-[72%] rounded-full transition-all duration-700"></div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-space-xs text-body-sm font-body-sm text-on-surface-variant">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                      <span>Priority 48-Hour Conservatory Hold</span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                      <span>Complimentary Valet at Poes Garden & ECR</span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                      <span>Direct Kitchen Sommelier Consultation</span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span>
                      <span>Exclusive Access to Seasonal Rare Teas</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low p-space-sm rounded-lg mt-space-md flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Dedicated Hostess</span>
                    <span className="font-body-md text-body-md text-primary font-semibold">Maitre Gayatri Nair</span>
                  </div>
                  <button
                    onClick={() => showToast('Direct Ring to Maitre Gayatri initiated.')}
                    className="px-space-sm py-1 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase hover:bg-on-surface-variant transition-colors cursor-pointer"
                  >
                    Direct Ring
                  </button>
                </div>
              </div>
            </section>

            {/* Section 2: Active & Upcoming Reservation Lifecycle */}
            <section className="w-full flex flex-col gap-space-md">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">Active Sanctuary Itinerary</h2>
                </div>
                <span className="font-caption text-caption text-on-surface-variant">Real-time Table Synchronization Enabled</span>
              </div>

              {/* Live Booking Hero Card */}
              <div className="w-full bg-surface-container-lowest rounded-xl p-space-lg lg:p-space-xl shadow-lg relative overflow-hidden border border-surface-container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                  {/* Image Snippet */}
                  <div className="lg:col-span-4 relative rounded-lg overflow-hidden shadow-sm aspect-video lg:aspect-square">
                    <img
                      alt="Sun-dappled interior of a grand botanical fine dining greenhouse at Poes Garden"
                      className="w-full h-full object-cover"
                      src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
                    />
                    <div className="absolute top-3 left-3 bg-primary/85 backdrop-blur-md text-surface-bright px-space-sm py-1 rounded font-label-caps text-label-caps uppercase tracking-wider font-semibold">
                      Today · Evening Soirée
                    </div>
                  </div>

                  {/* Main Booking Details */}
                  <div className="lg:col-span-8 flex flex-col justify-between gap-space-lg">
                    <div className="flex flex-col gap-space-xs">
                      <div className="flex flex-wrap items-center justify-between gap-space-sm">
                        <div className="flex items-center gap-space-xs">
                          <span className="bg-secondary-container text-on-secondary-container px-space-sm py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">event_seat</span> Confirmed · Table C4 Reserved
                          </span>
                          <span className="bg-surface-container px-space-xs py-0.5 rounded font-caption text-caption text-on-surface-variant">Booking ID: #MF-8834</span>
                        </div>

                        {/* Countdown Pill */}
                        <div className="bg-tertiary-fixed text-on-tertiary-fixed px-space-md py-1 rounded-full font-label-numeric text-label-numeric font-bold tracking-tight shadow-sm flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">timer</span>
                          <span>{formatCountdown(countdownSeconds)}</span>
                        </div>
                      </div>

                      <h3 className="font-headline-lg text-headline-lg text-primary mt-1">Poes Garden Flagship Sanctuary</h3>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        12 Kasturi Rangan Road, Poes Garden, Chennai 600086 · Conservatory Garden Alcove
                      </p>
                    </div>

                    {/* Fast Spec Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm py-space-sm bg-surface-container-low p-space-md rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Time Slot</span>
                        <span className="font-title-editorial text-title-editorial text-primary font-bold">8:30 PM IST</span>
                        <span className="font-caption text-caption text-secondary">Botanical Dinner</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Guest Covers</span>
                        <span className="font-title-editorial text-title-editorial text-primary font-bold">4 Guests</span>
                        <span className="font-caption text-caption text-on-surface-variant">Intimate Dining</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Course Curation</span>
                        <span className="font-title-editorial text-title-editorial text-primary font-bold">7-Course</span>
                        <span className="font-caption text-caption text-on-surface-variant">Autumn Harvest Menu</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Assigned Sommelier</span>
                        <span className="font-title-editorial text-title-editorial text-primary font-bold">Chef Julian</span>
                        <span className="font-caption text-caption text-secondary">Tea Pairings</span>
                      </div>
                    </div>

                    {/* Dietary Memo Banner */}
                    <div className="flex items-center justify-between bg-surface-container px-space-md py-space-xs rounded text-body-sm font-body-sm text-on-surface">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-secondary text-[18px]">room_service</span>
                        <span className="font-medium">Active Kitchen Note:</span>
                        <span className="italic text-on-surface-variant">{dietaryMemo}</span>
                      </div>
                      <button
                        onClick={() => setIsDietaryModalOpen(true)}
                        className="font-label-caps text-label-caps text-secondary underline hover:text-primary uppercase font-bold cursor-pointer"
                      >
                        Modify Memo
                      </button>
                    </div>

                    {/* Action Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
                      <div className="flex items-center gap-space-xs">
                        <a
                          href="https://maps.google.com"
                          target="_blank"
                          rel="noreferrer"
                          className="px-space-md py-2 bg-surface-container text-primary rounded font-label-caps text-label-caps uppercase tracking-wider font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[16px]">directions</span> Navigate Flagship
                        </a>
                        <button
                          onClick={() => showToast('Opening reservation modification drawer...')}
                          className="px-space-md py-2 bg-surface-container text-primary rounded font-label-caps text-label-caps uppercase tracking-wider font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit_calendar</span> Modify Booking
                        </button>
                      </div>
                      <button
                        onClick={handleCancelReservation}
                        className="px-space-md py-2 text-error font-label-caps text-label-caps uppercase tracking-wider font-semibold hover:bg-error-container/50 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span> Cancel Reservation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Bespoke Reservation Request Interface */}
            <section className="w-full bg-surface-container-low rounded-xl p-space-lg lg:p-space-xl shadow-md flex flex-col gap-space-lg border border-surface-container-high">
              <div className="flex flex-col gap-space-2xs">
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold">Concierge Dispatch</span>
                <h2 className="font-headline-md text-headline-md text-primary">Arrange an Upcoming Sanctuary Dining Experience</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Direct reservation link with real-time floor availability across all four Chennai havens.</p>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {/* 1. Sanctuary Outlet Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Select Sanctuary Sanctuary</label>
                  <div className="relative">
                    <select
                      value={newOutlet}
                      onChange={(e) => setNewOutlet(e.target.value)}
                      className="w-full h-12 bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md rounded shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-surface-container-high"
                    >
                      <option value="poes">Poes Garden Flagship</option>
                      <option value="ecr">Palavakkam Coastal ECR</option>
                      <option value="anna">Anna Nagar East Pavilion</option>
                      <option value="velachery">Velachery Lakeside Manor</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                  </div>
                  <span className="font-caption text-caption text-secondary font-medium">Flagship: High Valet Density</span>
                </div>

                {/* 2. Date Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Date of Attendance</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full h-12 bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
                  />
                  <span className="font-caption text-caption text-on-surface-variant">Booking window open for 60 days</span>
                </div>

                {/* 3. Service Slot */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Service Sitting</label>
                  <div className="relative">
                    <select
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      className="w-full h-12 bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md rounded shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-surface-container-high"
                    >
                      <option value="lunch">Midday Degustation (12:30 PM - 3:00 PM)</option>
                      <option value="tea">Conservatory High Tea (4:30 PM - 6:30 PM)</option>
                      <option value="dinner">Botanical Evening (7:30 PM - 11:00 PM)</option>
                      <option value="late">Moonlit Cellar Tasting (10:30 PM onwards)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[20px]">expand_more</span>
                  </div>
                  <span className="font-caption text-caption text-secondary-fixed-dim text-on-tertiary-container font-semibold">Chef's Table Available</span>
                </div>

                {/* 4. Covers & Party Size */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase font-semibold">Guest Party Count</label>
                  <div className="relative">
                    <select
                      value={newParty}
                      onChange={(e) => setNewParty(e.target.value)}
                      className="w-full h-12 bg-surface-container-lowest text-on-surface font-body-md text-body-md px-space-md rounded shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-surface-container-high"
                    >
                      <option value="2">2 Covers (Intimate Salon)</option>
                      <option value="4">4 Covers (Verandah Banquette)</option>
                      <option value="6">6 Covers (Greenhouse Round)</option>
                      <option value="8">8 Covers (Private Pavilion)</option>
                      <option value="12">12 Covers (Grand Estate Board)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[20px]">group</span>
                  </div>
                  <span className="font-caption text-caption text-on-surface-variant">For &gt;12, contact Maitre directly</span>
                </div>

                {/* Full-Width Floor Availability Bar & Submit */}
                <div className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-col md:flex-row items-center justify-between gap-space-md pt-space-sm">
                  <div className="flex items-center gap-space-sm text-body-sm font-body-sm text-on-surface-variant">
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span> 3 Premium Tables Unreserved
                    </span>
                    <span>· Sommelier Allocation Validated</span>
                  </div>
                  <div className="flex items-center gap-space-sm w-full md:w-auto">
                    <button
                      type="button"
                      onClick={handleRequestBooking}
                      className="w-full md:w-auto px-space-xl h-12 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase tracking-widest font-bold hover:bg-surface-tint transition-all shadow-md flex items-center justify-center gap-space-xs cursor-pointer"
                    >
                      <span>Secure Table Placement</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* Section 4: Past Dining History & Reservation Archive */}
            <section className="w-full flex flex-col gap-space-lg">
              <div className="flex flex-wrap items-center justify-between gap-space-md">
                <div className="flex flex-col">
                  <h2 className="font-headline-md text-headline-md text-primary">Sanctuary Gastronomy Archive</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">Itemized Petpooja POS receipts, sommelier notes, and verified dining records.</p>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button className="px-space-sm py-1.5 bg-primary text-on-primary font-label-caps text-label-caps uppercase rounded font-bold shadow-sm cursor-pointer">All Sittings</button>
                  <button className="px-space-sm py-1.5 bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase rounded hover:text-primary transition-colors cursor-pointer">Poes Garden</button>
                  <button className="px-space-sm py-1.5 bg-surface-container text-on-surface-variant font-label-caps text-label-caps uppercase rounded hover:text-primary transition-colors cursor-pointer">ECR</button>
                </div>
              </div>

              {/* Table Container */}
              <div className="w-full bg-surface-container-lowest rounded-xl overflow-x-auto shadow-md border border-surface-container">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    <tr>
                      <th className="py-space-md px-space-lg">Sitting Date & Outlet</th>
                      <th className="py-space-md px-space-md">Occasion & Table</th>
                      <th className="py-space-md px-space-md">Covers</th>
                      <th className="py-space-md px-space-md">Bill Gross</th>
                      <th className="py-space-md px-space-md">Status</th>
                      <th className="py-space-md px-space-lg text-right">Dossier & Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
                    {/* Row 1 */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-space-md px-space-lg">
                        <div className="flex flex-col">
                          <span className="font-title-editorial text-title-editorial text-primary font-bold">14 Oct 2024</span>
                          <span className="font-caption text-caption text-on-surface-variant">Poes Garden Flagship · Evening</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex flex-col">
                          <span className="font-medium text-primary">Private Anniversary Dinner</span>
                          <span className="font-caption text-caption text-secondary">Table C4 · Conservatory</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md font-label-numeric text-label-numeric">4 Guests</td>
                      <td className="py-space-md px-space-md">
                        <div className="flex flex-col">
                          <span className="font-label-numeric text-label-numeric font-bold text-primary">₹18,450.00</span>
                          <span className="font-caption text-caption text-secondary">+280 Pts Credited</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <span className="bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold uppercase">Completed</span>
                      </td>
                      <td className="py-space-md px-space-lg text-right">
                        <div className="flex items-center justify-end gap-space-xs">
                          <button
                            onClick={() => showToast('Downloading Petpooja Tax Invoice #INV-2024-8931...')}
                            className="px-space-sm py-1 bg-surface-container rounded font-label-caps text-label-caps text-primary hover:bg-surface-container-high flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">receipt_long</span> PDF Receipt
                          </button>
                          <button
                            onClick={() => setIsFeedbackModalOpen(true)}
                            className="px-space-sm py-1 bg-secondary-container text-on-secondary-container rounded font-label-caps text-label-caps font-bold hover:bg-secondary-fixed cursor-pointer"
                          >
                            Review Dish
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Row 2 */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-space-md px-space-lg">
                        <div className="flex flex-col">
                          <span className="font-title-editorial text-title-editorial text-primary font-bold">29 Sep 2024</span>
                          <span className="font-caption text-caption text-on-surface-variant">Palavakkam Coastal ECR</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex flex-col">
                          <span className="font-medium text-primary">Executive Tea & Sundowner</span>
                          <span className="font-caption text-caption text-secondary">Deck Pavilion #2</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md font-label-numeric text-label-numeric">6 Guests</td>
                      <td className="py-space-md px-space-md">
                        <div className="flex flex-col">
                          <span className="font-label-numeric text-label-numeric font-bold text-primary">₹12,200.00</span>
                          <span className="font-caption text-caption text-secondary">+195 Pts Credited</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <span className="bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold uppercase">Completed</span>
                      </td>
                      <td className="py-space-md px-space-lg text-right">
                        <div className="flex items-center justify-end gap-space-xs">
                          <button
                            onClick={() => showToast('Downloading Petpooja Tax Invoice #INV-2024-7104...')}
                            className="px-space-sm py-1 bg-surface-container rounded font-label-caps text-label-caps text-primary hover:bg-surface-container-high flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">receipt_long</span> PDF Receipt
                          </button>
                          <span className="font-caption text-caption text-on-surface-variant italic">Feedback Logged</span>
                        </div>
                      </td>
                    </tr>

                    {/* Row 3 */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-space-md px-space-lg">
                        <div className="flex flex-col">
                          <span className="font-title-editorial text-title-editorial text-primary font-bold">18 Aug 2024</span>
                          <span className="font-caption text-caption text-on-surface-variant">Anna Nagar East Pavilion</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <div className="flex flex-col">
                          <span className="font-medium text-primary">Family Birthday Luncheon</span>
                          <span className="font-caption text-caption text-secondary">Atrium Table 10</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md font-label-numeric text-label-numeric">8 Guests</td>
                      <td className="py-space-md px-space-md">
                        <div className="flex flex-col">
                          <span className="font-label-numeric text-label-numeric font-bold text-primary">₹24,800.00</span>
                          <span className="font-caption text-caption text-secondary">+380 Pts Credited</span>
                        </div>
                      </td>
                      <td className="py-space-md px-space-md">
                        <span className="bg-primary-fixed text-on-primary-fixed font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold uppercase">Completed</span>
                      </td>
                      <td className="py-space-md px-space-lg text-right">
                        <div className="flex items-center justify-end gap-space-xs">
                          <button
                            onClick={() => showToast('Downloading Petpooja Tax Invoice #INV-2024-5542...')}
                            className="px-space-sm py-1 bg-surface-container rounded font-label-caps text-label-caps text-primary hover:bg-surface-container-high flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[15px]">receipt_long</span> PDF Receipt
                          </button>
                          <span className="font-caption text-caption text-on-surface-variant italic">Feedback Logged</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5: Loyalty Guild & Curated Privileges */}
            <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
              {/* Rewards Balance & Tier Benefits */}
              <div className="lg:col-span-6 bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-xl shadow-md flex flex-col justify-between border border-surface-container">
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold">Guild Rewards Registry</span>
                    <span className="font-label-numeric text-label-numeric font-bold text-primary">Balance: {user.rewardPoints || 1450} Pts</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Redeem Privileges for Next Visit</h3>
                  
                  <div className="flex flex-col gap-space-sm mt-space-xs">
                    {/* Reward 1 */}
                    <div className="p-space-md bg-surface-container-low rounded-lg flex items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-10 h-10 rounded bg-primary text-secondary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">wine_bar</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-editorial text-title-editorial text-primary font-bold">Rare Botanical Tea Flight</span>
                          <span className="font-caption text-caption text-on-surface-variant">Curated 4-infusion flight from Nilgiris harvest</span>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast('Privilege Redeemed: Rare Botanical Tea Flight voucher credited!')}
                        className="px-space-sm py-1.5 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase font-semibold hover:bg-surface-tint cursor-pointer"
                      >
                        Redeem 600 Pts
                      </button>
                    </div>

                    {/* Reward 2 */}
                    <div className="p-space-md bg-surface-container-low rounded-lg flex items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-10 h-10 rounded bg-secondary text-surface-bright flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">workspace_premium</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-editorial text-title-editorial text-primary font-bold">Private Glasshouse Seclusion</span>
                          <span className="font-caption text-caption text-on-surface-variant">Waived reservation retainer for up to 8 guests</span>
                        </div>
                      </div>
                      <button
                        onClick={() => showToast('Privilege Redeemed: Private Glasshouse Seclusion credited!')}
                        className="px-space-sm py-1.5 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase font-semibold hover:bg-surface-tint cursor-pointer"
                      >
                        Redeem 1,200 Pts
                      </button>
                    </div>

                    {/* Reward 3 (Locked) */}
                    <div className="p-space-md bg-surface-container-low/60 rounded-lg flex items-center justify-between gap-space-md opacity-75">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-10 h-10 rounded bg-surface-variant text-on-surface-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-[22px]">countertops</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-title-editorial text-title-editorial text-on-surface-variant font-bold">Private Masterclass with Chef Julian</span>
                          <span className="font-caption text-caption text-outline">Exclusive culinary session at Anna Nagar Manor</span>
                        </div>
                      </div>
                      <span className="font-label-caps text-label-caps text-outline font-bold uppercase">2,500 Pts Req</span>
                    </div>
                  </div>
                </div>

                <div className="pt-space-md flex items-center justify-between text-caption font-caption text-on-surface-variant">
                  <span>Points expire 24 months from last sitting.</span>
                  <a className="text-secondary underline font-semibold" href="#">Terms of Guild Honor</a>
                </div>
              </div>

              {/* Sommelier Notes & Patron Preference Dossier */}
              <div className="lg:col-span-6 bg-surface-container-lowest p-space-lg lg:p-space-xl rounded-xl shadow-md flex flex-col justify-between border border-surface-container">
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold">Kitchen Intelligence & Dossier</span>
                    <span className="font-caption text-caption text-on-surface-variant">Synced with Head Chef Console</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Curated Taste Profile & Floor Directives</h3>
                  
                  <div className="flex flex-col gap-space-sm">
                    <div className="p-space-md bg-surface-container-low rounded-lg flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">Preferred Beverage Architecture</span>
                      <p className="font-body-md text-body-md text-on-surface">
                        Prefers wild single-estate white teas, jasmine blossoms, and house-fermented kombuchas with low residual sugars.
                      </p>
                    </div>
                    <div className="p-space-md bg-surface-container-low rounded-lg flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">Bespoke Table Placement</span>
                      <p className="font-body-md text-body-md text-on-surface">
                        Consistently assigns Table C4 or ECR Bay Vista. Prefers tables positioned away from main service entryways to permit unhurried dialogue.
                      </p>
                    </div>
                    <div className="p-space-md bg-surface-container-low rounded-lg flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">Staff Commendations Awarded</span>
                      <p className="font-body-md text-body-md text-on-surface">
                        Recognized Floor Sommelier Julian (5 stars, Sept 2024) and Lead Server Karthik (Oct 2024).
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="w-full mt-space-md py-space-sm bg-surface-container text-primary rounded font-label-caps text-label-caps uppercase tracking-wider font-bold hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">rate_review</span> Provide Post-Visit Feedback
                </button>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* Modal: Provide Post-Visit Feedback */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest rounded-xl max-w-xl w-full p-space-lg lg:p-space-xl shadow-2xl flex flex-col gap-space-md relative border border-surface-container">
            <button
              onClick={() => setIsFeedbackModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-widest">Sanctuary Critique Dossier</span>
              <h3 className="font-headline-sm text-headline-sm text-primary">Post-Visit Dining Experience</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Your feedback directly shapes executive kitchen adjustments and staff honors.</p>
            </div>

            <div className="flex flex-col gap-space-md py-space-xs">
              <div className="flex flex-col gap-1">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Overall Sanctuary Ambiance</span>
                <div className="flex items-center gap-2 text-secondary cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setRating(star)}
                      className={`material-symbols-outlined text-[28px] ${star <= rating ? 'opacity-100' : 'opacity-30'}`}
                    >
                      star
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Celebrated Dish / Course Critique</label>
                <input
                  type="text"
                  value={dishCritique}
                  onChange={(e) => setDishCritique(e.target.value)}
                  placeholder="e.g. The Smoked Artichoke & Jasmine Infusion was impeccable..."
                  className="w-full h-11 bg-surface-container text-on-surface px-space-md rounded text-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Staff Member Recognition</label>
                <input
                  type="text"
                  value={staffRecognition}
                  onChange={(e) => setStaffRecognition(e.target.value)}
                  placeholder="e.g. Maitre Gayatri / Floor Server Karthik"
                  className="w-full h-11 bg-surface-container text-on-surface px-space-md rounded text-body-md focus:outline-none focus:ring-1 focus:ring-primary border border-surface-container-high"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Confidential Notes for Executive Chef</label>
                <textarea
                  rows={3}
                  value={chefNotes}
                  onChange={(e) => setChefNotes(e.target.value)}
                  placeholder="Share discrete insights on pacing, lighting, or acoustics..."
                  className="w-full bg-surface-container text-on-surface p-space-sm rounded text-body-md focus:outline-none focus:ring-1 focus:ring-primary resize-none border border-surface-container-high"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-space-sm pt-space-xs">
              <button
                onClick={() => setIsFeedbackModalOpen(false)}
                className="px-space-md py-2 text-on-surface-variant font-label-caps text-label-caps uppercase cursor-pointer"
              >
                Dismiss
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="px-space-xl py-2 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase font-bold tracking-wider hover:bg-surface-tint shadow-md cursor-pointer"
              >
                Transmit Critique
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Dietary Memo Quick Adjustment */}
      {isDietaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-2xl flex flex-col gap-space-md relative border border-surface-container">
            <button
              onClick={() => setIsDietaryModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-widest">Immediate Kitchen Dispatch</span>
              <h3 className="font-headline-sm text-headline-sm text-primary">Modify Dietary Memo for Table C4</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Dispatched in real-time to Executive Chef and Line Expeditor.</p>
            </div>
            <textarea
              rows={4}
              value={dietaryMemo}
              onChange={(e) => setDietaryMemo(e.target.value)}
              className="w-full bg-surface-container text-on-surface p-space-sm rounded text-body-md focus:outline-none focus:ring-1 focus:ring-primary resize-none border border-surface-container-high"
            />
            <div className="flex items-center justify-end gap-space-sm">
              <button
                onClick={() => setIsDietaryModalOpen(false)}
                className="px-space-md py-2 text-on-surface-variant font-label-caps text-label-caps uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDietaryMemo}
                className="px-space-lg py-2 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase font-bold tracking-wider hover:bg-surface-tint shadow-md cursor-pointer"
              >
                Update Table C4 Memo
              </button>
            </div>
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
                <button onClick={() => onSwitchRole?.('manager-operations')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">Manager</button>
                <button onClick={() => onSwitchRole?.('chef-kitchen')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">Chef</button>
                <button onClick={() => onSwitchRole?.('hr-roster')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">HR</button>
                <button onClick={() => onSwitchRole?.('accountant-ledger')} className="px-2 py-1 bg-surface-container text-on-surface font-caption text-caption rounded hover:bg-surface-container-high transition-colors cursor-pointer">Accountant</button>
                <button onClick={() => onSwitchRole?.('customer-portal')} className="px-2 py-1 bg-primary-container text-on-primary font-caption text-caption rounded font-semibold cursor-pointer">VIP Guest</button>
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
