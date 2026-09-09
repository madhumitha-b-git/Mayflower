import React, { useState } from 'react';
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
  onOpenReservations?: () => void;
}

export const RoleDashboard: React.FC<Props> = ({ user, onLogout, onOpenReservations }) => {
  // Strict Role Isolation:
  // Each logged-in email account gets ONLY their dedicated role dashboard.
  // Role switching dropdowns and nav bars are disabled for individual role accounts.
  const userRole = user.role || 'Customer';
  const isSuperAdmin = userRole === 'SuperAdmin';
  
  const [activeRole, setActiveRole] = useState<UserRole | 'SuperAdmin'>(userRole);

  const handleSwitchRole = (rolePathOrName: string) => {
    if (!isSuperAdmin) return; // Block unauthorized role switching for non-superadmin users
    switch (rolePathOrName) {
      case 'owner-management':
      case 'Owner':
        setActiveRole('Owner');
        break;
      case 'admin-suite':
      case 'Admin':
        setActiveRole('Admin');
        break;
      case 'manager-operations':
      case 'Manager':
        setActiveRole('Manager');
        break;
      case 'chef-kitchen':
      case 'Chef':
        setActiveRole('Chef');
        break;
      case 'hr-roster':
      case 'HR':
        setActiveRole('HR');
        break;
      case 'accountant-ledger':
      case 'Accountant':
        setActiveRole('Accountant');
        break;
      case 'customer-portal':
      case 'Customer':
        setActiveRole('Customer');
        break;
      case 'SuperAdmin':
        setActiveRole('SuperAdmin');
        break;
      default:
        setActiveRole(userRole);
    }
  };

  const switchHandler = isSuperAdmin ? handleSwitchRole : undefined;

  switch (activeRole) {
    case 'SuperAdmin': return <SuperAdminDashboard user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
    case 'Owner':      return <OwnerDashboard user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
    case 'Admin':      return <AdminDashboard user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
    case 'Manager':    return <ManagerDashboard user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
    case 'Chef':       return <ChefDashboard user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
    case 'HR':         return <HRDashboard user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
    case 'Accountant': return <AccountantDashboard user={user} onLogout={onLogout} onSwitchRole={switchHandler} />;
    default:           return <CustomerDashboard user={user} onLogout={onLogout} onOpenReservations={onOpenReservations} onSwitchRole={switchHandler} />;
  }
};
