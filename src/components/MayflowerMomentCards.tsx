import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, Check, Copy, Share2, MapPin, X, User, Mail, Phone, MessageSquare, CheckCircle2, Star } from 'lucide-react';
import { UserProfile } from '../types';
import { deductPointsFromUser } from '../data/userStorage';

interface MomentCardTier {
  id: string;
  title: string;
  badge: string;
  targetGroup: string;
  price: number;
  formattedPrice: string;
  colorClass: string;
  bgGradient: string;
  accentClass: string;
  description: string;
  popular?: boolean;
}

interface IssuedCard {
  id: string;
  voucherCode: string;
  cardTitle: string;
  amount: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  personalMessage?: string;
  issuedAt: string;
  outlet: string;
  isRedeemedWithPoints?: boolean;
}

interface MayflowerMomentCardsProps {
  currentUser?: UserProfile | null;
  onOpenAuth?: () => void;
  onUpdateUser?: (user: UserProfile) => void;
}

const MOMENT_CARDS: MomentCardTier[] = [
  {
    id: 'mc-2',
    title: 'Treat for 2',
    badge: 'Cozy Dining',
    targetGroup: 'Treat for 2',
    price: 2000,
    formattedPrice: '₹2,000',
    colorClass: 'from-sky-700 to-blue-900',
    bgGradient: 'bg-gradient-to-br from-[#1E5F8A] to-[#0E3553]',
    accentClass: 'text-sky-300',
    description: 'Perfect for a romantic date night or catching up with your best friend over fresh wood-fired pizzas and artisanal beverages.',
  },
  {
    id: 'mc-4',
    title: 'Treat for 4',
    badge: 'Family & Friends',
    targetGroup: 'Treat for 4',
    price: 3950,
    formattedPrice: '₹3,950',
    colorClass: 'from-emerald-700 to-teal-900',
    bgGradient: 'bg-gradient-to-br from-[#1B684B] to-[#0D3F2C]',
    accentClass: 'text-emerald-300',
    description: 'Ideal for small family gatherings or weekend brunches. Includes signature starters, pasta, pizzas, and desserts.',
    popular: true,
  },
  {
    id: 'mc-8',
    title: 'Treat for 8',
    badge: 'Group Celebration',
    targetGroup: 'Treat for 8',
    price: 7750,
    formattedPrice: '₹7,750',
    colorClass: 'from-rose-700 to-red-950',
    bgGradient: 'bg-gradient-to-br from-[#983443] to-[#591621]',
    accentClass: 'text-rose-300',
    description: 'Generous group dining pass for birthday parties, team dinners, or anniversary celebrations with sharing platters.',
  },
  {
    id: 'mc-12',
    title: 'Treat for 12',
    badge: 'Grand Feast',
    targetGroup: 'Treat for 12',
    price: 11500,
    formattedPrice: '₹11,500',
    colorClass: 'from-purple-800 to-indigo-950',
    bgGradient: 'bg-gradient-to-br from-[#5E2B82] to-[#2E1045]',
    accentClass: 'text-purple-300',
    description: 'The ultimate Mayflower feast voucher for large milestone celebrations across our glasshouse courtyards.',
  },
  {
    id: 'mc-coffee',
    title: 'Coffee & Dessert Date',
    badge: 'Sweet Treats',
    targetGroup: 'Treat for 2',
    price: 1250,
    formattedPrice: '₹1,250',
    colorClass: 'from-amber-700 to-yellow-950',
    bgGradient: 'bg-gradient-to-br from-[#8C5819] to-[#4D2E07]',
    accentClass: 'text-amber-300',
    description: 'Specialty pour-overs, monster shakes, and our famous Lotus Biscoff cheesecake or warm chocolate brownie.',
  },
  {
    id: 'mc-chef',
    title: "Chef's Tasting Sanctuary",
    badge: 'Exclusive Dining',
    targetGroup: 'Gourmet Pass',
    price: 5000,
    formattedPrice: '₹5,000',
    colorClass: 'from-teal-700 to-cyan-950',
    bgGradient: 'bg-gradient-to-br from-[#1D6C68] to-[#0C3D3A]',
    accentClass: 'text-teal-300',
    description: 'A curated multicourse tasting journey designed by our executive chef featuring seasonal botanical delicacies.',
  },
];

