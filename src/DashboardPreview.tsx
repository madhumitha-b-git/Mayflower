import React, { useState } from 'react';
import { RoleDashboard } from './components/dashboards/RoleDashboard';
import { UserProfile, UserRole } from './types';

const ROLES: UserRole[] = ['SuperAdmin', 'Owner', 'Admin', 'Manager', 'Chef', 'HR', 'Accountant', 'Customer'];

const mockUser = (role: UserRole): UserProfile => ({
  id: 'preview-user',
  name: 'Preview User',
  email: 'preview@mayflower.com',
  phone: '+91 98765 43210',
  role,
  rewardPoints: 1200,
  tier: 'Gold',
  totalVisits: 8,
  joinedDate: '1 Jan 2024',
  transactions: [],
  reservations: [],
});

export default function DashboardPreview() {
  const [role, setRole] = useState<UserRole>('SuperAdmin');

  return (
    <div>
      {/* Role Switcher Bar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#02150c] text-white flex items-center gap-3 px-4 py-2 shadow-lg">
        <span className="text-xs font-bold text-[#e4c27d] uppercase tracking-widest">Dashboard Preview:</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="bg-[#152a20] text-[#e4c27d] border border-[#e4c27d]/40 rounded-lg px-3 py-1 text-xs font-bold focus:outline-none cursor-pointer"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <span className="text-[10px] text-gray-400 ml-2">Viewing as: <strong className="text-white">{role}</strong></span>
      </div>

      {/* Dashboard rendered below the switcher bar */}
      <div className="pt-10">
        <RoleDashboard
          user={mockUser(role)}
          onLogout={() => alert('Logout clicked (preview mode)')}
          onOpenReservations={() => alert('Open Reservations clicked (preview mode)')}
        />
      </div>
    </div>
  );
}
