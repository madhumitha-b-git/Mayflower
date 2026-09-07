import React, { useState } from 'react';
import { Settings, Users, Store, FileText, LogOut, Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { UserProfile } from '../../types';
import { getStoredUsers } from '../../data/userStorage';

interface Props { user: UserProfile; onLogout: () => void; }

export const AdminDashboard: React.FC<Props> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'outlets'>('overview');
  const allUsers = getStoredUsers();

  const tasks = [
    { label: 'Review new outlet setup — Velachery', status: 'Pending', priority: 'High' },
    { label: 'Approve menu update for Egmore', status: 'In Progress', priority: 'Medium' },
    { label: 'Staff onboarding — 3 new hires', status: 'Pending', priority: 'High' },
    { label: 'Monthly compliance report', status: 'Completed', priority: 'Low' },
    { label: 'Update reservation slot timings', status: 'Completed', priority: 'Medium' },
  ];

  const statusIcon = (s: string) => s === 'Completed' ? <CheckCircle className="w-4 h-4 text-green-500" /> : s === 'In Progress' ? <Clock className="w-4 h-4 text-amber-500" /> : <AlertCircle className="w-4 h-4 text-red-400" />;
  const priorityColor = (p: string) => p === 'High' ? 'text-red-600 bg-red-50' : p === 'Medium' ? 'text-amber-600 bg-amber-50' : 'text-green-600 bg-green-50';

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="bg-[#2D4030] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">Admin Panel</div>
            <div className="text-xs text-green-300">The Mayflower — Administrative Control</div>
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
        {[{ id: 'overview', label: 'Overview', icon: FileText }, { id: 'users', label: 'Users', icon: Users }, { id: 'outlets', label: 'Outlets', icon: Store }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${activeTab === id ? 'border-blue-500 text-blue-600' : 'border-transparent text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {activeTab === 'overview' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Admin Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: allUsers.length, color: 'bg-blue-500', icon: Users },
                { label: 'Active Outlets', value: 4, color: 'bg-[#2D4030]', icon: Store },
                { label: 'Pending Tasks', value: tasks.filter(t => t.status === 'Pending').length, color: 'bg-red-500', icon: AlertCircle },
                { label: 'Completed Tasks', value: tasks.filter(t => t.status === 'Completed').length, color: 'bg-green-500', icon: CheckCircle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="bg-white rounded-2xl p-5 border border-[#E8E4DB] flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon className="w-5 h-5 text-white" /></div>
                  <div><div className="text-xl font-bold text-[#1A1A1A]">{value}</div><div className="text-xs text-[#5A5A40]">{label}</div></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5">
              <h3 className="font-bold text-[#1A1A1A] mb-4">Admin Task Queue</h3>
              <div className="space-y-2">
                {tasks.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2]">
                    <div className="flex items-center space-x-3">
                      {statusIcon(t.status)}
                      <span className="text-sm text-[#1A1A1A]">{t.label}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColor(t.priority)}`}>{t.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">User Management</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF7F2] border-b border-[#E8E4DB]">
                  <tr>{['Name', 'Email', 'Role', 'Joined'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5A5A40] uppercase tracking-wider">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#E8E4DB]">
                  {allUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3 font-medium">{u.name}</td>
                      <td className="px-4 py-3 text-[#5A5A40]">{u.email}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{u.role || 'Customer'}</span></td>
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
            <h2 className="text-xl font-bold text-[#1A1A1A]">Outlet Administration</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {['Poes Garden', 'Anna Nagar', 'Egmore', 'Palavakkam'].map(o => (
                <div key={o} className="bg-white rounded-2xl border border-[#E8E4DB] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-[#1A1A1A]">{o}</h3>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="space-y-1 text-xs text-[#5A5A40]">
                    <div className="flex justify-between"><span>Tables</span><span className="font-bold text-[#1A1A1A]">12</span></div>
                    <div className="flex justify-between"><span>Capacity</span><span className="font-bold text-[#1A1A1A]">48 guests</span></div>
                    <div className="flex justify-between"><span>Status</span><span className="font-bold text-green-600">Operational</span></div>
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
