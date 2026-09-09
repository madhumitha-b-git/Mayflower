import React, { useState } from 'react';
import { 
  Users, DollarSign, Calendar, Clock, Award, CheckCircle2, XCircle, AlertTriangle, 
  Filter, Plus, Send, Download, RefreshCw, Shield, ChevronRight, LogOut, Bell, 
  Building, Check, Sparkles, UserPlus, HeartHandshake, Eye, Search, ArrowRight, X
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getStoredUsers } from '../../data/userStorage';

interface Props { 
  user: UserProfile; 
  onLogout: () => void;
  onSwitchRole?: (role: string) => void;
}

interface ShiftRequest {
  id: string;
  type: 'Shift Swap' | 'Leave Request' | 'Overtime Claim';
  employee: string;
  role: string;
  outlet: string;
  details: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  outlet: string;
  shift: 'Morning (07:00-15:00)' | 'Evening (15:00-23:00)' | 'Night (22:00-06:00)';
  status: 'Clocked In' | 'On Break' | 'Off Duty' | 'On Leave';
  clockInTime: string;
  hoursWorked: number;
  tipScore: number;
  gratuityShare: number;
}

export const HRDashboard: React.FC<Props> = ({ user, onLogout, onSwitchRole }) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'gratuity' | 'approvals' | 'honorRoll'>('roster');
  const [selectedOutlet, setSelectedOutlet] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showGratuityModal, setShowGratuityModal] = useState<boolean>(false);
  const [showAwardModal, setShowAwardModal] = useState<boolean>(false);
  const [showOnboardModal, setShowOnboardModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sample initial staff members
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { id: 'EMP-01', name: 'Chef Rajesh Sharma', role: 'Executive Chef', outlet: 'Poes Garden', shift: 'Evening (15:00-23:00)', status: 'Clocked In', clockInTime: '14:45', hoursWorked: 7.5, tipScore: 4.9, gratuityShare: 2450 },
    { id: 'EMP-02', name: 'Ananya Roy', role: 'Head Sommelier', outlet: 'ECR Sanctuary', shift: 'Evening (15:00-23:00)', status: 'Clocked In', clockInTime: '15:00', hoursWorked: 7.0, tipScore: 4.8, gratuityShare: 2200 },
    { id: 'EMP-03', name: 'Vikram Seth', role: 'Floor Captain', outlet: 'Poes Garden', shift: 'Morning (07:00-15:00)', status: 'Off Duty', clockInTime: '06:55', hoursWorked: 8.0, tipScore: 4.7, gratuityShare: 1950 },
    { id: 'EMP-04', name: 'Priya Sundaram', role: 'Maître d’', outlet: 'Anna Nagar', shift: 'Evening (15:00-23:00)', status: 'Clocked In', clockInTime: '14:50', hoursWorked: 7.2, tipScore: 4.9, gratuityShare: 2300 },
    { id: 'EMP-05', name: 'Arjun Kapoor', role: 'Line Cook', outlet: 'Velachery', shift: 'Morning (07:00-15:00)', status: 'Off Duty', clockInTime: '07:00', hoursWorked: 8.0, tipScore: 4.5, gratuityShare: 1600 },
    { id: 'EMP-06', name: 'Kavita Menon', role: 'Pastry Chef', outlet: 'Poes Garden', shift: 'Morning (07:00-15:00)', status: 'Off Duty', clockInTime: '06:45', hoursWorked: 8.5, tipScore: 4.9, gratuityShare: 2100 },
    { id: 'EMP-07', name: 'Siddharth Rao', role: 'Senior Bartender', outlet: 'ECR Sanctuary', shift: 'Night (22:00-06:00)', status: 'On Break', clockInTime: '21:50', hoursWorked: 4.0, tipScore: 4.6, gratuityShare: 1850 },
    { id: 'EMP-08', name: 'Meera Patel', role: 'Guest Relations', outlet: 'Anna Nagar', shift: 'Evening (15:00-23:00)', status: 'On Leave', clockInTime: '--:--', hoursWorked: 0, tipScore: 4.8, gratuityShare: 0 },
  ]);

  // Initial shift requests
  const [requests, setRequests] = useState<ShiftRequest[]>([
    { id: 'REQ-101', type: 'Shift Swap', employee: 'Vikram Seth', role: 'Floor Captain', outlet: 'Poes Garden', details: 'Swap Evening shift on 15 Jul with Ananya Roy', date: '12 Jul 2025', status: 'Pending', reason: 'Family engagement' },
    { id: 'REQ-102', type: 'Leave Request', employee: 'Meera Patel', role: 'Guest Relations', outlet: 'Anna Nagar', details: 'Casual leave for 2 days (14-15 Jul)', date: '11 Jul 2025', status: 'Approved', reason: 'Medical appointment' },
    { id: 'REQ-103', type: 'Overtime Claim', employee: 'Kavita Menon', role: 'Pastry Chef', outlet: 'Poes Garden', details: '2.5 Hours extra for VIP Banquet preps', date: '10 Jul 2025', status: 'Pending', reason: 'Unscheduled VIP tasting menu setup' },
    { id: 'REQ-104', type: 'Shift Swap', employee: 'Arjun Kapoor', role: 'Line Cook', outlet: 'Velachery', details: 'Swap Morning shift on 16 Jul with Suresh P.', date: '10 Jul 2025', status: 'Rejected', reason: 'Shortage of line cooks on 16 Jul' },
  ]);

  // Honor roll employees
  const [honorRoll, setHonorRoll] = useState([
    { id: 'HR-01', name: 'Priya Sundaram', role: 'Maître d’', outlet: 'Anna Nagar', month: 'July 2025', title: 'Artisan of the Month', praiseCount: 42, reward: '₹15,000 Bonus + Guild Gold Star' },
    { id: 'HR-02', name: 'Chef Rajesh Sharma', role: 'Executive Chef', outlet: 'Poes Garden', month: 'June 2025', title: 'Culinary Mastermind', praiseCount: 58, reward: '₹20,000 Bonus + Master Apron' },
    { id: 'HR-03', name: 'Ananya Roy', role: 'Head Sommelier', outlet: 'ECR Sanctuary', month: 'May 2025', title: 'Hospitality Luminary', praiseCount: 39, reward: '₹12,500 Bonus + Wine Guild Badge' },
  ]);

  // Form states
  const [awardForm, setAwardForm] = useState({ name: '', role: '', outlet: 'Poes Garden', title: 'Hospitality Luminary', reward: '₹10,000 Bonus' });
  const [onboardForm, setOnboardForm] = useState({ name: '', role: 'Waiter', outlet: 'Poes Garden', shift: 'Morning (07:00-15:00)' as const });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRequestAction = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    showToast(`Request ${id} marked as ${newStatus}`);
  };

  const handleDisburseGratuity = () => {
    setShowGratuityModal(false);
    showToast('Gratuity pool of ₹42,500 successfully disbursed to 48 active staff accounts!');
  };

  const handleAddAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardForm.name) return;
    const newAward = {
      id: `HR-${honorRoll.length + 1}`,
      name: awardForm.name,
      role: awardForm.role || 'Hospitality Associate',
      outlet: awardForm.outlet,
      month: 'July 2025',
      title: awardForm.title,
      praiseCount: 12,
      reward: awardForm.reward,
    };
    setHonorRoll([newAward, ...honorRoll]);
    setShowAwardModal(false);
    showToast(`Artisan Recognition awarded to ${awardForm.name}!`);
    setAwardForm({ name: '', role: '', outlet: 'Poes Garden', title: 'Hospitality Luminary', reward: '₹10,000 Bonus' });
  };

  const handleOnboardStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardForm.name) return;
    const newEmp: StaffMember = {
      id: `EMP-0${staffList.length + 1}`,
      name: onboardForm.name,
      role: onboardForm.role,
      outlet: onboardForm.outlet,
      shift: onboardForm.shift,
      status: 'Clocked In',
      clockInTime: '09:00',
      hoursWorked: 1.0,
      tipScore: 5.0,
      gratuityShare: 1500,
    };
    setStaffList([newEmp, ...staffList]);
    setShowOnboardModal(false);
    showToast(`New team member ${onboardForm.name} onboarded successfully!`);
    setOnboardForm({ name: '', role: 'Waiter', outlet: 'Poes Garden', shift: 'Morning (07:00-15:00)' });
  };

  // Filtered staff list
  const filteredStaff = staffList.filter(s => {
    const matchesOutlet = selectedOutlet === 'all' || s.outlet.toLowerCase().includes(selectedOutlet.toLowerCase());
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.outlet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOutlet && matchesSearch;
  });

  const totalGratuityPool = staffList.reduce((acc, curr) => acc + curr.gratuityShare, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] font-sans antialiased pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#2D4030] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 border border-[#C5A059]/40 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#C5A059]" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="bg-[#2D4030] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A059] flex items-center justify-center text-[#2D4030] shadow-inner font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-wide font-serif">STAFFING & ROSTER</h1>
                <span className="text-[10px] bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {user.role ? user.role.toUpperCase() : 'HR'}
                </span>
              </div>
              <p className="text-xs text-green-200/80">The Mayflower Fine Dining Guild — Human Resources Management</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Role Switcher */}
            {onSwitchRole && (
              <select
                onChange={(e) => onSwitchRole(e.target.value)}
                defaultValue="hr-roster"
                className="bg-[#1e2c21] text-xs text-[#E8E4DB] border border-green-700/50 rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-[#C5A059]"
              >
                <option value="owner-management">👑 Owner Portal</option>
                <option value="admin-suite">🛡️ Admin Suite</option>
                <option value="manager-operations">💼 Manager Ops</option>
                <option value="chef-kitchen">👨‍🍳 Chef Kitchen</option>
                <option value="hr-roster">👥 HR & Roster</option>
                <option value="accountant-ledger">📊 Accountant</option>
                <option value="customer-portal">🍷 Patron Portal</option>
              </select>
            )}

            <button 
              onClick={() => setShowOnboardModal(true)}
              className="bg-[#C5A059] hover:bg-[#b08d4b] text-[#2D4030] px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Onboard Staff</span>
            </button>

            <button 
              onClick={onLogout} 
              className="text-xs text-red-300 hover:text-red-100 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 px-3 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-6 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">Active Staff</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#2D4030]">{staffList.length} Members</div>
            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>98.2% Shift Compliance Rate</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">Daily Gratuity Pool</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#2D4030]">₹{totalGratuityPool.toLocaleString('en-IN')}</div>
            <div className="text-xs text-amber-600 font-medium mt-1 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Ready for Evening Disbursal</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">Pending Approvals</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#2D4030]">{requests.filter(r => r.status === 'Pending').length} Requests</div>
            <div className="text-xs text-purple-600 font-medium mt-1 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Shift Swaps & Overtime</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E8E4DB] shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#5A5A40] uppercase tracking-wider">Artisan Honor Roll</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#C5A059] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#2D4030]">{honorRoll.length} Awardees</div>
            <div className="text-xs text-[#C5A059] font-medium mt-1 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>July 2025 Guild Recognition</span>
            </div>
          </div>
        </div>

        {/* Tab Filter & Outlet Selector Bar */}
        <div className="bg-white rounded-2xl border border-[#E8E4DB] p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Main Module Tabs */}
          <div className="flex items-center bg-[#FAF7F2] p-1 rounded-xl border border-[#E8E4DB] w-full lg:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'roster' 
                  ? 'bg-[#2D4030] text-white shadow-sm' 
                  : 'text-[#5A5A40] hover:text-[#1A1A1A]'
              }`}
            >
              👥 Staff Roster & Shifts
            </button>

            <button
              onClick={() => setActiveTab('gratuity')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'gratuity' 
                  ? 'bg-[#2D4030] text-white shadow-sm' 
                  : 'text-[#5A5A40] hover:text-[#1A1A1A]'
              }`}
            >
              💰 Gratuity Allocation
            </button>

            <button
              onClick={() => setActiveTab('approvals')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'approvals' 
                  ? 'bg-[#2D4030] text-white shadow-sm' 
                  : 'text-[#5A5A40] hover:text-[#1A1A1A]'
              }`}
            >
              <span>📋 Shift Swaps & Leave</span>
              {requests.filter(r => r.status === 'Pending').length > 0 && (
                <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                  {requests.filter(r => r.status === 'Pending').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('honorRoll')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === 'honorRoll' 
                  ? 'bg-[#2D4030] text-white shadow-sm' 
                  : 'text-[#5A5A40] hover:text-[#1A1A1A]'
              }`}
            >
              🏆 Honor Roll & Guild Awards
            </button>
          </div>

          {/* Sanctuary Outlet Filters */}
          <div className="flex items-center space-x-2 w-full lg:w-auto overflow-x-auto">
            <span className="text-xs font-bold text-[#5A5A40] whitespace-nowrap flex items-center space-x-1">
              <Building className="w-3.5 h-3.5" />
              <span>Sanctuary:</span>
            </span>
            {[
              { id: 'all', label: 'All Outlets' },
              { id: 'poes', label: 'Poes Garden' },
              { id: 'ecr', label: 'ECR Sanctuary' },
              { id: 'anna', label: 'Anna Nagar' },
              { id: 'velachery', label: 'Velachery' },
            ].map(o => (
              <button
                key={o.id}
                onClick={() => setSelectedOutlet(o.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  selectedOutlet === o.id
                    ? 'bg-[#C5A059] text-[#2D4030] border-[#C5A059] font-bold'
                    : 'bg-white text-[#5A5A40] border-[#E8E4DB] hover:bg-[#FAF7F2]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB CONTENT: 1. Staff Roster & Shifts */}
        {activeTab === 'roster' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8E4DB]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search staff by name, role, or outlet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="text-xs text-[#5A5A40] font-medium">
                Showing <span className="font-bold text-[#1A1A1A]">{filteredStaff.length}</span> of {staffList.length} staff members
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#2D4030] text-white">
                    <tr>
                      <th className="px-4 py-3.5 font-semibold">Employee Details</th>
                      <th className="px-4 py-3.5 font-semibold">Assigned Sanctuary</th>
                      <th className="px-4 py-3.5 font-semibold">Shift Schedule</th>
                      <th className="px-4 py-3.5 font-semibold">Duty Status</th>
                      <th className="px-4 py-3.5 font-semibold">Clock-In</th>
                      <th className="px-4 py-3.5 font-semibold">Hours Today</th>
                      <th className="px-4 py-3.5 font-semibold">Performance Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E4DB]">
                    {filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-[#1A1A1A] text-sm">{staff.name}</div>
                          <div className="text-[11px] text-[#5A5A40]">{staff.role} • <span className="font-mono text-gray-400">{staff.id}</span></div>
                        </td>

                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {staff.outlet}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-medium text-[#1A1A1A]">
                          {staff.shift}
                        </td>

                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            staff.status === 'Clocked In'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : staff.status === 'On Break'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : staff.status === 'On Leave'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {staff.status === 'Clocked In' && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />}
                            {staff.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[#5A5A40]">
                          {staff.clockInTime}
                        </td>

                        <td className="px-4 py-3.5 font-bold text-[#2D4030]">
                          {staff.hoursWorked} hrs
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center space-x-1">
                            <span className="font-bold text-[#C5A059]">{staff.tipScore}</span>
                            <span className="text-gray-400 text-[10px]">/ 5.0 ★</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 2. Gratuity Allocation Engine */}
        {activeTab === 'gratuity' && (
          <div className="space-y-6">
            <div className="bg-[#2D4030] text-white p-6 rounded-2xl border border-[#C5A059]/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 px-3 py-1 rounded-full text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AUTOMATED GRATUITY ENGINE</span>
                </div>
                <h2 className="text-2xl font-serif font-bold">Daily Tip & Service Charge Disbursal</h2>
                <p className="text-xs text-green-200/80 max-w-xl">
                  Calculates equal-weight gratuity shares adjusted for hours on shift and customer feedback scores.
                </p>
              </div>

              <div className="text-right space-y-2 bg-[#1e2c21] p-4 rounded-xl border border-green-800/40 w-full md:w-auto">
                <div className="text-xs text-gray-300">Total Pooled Amount Today</div>
                <div className="text-3xl font-bold text-[#C5A059]">₹{totalGratuityPool.toLocaleString('en-IN')}</div>
                <button
                  onClick={() => setShowGratuityModal(true)}
                  className="w-full bg-[#C5A059] hover:bg-[#b08d4b] text-[#2D4030] font-bold px-4 py-2.5 rounded-xl text-xs transition shadow cursor-pointer mt-2 flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Disburse Gratuity Pool Now</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E4DB] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#E8E4DB] bg-[#FAF7F2] flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1A1A1A]">Staff Member Gratuity Breakdown</h3>
                <span className="text-xs text-[#5A5A40]">Calculated for {filteredStaff.length} active employees</span>
              </div>
              
              <div className="divide-y divide-[#E8E4DB]">
                {filteredStaff.map(staff => (
                  <div key={staff.id} className="p-4 flex items-center justify-between hover:bg-[#FAF7F2] transition">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs">
                        {staff.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1A1A1A]">{staff.name}</div>
                        <div className="text-xs text-[#5A5A40]">{staff.role} • {staff.outlet}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6 text-xs">
                      <div className="text-right">
                        <div className="text-gray-400 text-[10px]">Hours Worked</div>
                        <div className="font-semibold text-[#1A1A1A]">{staff.hoursWorked} hrs</div>
                      </div>

                      <div className="text-right">
                        <div className="text-gray-400 text-[10px]">Tip Multiplier</div>
                        <div className="font-semibold text-[#C5A059]">{staff.tipScore}★</div>
                      </div>

                      <div className="text-right pl-4 border-l border-[#E8E4DB]">
                        <div className="text-gray-400 text-[10px]">Calculated Share</div>
                        <div className="font-bold text-base text-emerald-700">₹{staff.gratuityShare.toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT: 3. Shift Swaps & Approvals */}
        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-serif text-[#2D4030]">Pending Roster Actions & Requests</h2>
              <span className="text-xs text-[#5A5A40]">
                {requests.filter(r => r.status === 'Pending').length} Action Required
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map(req => (
                <div 
                  key={req.id} 
                  className={`bg-white rounded-2xl p-5 border shadow-sm transition space-y-4 ${
                    req.status === 'Pending' ? 'border-amber-300 ring-1 ring-amber-200' : 'border-[#E8E4DB]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                        {req.id}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        req.type === 'Shift Swap' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                          : req.type === 'Leave Request' 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.type}
                      </span>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      req.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : req.status === 'Rejected'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-[#1A1A1A] text-base">{req.employee}</div>
                    <div className="text-xs text-[#5A5A40]">{req.role} • {req.outlet}</div>
                  </div>

                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8E4DB] text-xs space-y-1">
                    <div className="font-semibold text-[#2D4030]">{req.details}</div>
                    <div className="text-gray-500">Reason: {req.reason}</div>
                    <div className="text-[10px] text-gray-400 pt-1">Submitted on {req.date}</div>
                  </div>

                  {req.status === 'Pending' ? (
                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        onClick={() => handleRequestAction(req.id, 'Approved')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Request</span>
                      </button>
                      <button
                        onClick={() => handleRequestAction(req.id, 'Rejected')}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 italic text-center pt-1">
                      Action completed for {req.id}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT: 4. Honor Roll & Guild Awards */}
        {activeTab === 'honorRoll' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#2D4030]">Artisan Honor Roll & Recognition</h2>
                <p className="text-xs text-[#5A5A40]">Celebrate excellence and hospitality distinction across Mayflower sanctuaries.</p>
              </div>

              <button
                onClick={() => setShowAwardModal(true)}
                className="bg-[#2D4030] hover:bg-[#1e2c21] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow cursor-pointer"
              >
                <Award className="w-4 h-4 text-[#C5A059]" />
                <span>+ Grant Artisan Award</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {honorRoll.map(award => (
                <div key={award.id} className="bg-white rounded-2xl p-6 border border-[#C5A059]/40 shadow-sm relative overflow-hidden group hover:shadow-lg transition">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#C5A059]/10 rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-center space-x-2 text-[#C5A059] font-bold text-xs mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{award.month} Winner</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#2D4030]">{award.name}</h3>
                  <p className="text-xs text-[#5A5A40] mb-4">{award.role} • {award.outlet}</p>

                  <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E4DB] space-y-2 mb-4">
                    <div className="text-xs font-bold text-[#C5A059] uppercase tracking-wider">{award.title}</div>
                    <div className="text-xs text-[#2D4030] font-semibold">{award.reward}</div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-[#E8E4DB]">
                    <span className="flex items-center space-x-1">
                      <HeartHandshake className="w-4 h-4 text-rose-500" />
                      <span>{award.praiseCount} Patron Compliments</span>
                    </span>
                    <span className="font-mono text-gray-400">{award.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Gratuity Disbursal Confirmation */}
      {showGratuityModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-[#E8E4DB]">
            <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-3">
              <div className="flex items-center space-x-2 text-[#2D4030]">
                <DollarSign className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-serif font-bold text-lg">Confirm Gratuity Disbursal</h3>
              </div>
              <button onClick={() => setShowGratuityModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E4DB] space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#5A5A40]">Total Gratuity Pool:</span>
                <span className="font-bold text-[#2D4030] text-sm">₹{totalGratuityPool.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A5A40]">Recipient Count:</span>
                <span className="font-bold text-[#1A1A1A]">{staffList.length} Active Staff</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5A5A40]">Transfer Method:</span>
                <span className="font-bold text-emerald-700">Instant Guild Payroll Credit</span>
              </div>
            </div>

            <p className="text-xs text-[#5A5A40] leading-relaxed">
              Disbursing will immediately transfer allocated gratuity funds to staff digital wallets and output audit receipts to the accountant ledger.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleDisburseGratuity}
                className="flex-1 bg-[#2D4030] hover:bg-[#1e2c21] text-white font-bold py-3 rounded-xl text-xs transition shadow cursor-pointer"
              >
                Confirm & Disburse Funds
              </button>
              <button
                onClick={() => setShowGratuityModal(false)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Award Recognition Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddAward} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8E4DB]">
            <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-3">
              <div className="flex items-center space-x-2 text-[#2D4030]">
                <Award className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-serif font-bold text-lg">Grant Artisan Recognition</h3>
              </div>
              <button type="button" onClick={() => setShowAwardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Staff Member Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chef Ramesh V."
                  value={awardForm.name}
                  onChange={(e) => setAwardForm({ ...awardForm, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Role / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Sous Chef"
                  value={awardForm.role}
                  onChange={(e) => setAwardForm({ ...awardForm, role: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Sanctuary Outlet</label>
                <select
                  value={awardForm.outlet}
                  onChange={(e) => setAwardForm({ ...awardForm, outlet: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Poes Garden">Poes Garden</option>
                  <option value="ECR Sanctuary">ECR Sanctuary</option>
                  <option value="Anna Nagar">Anna Nagar</option>
                  <option value="Velachery">Velachery</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Award Title</label>
                <input
                  type="text"
                  required
                  value={awardForm.title}
                  onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Bonus Reward & Honor</label>
                <input
                  type="text"
                  required
                  value={awardForm.reward}
                  onChange={(e) => setAwardForm({ ...awardForm, reward: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#2D4030] hover:bg-[#1e2c21] text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer"
              >
                Grant Award & Announce
              </button>
              <button
                type="button"
                onClick={() => setShowAwardModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Onboard Staff Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleOnboardStaff} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8E4DB]">
            <div className="flex items-center justify-between border-b border-[#E8E4DB] pb-3">
              <div className="flex items-center space-x-2 text-[#2D4030]">
                <UserPlus className="w-5 h-5 text-[#C5A059]" />
                <h3 className="font-serif font-bold text-lg">Onboard New Team Member</h3>
              </div>
              <button type="button" onClick={() => setShowOnboardModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Role / Position</label>
                <select
                  value={onboardForm.role}
                  onChange={(e) => setOnboardForm({ ...onboardForm, role: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Executive Chef">Executive Chef</option>
                  <option value="Sous Chef">Sous Chef</option>
                  <option value="Line Cook">Line Cook</option>
                  <option value="Head Sommelier">Head Sommelier</option>
                  <option value="Maître d’">Maître d’</option>
                  <option value="Floor Captain">Floor Captain</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Guest Relations">Guest Relations</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Sanctuary Outlet</label>
                <select
                  value={onboardForm.outlet}
                  onChange={(e) => setOnboardForm({ ...onboardForm, outlet: e.target.value })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Poes Garden">Poes Garden</option>
                  <option value="ECR Sanctuary">ECR Sanctuary</option>
                  <option value="Anna Nagar">Anna Nagar</option>
                  <option value="Velachery">Velachery</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#5A5A40] mb-1">Assigned Shift</label>
                <select
                  value={onboardForm.shift}
                  onChange={(e) => setOnboardForm({ ...onboardForm, shift: e.target.value as any })}
                  className="w-full bg-[#FAF7F2] border border-[#E8E4DB] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="Morning (07:00-15:00)">Morning (07:00-15:00)</option>
                  <option value="Evening (15:00-23:00)">Evening (15:00-23:00)</option>
                  <option value="Night (22:00-06:00)">Night (22:00-06:00)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#2D4030] hover:bg-[#1e2c21] text-white font-bold py-2.5 rounded-xl text-xs transition shadow cursor-pointer"
              >
                Complete Onboarding
              </button>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
