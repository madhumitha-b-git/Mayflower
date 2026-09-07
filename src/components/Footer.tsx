import React from 'react';
import { Calendar, ArrowUp } from 'lucide-react';
import { OUTLETS } from '../data/restaurantData';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onPlanVisit: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onPlanVisit }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A1A] text-[#FAF7F2] pt-20 pb-12 border-t border-[#E8E4DB]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Top Callout Banner */}
        <div className="pb-16 border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D1CDBC] font-bold block mb-2">
              Unforgettable Gatherings
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-light text-[#FAF7F2]">
              Let us prepare your table in the sanctuary.
            </h3>
          </div>

          <button
            onClick={onPlanVisit}
            id="footer-btn-plan-visit"
            className="px-8 py-4 rounded-full bg-[#5A5A40] hover:bg-[#4A4A30] text-white text-[11px] uppercase tracking-widest font-bold transition-all duration-300 shadow-lg flex items-center space-x-3 shrink-0 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Plan Your Visit</span>
          </button>
        </div>

        {/* Links & Information Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-16">
          
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-[16px] bg-[#FAF7F2] border border-white/20 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
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
              <div className="flex flex-col">
                <span className="font-cinzel text-2xl tracking-[0.06em] font-bold uppercase text-[#FAF7F2]">
                  MAYFLOWER
                </span>
                <span className="text-[9px] tracking-[0.2em] font-semibold text-[#D1CDBC] uppercase">
                  CAFE &amp; DINING • CHENNAI
                </span>
              </div>
            </div>

            <p className="text-sm text-[#FAF7F2]/75 leading-relaxed max-w-sm">
              Chennai’s premier cafe and global-fusion restaurant sanctuary, uniting the culinary spirit of Pan-Asian, Italian, French, Mediterranean, Mexican, and American flavours.
            </p>

            <div className="flex items-center space-x-3 pt-2 text-xs text-[#D1CDBC]">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>All 4 Chennai sanctuaries open daily</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#D1CDBC] font-bold">
              Explore
            </h4>
            <ul className="space-y-2 text-sm text-[#FAF7F2]/80">
              <li>
                <button onClick={() => onNavigate('hero')} className="hover:text-white transition-colors cursor-pointer">
                  Sanctuary Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  Our Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-white transition-colors cursor-pointer">
                  Global Food Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('locations')} className="hover:text-white transition-colors cursor-pointer">
                  Chennai Outlets
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Get in Touch
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Outlets */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#D1CDBC] font-bold">
              Sanctuaries
            </h4>
            <ul className="space-y-2 text-sm text-[#FAF7F2]/80">
              {OUTLETS.map((o) => (
                <li key={o.id}>
                  <button
                    onClick={() => onNavigate('locations')}
                    className="hover:text-white transition-colors text-left cursor-pointer"
                  >
                    <span className="font-medium text-[#FAF7F2] block">{o.name}</span>
                    <span className="text-[11px] text-[#FAF7F2]/50 block truncate">{o.hours.split('(')[0]}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Traditions */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-[#D1CDBC] font-bold">
              Cuisines
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-[#FAF7F2]/80">
              <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2]/10 border border-white/10">Pan-Asian</span>
              <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2]/10 border border-white/10">Italian</span>
              <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2]/10 border border-white/10">French</span>
              <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2]/10 border border-white/10">Mediterranean</span>
              <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2]/10 border border-white/10">Mexican</span>
              <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2]/10 border border-white/10">American</span>
            </div>
            <div className="pt-3">
              <span className="text-[10px] uppercase tracking-wider text-[#D1CDBC] block font-bold">
                Dress Code
              </span>
              <p className="text-xs text-[#FAF7F2]/70 mt-0.5">
                Smart casual & bohemian chic.
              </p>
            </div>
          </div>

        </div>

        {/* Natural Tones Quick Outlets & Hours Bar */}
        <div className="py-6 border-t border-b border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Our Outlets:</span>
            <div className="flex items-center gap-3 font-medium text-[#FAF7F2]">
              <span>Poes Garden</span> <span className="opacity-30">/</span>
              <span>Palavakkam</span> <span className="opacity-30">/</span>
              <span>Egmore</span> <span className="opacity-30">/</span>
              <span>Anna Nagar</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Opening Hours:</span>
            <span className="font-medium text-[#FAF7F2]">Mon - Sun: 11:00 AM — 11:00 PM</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Connect:</span>
            <div className="flex gap-4 font-medium text-[#FAF7F2]/90">
              <span className="hover:text-white cursor-pointer">Instagram</span>
              <span className="hover:text-white cursor-pointer">Facebook</span>
              <span onClick={() => onNavigate('contact')} className="hover:text-white cursor-pointer">Get in Touch</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & back to top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF7F2]/50 gap-4">
          <p>© {new Date().getFullYear()} Mayflower Restaurants Pvt Ltd. All rights reserved. Chennai, India.</p>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center space-x-2 text-[#D1CDBC] hover:text-white transition-colors cursor-pointer"
          >
            <span>Return to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};
