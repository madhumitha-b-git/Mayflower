import React, { useState } from 'react';
import { Shield, Users, Store, Settings, BarChart3, LogOut, ChevronRight, Bell, Globe, Lock, Database, Activity } from 'lucide-react';
import { UserProfile } from '../../types';
import { getStoredUsers } from '../../data/userStorage';

interface Props { user: UserProfile; onLogout: () => void; }

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
  <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB] flex items-center space-x-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>
      <div className="text-xs text-[#5A5A40] font-medium">{label}</div>
    </div>
  </div>
);

export const SuperAdminDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'outlets' | 'roles' | 'system'>('overview');
  const allUsers = getStoredUsers();

  const roleCounts = allUsers.reduce((acc, u) => {
    const r = u.role || 'Customer';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const outlets = ['Poes Garden', 'Anna Nagar', 'Egmore', 'Palavakkam'];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'outlets', label: 'Outlets', icon: Store },
    { id: 'roles', label: 'Roles', icon: Lock },
    { id: 'system', label: 'System', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Top Bar */}
      <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Super Admin Panel</div>
            <div className="text-xs text-gray-400">The Mayflower — Full System Access</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="text-xs text-gray-300">{user.email}</div>
          <button onClick={onLogout} className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 cursor-pointer">
            <LogOut className="w-4 h-4" /><span>Logout</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="bg-white border-b border-[#E8E4DB] px-6 flex space-x-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === id ? 'border-red-600 text-red-600' : 'border-transparent text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {activeTab === 'overview' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">System Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Users" value={allUsers.length} color="bg-blue-500" />
              <StatCard icon={Store} label="Outlets" value={4} color="bg-[#2D4030]" />
              <StatCard icon={Lock} label="Roles Defined" value={8} color="bg-purple-500" />
              <StatCard icon={Activity} label="System Status" value="Live" color="bg-green-500" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5">
                <h3 className="font-bold text-[#1A1A1A] mb-4">Users by Role</h3>
                <div className="space-y-2">
                  {Object.entries(roleCounts).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between text-sm">
                      <span className="text-[#5A5A40]">{role}</span>
                      <span className="font-bold text-[#1A1A1A] bg-[#FAF7F2] px-3 py-0.5 rounded-full text-xs">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5">
                <h3 className="font-bold text-[#1A1A1A] mb-4">Outlet Status</h3>
                <div className="space-y-2">
                  {outlets.map(o => (
                    <div key={o} className="flex items-center justify-between text-sm">
                      <span className="text-[#5A5A40]">{o}</span>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">All Users ({allUsers.length})</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF7F2] border-b border-[#E8E4DB]">
                  <tr>{['Name', 'Email', 'Role', 'Points', 'Joined'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DB]">
                  {allUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3 font-medium text-[#1A1A1A]">{u.name}</td>
                      <td className="px-4 py-3 text-[#5A5A40]">{u.email}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold bg-[#2D4030]/10 text-[#2D4030] px-2 py-0.5 rounded-full">{u.role || 'Customer'}</span></td>
                      <td className="px-4 py-3 text-[#5A5A40]">{u.rewardPoints}</td>
                      <td className="px-4 py-3 text-[#5A5A40]">{u.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'outlets' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Outlet Management</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {outlets.map(o => (
                <div key={o} className="bg-white rounded-2xl border border-[#E8E4DB] p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#2D4030] flex items-center justify-center">
                      <Store className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-[#1A1A1A] text-sm">{o}</div>
                      <div className="text-xs text-green-600 font-medium">● Active</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#5A5A40]" />
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'roles' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Role & Access Control</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF7F2] border-b border-[#E8E4DB]">
                  <tr>{['Role', 'Primary Access', 'Users'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DB]">
                  {[
                    ['SuperAdmin', 'Full system, configuration, users, roles, outlets and integration controls'],
                    ['Owner', 'Business-wide visibility, dashboards and operational overview'],
                    ['Admin', 'Administrative and operational management across authorised modules'],
                    ['Manager', 'Outlet reservations, tables, SOPs, tasks, feedback and daily operations'],
                    ['Chef', 'Assigned kitchen SOPs, checklists and operational tasks'],
                    ['HR', 'Relevant employee/HR workflows'],
                    ['Accountant', 'Financial/business information through authorised integrations'],
                    ['Customer', 'Registration, profile, reservations, loyalty information and feedback'],
                  ].map(([role, access]) => (
                    <tr key={role} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3"><span className="text-xs font-bold bg-[#2D4030]/10 text-[#2D4030] px-2 py-0.5 rounded-full">{role}</span></td>
                      <td className="px-4 py-3 text-[#5A5A40] text-xs">{access}</td>
                      <td className="px-4 py-3 font-bold text-[#1A1A1A]">{roleCounts[role] || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'system' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">System Configuration</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: Globe, label: 'Website Integration', status: 'Connected', color: 'bg-green-500' },
                { icon: Database, label: 'LocalStorage DB', status: 'Active', color: 'bg-blue-500' },
                { icon: Lock, label: 'RBAC Enforcement', status: 'Enabled', color: 'bg-purple-500' },
                { icon: Activity, label: 'Email Service', status: 'Simulated', color: 'bg-orange-500' },
              ].map(({ icon: Icon, label, status, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-[#E8E4DB] p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-[#1A1A1A] text-sm">{label}</span>
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{status}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
