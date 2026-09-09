import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const CreateSchema = z.object({
  outlet_id:    z.string().uuid().nullable().optional(),
  category:     z.string().min(1),
  name:         z.string().min(1),
  description:  z.string().optional(),
  price:        z.number().positive(),
  image_url:    z.string().url().optional(),
  is_veg:       z.boolean().optional(),
  is_available: z.boolean().optional(),
  is_chef_pick: z.boolean().optional(),
  sort_order:   z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const outlet_id = url.searchParams.get('outlet_id');
  const category = url.searchParams.get('category');
  const is_veg = url.searchParams.get('is_veg');

  let query = supabaseAdmin
    .from('menu_items').select('*').eq('is_available', true).order('sort_order').order('name');

  if (outlet_id) query = query.or(`outlet_id.eq.${outlet_id},outlet_id.is.null`);
  if (category) query = query.eq('category', category);
  if (is_veg !== null) query = query.eq('is_veg', is_veg === 'true');

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('menu_items').insert(parsed.data).select().single();
  if (error) return apiError('Failed to create menu item', 500);
  return apiSuccess(data, 201);
}, ['Admin', 'SuperAdmin'] as UserRole[]);
