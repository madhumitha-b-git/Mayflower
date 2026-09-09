import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const UpdateSchema = z.object({
  status:    z.enum(['Pending','Confirmed','Cancelled','Completed','No-show']).optional(),
  table_id:  z.string().uuid().nullable().optional(),
  special_notes: z.string().optional(),
});

type Ctx = { params: { id: string } };

export const GET = withAuth(async (_req: NextRequest, user, ctx?: Ctx) => {
  const { data, error } = await supabaseAdmin
    .from('reservations')
    .select('*, users!customer_id(name, email, phone), outlets(name), tables(name, floor_id)')
    .eq('id', ctx!.params.id)
    .single();

  if (error || !data) return apiError('Reservation not found', 404);

  const isOwner = data.customer_id === user.userId;
  const isStaff = ['Manager','Admin','Owner','SuperAdmin'].includes(user.role);
  if (!isOwner && !isStaff) return apiError('Forbidden', 403);

  return apiSuccess(data);
}, ['Customer','Manager','Admin','Owner','SuperAdmin'] as UserRole[]);

export const PATCH = withAuth(async (req: NextRequest, user, ctx?: Ctx) => {
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const updates: Record<string, unknown> = { ...parsed.data };

  if (parsed.data.status === 'Confirmed') {
    updates.confirmed_at = new Date().toISOString();
    updates.assigned_by = user.userId;
  }
  if (parsed.data.status === 'Cancelled') updates.cancelled_at = new Date().toISOString();
  if (parsed.data.status === 'Completed') updates.completed_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('reservations').update(updates).eq('id', ctx!.params.id)
    .select('*, outlets(name), tables(name)').single();

  if (error || !data) return apiError('Update failed', 500);

  await supabaseAdmin.from('audit_logs').insert({
    user_id: user.userId, action: `reservations.${parsed.data.status?.toLowerCase() ?? 'update'}`,
    entity: 'reservations', entity_id: ctx!.params.id,
  });

  return apiSuccess(data);
}, ['Manager','Admin','Owner','SuperAdmin'] as UserRole[]);
