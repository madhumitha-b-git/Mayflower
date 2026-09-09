import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const UpdateSchema = z.object({
  name:          z.string().optional(),
  address:       z.string().optional(),
  phone:         z.string().optional(),
  email:         z.string().email().optional(),
  opening_hours: z.record(z.string()).optional(),
  description:   z.string().optional(),
  images:        z.array(z.string()).optional(),
  status:        z.enum(['active','inactive','coming_soon']).optional(),
  published:     z.boolean().optional(),
});

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { data, error } = await supabaseAdmin
    .from('outlets').select('*').eq('id', ctx.params.id).single();
  if (error || !data) return NextResponse.json({ error: 'Outlet not found' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export const PATCH = withAuth(async (req: NextRequest, user, ctx?: Ctx) => {
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('outlets').update(parsed.data).eq('id', ctx!.params.id).select().single();
  if (error || !data) return apiError('Update failed', 500);

  await supabaseAdmin.from('audit_logs').insert({
    user_id: user.userId, action: 'outlets.update', entity: 'outlets', entity_id: ctx!.params.id,
  });
  return apiSuccess(data);
}, ['Admin', 'Owner', 'SuperAdmin'] as UserRole[]);

export const DELETE = withAuth(async (_req: NextRequest, user, ctx?: Ctx) => {
  const { error } = await supabaseAdmin.from('outlets').delete().eq('id', ctx!.params.id);
  if (error) return apiError('Delete failed', 500);
  await supabaseAdmin.from('audit_logs').insert({
    user_id: user.userId, action: 'outlets.delete', entity: 'outlets', entity_id: ctx!.params.id,
  });
  return apiSuccess({ deleted: true });
}, ['SuperAdmin'] as UserRole[]);