export const MayflowerMomentCards: React.FC<MayflowerMomentCardsProps> = ({
  currentUser,
  onOpenAuth,
  onUpdateUser
}) => {
  const [selectedOutlet, setSelectedOutlet] = useState<string>('All Chennai Outlets');
  const [activeCard, setActiveCard] = useState<MomentCardTier | null>(null);

  // Purchaser Details
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [personalMessage, setPersonalMessage] = useState('Wishing you cherished moments and delicious food at The Mayflower!');

  // Issued State
  const [issuedCard, setIssuedCard] = useState<IssuedCard | null>(null);
  const [copied, setCopied] = useState(false);
  const [pointsError, setPointsError] = useState<string | null>(null);

  // Auto fill purchaser details if user logged in
  useEffect(() => {
    if (currentUser) {
      setBuyerName(currentUser.name);
      setBuyerEmail(currentUser.email);
      setBuyerPhone(currentUser.phone);
    }
  }, [currentUser]);

  const handleOpenGifting = (card: MomentCardTier) => {
    setActiveCard(card);
    setIssuedCard(null);
    setCopied(false);
    setPointsError(null);
  };

  const handleGenerateVoucher = (e: React.FormEvent, redeemWithPoints = false) => {
    if (e) e.preventDefault();
    if (!activeCard) return;
    setPointsError(null);

    // Points redemption check
    if (redeemWithPoints) {
      if (!currentUser) {
        if (onOpenAuth) onOpenAuth();
        return;
      }

      const pointsNeeded = activeCard.price;
      const res = deductPointsFromUser(
        currentUser.id,
        pointsNeeded,
        `Redeemed Gift Card: ${activeCard.title}`
      );

      if (!res.success) {
        setPointsError(res.message || 'Insufficient reward points balance.');
        return;
      }

      if (res.user && onUpdateUser) {
        onUpdateUser(res.user);
      }
    }

    const voucherCode = `MF-MOMENT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCard: IssuedCard = {
      id: String(Date.now()),
      voucherCode,
      cardTitle: activeCard.title,
      amount: activeCard.formattedPrice,
      buyerName: buyerName || (currentUser ? currentUser.name : 'Valued Guest'),
      buyerEmail: buyerEmail || (currentUser ? currentUser.email : ''),
      buyerPhone: buyerPhone || (currentUser ? currentUser.phone : ''),
      personalMessage,
      issuedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      outlet: selectedOutlet,
      isRedeemedWithPoints: redeemWithPoints,
    };

    setIssuedCard(newCard);

    try {
      const existing = JSON.parse(localStorage.getItem('mayflower_moment_cards') || '[]');
      localStorage.setItem('mayflower_moment_cards', JSON.stringify([newCard, ...existing]));
    } catch {
      // Ignore if localStorage blocked
    }
  };

  const handleCopyCode = () => {
    if (issuedCard) {
      navigator.clipboard.writeText(issuedCard.voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    if (!issuedCard) return;
    const text = `🌸 *The Mayflower Gift Card Voucher*\n` +
      `Purchased By: ${issuedCard.buyerName}\n` +
      `Experience: ${issuedCard.cardTitle} (${issuedCard.amount})\n` +
      `Voucher Code: *${issuedCard.voucherCode}*\n` +
      `Note: "${issuedCard.personalMessage}"\n` +
      `Redeemable across all Mayflower Chennai outlets for 365 days!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <section id="moment-cards" className="py-20 bg-[#F4F0E8] text-[#1A1A1A] relative border-b border-[#E8E4DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-[#E8E4DB] gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E8E4DB] text-[#5A5A40] text-[11px] font-bold uppercase tracking-widest">
              <Gift className="w-3.5 h-3.5 text-[#56B3A8]" />
              <span>Gifting Experiences &amp; Rewards</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-[#1A1A1A]">
              Mayflower Moment Cards
            </h2>
            <p className="font-serif italic text-lg sm:text-xl text-[#56B3A8]">
              Share the pleasure or redeem using your reward points.
            </p>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">
              Purchase or redeem Mayflower Moment Cards using your Sanctuary Reward Points! Redeemable across all Mayflower outlets in Chennai.
            </p>
          </div>

          {/* Location Filter */}
          <div className="flex items-center space-x-2 bg-white px-4 py-2.5 rounded-xl border border-[#E8E4DB] shadow-xs shrink-0">
            <MapPin className="w-4 h-4 text-[#56B3A8]" />
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="bg-transparent text-xs font-semibold text-[#1A1A1A] focus:outline-none cursor-pointer pr-2"
              aria-label="Select Mayflower Outlet"
            >
              <option value="All Chennai Outlets">All Chennai Outlets</option>
              <option value="Poes Garden">Poes Garden Outlet</option>
              <option value="Anna Nagar">Anna Nagar Outlet</option>
              <option value="T. Nagar">T. Nagar Outlet</option>
              <option value="ECR Palavakkam">ECR Beachway Outlet</option>
            </select>
          </div>
        </div>

        {/* Moment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOMENT_CARDS.map((card) => (
            <div
              key={card.id}
              className="group relative rounded-2xl overflow-hidden bg-white border border-[#E8E4DB] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {card.popular && (
                <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-[#56B3A8] text-white text-[10px] uppercase font-bold tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              {/* Card Graphic Header */}
              <div className={`relative h-44 ${card.bgGradient} p-6 text-white flex flex-col justify-between overflow-hidden`}>
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">
                    {card.badge}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[10px] font-semibold text-white">
                    {card.targetGroup}
                  </span>
                </div>

                <div className="relative z-10 space-y-0.5">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-white/80" />
                    <span className="text-xs uppercase tracking-wider font-semibold text-white/90">
                      Mayflower Gift Card
                    </span>
                  </div>
                  <h3 className="font-serif text-2xl font-normal tracking-wide text-white">
                    {card.title}
                  </h3>
                </div>
              </div>

              {/* Card Details & Add Button */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-[#5A5A40] leading-relaxed">
                  {card.description}
                </p>

                <div className="pt-3 border-t border-[#E8E4DB] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#7A7A7A] block font-semibold">
                      Card Value / Points
                    </span>
                    <span className="font-serif text-xl font-bold text-[#1A1A1A] block">
                      {card.formattedPrice}
                    </span>
                    <span className="text-[10px] font-bold text-[#2D4030] flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                      <span>{card.price.toLocaleString()} PTS</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenGifting(card)}
                    id={`btn-add-moment-card-${card.id}`}
                    className="px-6 py-2.5 rounded-xl bg-[#E25C38] hover:bg-[#C94A28] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>Get Card</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Highlights Bar */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E4DB] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-base text-[#1A1A1A]">Instant Digital Voucher</h4>
            <p className="text-xs text-[#5A5A40]">Receive digital voucher code immediately on screen and email.</p>
          </div>
          <div className="space-y-1 border-t sm:border-t-0 sm:border-x border-[#E8E4DB] pt-4 sm:pt-0 sm:px-4">
            <h4 className="font-serif font-bold text-base text-[#1A1A1A]">1 Year Validity</h4>
            <p className="text-xs text-[#5A5A40]">Redeemable across all 4 Chennai outlets with zero blackout dates.</p>
          </div>
          <div className="space-y-1 pt-4 sm:pt-0">
            <h4 className="font-serif font-bold text-base text-[#1A1A1A]">Redeem with Points</h4>
            <p className="text-xs text-[#5A5A40]">Use your Sanctuary Reward Points to get Gift Cards 100% free!</p>
          </div>
        </div>
      </div>

      {/* Gift Card Modal */}
      {activeCard && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveCard(null)}
        >
          <div
            className="relative max-w-lg w-full bg-[#FAF7F2] rounded-2xl overflow-hidden shadow-2xl border border-[#E8E4DB] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveCard(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-[#1A1A1A] flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header banner */}
            <div className={`p-6 ${activeCard.bgGradient} text-white space-y-1`}>
              <span className="text-[10px] uppercase tracking-widest font-bold text-white/80">
                The Mayflower Gift Card
              </span>
              <h3 className="font-serif text-2xl font-normal text-white">
                {activeCard.title} &bull; {activeCard.formattedPrice}
              </h3>
              <p className="text-xs text-white/90">
                Share the pleasure or redeem using your reward points.
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {pointsError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {pointsError}
                </div>
              )}

              {!issuedCard ? (
                <form onSubmit={(e) => handleGenerateVoucher(e, false)} className="space-y-5">
                  {/* Purchaser Details Section */}
                  <div className="bg-white p-5 rounded-xl border border-[#E8E4DB] space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between pb-2.5 border-b border-[#E8E4DB]">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-[#E25C38]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                          Your Details
                        </h4>
                      </div>

                      {currentUser && (
                        <span className="text-[11px] font-bold text-[#2D4030] bg-[#FAF7F2] px-2.5 py-1 rounded-md border border-[#E8E4DB] flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                          <span>{currentUser.rewardPoints} PTS Balance</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="text"
                          required
                          placeholder="e.g., Ananth Narayanan"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          className="w-full pl-9.5 pr-4 py-2.5 rounded-lg border border-[#E8E4DB] bg-[#FAF7F2]/50 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E25C38] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="email"
                            required
                            placeholder="e.g., ananth@gmail.com"
                            value={buyerEmail}
                            onChange={(e) => setBuyerEmail(e.target.value)}
                            className="w-full pl-9.5 pr-4 py-2.5 rounded-lg border border-[#E8E4DB] bg-[#FAF7F2]/50 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E25C38] focus:bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] mb-1">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            placeholder="e.g., +91 98400 12345"
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            className="w-full pl-9.5 pr-4 py-2.5 rounded-lg border border-[#E8E4DB] bg-[#FAF7F2]/50 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E25C38] focus:bg-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] mb-1">
                        Optional Note / Greeting
                      </label>
                      <div className="relative">
                        <MessageSquare className="w-4 h-4 text-[#7A7A7A] absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="text"
                          value={personalMessage}
                          onChange={(e) => setPersonalMessage(e.target.value)}
                          placeholder="e.g., Happy Birthday!"
                          className="w-full pl-9.5 pr-4 py-2.5 rounded-lg border border-[#E8E4DB] bg-[#FAF7F2]/50 text-sm text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#E25C38] focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions: Standard Purchase vs Points Redemption */}
                  <div className="space-y-2 pt-2">
                    {/* Points Redemption Option */}
                    {currentUser ? (
                      <button
                        type="button"
                        onClick={(e) => handleGenerateVoucher(e as any, true)}
                        className="w-full py-3.5 rounded-xl bg-[#2D4030] hover:bg-[#1F3022] text-white text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                        <span>Redeem with {activeCard.price.toLocaleString()} Reward Points</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveCard(null);
                          if (onOpenAuth) onOpenAuth();
                        }}
                        className="w-full py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold uppercase tracking-wider hover:bg-amber-100 transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <Star className="w-4 h-4 text-amber-700" />
                        <span>Login to Redeem with Reward Points</span>
                      </button>
                    )}

                    <button
                      type="submit"
                      id="btn-confirm-moment-card"
                      className="w-full py-3 rounded-xl bg-[#E25C38] hover:bg-[#C94A28] text-white text-xs uppercase tracking-widest font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Standard Purchase ({activeCard.formattedPrice})</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Generated Digital Gift Voucher */
                <div className="space-y-6 text-center animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                      Gift Card Issued!
                    </h4>
                    <p className="text-xs text-[#5A5A40]">
                      Voucher code generated for <span className="font-semibold text-[#1A1A1A]">{issuedCard.buyerName}</span>
                    </p>
                  </div>

                  {/* Digital Voucher Card Preview */}
                  <div className="rounded-xl border border-[#D5D0C5] bg-white p-5 text-left space-y-4 shadow-sm">
                    <div className="flex justify-between items-start border-b border-[#E8E4DB] pb-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#E25C38] block">
                          The Mayflower Gift Card
                        </span>
                        <h5 className="font-serif font-bold text-base text-[#1A1A1A]">
                          {issuedCard.cardTitle}
                        </h5>
                      </div>
                      <span className="font-serif font-bold text-lg text-[#1A1A1A] bg-[#FAF7F2] px-3 py-1 rounded-lg border border-[#E8E4DB]">
                        {issuedCard.amount}
                      </span>
                    </div>

                    <div className="text-center py-3 bg-[#FAF7F2] rounded-xl border border-[#E8E4DB]/80">
                      <span className="text-[10px] uppercase tracking-widest text-[#5A5A40] block mb-1 font-semibold">
                        Voucher Code
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-[#1A1A1A] bg-white px-4 py-1.5 rounded-lg border border-[#E8E4DB] inline-block shadow-inner">
                        {issuedCard.voucherCode}
                      </span>
                    </div>

                    {/* Buyer Summary */}
                    <div className="text-xs bg-[#FAF7F2]/60 p-3 rounded-xl border border-[#E8E4DB] space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase tracking-wider text-[#7A7A7A] font-bold">
                          Issued To
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {issuedCard.isRedeemedWithPoints ? 'Redeemed via Points' : 'Active'} &bull; 365 Days
                        </span>
                      </div>
                      <p className="font-semibold text-[#1A1A1A]">{issuedCard.buyerName}</p>
                      <p className="text-[#5A5A40] text-[11px]">{issuedCard.buyerEmail} &bull; {issuedCard.buyerPhone}</p>
                    </div>

                    {issuedCard.personalMessage && (
                      <p className="text-xs italic text-[#4A4A4A] bg-[#FAF7F2] p-2.5 rounded-lg border border-[#E8E4DB]">
                        "{issuedCard.personalMessage}"
                      </p>
                    )}

                    <div className="text-[10px] text-[#5A5A40] flex flex-wrap justify-between pt-1 border-t border-[#E8E4DB]">
                      <span>Valid at: {issuedCard.outlet}</span>
                      <span>Issued on: {issuedCard.issuedAt}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={handleCopyCode}
                      className="w-full sm:flex-1 py-3 rounded-xl bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'Code Copied!' : 'Copy Code'}</span>
                    </button>
                    <button
                      onClick={handleWhatsAppShare}
                      className="w-full sm:flex-1 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share on WhatsApp</span>
                    </button>
                    <button
                      onClick={() => setActiveCard(null)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E8E4DB] bg-white hover:bg-[#FAF7F2] text-xs uppercase tracking-wider font-bold text-[#1A1A1A] cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
