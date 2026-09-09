import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/client';
import { comparePassword, signToken } from '@/lib/auth/jwt';

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, password_hash, role, outlet_id, is_active')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Sign JWT
    const token = await signToken({
      userId:   user.id,
      email:    user.email,
      role:     user.role,
      outletId: user.outlet_id,
    });

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action:  'auth.login',
      entity:  'users',
      entity_id: user.id,
      meta:    { email: user.email },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, outletId: user.outlet_id },
        token,
      },
    });

    // Set httpOnly cookie
    response.cookies.set('mayflower_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7, // 7 days
      path:     '/',
    });

    return response;
  } catch (err) {
    console.error('[Login Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
