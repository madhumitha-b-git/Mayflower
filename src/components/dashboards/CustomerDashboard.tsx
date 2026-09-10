import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { UserProfile } from '../../types';
import { PlanYourVisit } from '../PlanYourVisit';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onOpenReservations?: () => void;
  onSwitchRole?: (role: string) => void;
  onUpdateUser?: (user: UserProfile) => void;
}

interface CustomerRow {
  dietary_preferences: string[] | null;
  allergies: string | null;
  preferred_seating: string | null;
  total_visits: number;
  loyalty_tier: string | null;
  loyalty_points: number;
}

interface ReservationRow {
  id: string;
  booking_code: string | null;
  outlet: string | null;
  reservation_date: string | null;
  time_slot: string | null;
  guests: number | null;
  status: string | null;
  booked_at: string | null;
  special_occasion: string | null;
  dietary_prefs: string | null;
}

interface FeedbackRow {
  id: string;
  outlet: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
  visit_date: string | null;
}

interface OutletRow {
  id: string;
  name: string;
}

export const CustomerDashboard: React.FC<Props> = ({ user, onLogout, onUpdateUser }) => {
  const [showReservationWizard, setShowReservationWizard] = useState(false);
  const [customer, setCustomer] = useState<CustomerRow | null>(null);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRow[]>([]);
  const [outlets, setOutlets] = useState<OutletRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Modify reservation inline
  const [modifyingId, setModifyingId] = useState<string | null>(null);
  const [modifyDate, setModifyDate] = useState('');
  const [modifySlot, setModifySlot] = useState('');
  const [modifyGuests, setModifyGuests] = useState('');

  // Feedback modal
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [fbOutlet, setFbOutlet] = useState('');
  const [fbRating, setFbRating] = useState(5);
  const [fbComment, setFbComment] = useState('');
  const [fbVisitDate, setFbVisitDate] = useState('');
  const [submittingFb, setSubmittingFb] = useState(false);

  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; error?: boolean }>({ show: false, message: '' });

  const showToast = (msg: string, error = false) => {
    setToast({ show: true, message: msg, error });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  useEffect(() => { fetchAll(); }, [user.id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [custRes, resRes, fbRes, outRes] = await Promise.all([
        supabase.from('customers').select('dietary_preferences,allergies,preferred_seating,total_visits,loyalty_tier,loyalty_points').eq('user_id', user.id).maybeSingle(),
        supabase.from('reservations').select('id,booking_code,outlet,reservation_date,time_slot,guests,status,booked_at,special_occasion,dietary_prefs').eq('customer_id', user.id).order('reservation_date', { ascending: false }),
        supabase.from('feedback').select('id,outlet,rating,comment,created_at,visit_date').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('outlets').select('id,name').eq('is_active', true).order('name'),
      ]);
      if (custRes.data) setCustomer(custRes.data as CustomerRow);
      if (resRes.data) setReservations(resRes.data as ReservationRow[]);
      if (fbRes.data) setFeedbackHistory(fbRes.data as FeedbackRow[]);
      if (outRes.data) { setOutlets(outRes.data as OutletRow[]); if (outRes.data.length > 0) setFbOutlet(outRes.data[0].name); }
    } catch { showToast('Failed to load data.', true); }
    finally { setLoading(false); }
  };

  const handleModifySave = async (id: string) => {
    const updates: Record<string, string | number> = {};
    if (modifyDate) updates.reservation_date = modifyDate;
    if (modifySlot) updates.time_slot = modifySlot;
    if (modifyGuests) updates.guests = parseInt(modifyGuests);
    const { error } = await supabase.from('reservations').update(updates).eq('id', id).eq('customer_id', user.id);
    if (error) { showToast('Failed to update reservation.', true); return; }
    showToast('Reservation updated.');
    setModifyingId(null);
    fetchAll();
  };

  const RESERVATION_BONUS = 300;

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this reservation? Your 300 loyalty points will be deducted.')) return;

    // 1. Delete the reservation row entirely
    const { error: delError } = await supabase.from('reservations').delete().eq('id', id).eq('customer_id', user.id);
    if (delError) { showToast('Failed to cancel reservation.', true); return; }

    // 2. Deduct points and log cancellation transaction in user_profiles
    const { data: profileData } = await supabase.from('user_profiles').select('reward_points,transactions').eq('id', user.id).single();
    if (profileData) {
      const cancelTx = {
        id: `cancel-${id}`,
        type: 'cancelled_reservation',
        points: -RESERVATION_BONUS,
        description: 'Points deducted for cancelled reservation',
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      const newPoints = Math.max(0, (profileData.reward_points ?? 0) - RESERVATION_BONUS);
      const { error: updateError } = await supabase.from('user_profiles').update({
        reward_points: newPoints,
        transactions: [...(profileData.transactions ?? []), cancelTx],
      }).eq('id', user.id);
      if (!updateError && onUpdateUser) {
        const { fetchUserProfile } = await import('../../lib/authService');
        const updated = await fetchUserProfile(user.id);
        if (updated) onUpdateUser(updated);
      }
    }

    showToast('Reservation cancelled. 300 points deducted.');
    fetchAll();
  };

  const handleSubmitFeedback = async () => {
    if (!fbOutlet || !fbComment) { showToast('Please fill outlet and comment.', true); return; }
    setSubmittingFb(true);
    const { error } = await supabase.from('feedback').insert({ user_id: user.id, outlet: fbOutlet, rating: fbRating, comment: fbComment, visit_date: fbVisitDate || null });
    setSubmittingFb(false);
    if (error) { showToast('Failed to submit feedback.', true); return; }
    showToast('Feedback submitted. Thank you!');
    setIsFeedbackOpen(false);
    setFbComment(''); setFbVisitDate(''); setFbRating(5);
    fetchAll();
  };

  const loyaltyPoints = customer?.loyalty_points ?? user.rewardPoints ?? 0;
  const loyaltyTier = customer?.loyalty_tier ?? user.tier ?? 'Green';
  const totalVisits = customer?.total_visits ?? user.totalVisits ?? 0;
  const upcomingRes = reservations.filter(r => r.status === 'Confirmed');
  const pastRes = reservations.filter(r => r.status === 'Completed' || r.status === 'Cancelled');

  const REWARDS = [
    { id: 'r1', label: 'Complimentary Dessert', cost: 300, icon: 'cake' },
    { id: 'r2', label: 'Priority Table Booking', cost: 600, icon: 'event_seat' },
    { id: 'r3', label: 'Free Beverage Upgrade', cost: 900, icon: 'local_cafe' },
  ];

  // Show the PlanYourVisit wizard full-screen within the dashboard
  if (showReservationWizard) {
    return (
      <div className="bg-background min-h-screen">
        <PlanYourVisit
          initialOutlet="Poes Garden"
          currentUser={user}
          onUpdateUser={onUpdateUser}
          onRequestSignIn={() => {}}
          onBackToWebsite={() => { setShowReservationWizard(false); fetchAll(); }}
        />
      </div>
    );
  }

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(21,42,32,0.04)]">
        <div className="h-20 w-full px-space-md lg:px-margin-desktop flex items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-container text-secondary flex items-center justify-center font-title-editorial text-xl font-bold shadow-inner">M</div>
            <div className="flex flex-col">
              <span className="font-title-editorial text-title-editorial text-primary tracking-tight font-semibold leading-none">Mayflower</span>
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mt-1">Sanctuaries · Chennai</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="font-label-caps text-label-caps px-space-xs py-0.5 rounded bg-primary-container text-on-primary font-bold uppercase hidden sm:inline">Guest Portal</span>
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
              {user.name ? user.name[0].toUpperCase() : 'G'}
            </div>
            <button onClick={onLogout} className="text-caption text-error hover:underline font-label-caps uppercase ml-1 cursor-pointer">Logout</button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="w-full pt-24 bg-background min-h-[calc(100vh-80px)] pb-16">
        <div className="w-full px-space-md lg:px-margin-desktop py-space-xl flex flex-col gap-space-2xl">

          {loading ? (
            <div className="flex items-center justify-center py-space-2xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase animate-pulse">Loading your profile...</span>
            </div>
          ) : (
            <>
              {/* Section 1: Profile */}
              <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                <div className="lg:col-span-8 bg-primary text-on-primary rounded-xl p-space-lg relative overflow-hidden shadow-xl flex flex-col gap-space-lg">
                  <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-surface-tint/10 blur-3xl pointer-events-none"></div>
                  <div className="relative z-10 flex flex-wrap items-start justify-between gap-space-md">
                    <div className="flex items-center gap-space-md">
                      <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-title-editorial text-2xl font-bold shadow-md">
                        {user.name ? user.name[0].toUpperCase() : 'G'}
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-headline-md text-headline-md text-surface-bright tracking-tight">{user.name}</h1>
                        <div className="flex flex-wrap items-center gap-space-xs mt-1">
                          <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold">{loyaltyTier}</span>
                          <span className="font-caption text-caption text-surface-variant/80">· Member since {user.joinedDate || '—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end bg-primary-container/80 px-space-md py-space-sm rounded-lg">
                      <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-wider">Loyalty Points</span>
                      <span className="font-headline-sm text-headline-sm text-surface-bright font-bold">{loyaltyPoints.toLocaleString()}</span>
                      <span className="font-caption text-caption text-on-primary-container">{totalVisits} total visits</span>
                    </div>
                  </div>
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                    <div className="bg-surface-tint/15 p-space-sm rounded-lg flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-secondary-fixed uppercase font-semibold">Contact</span>
                      <span className="font-body-md text-body-md text-surface-bright flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">mail</span> {user.email || '—'}
                      </span>
                      <span className="font-body-md text-body-md text-surface-bright flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">phone_iphone</span> {user.phone || '—'}
                      </span>
                    </div>
                    <div className="bg-surface-tint/15 p-space-sm rounded-lg flex flex-col gap-1">
                      <span className="font-label-caps text-label-caps text-secondary-fixed uppercase font-semibold">Preferences</span>
                      {customer?.dietary_preferences && customer.dietary_preferences.length > 0
                        ? <span className="font-body-md text-body-md text-surface-bright">{customer.dietary_preferences.join(', ')}</span>
                        : <span className="font-caption text-caption text-on-primary-container">No dietary preferences set</span>}
                      {customer?.preferred_seating && <span className="font-caption text-caption text-on-primary-container">Seating: {customer.preferred_seating}</span>}
                      {customer?.allergies && <span className="font-caption text-caption text-on-primary-container">Allergies: {customer.allergies}</span>}
                    </div>
                  </div>
                </div>

                {/* Loyalty Summary */}
                <div className="lg:col-span-4 bg-surface-container rounded-xl p-space-lg flex flex-col gap-space-md shadow-sm border border-surface-container-high">
                  <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary font-bold">Loyalty Status</span>
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="font-title-editorial text-title-editorial text-primary font-bold">{loyaltyTier} Tier</span>
                      <span className="font-caption text-caption text-on-surface-variant">{loyaltyPoints} pts</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className="h-full bg-secondary rounded-full transition-all duration-700" style={{ width: `${Math.min((loyaltyPoints / 2000) * 100, 100)}%` }}></div>
                    </div>
                    <span className="font-caption text-caption text-on-surface-variant">{Math.max(0, 2000 - loyaltyPoints)} pts to next tier</span>
                  </div>
                  <div className="flex flex-col gap-space-xs text-body-sm font-body-sm text-on-surface-variant">
                    <div className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span><span>Priority reservation access</span></div>
                    <div className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span><span>Points on every visit</span></div>
                    <div className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-secondary text-[18px]">check_circle</span><span>Exclusive member offers</span></div>
                  </div>
                  <button
                    onClick={() => { setIsFeedbackOpen(true); }}
                    className="w-full mt-auto py-space-sm bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase font-bold hover:bg-surface-tint transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">rate_review</span> Submit Feedback
                  </button>
                </div>
              </section>

              {/* Section 2: Book a Table CTA */}
              <section className="w-full bg-surface-container-low rounded-xl p-space-lg shadow-md border border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-space-lg">
                <div className="flex flex-col gap-space-2xs">
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold">Reservations</span>
                  <h2 className="font-headline-md text-headline-md text-primary">Book a Table</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant">Choose your date, space, and table through our step-by-step reservation desk.</p>
                </div>
                <button
                  onClick={() => setShowReservationWizard(true)}
                  className="shrink-0 px-space-xl h-14 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase tracking-widest font-bold hover:bg-surface-tint transition-all shadow-md flex items-center gap-space-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">event_seat</span>
                  Reserve a Table
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </section>

              {/* Section 3: Upcoming Reservations */}
              <section className="w-full flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-semibold">Upcoming Reservations</h2>
                </div>
                {upcomingRes.length === 0 ? (
                  <div className="bg-surface-container rounded-xl p-space-lg text-center text-on-surface-variant font-body-md">
                    No upcoming reservations.{' '}
                    <button onClick={() => setShowReservationWizard(true)} className="text-primary underline font-semibold cursor-pointer">Book one now</button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-space-md">
                    {upcomingRes.map(r => (
                      <div key={r.id} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-surface-container flex flex-col gap-space-md">
                        {modifyingId === r.id ? (
                          <div className="flex flex-col gap-space-md">
                            <span className="font-label-caps text-label-caps text-secondary uppercase font-bold">Modify Reservation</span>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                              <div className="flex flex-col gap-1">
                                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs">New Date</label>
                                <input type="date" value={modifyDate} min={new Date().toISOString().split('T')[0]} onChange={e => setModifyDate(e.target.value)}
                                  className="h-10 bg-surface-container text-on-surface px-space-sm rounded border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs">Time Slot</label>
                                <select value={modifySlot} onChange={e => setModifySlot(e.target.value)}
                                  className="h-10 bg-surface-container text-on-surface px-space-sm rounded border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                                  <option value="1:00 PM">Lunch – 1:00 PM</option>
                                  <option value="7:30 PM">Dinner – 7:30 PM</option>
                                  <option value="8:00 PM">Dinner – 8:00 PM</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase text-xs">Guests</label>
                                <select value={modifyGuests} onChange={e => setModifyGuests(e.target.value)}
                                  className="h-10 bg-surface-container text-on-surface px-space-sm rounded border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer">
                                  {[1,2,3,4,5,6,7,8,10].map(n => <option key={n} value={String(n)}>{n}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center gap-space-sm">
                              <button onClick={() => handleModifySave(r.id)} className="px-space-md py-1.5 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase font-bold cursor-pointer">Save Changes</button>
                              <button onClick={() => setModifyingId(null)} className="px-space-md py-1.5 text-on-surface-variant font-label-caps text-label-caps uppercase cursor-pointer">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-start justify-between gap-space-md">
                            <div className="flex flex-col gap-space-xs">
                              <div className="flex items-center gap-space-xs">
                                <span className="bg-secondary-container text-on-secondary-container px-space-sm py-0.5 rounded-full font-label-caps text-label-caps uppercase font-bold">Confirmed</span>
                                {r.booking_code && <span className="font-caption text-caption text-on-surface-variant">#{r.booking_code}</span>}
                              </div>
                              <h3 className="font-title-editorial text-title-editorial text-primary font-bold">{r.outlet || '—'}</h3>
                              <div className="flex flex-wrap gap-space-md text-body-sm font-body-sm text-on-surface-variant">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">calendar_today</span>{r.reservation_date || '—'}</span>
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">schedule</span>{r.time_slot || '—'}</span>
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">group</span>{r.guests || '—'} guests</span>
                                {r.special_occasion && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">celebration</span>{r.special_occasion}</span>}
                              </div>
                              {r.dietary_prefs && <span className="font-caption text-caption text-on-surface-variant">Dietary: {r.dietary_prefs}</span>}
                            </div>
                            <div className="flex items-center gap-space-xs">
                              <button
                                onClick={() => { setModifyingId(r.id); setModifyDate(r.reservation_date || ''); setModifySlot(r.time_slot || '7:30 PM'); setModifyGuests(String(r.guests || 2)); }}
                                className="px-space-sm py-1.5 bg-surface-container text-primary rounded font-label-caps text-label-caps uppercase font-semibold hover:bg-surface-container-high flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[15px]">edit_calendar</span> Modify
                              </button>
                              <button
                                onClick={() => handleCancel(r.id)}
                                className="px-space-sm py-1.5 text-error font-label-caps text-label-caps uppercase font-semibold hover:bg-error-container/50 rounded flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[15px]">cancel</span> Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Section 4: Dining History */}
              <section className="w-full flex flex-col gap-space-md">
                <h2 className="font-headline-md text-headline-md text-primary">Dining History</h2>
                {pastRes.length === 0 ? (
                  <div className="bg-surface-container rounded-xl p-space-lg text-center text-on-surface-variant font-body-md">No past reservations yet.</div>
                ) : (
                  <div className="w-full bg-surface-container-lowest rounded-xl overflow-x-auto shadow-md border border-surface-container">
                    <table className="w-full text-left min-w-[600px]">
                      <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                        <tr>
                          <th className="py-space-md px-space-lg">Date & Outlet</th>
                          <th className="py-space-md px-space-md">Slot</th>
                          <th className="py-space-md px-space-md">Guests</th>
                          <th className="py-space-md px-space-md">Status</th>
                          <th className="py-space-md px-space-lg text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low font-body-md text-body-md text-on-surface">
                        {pastRes.map(r => (
                          <tr key={r.id} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="py-space-md px-space-lg">
                              <div className="flex flex-col">
                                <span className="font-title-editorial text-title-editorial text-primary font-bold">{r.reservation_date || '—'}</span>
                                <span className="font-caption text-caption text-on-surface-variant">{r.outlet || '—'}</span>
                              </div>
                            </td>
                            <td className="py-space-md px-space-md font-caption text-caption text-on-surface-variant capitalize">{r.time_slot || '—'}</td>
                            <td className="py-space-md px-space-md font-label-numeric text-label-numeric">{r.guests || '—'}</td>
                            <td className="py-space-md px-space-md">
                              <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full font-bold uppercase ${r.status === 'Completed' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="py-space-md px-space-lg text-right">
                              {r.status === 'Completed' && (
                                <button
                                  onClick={() => { setIsFeedbackOpen(true); setFbOutlet(r.outlet || ''); setFbVisitDate(r.reservation_date || ''); }}
                                  className="px-space-sm py-1 bg-secondary-container text-on-secondary-container rounded font-label-caps text-label-caps font-bold hover:bg-secondary-fixed cursor-pointer"
                                >
                                  Leave Feedback
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Section 5: Loyalty & Rewards + Feedback History */}
              <section className="w-full grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
                <div className="lg:col-span-6 bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold">Rewards</span>
                    <span className="font-label-numeric text-label-numeric font-bold text-primary">{loyaltyPoints} pts available</span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Redeem Points</h3>
                  <div className="flex flex-col gap-space-sm">
                    {REWARDS.map(reward => {
                      const canRedeem = loyaltyPoints >= reward.cost;
                      return (
                        <div key={reward.id} className={`p-space-md bg-surface-container-low rounded-lg flex items-center justify-between gap-space-md ${!canRedeem ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-space-sm">
                            <div className="w-10 h-10 rounded bg-primary text-secondary flex items-center justify-center">
                              <span className="material-symbols-outlined text-[20px]">{reward.icon}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-title-editorial text-title-editorial text-primary font-bold">{reward.label}</span>
                              <span className="font-caption text-caption text-on-surface-variant">{reward.cost} pts required</span>
                            </div>
                          </div>
                          {canRedeem ? (
                            <button
                              disabled={redeemingId === reward.id}
                              onClick={async () => {
                                setRedeemingId(reward.id);
                                const { error } = await supabase.from('loyalty_redemptions').insert({ user_id: user.id, reward_label: reward.label, points_used: reward.cost });
                                setRedeemingId(null);
                                if (error) { showToast('Redemption failed.', true); return; }
                                showToast(`${reward.label} redeemed!`);
                                fetchAll();
                              }}
                              className="px-space-sm py-1.5 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase font-semibold hover:bg-surface-tint cursor-pointer disabled:opacity-60 whitespace-nowrap"
                            >
                              {redeemingId === reward.id ? 'Redeeming...' : `Redeem ${reward.cost} pts`}
                            </button>
                          ) : (
                            <span className="font-label-caps text-label-caps text-outline font-bold uppercase whitespace-nowrap">Insufficient pts</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant mt-auto">Points expire 24 months from last visit.</p>
                </div>

                <div className="lg:col-span-6 bg-surface-container-lowest p-space-lg rounded-xl shadow-md flex flex-col gap-space-md border border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest font-bold">Feedback History</span>
                    <button
                      onClick={() => { setIsFeedbackOpen(true); setFbOutlet(outlets[0]?.name ?? ''); }}
                      className="px-space-sm py-1 bg-surface-container text-primary rounded font-label-caps text-label-caps uppercase font-semibold hover:bg-surface-container-high flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span> New
                    </button>
                  </div>
                  {feedbackHistory.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-on-surface-variant font-body-md">No feedback submitted yet.</div>
                  ) : (
                    <div className="flex flex-col gap-space-sm overflow-y-auto max-h-80">
                      {feedbackHistory.map(fb => (
                        <div key={fb.id} className="p-space-md bg-surface-container-low rounded-lg flex flex-col gap-space-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-title-editorial text-title-editorial text-primary font-bold">{fb.outlet || '—'}</span>
                            <div className="flex items-center gap-0.5 text-secondary">
                              {[1,2,3,4,5].map(s => (
                                <span key={s} className={`material-symbols-outlined text-[16px] ${s <= (fb.rating || 0) ? 'opacity-100' : 'opacity-25'}`}>star</span>
                              ))}
                            </div>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface">{fb.comment}</p>
                          <span className="font-caption text-caption text-on-surface-variant">
                            {fb.visit_date ? `Visit: ${fb.visit_date} · ` : ''}{fb.created_at ? new Date(fb.created_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 z-50 bg-primary/60 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-lg shadow-2xl flex flex-col gap-space-md relative border border-surface-container">
            <button onClick={() => setIsFeedbackOpen(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer">
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-label-caps text-secondary uppercase font-bold tracking-widest">Share Your Experience</span>
              <h3 className="font-headline-sm text-headline-sm text-primary">Submit Feedback</h3>
            </div>
            <div className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Outlet</label>
                <div className="relative">
                  <select value={fbOutlet} onChange={e => setFbOutlet(e.target.value)}
                    className="w-full h-11 bg-surface-container text-on-surface px-space-md rounded border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer">
                    {outlets.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                    {outlets.length === 0 && <option value={fbOutlet}>{fbOutlet}</option>}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-on-surface-variant pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Visit Date (optional)</label>
                <input type="date" value={fbVisitDate} onChange={e => setFbVisitDate(e.target.value)}
                  className="w-full h-11 bg-surface-container text-on-surface px-space-md rounded border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Rating</label>
                <div className="flex items-center gap-2 text-secondary cursor-pointer">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} onClick={() => setFbRating(star)}
                      className={`material-symbols-outlined text-[28px] ${star <= fbRating ? 'opacity-100' : 'opacity-30'}`}>star</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">Your Feedback</label>
                <textarea rows={3} value={fbComment} onChange={e => setFbComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full bg-surface-container text-on-surface p-space-sm rounded border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-space-sm pt-space-xs">
              <button onClick={() => setIsFeedbackOpen(false)} className="px-space-md py-2 text-on-surface-variant font-label-caps text-label-caps uppercase cursor-pointer">Cancel</button>
              <button onClick={handleSubmitFeedback} disabled={submittingFb}
                className="px-space-xl py-2 bg-primary text-on-primary rounded font-label-caps text-label-caps uppercase font-bold tracking-wider hover:bg-surface-tint shadow-md cursor-pointer disabled:opacity-60">
                {submittingFb ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-space-md py-space-sm rounded shadow-lg flex items-center gap-space-sm ${toast.error ? 'bg-error text-on-error' : 'bg-primary text-on-primary'}`}>
          <span className="material-symbols-outlined text-[20px]">{toast.error ? 'error' : 'verified'}</span>
          <span className="font-body-sm text-body-sm">{toast.message}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-surface-container-lowest py-space-xl border-t border-surface-container">
        <div className="w-full px-space-md lg:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-space-sm text-caption font-caption text-on-surface-variant">
          <span className="font-title-editorial text-title-editorial text-primary font-semibold">Mayflower Sanctuaries · Chennai</span>
          <div>© {new Date().getFullYear()} Mayflower Hospitality Group India LLP. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
};
