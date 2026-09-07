import React, { useState } from 'react';
import { User, Calendar, Star, MessageSquare, LogOut, Bell, Gift, ArrowRight } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props { user: UserProfile; onLogout: () => void; onOpenReservations?: () => void; }

export const CustomerDashboard: React.FC<Props> = ({ user, onLogout, onOpenReservations }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'reservations' | 'loyalty' | 'feedback'>('profile');

  const tierColor = { Green: 'text-green-600 bg-green-50', Gold: 'text-amber-600 bg-amber-50', 'Sanctuary VIP': 'text-purple-600 bg-purple-50' }[user.tier] || '';

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="bg-[#2D4030] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold">{user.name}</div>
            <div className="text-xs text-green-300">Mayflower Member · {user.tier}</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Bell className="w-5 h-5 text-gray-300" />
          <button onClick={onLogout} className="flex items-center space-x-1 text-xs text-red-300 hover:text-red-200 cursor-pointer">
            <LogOut className="w-4 h-4" /><span>Logout</span>
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-[#E8E4DB] px-6 flex space-x-1 overflow-x-auto">
        {[{ id: 'profile', label: 'Profile', icon: User }, { id: 'reservations', label: 'Reservations', icon: Calendar }, { id: 'loyalty', label: 'Loyalty', icon: Star }, { id: 'feedback', label: 'Feedback', icon: MessageSquare }].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-1.5 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${activeTab === id ? 'border-[#2D4030] text-[#2D4030]' : 'border-transparent text-[#5A5A40] hover:text-[#1A1A1A]'}`}>
            <Icon className="w-3.5 h-3.5" /><span>{label}</span>
          </button>
        ))}
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {activeTab === 'profile' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">My Profile</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-2xl bg-[#2D4030] flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xl font-bold text-[#1A1A1A]">{user.name}</div>
                  <div className="text-sm text-[#5A5A40]">{user.email}</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${tierColor}`}>{user.tier} Member</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { label: 'Member ID', value: user.id },
                  { label: 'Joined', value: user.joinedDate },
                  { label: 'Total Visits', value: user.totalVisits },
                  { label: 'Reward Points', value: `${user.rewardPoints} PTS` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#FAF7F2] rounded-xl p-3">
                    <div className="text-xs text-[#5A5A40]">{label}</div>
                    <div className="font-bold text-sm text-[#1A1A1A] truncate">{value}</div>
                  </div>
                ))}
              </div>
            </div>
            {onOpenReservations && (
              <button onClick={onOpenReservations} className="w-full py-3.5 rounded-xl bg-[#2D4030] hover:bg-[#1F3022] text-white text-xs uppercase tracking-widest font-bold flex items-center justify-center space-x-2 cursor-pointer">
                <span>Make a Reservation</span><ArrowRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}

        {activeTab === 'reservations' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">My Reservations</h2>
            {(user.reservations || []).length > 0 ? (
              <div className="space-y-3">
                {(user.reservations || []).map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border border-[#E8E4DB] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#1A1A1A]">{r.outlet}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === 'Confirmed' ? 'text-blue-600 bg-blue-50' : 'text-green-600 bg-green-50'}`}>{r.status}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#5A5A40]">
                      <div>Date: <span className="font-medium text-[#1A1A1A]">{r.date}</span></div>
                      <div>Time: <span className="font-medium text-[#1A1A1A]">{r.timeSlot}</span></div>
                      <div>Guests: <span className="font-medium text-[#1A1A1A]">{r.guests}</span></div>
                      <div>Code: <span className="font-mono font-bold text-[#2D4030]">{r.bookingCode}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#E8E4DB] p-10 text-center">
                <Calendar className="w-10 h-10 text-[#E8E4DB] mx-auto mb-3" />
                <p className="text-sm text-[#5A5A40]">No reservations yet.</p>
                {onOpenReservations && (
                  <button onClick={onOpenReservations} className="mt-4 px-6 py-2.5 rounded-xl bg-[#2D4030] text-white text-xs font-bold cursor-pointer">Book a Table</button>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'loyalty' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Loyalty & Rewards</h2>
            <div className="bg-[#2D4030] rounded-2xl p-6 text-white">
              <div className="text-xs uppercase tracking-widest text-green-300 mb-1">Current Balance</div>
              <div className="text-4xl font-bold">{user.rewardPoints} <span className="text-lg font-normal text-green-300">PTS</span></div>
              <div className="mt-2"><span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/20`}>{user.tier}</span></div>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5">
              <h3 className="font-bold text-[#1A1A1A] mb-3">Points History</h3>
              <div className="space-y-2">
                {user.transactions.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2]">
                    <div>
                      <div className="text-xs font-medium text-[#1A1A1A]">{t.description}</div>
                      <div className="text-xs text-[#5A5A40]">{t.date}</div>
                    </div>
                    <span className={`text-sm font-bold ${t.points > 0 ? 'text-green-600' : 'text-red-500'}`}>{t.points > 0 ? '+' : ''}{t.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'feedback' && (
          <>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Share Feedback</h2>
            <div className="bg-white rounded-2xl border border-[#E8E4DB] p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A40] mb-1.5">Your Experience</label>
                <textarea rows={4} placeholder="Tell us about your visit..." className="w-full p-3 rounded-xl border border-[#E8E4DB] text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#2D4030] resize-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5A5A40] mb-1.5">Rating</label>
                <div className="flex space-x-2">
                  {[1,2,3,4,5].map(n => <button key={n} className="text-2xl cursor-pointer hover:scale-110 transition-transform">⭐</button>)}
                </div>
              </div>
              <button className="w-full py-3 rounded-xl bg-[#2D4030] text-white text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-[#1F3022]">Submit Feedback</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
