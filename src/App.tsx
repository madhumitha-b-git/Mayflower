import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { AboutSection } from './components/AboutSection';
import { MayflowerGallery } from './components/MayflowerGallery';
import { MenuSection } from './components/MenuSection';
import { MayflowerMomentCards } from './components/MayflowerMomentCards';
import { OutletsSection } from './components/OutletsSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { PlanYourVisit } from './components/PlanYourVisit';
import { Modals } from './components/Modals';
import { AuthModal } from './components/AuthModal';
import { LoyaltyDashboardModal } from './components/LoyaltyDashboardModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ActiveModalType, UserProfile } from './types';
import { getCurrentUser, setCurrentUserSession, WelcomeEmailData } from './data/userStorage';
import { RoleDashboard } from './components/dashboards/RoleDashboard';

export default function App() {
  const [activeView, setActiveView] = useState<'website' | 'reservations'>('website');
  const [activeModal, setActiveModal] = useState<ActiveModalType>('none');
  const [targetOutlet, setTargetOutlet] = useState<string>('Poes Garden');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [welcomeEmail, setWelcomeEmail] = useState<WelcomeEmailData | null>(null);

  // Load user session from local JSON storage
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveView('website');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOpenReservations = (outletName?: string) => {
    if (outletName) {
      setTargetOutlet(outletName);
    }
    setActiveView('reservations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToWebsite = () => {
    setActiveView('website');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserProfile, emailData?: WelcomeEmailData) => {
    setCurrentUser(user);
    if (emailData) setWelcomeEmail(emailData);
    setActiveModal('none');
    // Force re-render so isStaffRole check triggers immediately
    if (user.role && user.role !== 'Customer') {
      window.scrollTo({ top: 0 });
    }
  };

  const handleLogout = () => {
    setCurrentUserSession(null);
    setCurrentUser(null);
    setWelcomeEmail(null);
    setActiveModal('none');
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
  };

  const isStaffRole = currentUser && currentUser.role && currentUser.role !== 'Customer';

  // Redirect staff away from loyalty modal if it somehow gets opened
  useEffect(() => {
    if (isStaffRole && activeModal === 'loyalty') {
      setActiveModal('none');
    }
  }, [isStaffRole, activeModal]);

  // Show role-specific dashboard for staff users — full page takeover
  if (isStaffRole) {
    return (
      <RoleDashboard
        user={currentUser!}
        onLogout={handleLogout}
        onOpenReservations={handleOpenReservations}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1A1A] selection:bg-[#D1CDBC] selection:text-[#1A1A1A] pb-16 md:pb-0">
      {/* Sticky Top Navigation Bar */}
      <Header
        activeView={activeView}
        currentUser={currentUser}
        onNavigate={scrollToSection}
        onOpenReservations={() => handleOpenReservations()}
        onBackToWebsite={handleBackToWebsite}
        onOpenFranchise={() => setActiveModal('franchise')}
        onOpenAuth={() => setActiveModal('auth')}
        onOpenLoyalty={() => setActiveModal('loyalty')}
      />

      {/* Main Content Area: Website or Conversational Reservation Desk */}
      <main className="flex-1">
        {activeView === 'website' ? (
          <>
            {/* Rotating Hero Carousel Gallery */}
            <HeroCarousel
              onPlanVisit={() => handleOpenReservations()}
              onExploreMenu={() => scrollToSection('menu')}
            />

            {/* About Mayflower Philosophy */}
            <AboutSection />

            {/* Mayflower Visual Feast Gallery */}
            <MayflowerGallery />

            {/* Global Fusion Repertoire Menu */}
            <MenuSection
              onPlanVisit={() => handleOpenReservations()}
              onRequestCellar={() => setActiveModal('cellar')}
            />

            {/* Mayflower Moment Cards Gifting & Points Redemption Section */}
            <MayflowerMomentCards
              currentUser={currentUser}
              onOpenAuth={() => setActiveModal('auth')}
              onUpdateUser={handleUpdateUser}
            />

            {/* Chennai Sanctuaries & Interactive Map */}
            <OutletsSection
              onReserveOutlet={(outletName) => handleOpenReservations(outletName)}
            />

            {/* Concierge & Contact Pathways */}
            <ContactSection
              onOpenModal={(modalType) => setActiveModal(modalType)}
            />
          </>
        ) : (
          /* Conversational Digital Reservation Desk: Plan Your Visit */
          <PlanYourVisit
            initialOutlet={targetOutlet}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onBackToWebsite={handleBackToWebsite}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={scrollToSection}
        onPlanVisit={() => handleOpenReservations()}
      />

      {/* Interactive General Modals */}
      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal('none')}
      />

      {/* Email-Only Authentication / OTP Modal */}
      <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={() => setActiveModal('none')}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Starbucks-Style Loyalty & User Account Dashboard Modal */}
      <LoyaltyDashboardModal
        isOpen={activeModal === 'loyalty'}
        user={currentUser}
        welcomeEmail={welcomeEmail}
        onClose={() => setActiveModal('none')}
        onLogout={handleLogout}
        onNavigateToGiftCards={() => scrollToSection('moment-cards')}
      />

      {/* Mobile Bottom Floating Navigation Dock */}
      <MobileBottomNav
        activeView={activeView}
        onNavigate={scrollToSection}
        onOpenReservations={() => handleOpenReservations()}
        onBackToWebsite={handleBackToWebsite}
      />
    </div>
  );
}
