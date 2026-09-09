import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const CreateSchema = z.object({
  outlet_id:  z.string().uuid(),
  floor_id:   z.string().uuid().optional(),
  name:       z.string().min(1),
  seats:      z.number().int().min(1).max(20),
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  notes:      z.string().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const outlet_id = url.searchParams.get('outlet_id');
  const date = url.searchParams.get('date');
  const time_slot = url.searchParams.get('time_slot');

  let query = supabaseAdmin
    .from('tables')
    .select('*, floors(name)')
    .eq('is_active', true)
    .order('name');

  if (outlet_id) query = query.eq('outlet_id', outlet_id);

  const { data: tables, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });

  // If date+time provided, mark which tables are reserved
  if (date && time_slot && tables) {
    const { data: reserved } = await supabaseAdmin
      .from('reservations')
      .select('table_id')
      .eq('date', date)
      .eq('time_slot', time_slot)
      .in('status', ['Pending','Confirmed']);

    const reservedIds = new Set((reserved ?? []).map((r: { table_id: string }) => r.table_id));
    const enriched = tables.map(t => ({ ...t, is_reserved: reservedIds.has(t.id) }));
    return NextResponse.json({ success: true, data: enriched });
  }

  return NextResponse.json({ success: true, data: tables });
}

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('tables').insert(parsed.data).select('*, floors(name)').single();
  if (error) return apiError('Failed to create table', 500);
  return apiSuccess(data, 201);
}, ['Admin', 'SuperAdmin'] as UserRole[]);
