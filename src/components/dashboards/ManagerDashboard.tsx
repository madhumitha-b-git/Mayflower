import React, { useState } from 'react';
import { ClipboardList, Calendar, Users, CheckSquare, LogOut, Bell, Clock, CheckCircle, LayoutGrid } from 'lucide-react';
import { UserProfile } from '../../types';
import { getStoredUsers } from '../../data/userStorage';

interface Props { user: UserProfile; onLogout: () => void; }

export const ManagerDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'tables' | 'tasks' | 'feedback'>('reservations');
  const allUsers = getStoredUsers();
  const allReservations = allUsers.flatMap(u => (u.reservations || []).map(r => ({ ...r, guestName: u.name, guestEmail: u.email })));

  const tables = [
    { id: 'T1', name: 'Garden Table 1', area: 'Garden', seats: 4, status: 'Available' },
    { id: 'T2', name: 'Window Table 2', area: 'Window', seats: 2, status: 'Reserved' },
    { id: 'T3', name: 'Main Dining 3', area: 'Main Dining', seats: 6, status: 'Occupied' },
    { id: 'T4', name: 'Private Booth 1', area: 'Private Space', seats: 8, status: 'Available' },
    { id: 'T5', name: 'Garden Table 2', area: 'Garden', seats: 4, status: 'Cleaning' },
    { id: 'T6', name: 'Window Table 3', area: 'Window', seats: 2, status: 'Available' },
  ];

  const tasks = [
    { label: 'Morning briefing with floor staff', time: '9:00 AM', done: true },
    { label: 'Review today\'s reservation list', time: '10:00 AM', done: true },
    { label: 'Table setup for private event — T4', time: '11:30 AM', done: false },
    { label: 'Feedback review from last weekend', time: '2:00 PM', done: false },
    { label: 'Evening shift handover', time: '6:00 PM', done: false },
  ];

  const statusColor = (s: string) => ({
    Available: 'text-green-600 bg-green-50',
    Reserved: 'text-blue-600 bg-blue-50',
    Occupied: 'text-red-600 bg-red-50',
    Cleaning: 'text-amber-600 bg-amber-50',
  }[s] || 'text-gray-600 bg-gray-50');

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="bg-[#1E3932] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500 flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Manager Dashboard</div>
            <div className="text-xs text-green-300">The Mayflower — Daily Operations</div>
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

      <div className="bg-white border-b border-[#E8E4DB] px-6 flex space-x-1 overflow-x-auto">
        {[{ id: 'reservations', label: 'Reservations', icon: Calendar }, { id: 'tables', label: 'Tables', icon: LayoutGrid }, { id: 'tasks', label: 'Tasks', icon: CheckSquare }, { id: 'feedback', label: 'Feedback', icon: ClipboardList }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === id ? 'border-purple-500 text-purple-600' : 'border-transparent text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {activeTab === 'reservations' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Today's Reservations ({allReservations.length})</h2>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[{ label: 'Total', value: allReservations.length, color: 'bg-purple-500' }, { label: 'Confirmed', value: allReservations.filter(r => r.status === 'Confirmed').length, color: 'bg-blue-500' }, { label: 'Completed', value: allReservations.filter(r => r.status === 'Completed').length, color: 'bg-green-500' }].map(({ label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl p-4 border border-[#E8E4DB] text-center">
                  <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}><Calendar className="w-4 h-4 text-white" /></div>
                  <div className="text-2xl font-bold text-[#1A1A1A]">{value}</div>
                  <div className="text-xs text-[#5A5A40]">{label}</div>
                </div>
              ))}
            </div>
            {allReservations.length > 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#FAF7F2] border-b border-[#E8E4DB]">
                    <tr>{['Guest', 'Outlet', 'Date', 'Time', 'Guests', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DB]">
                    {allReservations.map(r => (
                      <tr key={r.id} className="hover:bg-[#FAF7F2]">
                        <td className="px-4 py-3 font-medium">{r.guestName}</td>
                        <td className="px-4 py-3 text-[#5A5A40]">{r.outlet}</td>
                        <td className="px-4 py-3 text-[#5A5A40]">{r.date}</td>
                        <td className="px-4 py-3 text-[#5A5A40]">{r.timeSlot}</td>
                        <td className="px-4 py-3 text-[#5A5A40]">{r.guests}</td>
                        <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === 'Confirmed' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'}`}>{r.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8E4DB] p-10 text-center text-[#5A5A40] text-sm">No reservations yet.</div>
            )}
          </>
        )}

        {activeTab === 'tables' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Table Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tables.map(t => (
                <div key={t.id} className="bg-white rounded-2xl border border-[#E8E4DB] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#1A1A1A]">{t.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusColor(t.status)}`}>{t.status}</span>
                  </div>
                  <div className="text-xs text-[#5A5A40] space-y-0.5">
                    <div>Area: {t.area}</div>
                    <div>Seats: {t.seats}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'tasks' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Daily Task Checklist</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5 space-y-2">
              {tasks.map((t, i) => (
                <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${t.done ? 'bg-green-50' : 'bg-[#FAF7F2]'}`}>
                  <div className="flex items-center space-x-3">
                    {t.done ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                    <span className={`text-sm ${t.done ? 'line-through text-[#5A5A40]' : 'text-[#1A1A1A]'}`}>{t.label}</span>
                  </div>
                  <span className="text-xs text-[#5A5A40]">{t.time}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'feedback' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Customer Feedback</h2>
            <div className="space-y-3">
              {[
                { guest: 'Priya S.', rating: 5, comment: 'Loved the glasshouse seating! Food was amazing.', outlet: 'Poes Garden', date: '12 Jul 2025' },
                { guest: 'Arjun M.', rating: 4, comment: 'Great ambience, slightly slow service during peak hours.', outlet: 'Anna Nagar', date: '11 Jul 2025' },
                { guest: 'Kavitha R.', rating: 5, comment: 'The Khao Suey was outstanding. Will visit again!', outlet: 'Egmore', date: '10 Jul 2025' },
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E8E4DB] p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#1A1A1A]">{f.guest}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-[#5A5A40]">{f.outlet}</span>
                      <span className="text-xs text-amber-500">{'★'.repeat(f.rating)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#5A5A40]">{f.comment}</p>
                  <div className="text-xs text-[#5A5A40] mt-1">{f.date}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
