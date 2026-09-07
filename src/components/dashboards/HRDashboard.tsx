import React, { useState } from 'react';
import { UserCog, Users, FileText, Calendar, LogOut, Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { getStoredUsers } from '../../data/userStorage';

interface Props { user: UserProfile; onLogout: () => void; }

export const HRDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'onboarding' | 'attendance'>('employees');
  const allUsers = getStoredUsers();
  const staff = allUsers.filter(u => u.role && u.role !== 'Customer');

  const onboarding = [
    { name: 'Ravi Kumar', role: 'Waiter', outlet: 'Poes Garden', status: 'In Progress', date: '10 Jul 2025' },
    { name: 'Meena S.', role: 'Cashier', outlet: 'Anna Nagar', status: 'Pending', date: '12 Jul 2025' },
    { name: 'Suresh P.', role: 'Kitchen Staff', outlet: 'Egmore', status: 'Completed', date: '8 Jul 2025' },
  ];

  const attendance = [
    { name: 'Ravi Kumar', role: 'Waiter', checkIn: '9:00 AM', checkOut: '6:00 PM', status: 'Present' },
    { name: 'Meena S.', role: 'Cashier', checkIn: '10:00 AM', checkOut: '-', status: 'Present' },
    { name: 'Suresh P.', role: 'Kitchen Staff', checkIn: '-', checkOut: '-', status: 'Absent' },
    { name: 'Priya T.', role: 'Host', checkIn: '11:00 AM', checkOut: '8:00 PM', status: 'Present' },
  ];

  const statusColor = (s: string) => ({ Completed: 'text-green-600 bg-green-50', 'In Progress': 'text-amber-600 bg-amber-50', Pending: 'text-blue-600 bg-blue-50', Present: 'text-green-600 bg-green-50', Absent: 'text-red-600 bg-red-50' }[s] || '');

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="bg-[#2D4030] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center">
            <UserCog className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">HR Dashboard</div>
            <div className="text-xs text-green-300">The Mayflower — Human Resources</div>
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
        {[{ id: 'employees', label: 'Employees', icon: Users }, { id: 'onboarding', label: 'Onboarding', icon: FileText }, { id: 'attendance', label: 'Attendance', icon: Calendar }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === id ? 'border-teal-500 text-teal-600' : 'border-transparent text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {activeTab === 'employees' && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[{ label: 'Total Staff', value: staff.length, color: 'bg-teal-500' }, { label: 'Onboarding', value: onboarding.filter(o => o.status !== 'Completed').length, color: 'bg-amber-500' }, { label: 'Outlets', value: 4, color: 'bg-[#2D4030]' }].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-[#E8E4DB] text-center">
                  <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}><Users className="w-4 h-4 text-white" /></div>
                  <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>
                  <div className="text-xs text-[#5A5A40]">{label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF7F2] border-b border-[#E8E4DB]">
                  <tr>{['Name', 'Email', 'Role', 'Joined'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DB]">
                  {staff.map(u => (
                    <tr key={u.id} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-[#5A5A40]">{u.email}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{u.role}</span></td>
                      <td className="px-4 py-3 text-[#5A5A40]">{u.joinedDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'onboarding' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Onboarding Pipeline</h2>
            <div className="space-y-3">
              {onboarding.map((o, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E8E4DB] p-4 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-[#1A1A1A]">{o.name}</div>
                    <div className="text-xs text-[#5A5A40]">{o.role} — {o.outlet}</div>
                    <div className="text-xs text-[#5A5A40] mt-0.5">Start: {o.date}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>{o.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'attendance' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Today's Attendance</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF7F2] border-b border-[#E8E4DB]">
                  <tr>{['Name', 'Role', 'Check In', 'Check Out', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DB]">
                  {attendance.map((a, i) => (
                    <tr key={i} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3 font-medium">{a.name}</td>
                      <td className="px-4 py-3 text-[#5A5A40]">{a.role}</td>
                      <td className="px-4 py-3 text-[#5A5A40]">{a.checkIn}</td>
                      <td className="px-4 py-3 text-[#5A5A40]">{a.checkOut}</td>
                      <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(a.status)}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
