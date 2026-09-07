import React, { useState } from 'react';
import { TrendingUp, Store, Users, Star, LogOut, BarChart3, DollarSign, Bell, Calendar } from 'lucide-react';
import { UserProfile } from '../../types';
import { getStoredUsers } from '../../data/userStorage';

interface Props { user: UserProfile; onLogout: () => void; }

const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) => (
  <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB]">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>
    <div className="text-xs text-[#5A5A40] font-medium mt-0.5">{label}</div>
    {sub && <div className="text-xs text-green-600 font-semibold mt-1">{sub}</div>}
  </div>
);

export const OwnerDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'reports'>('overview');
  const allUsers = getStoredUsers();
  const customers = allUsers.filter(u => u.role === 'Customer' || !u.role);
  const totalReservations = allUsers.reduce((s, u) => s + (u.reservations?.length || 0), 0);

  const outlets = [
    { name: 'Poes Garden', reservations: 24, revenue: '₹1,84,000', status: 'Active' },
    { name: 'Anna Nagar', reservations: 18, revenue: '₹1,42,000', status: 'Active' },
    { name: 'Egmore', reservations: 15, revenue: '₹1,18,000', status: 'Active' },
    { name: 'Palavakkam', reservations: 21, revenue: '₹1,65,000', status: 'Active' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="bg-[#1E3932] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Owner / Management</div>
            <div className="text-xs text-green-300">The Mayflower — Business Overview</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-gray-300" />
          <div className="text-xs text-gray-300">{user.email}</div>
          <button onClick={onLogout} className="flex items-center space-x-1 text-xs text-red-300 hover:text-red-200 cursor-pointer">
            <LogOut className="w-4 h-4" /><span>Logout</span>
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-[#E8E4DB] px-6 flex space-x-1">
        {[{ id: 'overview', label: 'Overview', icon: BarChart3 }, { id: 'operations', label: 'Operations', icon: Store }, { id: 'reports', label: 'Reports', icon: DollarSign }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === id ? 'border-amber-500 text-amber-600' : 'border-transparent text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {activeTab === 'overview' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Business Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={Store} label="Active Outlets" value={4} sub="All operational" color="bg-[#2D4030]" />
              <StatCard icon={Users} label="Registered Customers" value={customers.length} sub="+12 this week" color="bg-blue-500" />
              <StatCard icon={Calendar} label="Total Reservations" value={totalReservations} sub="This month" color="bg-purple-500" />
              <StatCard icon={DollarSign} label="Est. Revenue" value="₹6,09,000" sub="This month" color="bg-amber-500" />
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Outlet Performance</h3>
              <div className="space-y-3">
                {outlets.map(o => (
                  <div key={o.name} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2]">
                    <div className="flex items-center space-x-3">
                      <Store className="w-4 h-4 text-[#2D4030]" />
                      <span className="font-medium text-sm text-[#1A1A1A]">{o.name}</span>
                    </div>
                    <div className="flex items-center space-x-6 text-xs text-[#5A5A40]">
                      <span>{o.reservations} reservations</span>
                      <span className="font-bold text-[#1A1A1A]">{o.revenue}</span>
                      <span className="text-green-600 font-bold">● {o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'operations' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Operational Dashboard</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {outlets.map(o => (
                <div key={o.name} className="bg-white rounded-2xl border border-[#E8E4DB] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#1A1A1A]">{o.name}</h3>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">● Active</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#FAF7F2] rounded-xl p-3"><div className="text-[#5A5A40]">Reservations</div><div className="font-bold text-lg text-[#1A1A1A]">{o.reservations}</div></div>
                    <div className="bg-[#FAF7F2] rounded-xl p-3"><div className="text-[#5A5A40]">Revenue</div><div className="font-bold text-lg text-[#1A1A1A]">{o.revenue}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Business Reports</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5 space-y-4">
              {[
                { label: 'Monthly Revenue', value: '₹6,09,000', change: '+18%' },
                { label: 'Total Customers', value: customers.length.toString(), change: '+12%' },
                { label: 'Avg. Table Occupancy', value: '78%', change: '+5%' },
                { label: 'Loyalty Points Issued', value: '12,400 PTS', change: '+22%' },
              ].map(({ label, value, change }) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2]">
                  <span className="text-sm text-[#5A5A40]">{label}</span>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-[#1A1A1A]">{value}</span>
                    <span className="text-xs font-bold text-green-600">{change}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
