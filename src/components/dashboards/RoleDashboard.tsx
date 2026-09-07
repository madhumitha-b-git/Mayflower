import React from 'react';
import { UserProfile } from '../../types';
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
  const role = user.role || 'Customer';

  switch (role) {
    case 'SuperAdmin': return <SuperAdminDashboard user={user} onLogout={onLogout} />;
    case 'Owner':      return <OwnerDashboard user={user} onLogout={onLogout} />;
    case 'Admin':      return <AdminDashboard user={user} onLogout={onLogout} />;
    case 'Manager':    return <ManagerDashboard user={user} onLogout={onLogout} />;
    case 'Chef':       return <ChefDashboard user={user} onLogout={onLogout} />;
    case 'HR':         return <HRDashboard user={user} onLogout={onLogout} />;
    case 'Accountant': return <AccountantDashboard user={user} onLogout={onLogout} />;
    default:           return <CustomerDashboard user={user} onLogout={onLogout} onOpenReservations={onOpenReservations} />;
  }
};
