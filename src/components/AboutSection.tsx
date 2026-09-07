import React, { useState } from 'react';
import { Globe, HeartHandshake, Sparkles, UtensilsCrossed, Star, CheckCircle2, ArrowRight, Quote, Flame } from 'lucide-react';

interface PillarData {
  id: string;
  tabLabel: string;
  tabIcon: React.ElementType;
  tagline: string;
  title: string;
  description: string;
  image: string;
  highlights: string[];
  quote: {
    text: string;
    author: string;
  };
  features?: {
    name: string;
    description: string;
    badge: string;
    image: string;
  }[];
}

const BRAND_PILLARS: PillarData[] = [
  {
    id: 'international',
    tabLabel: 'International Flavours',
    tabIcon: Globe,
    tagline: 'Global Culinary Artistry',
    title: 'Bringing World-Class Italian & Asian Cuisines to Chennai',
    description: 'The Mayflower was created with a singular vision: to deliver international-level taste and authentic recipes directly to Chennai diners. Our chefs masterfully blend traditional Italian techniques with vibrant Pan-Asian culinary traditions.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      'Authentic Italian hand-rolled pasta & slow-fermented sourdough pizzas',
      'Pan-Asian dim sum repertoire, authentic Khao Suey & bao buns',
      'French, Continental & Mediterranean inspired signature courses'
    ],
    quote: {
      text: "The fusion of authentic Italian pasta and delicate Asian dim sums under one roof is unmatched anywhere in Chennai.",
      author: "The Hindu Food Review"
    },
    features: [
      {
        name: 'Italian Repertoire',
        description: 'Truffle Mushroom Ravioli, Wood-fired Sourdough Pizzas, Creamy Risottos',
        badge: 'Italian',
        image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Pan-Asian Craft',
        description: 'Steamed Crystal Dim Sums, Tangy Orange Chicken, Burmese Khao Suey',
        badge: 'Pan-Asian',
        image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  {
    id: 'quality',
    tabLabel: 'Generous Portions & Quality',
    tabIcon: HeartHandshake,
    tagline: 'Abundant & Uncompromising',
    title: 'Renowned for Generous Quantities & Uncompromising Taste',
    description: 'We believe dining should be both extraordinary and satisfying. At Mayflower, every dish is crafted with generous portion sizes and top-tier ingredients, ensuring a wholesome experience that guests praise repeatedly.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      'Generous family-sized sharing portions across all categories',
      'Pristine imported & locally sourced fresh organic ingredients',
      'Zero artificial additives — 100% freshly cooked to order'
    ],
    quote: {
      text: "The portion sizes at Mayflower are incredibly generous, and the quality never drops no matter how busy the house gets.",
      author: "Food Lovers Chennai"
    }
  },
  {
    id: 'ambiance',
    tabLabel: 'Quaint & Lovely Ambiance',
    tabIcon: Sparkles,
    tagline: 'Botanical Sanctuary',
    title: 'A Quaint, Cozy Atmosphere Created for Special Moments',
    description: 'Step inside a serene bohemian haven featuring glasshouse conservatories, potted palms, woven cane lamps, and soft ambient warmth. Designed for romantic date nights, lively family meals, and peaceful catch-ups.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAo8A20eSCjsaWzVWhOcseGiH7uy_WzieVkzEIYn-jZW2cWP4ImDbbXu3BdFWQPDDPhtLGXg8OcCF68kErOJx6FwanmheIFdxIbtV5qzetdgr6I1l5RK59uOHKB3InPYC88F4t-JMi_Nckma4DRiMV9T3wCtyyPtJb2O2d9jR5enzbpDA3DfNBPfkocCJZ-33mSTOlsJQRoN2xB5ljQXZ9gbOhkfhz6TJLnWogFOImB0-aJsKFSimA',
    highlights: [
      'Lush botanical decor with indoor glasshouse dining',
      'Warm amber lighting & cozy cane seating nooks',
      'Tranquil outdoor garden spaces across all 4 Chennai sanctuaries'
    ],
    quote: {
      text: "The ambiance is quaint, aesthetic, and incredibly relaxing. It feels like stepping into a European glasshouse garden.",
      author: "Chennai Dining Guide"
    }
  },
  {
    id: 'favorites',
    tabLabel: 'Signature Fan Favorites',
    tabIcon: UtensilsCrossed,
    tagline: 'Iconic Creations',
    title: 'Beloved Signature Dishes Celebrated Across Chennai',
    description: 'From our famous Panko Crispy Chicken and Tangy Asian Orange Chicken to handcrafted Italian Gelato, discover the iconic menu items that have captured the hearts of food enthusiasts.',
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=1000&q=80',
    highlights: [
      'Crispy Panko Chicken served with signature house dips',
      'Tangy Asian Orange Chicken with wok-tossed citrus glaze',
      'Handcrafted Gelato & Lotus Biscoff Cheesecakes'
    ],
    quote: {
      text: "You cannot visit Mayflower without ordering the Panko Chicken and Orange Chicken — they are absolute perfection!",
      author: "Customer Review"
    },
    features: [
      {
        name: 'Panko Crispy Chicken',
        description: 'Golden Japanese Panko crusted chicken tenderloins with smoked garlic aioli',
        badge: 'Must Try',
        image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Tangy Orange Chicken',
        description: 'Crispy wok-tossed chicken coated in bittersweet mandarin citrus glaze',
        badge: 'Chef Favorite',
        image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80'
      },
      {
        name: 'Artisanal Gelato & Desserts',
        description: 'Velvety Italian gelato scoops, Sizzling Brownies & Biscoff Cheesecakes',
        badge: 'Sweet Ending',
        image: 'https://images.unsplash.com/photo-1567206563064-6f60f4078b57?auto=format&fit=crop&w=600&q=80'
      }
    ]
  }
];

export const AboutSection: React.FC = () => {
  const [activePillarId, setActivePillarId] = useState<string>('international');
  const [isFading, setIsFading] = useState<boolean>(false);

  const handlePillarChange = (id: string) => {
    if (id === activePillarId || isFading) return;
    setIsFading(true);
    setTimeout(() => {
      setActivePillarId(id);
      setIsFading(false);
    }, 120);
  };

  const currentPillar = BRAND_PILLARS.find((p) => p.id === activePillarId) || BRAND_PILLARS[0];

  return (
    <section id="about" className="py-24 bg-[#FAF7F2] text-[#1A1A1A] relative overflow-hidden border-b border-[#E8E4DB]">
      
      {/* Decorative ambient blurred shapes */}
      <div className="absolute top-12 right-[-80px] w-96 h-96 rounded-full bg-[#E8E4DB]/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-[-80px] w-96 h-96 rounded-full bg-[#D1CDBC]/30 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* Header Section Title */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] text-[10px] uppercase tracking-[0.25em] font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Why Mayflower is Special</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#1A1A1A] leading-tight">
            International Taste, Generous Portions <br />
            <span className="italic font-normal text-[#5A5A40]">&amp; A Quaint Botanical Sanctuary</span>
          </h2>
          
          <p className="text-[15px] sm:text-base text-[#4A4A4A] leading-relaxed max-w-2xl mx-auto">
            Discover what makes The Mayflower unique: world-class Italian &amp; Pan-Asian cuisines served in generous portions inside a cozy, bohemian glasshouse setting in Chennai.
          </p>
        </div>

        {/* Interactive Brand Pillar Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {BRAND_PILLARS.map((pillar) => {
            const IconComponent = pillar.tabIcon;
            const isActive = pillar.id === activePillarId;

            return (
              <button
                key={pillar.id}
                onClick={() => handlePillarChange(pillar.id)}
                className={`px-5 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 flex items-center space-x-2.5 cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#2D4030] text-white shadow-md scale-[1.02]'
                    : 'bg-white text-[#5A5A40] border border-[#E8E4DB] hover:border-[#2D4030] hover:text-[#1A1A1A]'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#E8E4DB]' : 'text-[#5A5A40]'}`} />
                <span>{pillar.tabLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Interactive Dynamic Stage Card with Fade Transition */}
        <div className={`rounded-[36px] bg-white border border-[#E8E4DB] shadow-md p-6 sm:p-10 lg:p-12 mb-16 transition-all duration-200 ease-in-out ${
          isFading ? 'opacity-30 scale-[0.99]' : 'opacity-100 scale-100'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center space-x-3">
                <span className="px-3.5 py-1 rounded-full bg-[#FAF7F2] border border-[#E8E4DB] text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]">
                  {currentPillar.tagline}
                </span>
                <span className="text-xs text-[#5A5A40] font-semibold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-[#D97706] text-[#D97706]" />
                  <span>Verified Guest Favorite</span>
                </span>
              </div>

              <h3 className="font-serif text-2xl sm:text-4xl font-normal text-[#1A1A1A] leading-snug">
                {currentPillar.title}
              </h3>

              <p className="text-sm sm:text-base text-[#4A4A4A] leading-relaxed">
                {currentPillar.description}
              </p>

              {/* Bullet Highlights */}
              <div className="space-y-3 pt-2">
                {currentPillar.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-[#2D4030] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-medium text-[#2C3B2E]">
                      {highlight}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quote Card */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E4DB] flex items-start space-x-3.5">
                <Quote className="w-6 h-6 text-[#5A5A40] shrink-0 mt-0.5 opacity-60" />
                <div>
                  <p className="text-xs sm:text-sm italic text-[#333333] font-serif">
                    "{currentPillar.quote.text}"
                  </p>
                  <p className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider mt-1">
                    — {currentPillar.quote.author}
                  </p>
                </div>
              </div>

            </div>

            {/* Right Media & Feature Showcase Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-[28px] overflow-hidden h-72 sm:h-80 shadow-md bg-[#E8E4DB]">
                <img
                  src={currentPillar.image}
                  alt={currentPillar.title}
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] uppercase tracking-wider font-bold text-[#1A1A1A] inline-block mb-1">
                    {currentPillar.tabLabel}
                  </span>
                  <p className="text-sm font-semibold text-white drop-shadow-xs">
                    The Mayflower Dining Sanctuary
                  </p>
                </div>
              </div>

              {/* Feature Cards if present */}
              {currentPillar.features && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {currentPillar.features.map((feat, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E4DB] flex items-center space-x-3">
                      <img src={feat.image} alt={feat.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#E25C38] block">
                          {feat.badge}
                        </span>
                        <h4 className="font-semibold text-xs text-[#1A1A1A] truncate">{feat.name}</h4>
                        <p className="text-[10px] text-[#666666] line-clamp-1">{feat.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Popular Dishes Feature Bar (Panko Chicken, Orange Chicken, Gelato) */}
        <div className="rounded-[32px] bg-[#2D4030] text-[#FAF7F2] p-8 sm:p-10 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 text-[#D1CDBC] text-[10px] uppercase tracking-[0.25em] font-bold">
                <Flame className="w-3.5 h-3.5 text-[#E25C38]" />
                <span>Chennai's Most Popular Menu Items</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-white">
                Crispy Panko Chicken, Orange Chicken &amp; Artisanal Gelato
              </h3>
              <p className="text-xs sm:text-sm text-[#D1CDBC] max-w-xl">
                Tried, tested, and loved by thousands. Explore our complete food menu to taste these legendary creations.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <a
                href="#menu"
                className="px-6 py-3 rounded-full bg-white text-[#1A1A1A] hover:bg-[#FAF7F2] text-xs uppercase tracking-widest font-bold transition-all duration-300 shadow-md inline-flex items-center space-x-2"
              >
                <span>View Full Menu</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
