import React from 'react';
import { Home, UtensilsCrossed, Calendar, MapPin, MessageSquare } from 'lucide-react';

interface MobileBottomNavProps {
  activeView: 'website' | 'reservations';
  onNavigate: (sectionId: string) => void;
  onOpenReservations: () => void;
  onBackToWebsite: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  onNavigate,
  onOpenReservations,
  onBackToWebsite
}) => {
  const handleItemClick = (sectionId: string) => {
    if (activeView === 'reservations') {
      onBackToWebsite();
      setTimeout(() => onNavigate(sectionId), 100);
    } else {
      onNavigate(sectionId);
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E8E4DB] px-3 py-2">
      <div className="flex items-center justify-around">
        
        {/* Sanctuary Home */}
        <button
          onClick={() => handleItemClick('hero')}
          className="flex flex-col items-center py-1 text-[#5A5A40] hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider mt-1 uppercase">Sanctuary</span>
        </button>

        {/* Menu */}
        <button
          onClick={() => handleItemClick('menu')}
          className="flex flex-col items-center py-1 text-[#5A5A40] hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider mt-1 uppercase">Menu</span>
        </button>

        {/* Elevated Reserve Pill */}
        <button
          onClick={activeView === 'reservations' ? onBackToWebsite : onOpenReservations}
          className="flex flex-col items-center -mt-5 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-[#5A5A40] text-white flex items-center justify-center shadow-lg border-2 border-[#FAF7F2] hover:scale-105 transition-transform">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-wider text-[#1A1A1A] mt-0.5 uppercase">
            {activeView === 'reservations' ? 'Explore' : 'Reserve'}
          </span>
        </button>

        {/* Outlets */}
        <button
          onClick={() => handleItemClick('locations')}
          className="flex flex-col items-center py-1 text-[#5A5A40] hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider mt-1 uppercase">Outlets</span>
        </button>

        {/* Contact */}
        <button
          onClick={() => handleItemClick('contact')}
          className="flex flex-col items-center py-1 text-[#5A5A40] hover:text-[#1A1A1A] transition-colors cursor-pointer"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold tracking-wider mt-1 uppercase">Contact</span>
        </button>

      </div>
    </div>
  );
};
