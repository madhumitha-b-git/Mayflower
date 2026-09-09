import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';
export { verifyToken } from './jwt';

export type UserRole = 'SuperAdmin' | 'Owner' | 'Admin' | 'Manager' | 'Chef' | 'HR' | 'Accountant' | 'Customer';

// Role hierarchy — higher index = more access
const ROLE_HIERARCHY: UserRole[] = [
  'Customer', 'Accountant', 'HR', 'Chef', 'Manager', 'Admin', 'Owner', 'SuperAdmin'
];

// Permission map per resource
export const PERMISSIONS: Record<string, UserRole[]> = {
  // Auth
  'auth.login':              ['Customer', 'Accountant', 'HR', 'Chef', 'Manager', 'Admin', 'Owner', 'SuperAdmin'],
  'auth.register':           ['Customer', 'Accountant', 'HR', 'Chef', 'Manager', 'Admin', 'Owner', 'SuperAdmin'],

  // Users
  'users.list':              ['Admin', 'Owner', 'SuperAdmin'],
  'users.create':            ['Admin', 'SuperAdmin'],
  'users.update':            ['Admin', 'SuperAdmin'],
  'users.delete':            ['SuperAdmin'],

  // Outlets
  'outlets.list':            ['Customer', 'Accountant', 'HR', 'Chef', 'Manager', 'Admin', 'Owner', 'SuperAdmin'],
  'outlets.create':          ['Admin', 'SuperAdmin'],
  'outlets.update':          ['Admin', 'Owner', 'SuperAdmin'],
  'outlets.publish':         ['Admin', 'SuperAdmin'],
  'outlets.delete':          ['SuperAdmin'],

  // Tables
  'tables.list':             ['Manager', 'Chef', 'Admin', 'Owner', 'SuperAdmin'],
  'tables.update_status':    ['Manager', 'Admin', 'SuperAdmin'],
  'tables.create':           ['Admin', 'SuperAdmin'],

  // Reservations
  'reservations.create':     ['Customer', 'Manager', 'Admin', 'SuperAdmin'],
  'reservations.list_own':   ['Customer'],
  'reservations.list_all':   ['Manager', 'Admin', 'Owner', 'SuperAdmin'],
  'reservations.approve':    ['Manager', 'Admin', 'SuperAdmin'],
  'reservations.assign_table': ['Manager', 'Admin', 'SuperAdmin'],
  'reservations.cancel':     ['Manager', 'Admin', 'SuperAdmin'],

  // SOP & Tasks
  'sop.list':                ['Chef', 'Manager', 'Admin', 'Owner', 'SuperAdmin'],
  'sop.create':              ['Manager', 'Admin', 'SuperAdmin'],
  'tasks.list':              ['Chef', 'Manager', 'Admin', 'Owner', 'SuperAdmin'],
  'tasks.create':            ['Manager', 'Admin', 'SuperAdmin'],
  'tasks.complete':          ['Chef', 'Manager', 'Admin', 'SuperAdmin'],
  'tasks.escalate':          ['Manager', 'Admin', 'SuperAdmin'],

  // Feedback
  'feedback.create':         ['Customer'],
  'feedback.list_all':       ['Manager', 'Admin', 'Owner', 'SuperAdmin'],

  // Franchise
  'franchise.submit':        ['Customer', 'Admin', 'SuperAdmin'],
  'franchise.list':          ['Admin', 'Owner', 'SuperAdmin'],
  'franchise.update':        ['Admin', 'SuperAdmin'],

  // Menu
  'menu.list':               ['Customer', 'Chef', 'Manager', 'Admin', 'Owner', 'SuperAdmin'],
  'menu.create':             ['Admin', 'SuperAdmin'],
  'menu.update':             ['Admin', 'SuperAdmin'],

  // Dashboard
  'dashboard.owner':         ['Owner', 'SuperAdmin'],
  'dashboard.admin':         ['Admin', 'SuperAdmin'],
  'dashboard.manager':       ['Manager', 'Admin', 'Owner', 'SuperAdmin'],
  'dashboard.chef':          ['Chef', 'Manager', 'Admin', 'SuperAdmin'],
  'dashboard.hr':            ['HR', 'Admin', 'Owner', 'SuperAdmin'],
  'dashboard.accountant':    ['Accountant', 'Admin', 'Owner', 'SuperAdmin'],

  // Financial
  'reports.financial':       ['Accountant', 'Owner', 'SuperAdmin'],
  'reports.operational':     ['Manager', 'Admin', 'Owner', 'SuperAdmin'],

  // System
  'system.config':           ['SuperAdmin'],
  'system.integrations':     ['Admin', 'SuperAdmin'],
  'audit.logs':              ['Admin', 'Owner', 'SuperAdmin'],
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role);
};

export const hasMinRole = (userRole: UserRole, minRole: UserRole): boolean => {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minRole);
};

// Extract JWT from request
export const getTokenFromRequest = (req: NextRequest): string | null => {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
  // Then check httpOnly cookie
  return req.cookies.get('mayflower_token')?.value || null;
};

// Auth middleware — use in API routes
export const withAuth = (
  handler: (req: NextRequest, user: JWTPayload, ctx?: unknown) => Promise<NextResponse>,
  requiredRoles?: UserRole[]
) => {
  return async (req: NextRequest, ctx?: unknown): Promise<NextResponse> => {
    const token = getTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    if (requiredRoles && !requiredRoles.includes(user.role as UserRole)) {
      return NextResponse.json({ error: 'Forbidden — insufficient role' }, { status: 403 });
    }

    return handler(req, user, ctx);
  };
};

// Helper to return standard error responses
export const apiError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status });

export const apiSuccess = (data: unknown, status = 200) =>
  NextResponse.json({ success: true, data }, { status });
