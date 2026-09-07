import React from 'react';
import { ActiveModalType } from '../types';
import { Building2, MessageSquareHeart, HelpCircle, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

interface ContactSectionProps {
  onOpenModal: (type: ActiveModalType) => void;
}

const OUTLET_CONTACTS = [
  {
    location: 'Poes Garden',
    brand: 'The Mayflower',
    addressLines: [
      '17, Kasturi Rangan Rd,',
      'Poes Garden, Alwarpet,',
      'Chennai, Tamil Nadu 600018'
    ],
    phone: '80981 89000',
    email: 'themayflowerchennai@gmail.com'
  },
  {
    location: 'Palavakkam',
    brand: 'The Mayflower',
    addressLines: [
      '28, MGR Salai, Palavakkam,',
      'Chennai – 600041',
      'Tamil Nadu'
    ],
    phone: '80981 89000',
    email: 'cafethemayflower@gmail.com'
  },
  {
    location: 'Egmore',
    brand: 'The Mayflower',
    addressLines: [
      '57, Gandhi Irwin Road, Egmore,',
      'Chennai – 600008',
      'Tamil Nadu'
    ],
    phone: '80981 89000',
    email: 'cafethemayflower@gmail.com'
  },
  {
    location: 'Anna Nagar',
    brand: 'The Mayflower',
    addressLines: [
      'J9, 6th Ave, J Block, Annanagar East,',
      'Chennai – 600102',
      'Tamil Nadu'
    ],
    phone: '80981 89000',
    email: 'cafethemayflower@gmail.com'
  }
];

export const ContactSection: React.FC<ContactSectionProps> = ({ onOpenModal }) => {
  return (
    <section id="contact" className="py-20 bg-[#FAF7F2] text-[#1A1A1A] relative border-b border-[#E8E4DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#5A5A40] font-bold block">
            Sanctuary Directory
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#1A1A1A]">
            Get in <span className="italic font-normal text-[#5A5A40]">Touch</span>
          </h2>
          <p className="text-[15px] text-[#4A4A4A] leading-relaxed">
            Connect directly with any of our four Chennai sanctuaries for dining enquiries, reservations, or events.
          </p>
          <div className="w-12 h-[2px] bg-[#5A5A40]/30 mx-auto mt-3" />
        </div>

        {/* EXACT CONTACT / GET IN TOUCH 4-COLUMN OUTLET DIRECTORY (MATCHING REFERENCE) */}
        <div className="bg-[#121212] text-white rounded-3xl p-8 sm:p-10 lg:p-12 mb-16 shadow-xl border border-[#262626]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {OUTLET_CONTACTS.map((outlet, idx) => (
              <div key={idx} className="flex flex-col justify-between">
                <div>
                  <h4 className="text-sm sm:text-[15px] text-[#A8A49A] font-light tracking-wide mb-1">
                    {outlet.location}
                  </h4>
                  <h3 className="font-serif text-xl sm:text-2xl font-normal text-white mb-3">
                    {outlet.brand}
                  </h3>
                  <div className="text-xs sm:text-[13px] text-[#CCCCCC] leading-relaxed space-y-0.5">
                    {outlet.addressLines.map((line, lIdx) => (
                      <p key={lIdx}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-white/15 space-y-1.5 text-xs sm:text-[13px]">
                  <p className="text-white">
                    <span className="font-bold">Phone: </span>
                    <a
                      href={`tel:${outlet.phone.replace(/\s+/g, '')}`}
                      className="text-white hover:text-[#D1CDBC] transition-colors"
                    >
                      {outlet.phone}
                    </a>
                  </p>
                  <p className="text-white break-all">
                    <span className="font-bold">Email: </span>
                    <a
                      href={`mailto:${outlet.email}`}
                      className="text-white hover:text-[#D1CDBC] transition-colors"
                    >
                      {outlet.email}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Clear Pathways Cards: Franchise, Feedback, General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          
          {/* Pathway 1: Franchise */}
          <div className="bg-[#F5F1EB] rounded-[32px] p-8 border border-[#E8E4DB] hover:border-[#5A5A40]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                Grow with Mayflower
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                Partner with us to cultivate Mayflower’s botanical cafe and dining footprint across South India and tier-1 cosmopolitan cities.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E8E4DB]">
              <button
                onClick={() => onOpenModal('franchise')}
                id="btn-open-franchise-modal"
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-[11px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Franchise Enquiry</span>
                <ArrowUpRight className="w-4 h-4 text-[#D1CDBC]" />
              </button>
            </div>
          </div>

          {/* Pathway 2: Feedback */}
          <div className="bg-[#F5F1EB] rounded-[32px] p-8 border border-[#E8E4DB] hover:border-[#5A5A40]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquareHeart className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                Assistance & Feedback
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                Your dining notes inspire our kitchen and service team. Share your recent experience, celebration memories, or suggestions.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E8E4DB]">
              <button
                onClick={() => onOpenModal('feedback')}
                id="btn-open-feedback-modal"
                className="w-full py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#4A4A30] text-white text-[11px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Share Feedback</span>
                <ArrowUpRight className="w-4 h-4 text-[#E8E4DB]" />
              </button>
            </div>
          </div>

          {/* Pathway 3: General Inquiries */}
          <div className="bg-[#F5F1EB] rounded-[32px] p-8 border border-[#E8E4DB] hover:border-[#5A5A40]/40 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1A1A] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl font-medium text-[#1A1A1A]">
                General Enquiries
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                Inquire about private dining buyouts, curated celebrations, press and editorial visits, or sommelier pairings.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-[#E8E4DB]">
              <button
                onClick={() => onOpenModal('general')}
                id="btn-open-general-modal"
                className="w-full py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-[11px] uppercase tracking-widest font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Concierge Desk</span>
                <ArrowUpRight className="w-4 h-4 text-[#D1CDBC]" />
              </button>
            </div>
          </div>

        </div>

        {/* Central Direct Contact Helpline */}
        <div className="bg-[#F5F1EB] rounded-[28px] p-8 border border-[#E8E4DB] flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#5A5A40] border border-[#E8E4DB] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-bold block">Central Helpline</span>
              <a href="tel:8098189000" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#5A5A40]">
                80981 89000
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#5A5A40] border border-[#E8E4DB] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-bold block">Electronic Mail</span>
              <a href="mailto:cafethemayflower@gmail.com" className="text-sm font-semibold text-[#1A1A1A] hover:text-[#5A5A40]">
                cafethemayflower@gmail.com
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F2] text-[#5A5A40] border border-[#E8E4DB] flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-bold block">Flagship Sanctuary</span>
              <span className="text-sm font-semibold text-[#1A1A1A]">
                Poes Garden, Chennai
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
