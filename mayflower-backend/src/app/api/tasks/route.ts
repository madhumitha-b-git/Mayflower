import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const CreateSchema = z.object({
  outlet_id:    z.string().uuid(),
  checklist_id: z.string().uuid().optional(),
  assigned_to:  z.string().uuid().optional(),
  title:        z.string().min(2),
  description:  z.string().optional(),
  priority:     z.enum(['Low','Medium','High','Critical']).optional(),
  due_date:     z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const GET = withAuth(async (req: NextRequest, user) => {
  const url = new URL(req.url);
  const outlet_id = url.searchParams.get('outlet_id');
  const status = url.searchParams.get('status');

  let query = supabaseAdmin
    .from('tasks')
    .select('*, users!assigned_to(name, role), users!assigned_by(name), sop_checklists(name, category)')
    .order('due_date', { ascending: true });

  // Chef sees only their own tasks
  if (user.role === 'Chef') {
    query = query.eq('assigned_to', user.userId);
  } else if (['Manager'].includes(user.role) && user.outletId) {
    query = query.eq('outlet_id', user.outletId);
  } else if (outlet_id) {
    query = query.eq('outlet_id', outlet_id);
  }

  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return apiError('Failed to fetch tasks', 500);
  return apiSuccess(data);
}, ['Chef','Manager','Admin','Owner','SuperAdmin'] as UserRole[]);

export const POST = withAuth(async (req: NextRequest, user) => {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { data, error } = await supabaseAdmin
    .from('tasks')
    .insert({ ...parsed.data, assigned_by: user.userId, status: 'Pending' })
    .select().single();
  if (error) return apiError('Failed to create task', 500);
  return apiSuccess(data, 201);
}, ['Manager','Admin','SuperAdmin'] as UserRole[]);
