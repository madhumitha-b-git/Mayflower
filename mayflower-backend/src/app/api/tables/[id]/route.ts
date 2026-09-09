import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const UpdateSchema = z.object({
  name:       z.string().optional(),
  seats:      z.number().int().min(1).optional(),
  status:     z.enum(['Available','Reserved','Occupied','Cleaning','Blocked']).optional(),
  floor_id:   z.string().uuid().nullable().optional(),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  notes:      z.string().optional(),
  is_active:  z.boolean().optional(),
});

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { data, error } = await supabaseAdmin
    .from('tables').select('*, floors(name)').eq('id', ctx.params.id).single();
  if (error || !data) return NextResponse.json({ error: 'Table not found' }, { status: 404 });
  return NextResponse.json({ success: true, data });
}

export const PATCH = withAuth(async (req: NextRequest, _user, ctx?: Ctx) => {
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('tables').update(parsed.data).eq('id', ctx!.params.id)
    .select('*, floors(name)').single();
  if (error || !data) return apiError('Update failed', 500);
  return apiSuccess(data);
}, ['Manager', 'Admin', 'SuperAdmin'] as UserRole[]);

export const DELETE = withAuth(async (_req: NextRequest, _user, ctx?: Ctx) => {
  const { error } = await supabaseAdmin.from('tables').update({ is_active: false }).eq('id', ctx!.params.id);
  if (error) return apiError('Delete failed', 500);
  return apiSuccess({ deleted: true });
}, ['Admin', 'SuperAdmin'] as UserRole[]);
