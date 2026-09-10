import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, UserRole, LoyaltyTier, PointTransaction, UserReservationRecord } from '../types';

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  message?: string;
}

/** Sign in with email + password via Supabase Auth, then load profile row */
export const supabaseLogin = async (email: string, password: string): Promise<AuthResult> => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.' };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    const message = error?.message?.toLowerCase().includes('invalid login')
      ? 'We could not find an account with those details. New to Mayflower? Register your account first.'
      : error?.message || 'Login failed.';
    return { success: false, message };
  }

  const profile = await fetchUserProfile(data.user.id);
  if (!profile) {
    return { success: false, message: 'Profile not found. Contact administrator.' };
  }

  return { success: true, user: profile };
};

/** Sign up a new customer via Supabase Auth, then insert profile row */
export const supabaseRegister = async (
  email: string,
  password: string,
  name: string
): Promise<AuthResult> => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Supabase is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { data: { user: signedInUser } } = await supabase.auth.getUser();
  if (signedInUser?.email?.toLowerCase() === normalizedEmail) {
    return { success: false, message: 'This email is already registered. Please sign in instead.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: { data: { name: name || normalizedEmail.split('@')[0] } },
  });

  if (error || !data.user) {
    const isDuplicate = /already|registered|exists/i.test(error?.message || '');
    return { success: false, message: isDuplicate ? 'This email is already registered. Please sign in instead.' : error?.message || 'Registration failed.' };
  }

  // With Supabase email-confirmation enabled, an existing email is deliberately
  // returned without a new identity. Treat it as a duplicate instead of showing success.
  if (data.user.identities?.length === 0) {
    return { success: false, message: 'This email is already registered. Please sign in instead.' };
  }

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const newProfile = {
    id: data.user.id,
    name: name || email.split('@')[0],
    email,
    phone: '',
    role: 'Customer' as UserRole,
    reward_points: 200,
    tier: 'Green' as LoyaltyTier,
    total_visits: 0,
    joined_date: todayStr,
    transactions: [{
      id: `signup-${data.user.id}`,
      type: 'earned_signup',
      points: 200,
      description: 'Welcome bonus for registering your Mayflower account',
      date: todayStr,
    }],
    reservations: [],
  };

  const { error: insertError } = await supabase.from('user_profiles').upsert(newProfile, { onConflict: 'id', ignoreDuplicates: true });

  if (insertError) {
    return { success: false, message: insertError.message };
  }

  const profile = await fetchUserProfile(data.user.id);
  return { success: true, user: profile ?? undefined };
};

/** Fetch the user_profiles row and map to UserProfile shape */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone ?? '',
    role: (data.role as UserRole) ?? 'Customer',
    rewardPoints: data.reward_points ?? 0,
    tier: (data.tier as LoyaltyTier) ?? 'Green',
    totalVisits: data.total_visits ?? 0,
    joinedDate: data.joined_date ?? '',
    transactions: data.transactions ?? [],
    reservations: data.reservations ?? [],
  };
};

export const addReservationForCurrentUser = async (
  user: UserProfile,
  reservation: UserReservationRecord
): Promise<AuthResult> => {
  const bookedAt = reservation.bookedAt;
  const BONUS_POINTS = 300;

  // 1. Insert into reservations table using actual DB column names
  const { error: resError } = await supabase.from('reservations').insert({
    customer_id: user.id,
    booking_code: reservation.bookingCode,
    outlet: reservation.outlet,
    reservation_date: reservation.date,
    time_slot: reservation.timeSlot,
    guests: reservation.guests,
    status: reservation.status,
  });
  if (resError) return { success: false, message: resError.message };

  // 2. Credit loyalty points and append transaction to user_profiles
  const newTransaction: PointTransaction = {
    id: `reservation-${reservation.id}`,
    type: 'earned_visit',
    points: BONUS_POINTS,
    description: `Reservation bonus (${reservation.outlet} - ${reservation.bookingCode})`,
    date: bookedAt,
  };
  const updatedTransactions = [...(user.transactions ?? []), newTransaction];
  const updatedPoints = (user.rewardPoints ?? 0) + BONUS_POINTS;

  await supabase.from('user_profiles').update({
    reward_points: updatedPoints,
    transactions: updatedTransactions,
    reservations: [...(user.reservations ?? []), reservation],
  }).eq('id', user.id);

  const updatedUser = await fetchUserProfile(user.id);
  return updatedUser
    ? { success: true, user: updatedUser }
    : { success: false, message: 'Reservation saved, but the updated account could not be loaded.' };
};

/** Get the currently authenticated Supabase session user profile */
export const getSupabaseCurrentUser = async (): Promise<UserProfile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return fetchUserProfile(session.user.id);
};

/** Sign out from Supabase */
export const supabaseLogout = async (): Promise<void> => {
  await supabase.auth.signOut();
};
