import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const SubmitSchema = z.object({
  name:    z.string().min(2),
  email:   z.string().email(),
  phone:   z.string().optional(),
  city:    z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SubmitSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from('franchise_leads').insert(parsed.data).select().single();
    if (error) return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const GET = withAuth(async (req: NextRequest) => {
  const url = new URL(req.url);
  const status = url.searchParams.get('status');

  let query = supabaseAdmin
    .from('franchise_leads')
    .select('*, users!assigned_to(name)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return apiError('Failed to fetch leads', 500);
  return apiSuccess(data);
}, ['Admin', 'Owner', 'SuperAdmin'] as UserRole[]);
