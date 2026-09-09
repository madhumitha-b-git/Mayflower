import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const CreateSchema = z.object({
  outlet_id:     z.string().uuid(),
  category:      z.enum(['Opening','Closing','Kitchen','Floor','Hygiene','Equipment','Customer Service','Quality Checks','Other']),
  name:          z.string().min(2),
  description:   z.string().optional(),
  assigned_role: z.enum(['SuperAdmin','Owner','Admin','Manager','Chef','HR','Accountant','Customer']).optional(),
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const url = new URL(req.url);
  const outlet_id = url.searchParams.get('outlet_id');

  let query = supabaseAdmin
    .from('sop_checklists')
    .select('*, users!created_by(name)')
    .eq('is_active', true)
    .order('category');

  // Managers/Chefs only see their outlet
  if (['Manager','Chef'].includes(user.role) && user.outletId) {
    query = query.eq('outlet_id', user.outletId);
  } else if (outlet_id) {
    query = query.eq('outlet_id', outlet_id);
  }

  const { data, error } = await query;
  if (error) return apiError('Failed to fetch SOPs', 500);
  return apiSuccess(data);
}, ['Chef','Manager','Admin','Owner','SuperAdmin'] as UserRole[]);

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('sop_checklists')
    .insert({ ...parsed.data, created_by: user.userId })
    .select().single();
  if (error) return apiError('Failed to create SOP', 500);
  return apiSuccess(data, 201);
}, ['Manager','Admin','SuperAdmin'] as UserRole[]);
