import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile, UserRole, LoyaltyTier } from '../types';

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
    return { success: false, message: error?.message || 'Login failed.' };
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
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return { success: false, message: error?.message || 'Registration failed.' };
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
    total_visits: 1,
    joined_date: todayStr,
  };

  const { error: insertError } = await supabase.from('user_profiles').insert(newProfile);

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
