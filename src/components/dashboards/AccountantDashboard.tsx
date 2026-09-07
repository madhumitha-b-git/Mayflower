import React, { useState } from 'react';
import { DollarSign, TrendingUp, FileText, CreditCard, LogOut, Bell, BarChart3 } from 'lucide-react';
import { UserProfile } from '../../types';
import { getStoredUsers } from '../../data/userStorage';

interface Props { user: UserProfile; onLogout: () => void; }

export const AccountantDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'reports'>('overview');
  const allUsers = getStoredUsers();
  const totalReservations = allUsers.reduce((s, u) => s + (u.reservations?.length || 0), 0);
  const totalPoints = allUsers.reduce((s, u) => s + u.rewardPoints, 0);

  const outlets = [
    { name: 'Poes Garden', revenue: 184000, reservations: 24, avgBill: 7667 },
    { name: 'Anna Nagar', revenue: 142000, reservations: 18, avgBill: 7889 },
    { name: 'Egmore', revenue: 118000, reservations: 15, avgBill: 7867 },
    { name: 'Palavakkam', revenue: 165000, reservations: 21, avgBill: 7857 },
  ];

  const transactions = [
    { id: 'TXN-001', type: 'Reservation', outlet: 'Poes Garden', amount: '₹8,400', date: '12 Jul 2025', status: 'Settled' },
    { id: 'TXN-002', type: 'Gift Card', outlet: 'Anna Nagar', amount: '₹2,000', date: '11 Jul 2025', status: 'Settled' },
    { id: 'TXN-003', type: 'Reservation', outlet: 'Egmore', amount: '₹6,200', date: '11 Jul 2025', status: 'Pending' },
    { id: 'TXN-004', type: 'Reservation', outlet: 'Palavakkam', amount: '₹9,100', date: '10 Jul 2025', status: 'Settled' },
    { id: 'TXN-005', type: 'Gift Card', outlet: 'Poes Garden', amount: '₹1,500', date: '10 Jul 2025', status: 'Settled' },
  ];

  const totalRevenue = outlets.reduce((s, o) => s + o.revenue, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="bg-[#1A1A1A] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Accountant Dashboard</div>
            <div className="text-xs text-gray-400">The Mayflower — Financial Overview</div>
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

      <div className="bg-white border-b border-[#E8E4DB] px-6 flex space-x-1">
        {[{ id: 'overview', label: 'Overview', icon: BarChart3 }, { id: 'transactions', label: 'Transactions', icon: CreditCard }, { id: 'reports', label: 'Reports', icon: FileText }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === id ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {activeTab === 'overview' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Financial Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(2)}L`, icon: DollarSign, color: 'bg-emerald-500' },
                { label: 'Reservations', value: totalReservations, icon: TrendingUp, color: 'bg-blue-500' },
                { label: 'Loyalty Points', value: `${totalPoints} PTS`, icon: CreditCard, color: 'bg-purple-500' },
                { label: 'Avg Bill', value: '₹7,820', icon: BarChart3, color: 'bg-amber-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl p-5 border border-[#E8E4DB] flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5 text-white" /></div>
                  <div><div className="text-lg font-bold text-[#1A1A1A]">{value}</div><div className="text-xs text-[#5A5A40]">{label}</div></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Revenue by Outlet</h3>
              <div className="space-y-3">
                {outlets.map(o => (
                  <div key={o.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#5A5A40]">{o.name}</span>
                      <span className="font-bold text-[#1A1A1A]">₹{o.revenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-[#E8E4DB] rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(o.revenue / totalRevenue) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'transactions' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Recent Transactions</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF7F2] border-b border-[#E8E4DB]">
                  <tr>{['ID', 'Type', 'Outlet', 'Amount', 'Date', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DB]">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3 font-mono text-xs text-[#5A5A40]">{t.id}</td>
                      <td className="px-4 py-3 font-medium">{t.type}</td>
                      <td className="px-4 py-3 text-[#5A5A40]">{t.outlet}</td>
                      <td className="px-4 py-3 font-bold text-[#1A1A1A]">{t.amount}</td>
                      <td className="px-4 py-3 text-[#5A5A40]">{t.date}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.status === 'Settled' ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'}`}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'reports' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Financial Reports</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {outlets.map(o => (
                <div key={o.name} className="bg-white rounded-2xl border border-[#E8E4DB] p-5">
                  <h3 className="font-bold text-[#1A1A1A] mb-3">{o.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#5A5A40]">Revenue</span><span className="font-bold">₹{o.revenue.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-[#5A5A40]">Reservations</span><span className="font-bold">{o.reservations}</span></div>
                    <div className="flex justify-between"><span className="text-[#5A5A40]">Avg Bill</span><span className="font-bold">₹{o.avgBill.toLocaleString('en-IN')}</span></div>
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
