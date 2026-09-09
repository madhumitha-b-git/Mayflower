import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const UpdateSchema = z.object({
  name:      z.string().min(2).optional(),
  phone:     z.string().optional(),
  role:      z.enum(['SuperAdmin','Owner','Admin','Manager','Chef','HR','Accountant','Customer']).optional(),
  outlet_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
});

type Ctx = { params: { id: string } };

export const GET = withAuth(async (_req: NextRequest, _user, ctx?: Ctx) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, role, outlet_id, phone, is_active, created_at')
    .eq('id', ctx!.params.id)
    .single();
  if (error || !data) return apiError('User not found', 404);
  return apiSuccess(data);
}, ['Admin', 'Owner', 'SuperAdmin'] as UserRole[]);

export const PATCH = withAuth(async (req: NextRequest, _user, ctx?: Ctx) => {
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('users').update(parsed.data).eq('id', ctx!.params.id)
    .select('id, name, email, role, outlet_id, is_active').single();
  if (error || !data) return apiError('Update failed', 500);
  return apiSuccess(data);
}, ['Admin', 'SuperAdmin'] as UserRole[]);

export const DELETE = withAuth(async (_req: NextRequest, _user, ctx?: Ctx) => {
  const { error } = await supabaseAdmin.from('users').delete().eq('id', ctx!.params.id);
  if (error) return apiError('Delete failed', 500);
  return apiSuccess({ deleted: true });
}, ['SuperAdmin'] as UserRole[]);
