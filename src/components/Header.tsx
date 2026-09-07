import React, { useState, useEffect, useRef } from 'react';
import { Menu as MenuIcon, X, Calendar, MapPin, Phone, ArrowLeft, Gift, Star, User } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeView: 'website' | 'reservations';
  currentUser: UserProfile | null;
  onNavigate: (sectionId: string) => void;
  onOpenReservations: () => void;
  onBackToWebsite: () => void;
  onOpenFranchise?: () => void;
  onOpenAuth: () => void;
  onOpenLoyalty: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  currentUser,
  onNavigate,
  onOpenReservations,
  onBackToWebsite,
  onOpenFranchise,
  onOpenAuth,
  onOpenLoyalty
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isStaff = currentUser && currentUser.role && currentUser.role !== 'Customer';

  const handleUserIconClick = () => {
    if (isStaff) return;
    if (currentUser) onOpenLoyalty();
    else onOpenAuth();
  };
  const [activeSection, setActiveSection] = useState<string>('hero');
  const isNavClickingRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Smooth scroll listener with RAF & click lock to prevent flickering
  useEffect(() => {
    if (activeView !== 'website') return;

    let ticking = false;

    const handleScroll = () => {
      if (isNavClickingRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sections = ['hero', 'about', 'gallery', 'menu', 'moment-cards', 'locations', 'contact'];
          const scrollPosition = window.scrollY + 160;

          let current = 'hero';
          for (const sectionId of sections) {
            const element = document.getElementById(sectionId);
            if (element) {
              const top = element.offsetTop;
              const height = element.offsetHeight;
              if (scrollPosition >= top && scrollPosition < top + height) {
                current = sectionId;
                break;
              }
            }
          }

          setActiveSection((prev) => (prev !== current ? current : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeView]);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    setActiveSection(sectionId);

    isNavClickingRef.current = true;
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isNavClickingRef.current = false;
    }, 850);

    if (activeView === 'reservations') {
      onBackToWebsite();
      setTimeout(() => {
        onNavigate(sectionId);
      }, 100);
    } else {
      onNavigate(sectionId);
    }
  };

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'Experience' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'menu', label: 'Menu' },
    { id: 'moment-cards', label: 'Moment Cards', isSpecial: true },
    { id: 'locations', label: 'Locations' },
    { id: 'contact', label: 'Get in Touch' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E4DB]/80 shadow-2xs transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Mark Badge + Brand Title Beside Logo */}
          <button
            onClick={handleUserIconClick}
            className="flex items-center space-x-3.5 group focus:outline-none cursor-pointer text-left shrink-0"
            id="nav-brand-logo"
            aria-label="The Mayflower Chennai - Register / Sign In"
            title={currentUser ? `Account Profile: ${currentUser.name}` : "Click to Register or Sign In"}
          >
            {/* Logo Badge: Letter 'M' Only */}
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[18px] bg-[#FAF7F2] border border-[#2D4030]/50 shadow-2xs flex items-center justify-center shrink-0 group-hover:border-[#2D4030] group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <svg viewBox="0 0 100 100" className="w-4/5 h-4/5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M50 16 C54 26 64 30 70 26 C64 37 54 39 50 33 C46 39 36 37 30 26 C36 30 46 26 50 16 Z"
                  fill="#2D4030"
                  opacity="0.18"
                />
                <text
                  x="50"
                  y="68"
                  textAnchor="middle"
                  fontFamily="'Playfair Display', 'Cormorant Garamond', Georgia, serif"
                  fontSize="56"
                  fontWeight="700"
                  fill="#2D4030"
                >
                  M
                </text>
              </svg>
            </div>

            {/* Brand Title & Subtitle Beside Logo */}
            <div className="flex flex-col text-left justify-center">
              <span className="font-cinzel text-xl sm:text-[22px] font-bold tracking-[0.06em] text-[#1A1A1A] group-hover:text-[#2D4030] transition-colors leading-none uppercase">
                MAYFLOWER
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-[0.24em] font-semibold text-[#5A5A40] uppercase mt-1 whitespace-nowrap">
                CAFE &amp; DINING • CHENNAI
              </span>
            </div>
          </button>

          {/* Elevated Clean Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 lg:space-x-8 text-[12px] uppercase tracking-[0.18em] font-semibold">
            {navItems.map((item) => {
              const isActive = activeView === 'website' && activeSection === item.id;
              
              if (item.isSpecial) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    id={`nav-${item.id}`}
                    className="relative py-1.5 px-3.5 rounded-full bg-[#E25C38]/10 hover:bg-[#E25C38] text-[#E25C38] hover:text-white font-bold transition-all duration-300 cursor-pointer flex items-center space-x-1.5 shadow-2xs hover:scale-105 whitespace-nowrap"
                  >
                    <Gift className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-${item.id}`}
                  className={`relative py-2 transition-all duration-200 cursor-pointer group flex items-center whitespace-nowrap ${
                    isActive
                      ? 'text-[#1A1A1A] font-bold'
                      : 'text-[#5A5A40] hover:text-[#1A1A1A]'
                  }`}
                >
                  <span>{item.label}</span>
                  
                  {/* Subtle Underline Accent */}
                  <span
                    className={`absolute bottom-0 left-0 h-[2px] bg-[#2D4030] transition-all duration-300 rounded-full ${
                      isActive ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-70'
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Medium screen navigation fallback */}
          <nav className="hidden md:flex lg:hidden items-center space-x-3 text-[11px] uppercase tracking-[0.15em] font-semibold text-[#5A5A40]">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="hover:text-[#1A1A1A] transition-colors py-1 cursor-pointer whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-3 shrink-0">
            {activeView === 'reservations' ? (
              <button
                onClick={onBackToWebsite}
                id="btn-back-to-restaurant"
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[11px] uppercase tracking-widest font-bold transition-all duration-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Explore Restaurant</span>
              </button>
            ) : (
              <>
                {onOpenFranchise && (
                  <button
                    type="button"
                    onClick={onOpenFranchise}
                    id="btn-franchise-enquiry-header"
                    className="px-4 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-white text-[#1A1A1A] border border-[#D8D4C8] text-[10px] uppercase tracking-widest font-bold transition-all duration-200 cursor-pointer shadow-2xs hover:border-[#1A1A1A] hover:-translate-y-0.5"
                  >
                    Franchise
                  </button>
                )}
                
                <button
                  onClick={onOpenReservations}
                  id="btn-plan-your-visit-header"
                  className="group relative inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#2D4030] text-white text-[10px] uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer shadow-xs hover:-translate-y-0.5"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#D1CDBC] group-hover:scale-110 transition-transform" />
                  <span>Reserve Table</span>
                </button>

                {/* Isolated Far-Right User Profile Icon (Colorless before login, Colored green + star after login) */}
                {currentUser ? (
                  <button
                    onClick={handleUserIconClick}
                    title={isStaff ? `${currentUser.role} Dashboard` : `${currentUser.name} (${currentUser.rewardPoints} PTS)`}
                    className="relative w-10 h-10 rounded-full bg-[#1E3932] hover:bg-[#162F29] border-2 border-[#00754A] text-white shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 ml-1.5 shrink-0"
                    aria-label="User Account"
                  >
                    <User className="w-4.5 h-4.5 text-white" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F59E0B] text-black text-[9px] font-black flex items-center justify-center shadow-xs">
                      ★
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAuth}
                    title="Register or Log In"
                    className="w-10 h-10 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#D5D0C5] text-[#8C887C] hover:text-[#1A1A1A] hover:border-[#1A1A1A] shadow-2xs flex items-center justify-center cursor-pointer transition-all hover:scale-105 ml-1.5 shrink-0"
                    aria-label="Register or Log In"
                  >
                    <User className="w-4.5 h-4.5" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            {currentUser ? (
              <button
                onClick={handleUserIconClick}
                className="w-9 h-9 rounded-full bg-[#1E3932] border-2 border-[#00754A] text-white flex items-center justify-center shadow-xs relative"
                aria-label="User Dashboard"
              >
                <User className="w-4 h-4 text-white" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#F59E0B] text-black text-[8px] font-black flex items-center justify-center">
                  ★
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="w-9 h-9 rounded-full bg-white border border-[#D5D0C5] text-[#8C887C] flex items-center justify-center shadow-2xs"
                aria-label="Register or Login"
              >
                <User className="w-4 h-4" />
              </button>
            )}

            {activeView !== 'reservations' && (
              <button
                onClick={onOpenReservations}
                className="px-3.5 py-1.5 rounded-full bg-[#2D4030] text-white text-[10px] uppercase tracking-widest font-bold shadow-xs"
              >
                Reserve
              </button>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#1A1A1A] hover:text-[#2D4030] focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
              id="mobile-nav-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E8E4DB] px-6 pt-4 pb-8 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-1 text-sm font-semibold uppercase tracking-wider">
            {navItems.map((item, idx) => {
              const isActive = activeView === 'website' && activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left py-3 border-b border-[#E8E4DB] flex items-center justify-between cursor-pointer transition-colors ${
                    item.isSpecial
                      ? 'text-[#E25C38] font-bold'
                      : isActive
                      ? 'text-[#2D4030] font-bold'
                      : 'text-[#1A1A1A] hover:text-[#2D4030]'
                  }`}
                >
                  <span className="font-cinzel text-base tracking-widest">{item.label}</span>
                  <span className="text-xs text-[#5A5A40]">0{idx + 1}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 space-y-2">
            {currentUser ? (
              <button
                onClick={() => { setMobileMenuOpen(false); handleUserIconClick(); }}
                className="w-full py-3.5 rounded-full bg-[#2D4030] text-white text-center text-[11px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2 shadow-sm"
              >
                <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                <span>{isStaff ? `${currentUser.role} Dashboard` : `Rewards (${currentUser.rewardPoints} PTS)`}</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-3.5 rounded-full bg-[#2D4030] text-white text-center text-[11px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2 shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Register / Sign In</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReservations();
              }}
              className="w-full py-3 rounded-full bg-[#1A1A1A] text-white text-center text-[11px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2 shadow-xs"
            >
              <Calendar className="w-4 h-4 text-[#E8E4DB]" />
              <span>Plan Your Visit (Reserve Table)</span>
            </button>
          </div>

          <div className="text-[11px] text-[#5A5A40] pt-3 flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between border-t border-[#E8E4DB]/60">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Poes Garden • Egmore • Anna Nagar • ECR</span>
            </span>
            <span className="flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 44 4892 7700</span>
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
