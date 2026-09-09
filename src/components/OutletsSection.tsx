import React, { useState } from 'react';
import { OUTLETS } from '../data/restaurantData';
import { MapPin, Clock, Phone, Navigation, Calendar, CheckCircle2, Compass, ExternalLink } from 'lucide-react';

interface OutletsSectionProps {
  onReserveOutlet: (outletName: string) => void;
}

export const OutletsSection: React.FC<OutletsSectionProps> = ({ onReserveOutlet }) => {
  const [selectedOutletId, setSelectedOutletId] = useState<string>(OUTLETS[0].id);

  const activeOutlet = OUTLETS.find((o) => o.id === selectedOutletId) || OUTLETS[0];

  return (
    <section id="locations" className="py-24 bg-[#FAF7F2] text-[#1A1A1A] relative border-b border-[#E8E4DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#5A5A40] font-bold block">
            Our Locations
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#1A1A1A]">
            Find a Mayflower <span className="italic font-normal text-[#5A5A40]">Near You in Chennai</span>
          </h2>
          <p className="text-[15px] text-[#4A4A4A] leading-relaxed">
            Visit us across our four locations in Chennai: Poes Garden, Anna Nagar, Egmore, and Palavakkam on ECR.
          </p>
          <div className="w-12 h-[2px] bg-[#5A5A40]/30 mx-auto mt-4" />
        </div>

        {/* Chennai Interactive Spatial Map & Location Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          
          {/* Left: Interactive Visual Map of Chennai Coastal & Urban Grid */}
          <div className="lg:col-span-5 bg-[#F5F1EB] rounded-[32px] p-6 border border-[#E8E4DB] shadow-sm relative overflow-hidden">
            <div className="flex items-center mb-4">
              <div className="flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider text-[#1A1A1A]">
                <Compass className="w-4 h-4 text-[#5A5A40]" />
                <span>Chennai Outlets Map</span>
              </div>
            </div>

            {/* Stylized Chennai Map Graphic Canvas */}
            <div className="relative w-full h-[360px] bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#E8E4DB] p-4 select-none">
              
              {/* Bay of Bengal Coastline Graphic on Right */}
              <div className="absolute top-0 right-0 bottom-0 w-28 bg-gradient-to-l from-[#E8E4DB]/60 via-[#E8E4DB]/20 to-transparent border-l border-[#E8E4DB] flex flex-col justify-center items-end pr-2 text-[10px] font-serif italic text-[#5A5A40] tracking-widest uppercase">
                <span className="rotate-90 origin-right">Bay of Bengal</span>
              </div>

              {/* Major Roads / Arteries Lines */}
              <svg className="absolute inset-0 w-full h-full stroke-[#5A5A40]/20 fill-none" strokeWidth="1.5">
                {/* ECR Coastline Road */}
                <path d="M 280 20 Q 270 180 320 360" strokeDasharray="4 4" stroke="#5A5A40" strokeWidth="1.2" />
                {/* Mount Road / Anna Salai arterial */}
                <path d="M 40 40 L 220 220 L 260 340" />
                {/* Poonamallee High Road */}
                <path d="M 30 140 L 210 170" />
                {/* Outer Ring */}
                <circle cx="160" cy="180" r="130" stroke="#5A5A40" strokeOpacity="0.1" />
              </svg>

              {/* Geographic Labels */}
              <div className="absolute top-6 left-6 text-[10px] uppercase tracking-wider font-bold text-[#5A5A40]">
                Central Chennai
              </div>
              <div className="absolute bottom-8 right-24 text-[10px] uppercase tracking-wider font-bold text-[#5A5A40]">
                East Coast (ECR)
              </div>

              {/* 4 Sanctuary Interactive Pins */}
              {OUTLETS.map((outlet) => {
                const isActive = outlet.id === selectedOutletId;
                const gmapLink = outlet.gmapUrl || `https://maps.google.com/?q=Mayflower+${encodeURIComponent(outlet.name)}+Chennai`;
                return (
                  <a
                    key={outlet.id}
                    href={gmapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setSelectedOutletId(outlet.id)}
                    style={{ left: `${outlet.mapCoordinates.x}%`, top: `${outlet.mapCoordinates.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 group z-20 transition-all duration-300 flex flex-col items-center cursor-pointer ${
                      isActive ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                    title={`Click to view ${outlet.name} on Google Maps`}
                  >
                    <div className="relative flex items-center justify-center">
                      <span
                        className={`absolute w-8 h-8 rounded-full transition-all ${
                          isActive
                            ? 'bg-[#5A5A40]/30 animate-ping'
                            : 'bg-[#5A5A40]/10 group-hover:bg-[#5A5A40]/20'
                        }`}
                      />
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-colors duration-200 ${
                          isActive
                            ? 'bg-[#5A5A40] text-white ring-4 ring-[#E8E4DB]'
                            : 'bg-[#1A1A1A] text-white group-hover:bg-[#5A5A40]'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Pin Label Tag */}
                    <div
                      className={`mt-1 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all shadow-md ${
                        isActive
                          ? 'bg-[#1A1A1A] text-white ring-2 ring-[#5A5A40]'
                          : 'bg-white text-[#1A1A1A] border border-[#E8E4DB] group-hover:bg-[#1A1A1A] group-hover:text-white'
                      }`}
                    >
                      {outlet.name}
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Quick switcher buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
              {OUTLETS.map((outlet) => (
                <button
                  key={outlet.id}
                  onClick={() => setSelectedOutletId(outlet.id)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                    outlet.id === selectedOutletId
                      ? 'bg-[#1A1A1A] text-white shadow-sm'
                      : 'bg-[#FAF7F2] text-[#5A5A40] border border-[#E8E4DB] hover:text-[#1A1A1A]'
                  }`}
                >
                  {outlet.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Featured Outlet Spotlight Details Card */}
          <div className="lg:col-span-7 bg-[#FAF7F2] rounded-[36px] border border-[#E8E4DB] shadow-md overflow-hidden">
            <div className="relative h-64 sm:h-72 overflow-hidden bg-[#E8E4DB]">
              <img
                src={activeOutlet.image}
                alt={activeOutlet.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white flex items-end justify-between">
                <div>
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold mb-2">
                    <span>Selected Sanctuary</span>
                  </div>
                  <h3 className="font-serif text-3xl font-semibold">{activeOutlet.name}</h3>
                  <p className="text-sm text-[#E8E4DB]">{activeOutlet.tagline}</p>
                </div>

                <a
                  href={activeOutlet.gmapUrl || `https://maps.google.com/?q=Mayflower+${encodeURIComponent(activeOutlet.name)}+Chennai`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center space-x-1.5 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-[#1A1A1A] text-xs font-bold transition shadow"
                >
                  <Navigation className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Google Maps ↗</span>
                </a>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <p className="text-[15px] text-[#4A4A4A] leading-relaxed">
                {activeOutlet.description}
              </p>

              {/* Highlights Chips */}
              <div className="flex flex-wrap gap-2">
                {activeOutlet.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F5F1EB] text-[#1A1A1A] text-xs font-semibold border border-[#E8E4DB]"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#5A5A40]" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>

              {/* Details List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#E8E4DB] text-xs sm:text-sm">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-bold block flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Address</span>
                  </span>
                  <p className="text-[#1A1A1A] font-medium">{activeOutlet.address}</p>
                  <a
                    href={activeOutlet.gmapUrl || `https://maps.google.com/?q=Mayflower+${encodeURIComponent(activeOutlet.name)}+Chennai`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-[#5A5A40] hover:text-[#1A1A1A] hover:underline font-bold pt-1"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-bold block flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Hours of Service</span>
                  </span>
                  <p className="text-[#1A1A1A] font-medium">{activeOutlet.hours}</p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-bold block flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Concierge Line</span>
                  </span>
                  <a
                    href={`tel:${activeOutlet.phone}`}
                    className="text-[#1A1A1A] hover:text-[#5A5A40] hover:underline font-semibold"
                  >
                    {activeOutlet.phone}
                  </a>
                </div>
              </div>

              {/* Actions: Reserve table here & Directions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => onReserveOutlet(activeOutlet.name)}
                  id={`btn-reserve-outlet-${activeOutlet.id}`}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#4A4A30] text-white text-[11px] uppercase tracking-widest font-bold transition-all duration-300 shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-[#E8E4DB]" />
                  <span>Reserve Table at {activeOutlet.name}</span>
                </button>

                <a
                  href={activeOutlet.gmapUrl || `https://maps.google.com/?q=Mayflower+${encodeURIComponent(activeOutlet.name)}+Chennai`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white text-[11px] uppercase tracking-widest font-bold transition-all flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Google Maps Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
