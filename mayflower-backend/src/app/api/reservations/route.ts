import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess, getTokenFromRequest, verifyToken } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const CreateSchema = z.object({
  outlet_id:           z.string().uuid(),
  date:                z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_slot:           z.string(),
  guests:              z.number().int().min(1).max(20),
  seating_area:        z.string().optional(),
  dietary_preferences: z.string().optional(),
  special_occasion:    z.string().optional(),
  special_notes:       z.string().optional(),
});

function generateBookingCode() {
  return `MF-${Math.floor(1000 + Math.random() * 9000)}`;
}

export const GET = withAuth(async (req: NextRequest, user) => {
  const isStaff = ['Manager','Admin','Owner','SuperAdmin'].includes(user.role);
  const url = new URL(req.url);
  const outlet_id = url.searchParams.get('outlet_id');
  const status = url.searchParams.get('status');
  const date = url.searchParams.get('date');

  let query = supabaseAdmin
    .from('reservations')
    .select('*, users!customer_id(name, email, phone), outlets(name), tables(name)')
    .order('date', { ascending: true })
    .order('time_slot', { ascending: true });

  if (!isStaff) query = query.eq('customer_id', user.userId);
  if (outlet_id) query = query.eq('outlet_id', outlet_id);
  if (status) query = query.eq('status', status);
  if (date) query = query.eq('date', date);

  const { data, error } = await query;
  if (error) return apiError('Failed to fetch reservations', 500);
  return apiSuccess(data);
}, ['Customer','Manager','Admin','Owner','SuperAdmin'] as UserRole[]);

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  // Generate unique booking code
  let booking_code = generateBookingCode();
  let attempts = 0;
  while (attempts < 5) {
    const { data: existing } = await supabaseAdmin
      .from('reservations').select('id').eq('booking_code', booking_code).single();
    if (!existing) break;
    booking_code = generateBookingCode();
    attempts++;
  }

  const { data, error } = await supabaseAdmin
    .from('reservations')
    .insert({ ...parsed.data, customer_id: user.userId, booking_code, status: 'Pending' })
    .select('*, outlets(name)')
    .single();

  if (error) return apiError('Failed to create reservation', 500);

  await supabaseAdmin.from('audit_logs').insert({
    user_id: user.userId, action: 'reservations.create',
    entity: 'reservations', entity_id: data.id,
    meta: { booking_code },
  });

  return apiSuccess(data, 201);
}, ['Customer','Manager','Admin','SuperAdmin'] as UserRole[]);
