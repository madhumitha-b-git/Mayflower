import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const UpdateSchema = z.object({
  category:     z.string().optional(),
  name:         z.string().optional(),
  description:  z.string().optional(),
  price:        z.number().positive().optional(),
  image_url:    z.string().url().optional(),
  is_veg:       z.boolean().optional(),
  is_available: z.boolean().optional(),
  is_chef_pick: z.boolean().optional(),
  sort_order:   z.number().int().optional(),
});

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { data, error } = await supabaseAdmin
    .from('menu_items').select('*').eq('id', ctx.params.id).single();
  if (error || !data) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export const PATCH = withAuth(async (req: NextRequest, _user, ctx?: Ctx) => {
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('menu_items').update(parsed.data).eq('id', ctx!.params.id).select().single();
  if (error || !data) return apiError('Update failed', 500);
  return apiSuccess(data);
}, ['Admin', 'SuperAdmin'] as UserRole[]);

export const DELETE = withAuth(async (_req: NextRequest, _user, ctx?: Ctx) => {
  const { error } = await supabaseAdmin
    .from('menu_items').update({ is_available: false }).eq('id', ctx!.params.id);
  if (error) return apiError('Delete failed', 500);
  return apiSuccess({ deleted: true });
}, ['Admin', 'SuperAdmin'] as UserRole[]);
