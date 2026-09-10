import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { OwnerDashboard } from './OwnerDashboard';
import { AdminDashboard } from './AdminDashboard';
import { ManagerDashboard } from './ManagerDashboard';
import { ChefDashboard } from './ChefDashboard';
import { HRDashboard } from './HRDashboard';
import { AccountantDashboard } from './AccountantDashboard';
import { CustomerDashboard } from './CustomerDashboard';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  onBackToWebsite: () => void;
  onOpenReservations?: () => void;
}

export const RoleDashboard: React.FC<Props> = ({ user, onLogout, onBackToWebsite, onOpenReservations }) => {
  const userRole = user.role || 'Customer';
  const isSuperAdmin = userRole === 'SuperAdmin';

  // SuperAdmin can switch views; all other roles are strictly locked to their own dashboard
  const [activeRole, setActiveRole] = useState<UserRole>(userRole as UserRole);

  const handleSwitchRole = (rolePathOrName: string) => {
    if (!isSuperAdmin) return;
    const map: Record<string, UserRole> = {
      'owner-management': 'Owner',   'Owner': 'Owner',
      'admin-suite': 'Admin',        'Admin': 'Admin',
      'manager-operations': 'Manager', 'Manager': 'Manager',
      'chef-kitchen': 'Chef',        'Chef': 'Chef',
      'hr-roster': 'HR',             'HR': 'HR',
      'accountant-ledger': 'Accountant', 'Accountant': 'Accountant',
      'customer-portal': 'Customer', 'Customer': 'Customer',
      'SuperAdmin': 'SuperAdmin',
    };
    setActiveRole(map[rolePathOrName] ?? (userRole as UserRole));
  };

  const switchHandler = isSuperAdmin ? handleSwitchRole : undefined;

  const renderDashboard = () => {
    switch (activeRole) {
      case 'SuperAdmin':  return <SuperAdminDashboard  user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Owner':       return <OwnerDashboard       user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Admin':       return <AdminDashboard       user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Manager':     return <ManagerDashboard     user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Chef':        return <ChefDashboard        user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'HR':          return <HRDashboard          user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      case 'Accountant':  return <AccountantDashboard  user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
      default:            return <CustomerDashboard    user={user} onLogout={onLogout} onOpenReservations={onOpenReservations} onSwitchRole={switchHandler} onUpdateUser={undefined} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Persistent back-to-website bar */}
      <div className="sticky top-0 z-[9999] bg-[#1A1A1A] text-white flex items-center justify-between px-4 sm:px-6 h-10 shrink-0">
        <button
          onClick={onBackToWebsite}
          className="flex items-center space-x-2 text-xs font-semibold text-[#D1CDBC] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Mayflower Website</span>
        </button>
        <div className="flex items-center space-x-3 text-xs text-[#D1CDBC]">
          <span className="hidden sm:inline">Logged in as</span>
          <span className="font-bold text-white">{user.name}</span>
          <span className="bg-[#2D4030] text-[#6FCF97] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
            {isSuperAdmin && activeRole !== 'SuperAdmin' ? `Viewing: ${activeRole}` : userRole}
          </span>
        </div>
      </div>

      {/* Role dashboard content */}
      <div className="flex-1">
        {renderDashboard()}
      </div>
    </div>
  );
};
