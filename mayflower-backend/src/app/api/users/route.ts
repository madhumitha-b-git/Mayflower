import { NextRequest } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { withAuth, apiError, apiSuccess } from '@/lib/auth/rbac';
import { hashPassword } from '@/lib/auth/jwt';
import type { UserRole } from '@/lib/auth/rbac';

const CreateUserSchema = z.object({
  name:      z.string().min(2),
  email:     z.string().email(),
  password:  z.string().min(6),
  role:      z.enum(['SuperAdmin','Owner','Admin','Manager','Chef','HR','Accountant','Customer']),
  outlet_id: z.string().uuid().optional(),
  phone:     z.string().optional(),
});

export const GET = withAuth(async (_req, user) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, name, email, role, outlet_id, phone, is_active, created_at')
    .order('created_at', { ascending: false });
  if (error) return apiError('Failed to fetch users', 500);
  return apiSuccess(data);
}, ['Admin', 'Owner', 'SuperAdmin'] as UserRole[]);

export const POST = withAuth(async (req: NextRequest) => {
  const body = await req.json();
  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input', 400);

  const { name, email, password, role, outlet_id, phone } = parsed.data;
  const password_hash = await hashPassword(password);

  const { data, error } = await supabaseAdmin
    .from('users')
    .insert({ name, email: email.toLowerCase(), password_hash, role, outlet_id, phone })
    .select('id, name, email, role, outlet_id')
    .single();

  if (error) return apiError(error.message.includes('unique') ? 'Email already exists' : 'Failed to create user', 500);
  return apiSuccess(data, 201);
}, ['Admin', 'SuperAdmin'] as UserRole[]);
