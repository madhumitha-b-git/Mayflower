import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess, getTokenFromRequest, verifyToken } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const CreateOutletSchema = z.object({
  name:          z.string().min(2),
  slug:          z.string().min(2),
  address:       z.string().optional(),
  phone:         z.string().optional(),
  email:         z.string().email().optional(),
  opening_hours: z.record(z.string()).optional(),
  description:   z.string().optional(),
  images:        z.array(z.string()).optional(),
  status:        z.enum(['active','inactive','coming_soon']).optional(),
});

export async function GET(req: NextRequest) {
  const token = getTokenFromRequest(req);
  const user = token ? await verifyToken(token) : null;
  const isStaff = user && ['Manager','Admin','Owner','SuperAdmin'].includes(user.role);

  let query = supabaseAdmin.from('outlets').select('*').order('name');
  if (!isStaff) query = query.eq('published', true).eq('status', 'active');

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to fetch outlets' }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = CreateOutletSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('outlets')
    .insert({ ...parsed.data, created_by: user.userId })
    .select().single();
  if (error) return apiError(error.message, 500);

  await supabaseAdmin.from('audit_logs').insert({
    user_id: user.userId, action: 'outlets.create', entity: 'outlets', entity_id: data.id,
  });
  return apiSuccess(data, 201);
}, ['Admin', 'SuperAdmin'] as UserRole[]);
