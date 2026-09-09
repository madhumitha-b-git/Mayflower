import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import type { UserRole } from '@/lib/auth/rbac';

const UpdateSchema = z.object({
  status:      z.enum(['Pending','In Progress','Completed','Escalated']).optional(),
  photo_url:   z.string().url().optional(),
  geo_lat:     z.number().optional(),
  geo_lng:     z.number().optional(),
  remarks:     z.string().optional(),
  escalated_to: z.string().uuid().optional(),
  priority:    z.enum(['Low','Medium','High','Critical']).optional(),
  assigned_to: z.string().uuid().optional(),
});

type Ctx = { params: { id: string } };

export const PATCH = withAuth(async (req: NextRequest, user, ctx?: Ctx) => {
  const body = await req.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.status === 'Completed') updates.completed_at = new Date().toISOString();
  if (parsed.data.status === 'Escalated') {
    updates.escalated_at = new Date().toISOString();
    updates.escalated_to = parsed.data.escalated_to;
  }

  const { data, error } = await supabaseAdmin
    .from('tasks').update(updates).eq('id', ctx!.params.id).select().single();
  if (error || !data) return apiError('Update failed', 500);

  await supabaseAdmin.from('audit_logs').insert({
    user_id: user.userId, action: `tasks.${parsed.data.status?.toLowerCase().replace(' ','_') ?? 'update'}`,
    entity: 'tasks', entity_id: ctx!.params.id,
  });

  return apiSuccess(data);
}, ['Chef','Manager','Admin','SuperAdmin'] as UserRole[]);
