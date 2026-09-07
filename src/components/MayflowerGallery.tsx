import React, { useState } from 'react';
import { Sparkles, Eye, X } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'The Mayflower Gourmet Burger',
    category: 'Handcrafted Mains',
    description: 'Artisanal brioche bun stuffed with juicy gourmet patty, crisp cabbage slaw, melted cheddar, and house relish.',
    imageUrl: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-1.jpg',
  },
  {
    id: 'g-2',
    title: 'Crispy Mayflower Fried Chicken',
    category: 'Small Plates & Starters',
    description: 'Golden-fried spiced chicken cutlet served hot with signature fiery chili oil dipping sauce.',
    imageUrl: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-2.jpg',
  },
  {
    id: 'g-3',
    title: 'Belgian Waffle Tower',
    category: 'Desserts & Sweets',
    description: 'Fluffy layered Belgian waffles topped with fresh strawberries, sliced bananas, dark chocolate drizzle, and vanilla bean ice cream.',
    imageUrl: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-3.jpg',
  },
  {
    id: 'g-4',
    title: 'Mayflower Rainbow Buddha Bowl',
    category: 'Salads & Wellness',
    description: 'Wholesome vibrant bowl loaded with charred sweet corn, black beans, broccoli florets, purple cabbage, zucchini, and house sesame dressing.',
    imageUrl: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-sec1-1.jpg',
  },
  {
    id: 'g-5',
    title: 'Artisanal Chilled Juice & Coolers',
    category: 'Signature Beverages',
    description: 'Freshly pressed seasonal juices and citrus passion quenchers served in custom-embossed The Mayflower glass bottles.',
    imageUrl: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-sec1-2.jpg',
  },
  {
    id: 'g-6',
    title: 'Sourdough Panini & Butter Herb Rice Platter',
    category: 'Lunch & Dinner Platters',
    description: 'Toasted sourdough panini with melted mozzarella alongside seasoned herb basmati rice, garlic sourdough baguette, and roasted potato wedges.',
    imageUrl: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-sec2.jpg',
  },
  {
    id: 'g-7',
    title: 'Lotus Stem & Bao Street Tacos',
    category: 'Fusion Starters',
    description: 'Soft steamed bao folded into tacos with crispy julienned vegetables, roasted peanuts, and a trio of dipping sauces.',
    imageUrl: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-sec2-1.jpg',
  },
  {
    id: 'g-8',
    title: 'Burmese Khao Suey Coconut Curry',
    category: 'Asian Specialties',
    description: 'Velvety coconut turmeric curry poured over tender noodles, crowned with cherry tomatoes, fresh sweet basil, and crunchy aromatics.',
    imageUrl: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-sec2-2.jpg',
  },
];

export const MayflowerGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="py-20 bg-[#FAF7F2] text-[#1A1A1A] relative border-b border-[#E8E4DB]">
      {/* Top Visual Banner matching the screenshot */}
      <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden mb-12 shadow-inner">
        <img
          src="https://swirllifestyle.com/wp-content/uploads/2024/04/mayflower-gallery-bg-3-1.jpg"
          alt="Mayflower Bohemian Cafe Atmosphere"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center brightness-105"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
          <span className="text-white/90 text-[11px] sm:text-xs uppercase tracking-[0.3em] font-semibold mb-2">
            A Sensory Journey
          </span>
          <h2 className="font-serif italic text-4xl sm:text-6xl md:text-7xl text-white font-normal drop-shadow-lg">
            Mayflower Gallery
          </h2>
          <p className="max-w-2xl text-white/95 text-sm sm:text-base mt-3 font-light leading-relaxed drop-shadow-md">
            Step into The Mayflower's visual feast! Explore the vibrant colours and flavours that define our bohemian cafe.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Photo Grid showcasing the authentic Swirl Lifestyle images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl border border-[#E8E4DB] cursor-pointer transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#E8E4DB]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center brightness-100 group-hover:brightness-105 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-xs text-white flex items-center space-x-1 font-medium">
                    <Eye className="w-3.5 h-3.5" />
                    <span>View photo details</span>
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-1 bg-white">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#56B3A8]">
                  {item.category}
                </span>
                <h3 className="font-serif text-base font-semibold text-[#1A1A1A] line-clamp-1 group-hover:text-[#56B3A8] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5A5A40] line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#FAF7F2] rounded-2xl overflow-hidden shadow-2xl border border-[#E8E4DB]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close photo"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative max-h-[60vh] overflow-hidden bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain max-h-[60vh]"
              />
            </div>

            <div className="p-6 sm:p-8 space-y-2 bg-[#FAF7F2]">
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#56B3A8]">
                {selectedPhoto.category}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A1A1A]">
                {selectedPhoto.title}
              </h3>
              <p className="text-sm text-[#4A4A4A] leading-relaxed">
                {selectedPhoto.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
