// The service role key must NOT be used in the browser.
// Staff creation is handled via a Supabase Edge Function.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
