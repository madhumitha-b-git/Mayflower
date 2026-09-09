import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const CreateSchema = z.object({
  outlet_id: z.string().uuid(),
  rating:    z.number().int().min(1).max(5),
  comment:   z.string().optional(),
});

const ReviewSchema = z.object({
  status: z.enum(['New','Reviewed','Resolved']),
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const url = new URL(req.url);
  const outlet_id = url.searchParams.get('outlet_id');

  let query = supabaseAdmin
    .from('feedback')
    .select('*, users!customer_id(name, email), outlets(name)')
    .order('created_at', { ascending: false });

  if (['Manager'].includes(user.role) && user.outletId) {
    query = query.eq('outlet_id', user.outletId);
  } else if (outlet_id) {
    query = query.eq('outlet_id', outlet_id);
  }

  const { data, error } = await query;
  if (error) return apiError('Failed to fetch feedback', 500);
  return apiSuccess(data);
}, ['Manager','Admin','Owner','SuperAdmin'] as UserRole[]);

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('feedback')
    .insert({ ...parsed.data, customer_id: user.userId })
    .select().single();
  if (error) return apiError('Failed to submit feedback', 500);
  return apiSuccess(data, 201);
}, ['Customer'] as UserRole[]);
