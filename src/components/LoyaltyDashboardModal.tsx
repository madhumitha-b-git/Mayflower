import React, { useState } from 'react';
import { X, Star, Award, TrendingUp, Gift, LogOut, Calendar, Clock, CheckCircle2, ChevronRight, MapPin, Coffee, Edit3, Mail, FileText, ChevronDown, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../types';
import { WelcomeEmailData, generateWelcomeEmailData } from '../data/userStorage';

interface LoyaltyDashboardModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  welcomeEmail?: WelcomeEmailData | null;
  onClose: () => void;
  onLogout: () => void;
  onNavigateToGiftCards: () => void;
}

export const LoyaltyDashboardModal: React.FC<LoyaltyDashboardModalProps> = ({
  isOpen,
  user,
  welcomeEmail,
  onClose,
  onLogout,
  onNavigateToGiftCards
}) => {
  const [expandedSection, setExpandedSection] = useState<'rewards' | 'reservations' | 'vouchers' | 'email' | 'none'>('rewards');

  if (!isOpen || !user) return null;

  const points = user.rewardPoints;
  let nextTier = 'Gold';
  let targetPoints = 800;
  let progressPct = Math.min(100, Math.round((points / 800) * 100));

  if (points >= 800 && points < 2000) {
    nextTier = 'Sanctuary VIP';
    targetPoints = 2000;
    progressPct = Math.min(100, Math.round(((points - 800) / (2000 - 800)) * 100));
  } else if (points >= 2000) {
    nextTier = 'Sanctuary VIP Max';
    targetPoints = 2000;
    progressPct = 100;
  }

  const reservations = user.reservations || [];

  // Generate fallback welcome email view if none passed
  const activeEmailData = welcomeEmail || generateWelcomeEmailData(user.email, user.name, user.id);

  const toggleSection = (section: 'rewards' | 'reservations' | 'vouchers' | 'email') => {
    setExpandedSection((prev) => (prev === section ? 'none' : section));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FAF7F2] w-full h-full overflow-y-auto flex flex-col animate-fadeIn">
      
      {/* Full-Screen Sticky Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E4DB] px-4 sm:px-8 py-4 flex items-center justify-between shadow-2xs">
        <button
          onClick={onClose}
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-[#1A1A1A] hover:text-[#2D4030] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#2D4030]" />
          <span>Back to Mayflower Restaurant</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-[#2D4030] text-white flex items-center justify-center font-serif font-bold text-sm">
            M
          </div>
          <span className="font-cinzel text-sm font-bold tracking-widest text-[#1A1A1A] uppercase hidden sm:inline-block">
            MAYFLOWER REWARDS
          </span>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-full bg-white border border-[#E8E4DB] hover:border-[#2D4030] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs flex items-center space-x-1.5"
        >
          <span>Close</span>
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Full-Width Starbucks Dark Green Header Banner (#1E3932) */}
      <section className="bg-[#1E3932] text-white py-14 px-4 sm:px-8 text-center relative w-full shrink-0 overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
        
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-4 relative z-10">
          {/* Circular Starbucks Cup/Avatar Badge with Edit Icon */}
          <div className="relative">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white border-4 border-[#00754A] shadow-2xl p-1.5 flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full bg-[#162F29] border border-white/20 flex flex-col items-center justify-center text-white">
                <Coffee className="w-10 h-10 sm:w-12 sm:h-12 text-[#00754A] fill-[#00754A]/20" />
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#E8E4DB] uppercase mt-1">MAYFLOWER</span>
              </div>
            </div>
            <button
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#00754A] hover:bg-[#005c3a] text-white flex items-center justify-center border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-110"
              title="Edit Account Profile"
            >
              <Edit3 className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* User Name & Tier Badge matching reference screenshot */}
          <div className="space-y-1">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-wide">
              {user.name}
            </h1>
            <p className="text-base sm:text-lg font-semibold text-[#D1CDBC]">
              {user.tier} Member
            </p>
          </div>
        </div>
      </section>

      {/* Full-Width Centered Main Content Area */}
      <main className="max-w-4xl mx-auto w-full py-10 px-4 sm:px-6 space-y-6 flex-1">
        
        {/* Section 1: MAYFLOWER REWARDS */}
        <div className="bg-white rounded-3xl border border-[#E8E4DB] shadow-sm p-6 sm:p-8 space-y-4">
          <button
            onClick={() => toggleSection('rewards')}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-[#1E3932]/10 text-[#1E3932] flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-[#00754A] text-[#00754A]" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#1E3932] tracking-wider uppercase">
                  MAYFLOWER REWARDS ({user.rewardPoints} PTS)
                </h3>
                <p className="text-xs text-[#5A5A40]">Earn &amp; redeem points for dining &amp; gift passes</p>
              </div>
            </div>
            {expandedSection === 'rewards' ? (
              <ChevronDown className="w-6 h-6 text-[#1E3932]" />
            ) : (
              <ChevronRight className="w-6 h-6 text-[#1E3932] group-hover:translate-x-1 transition-transform" />
            )}
          </button>

          {expandedSection === 'rewards' && (
            <div className="mt-4 pt-4 border-t border-[#E8E4DB] space-y-5 animate-fadeIn">
              <div className="bg-[#FAF7F2] p-6 rounded-2xl border border-[#E8E4DB] space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-[#1A1A1A] uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#D97706]" />
                    <span>Tier Progress ({user.tier})</span>
                  </span>
                  <span className="text-[#5A5A40] font-semibold">
                    {points >= 2000 ? 'Top VIP Unlocked' : `${points} / ${targetPoints} PTS to ${nextTier}`}
                  </span>
                </div>

                <div className="w-full h-4 rounded-full bg-white border border-[#E8E4DB] overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-[#1E3932] transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Redeem Gift Cards Callout */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-[#5A5A40]">Redeem reward points for Mayflower Moment Cards!</p>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToGiftCards();
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#E25C38] hover:bg-[#C94A28] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md shrink-0 transition-all hover:scale-105"
                  >
                    Redeem Points
                  </button>
                </div>
              </div>

              {/* Points Activity Stream */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs uppercase tracking-wider font-bold text-[#5A5A40]">Points Activity History:</h4>
                <div className="space-y-2.5">
                  {user.transactions.map((tx) => (
                    <div key={tx.id} className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E4DB] flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-sm text-[#1A1A1A] block">{tx.description}</span>
                        <span className="text-xs text-[#7A7A7A]">{tx.date}</span>
                      </div>
                      <span className={`font-mono font-bold text-sm px-3 py-1 rounded-lg ${
                        tx.points > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points} PTS
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: ORDERS & SEAT RESERVATIONS */}
        <div className="bg-white rounded-3xl border border-[#E8E4DB] shadow-sm p-6 sm:p-8 space-y-4">
          <button
            onClick={() => toggleSection('reservations')}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-[#1E3932]/10 text-[#1E3932] flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#1E3932]" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#1E3932] tracking-wider uppercase">
                  ORDERS &amp; SEAT RESERVATIONS ({reservations.length})
                </h3>
                <p className="text-xs text-[#5A5A40]">View your table bookings across all 4 Chennai sanctuaries</p>
              </div>
            </div>
            {expandedSection === 'reservations' ? (
              <ChevronDown className="w-6 h-6 text-[#1E3932]" />
            ) : (
              <ChevronRight className="w-6 h-6 text-[#1E3932] group-hover:translate-x-1 transition-transform" />
            )}
          </button>

          {expandedSection === 'reservations' && (
            <div className="mt-4 pt-4 border-t border-[#E8E4DB] space-y-4 animate-fadeIn">
              {reservations.length === 0 ? (
                <div className="text-center py-8 bg-[#FAF7F2] rounded-2xl border border-[#E8E4DB] space-y-2 text-xs text-[#5A5A40]">
                  <p className="font-semibold text-sm text-[#1A1A1A]">No seat reservations recorded yet.</p>
                  <p>Reserve a table to earn +150 bonus reward points!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reservations.map((res) => (
                    <div key={res.id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E4DB] space-y-3 text-xs">
                      <div className="flex justify-between items-center border-b border-[#E8E4DB] pb-2.5">
                        <span className="font-bold text-sm text-[#1A1A1A]">{res.outlet} Sanctuary</span>
                        <span className="font-mono font-bold text-sm text-[#2D4030] bg-white px-3 py-1 rounded-lg border border-[#E8E4DB] shadow-2xs">
                          {res.bookingCode}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div><strong className="text-[#5A5A40] block">Date &amp; Time:</strong> {res.date} &bull; {res.timeSlot}</div>
                        <div><strong className="text-[#5A5A40] block">Guests &amp; Zone:</strong> {res.guests} Guests ({res.seatingArea})</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: MY GIFT CARDS & VOUCHERS */}
        <div className="bg-white rounded-3xl border border-[#E8E4DB] shadow-sm p-6 sm:p-8 space-y-4">
          <button
            onClick={() => toggleSection('vouchers')}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-[#1E3932]/10 text-[#1E3932] flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-[#1E3932]" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#1E3932] tracking-wider uppercase">
                  MY GIFT CARDS &amp; VOUCHERS
                </h3>
                <p className="text-xs text-[#5A5A40]">Redeemed vouchers and active Mayflower passes</p>
              </div>
            </div>
            {expandedSection === 'vouchers' ? (
              <ChevronDown className="w-6 h-6 text-[#1E3932]" />
            ) : (
              <ChevronRight className="w-6 h-6 text-[#1E3932] group-hover:translate-x-1 transition-transform" />
            )}
          </button>

          {expandedSection === 'vouchers' && (
            <div className="mt-4 pt-4 border-t border-[#E8E4DB] text-center space-y-4 animate-fadeIn text-xs bg-[#FAF7F2] p-6 rounded-2xl border">
              <p className="text-sm text-[#5A5A40]">Redeem Mayflower Moment Cards to view active digital passes here.</p>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToGiftCards();
                }}
                className="px-6 py-3 rounded-xl bg-[#2D4030] text-white text-xs uppercase font-bold cursor-pointer transition-all hover:scale-105"
              >
                Explore Moment Cards
              </button>
            </div>
          )}
        </div>

        {/* Section 4: AUTOMATIC REGISTRATION WELCOME EMAIL */}
        <div className="bg-white rounded-3xl border border-[#E8E4DB] shadow-sm p-6 sm:p-8 space-y-4">
          <button
            onClick={() => toggleSection('email')}
            className="w-full flex items-center justify-between text-left group cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-emerald-800" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg text-[#1E3932] tracking-wider uppercase">
                  REGISTRATION WELCOME EMAIL (DELIVERED)
                </h3>
                <p className="text-xs text-[#5A5A40]">Official registration confirmation email receipt</p>
              </div>
            </div>
            {expandedSection === 'email' ? (
              <ChevronDown className="w-6 h-6 text-[#1E3932]" />
            ) : (
              <ChevronRight className="w-6 h-6 text-[#1E3932] group-hover:translate-x-1 transition-transform" />
            )}
          </button>

          {expandedSection === 'email' && (
            <div className="mt-4 pt-4 border-t border-[#E8E4DB] space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8E4DB] flex items-center justify-between text-xs text-[#5A5A40]">
                <span>To: <strong>{activeEmailData.toEmail}</strong></span>
                <span>Sent: {activeEmailData.sentAt}</span>
              </div>
              
              <div
                className="bg-white p-6 rounded-2xl border border-[#E8E4DB] shadow-2xs"
                dangerouslySetInnerHTML={{ __html: activeEmailData.bodyHtml }}
              />
            </div>
          )}
        </div>

        {/* Account Profile Footer & Logout */}
        <div className="pt-6 border-t border-[#E8E4DB] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-[#5A5A40]">
            Logged in as: <strong className="text-[#1E3932]">{user.email}</strong>
          </span>

          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Account</span>
          </button>
        </div>

      </main>
    </div>
  );
};
