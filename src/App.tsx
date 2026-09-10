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
import { RoleDashboard } from './components/dashboards/RoleDashboard';
import { ActiveModalType, UserProfile } from './types';
import { WelcomeEmailData } from './data/userStorage';
import { fetchUserProfile, getSupabaseCurrentUser, supabaseLogout } from './lib/authService';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

export type AppView = 'website' | 'reservations' | 'dashboard';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('website');
  const [activeModal, setActiveModal] = useState<ActiveModalType>('none');
  const [targetOutlet, setTargetOutlet] = useState<string>('Poes Garden');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [welcomeEmail, setWelcomeEmail] = useState<WelcomeEmailData | null>(null);

  // Restore session on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    getSupabaseCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    }).catch(() => {});

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentUser(null);
        setActiveView('website');
      } else {
        fetchUserProfile(session.user.id).then(setCurrentUser).catch(() => {});
      }
    });

    const profileChannel = supabase
      .channel('current-customer-profile')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, (payload) => {
        const userId = (payload.new as { id?: string }).id;
        if (userId) fetchUserProfile(userId).then((user) => user && setCurrentUser(user)).catch(() => {});
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(profileChannel);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    setActiveView('website');
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleOpenReservations = (outletName?: string) => {
    if (outletName) setTargetOutlet(outletName);
    setActiveView('reservations');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToWebsite = () => {
    setActiveView('website');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDashboard = () => {
    setActiveView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: UserProfile, emailData?: WelcomeEmailData) => {
    setCurrentUser(user);
    if (emailData) setWelcomeEmail(emailData);
    setActiveModal('none');
  };

  const handleLogout = () => {
    supabaseLogout();
    setCurrentUser(null);
    setWelcomeEmail(null);
    setActiveModal('none');
    setActiveView('website');
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
  };

  // Dashboard view — full page, with back-to-website handled inside RoleDashboard
  if (activeView === 'dashboard' && currentUser) {
    return (
      <RoleDashboard
        user={currentUser}
        onLogout={handleLogout}
        onBackToWebsite={handleBackToWebsite}
        onOpenReservations={() => handleOpenReservations()}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#1A1A1A] selection:bg-[#D1CDBC] selection:text-[#1A1A1A] pb-16 md:pb-0">
      <Header
        activeView={activeView}
        currentUser={currentUser}
        onNavigate={scrollToSection}
        onOpenReservations={() => handleOpenReservations()}
        onBackToWebsite={handleBackToWebsite}
        onOpenFranchise={() => setActiveModal('franchise')}
        onOpenAuth={() => setActiveModal('auth')}
        onOpenLoyalty={() => setActiveModal('loyalty')}
        onOpenDashboard={handleOpenDashboard}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {activeView === 'website' ? (
          <>
            <HeroCarousel
              onPlanVisit={() => handleOpenReservations()}
              onExploreMenu={() => scrollToSection('menu')}
            />
            <AboutSection />
            <MayflowerGallery />
            <MenuSection
              onPlanVisit={() => handleOpenReservations()}
              onRequestCellar={() => setActiveModal('cellar')}
            />
            <MayflowerMomentCards
              currentUser={currentUser}
              onOpenAuth={() => setActiveModal('auth')}
              onUpdateUser={handleUpdateUser}
            />
            <OutletsSection
              onReserveOutlet={(outletName) => handleOpenReservations(outletName)}
            />
            <ContactSection
              onOpenModal={(modalType) => setActiveModal(modalType)}
            />
          </>
        ) : (
          <PlanYourVisit
            initialOutlet={targetOutlet}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
            onRequestSignIn={() => setActiveModal('auth')}
            onBackToWebsite={handleBackToWebsite}
          />
        )}
      </main>

      <Footer
        onNavigate={scrollToSection}
        onPlanVisit={() => handleOpenReservations()}
      />

      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal('none')}
      />

      <AuthModal
        isOpen={activeModal === 'auth'}
        onClose={() => setActiveModal('none')}
        onLoginSuccess={handleLoginSuccess}
      />

      <LoyaltyDashboardModal
        isOpen={activeModal === 'loyalty'}
        user={currentUser}
        welcomeEmail={welcomeEmail}
        onClose={() => setActiveModal('none')}
        onLogout={handleLogout}
        onNavigateToGiftCards={() => scrollToSection('moment-cards')}
      />

      <MobileBottomNav
        activeView={activeView}
        onNavigate={scrollToSection}
        onOpenReservations={() => handleOpenReservations()}
        onBackToWebsite={handleBackToWebsite}
      />
    </div>
  );
}
