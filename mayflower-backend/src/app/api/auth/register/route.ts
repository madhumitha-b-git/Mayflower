import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { hashPassword, signToken } from '@/lib/auth/jwt';

const RegisterSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(6),
  phone:    z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });

    const { name, email, password, phone } = parsed.data;

    const { data: existing } = await supabaseAdmin
      .from('users').select('id').eq('email', email.toLowerCase()).single();
    if (existing)
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const password_hash = await hashPassword(password);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({ name, email: email.toLowerCase(), password_hash, phone, role: 'Customer' })
      .select('id, name, email, role')
      .single();

    if (error || !user)
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });

    // Create loyalty account
    await supabaseAdmin.from('loyalty_accounts').insert({ customer_id: user.id, points: 50 });
    await supabaseAdmin.from('loyalty_transactions').insert({
      account_id: (await supabaseAdmin.from('loyalty_accounts').select('id').eq('customer_id', user.id).single()).data?.id,
      type: 'earned_signup', points: 50, description: 'Welcome bonus',
    });

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id, action: 'auth.register', entity: 'users', entity_id: user.id,
    });

    const response = NextResponse.json({ success: true, data: { user, token } }, { status: 201 });
    response.cookies.set('mayflower_token', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/',
    });
    return response;
  } catch (err) {
    console.error('[Register Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
