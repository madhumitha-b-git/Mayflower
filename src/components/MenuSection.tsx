import React, { useState } from 'react';
import { MENU_ITEMS } from '../data/restaurantData';
import { MenuCategoryType } from '../types';
import { Sparkles, Coffee, Leaf, Utensils, ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react';

interface MenuSectionProps {
  onPlanVisit: () => void;
  onRequestCellar: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onPlanVisit, onRequestCellar }) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategoryType>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'chef'>('all');
  const [showAllDishes, setShowAllDishes] = useState<boolean>(false);

  const PDF_MENU_URL = 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-menu.pdf';

  const filteredDishes = MENU_ITEMS.filter((dish) => {
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    const matchesDietary =
      dietaryFilter === 'all' ||
      (dietaryFilter === 'veg' && dish.isVeg) ||
      (dietaryFilter === 'non-veg' && !dish.isVeg) ||
      (dietaryFilter === 'chef' && dish.isChefPick);

    return matchesCategory && matchesDietary;
  });

  const displayedDishes = showAllDishes ? filteredDishes : filteredDishes.slice(0, 8);
  const hasMoreDishes = filteredDishes.length > 8;

  const handleCategoryChange = (key: MenuCategoryType) => {
    setSelectedCategory(key);
    setShowAllDishes(false);
  };

  const handleDietaryChange = (filter: 'all' | 'veg' | 'non-veg' | 'chef') => {
    setDietaryFilter(filter);
    setShowAllDishes(false);
  };

  const categories: { key: MenuCategoryType; label: string }[] = [
    { key: 'all', label: 'All Dishes' },
    { key: 'dim-sum', label: 'Dim Sums' },
    { key: 'starters', label: 'Starters' },
    { key: 'pizza', label: 'Sourdough Pizzas' },
    { key: 'pasta', label: 'Pastas & Ravioli' },
    { key: 'burgers', label: 'Burgers & Club' },
    { key: 'asian-bowls', label: 'Asian Bowls' },
    { key: 'desserts-beverages', label: 'Desserts & Drinks' },
  ];

  return (
    <section id="menu" className="py-24 bg-[#F5F2EC] text-[#1A1A1A] relative border-b border-[#E8E4DB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#5A5A40] font-bold block">
            Our Food Menu
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#1A1A1A]">
            Delicious Dishes <span className="italic font-normal text-[#5A5A40]">Made Fresh</span>
          </h2>
          <p className="text-[15px] text-[#4A4A4A] leading-relaxed">
            From steamed dim sums and wood-fired sourdough pizzas to rich pasta, comfort Asian bowls, monster shakes, and desserts.
          </p>
          <div className="pt-2 flex items-center justify-center">
            <a
              href={PDF_MENU_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-see-full-menu-pdf"
              className="inline-flex items-center space-x-2 px-7 py-3 rounded-full bg-[#FAF7F2] hover:bg-white text-[#1A1A1A] border border-[#D8D4C8] hover:border-[#1A1A1A] text-[11px] uppercase tracking-widest font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#5A5A40]" />
              <span>See Full Menu (PDF)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#5A5A40]" />
            </a>
          </div>
          <div className="w-12 h-[2px] bg-[#5A5A40]/30 mx-auto mt-4" />
        </div>

        {/* Categories Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar space-x-2 pb-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleCategoryChange(cat.key)}
              id={`tab-category-${cat.key}`}
              className={`px-5 py-2.5 rounded-full text-[11px] uppercase tracking-widest font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                selectedCategory === cat.key
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : 'bg-[#FAF7F2] text-[#5A5A40] hover:text-[#1A1A1A] hover:border-[#1A1A1A] border border-[#E8E4DB]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Dietary and Chef Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <button
            onClick={() => handleDietaryChange('all')}
            className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
              dietaryFilter === 'all'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'bg-[#FAF7F2] text-[#4A4A4A] hover:bg-white border border-[#E8E4DB]'
            }`}
          >
            All Items ({MENU_ITEMS.length})
          </button>
          <button
            onClick={() => handleDietaryChange('veg')}
            className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold inline-flex items-center space-x-1.5 transition-all cursor-pointer ${
              dietaryFilter === 'veg'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'bg-[#FAF7F2] text-[#4A4A4A] hover:bg-white border border-[#E8E4DB]'
            }`}
          >
            <Leaf className="w-3 h-3 text-emerald-600" />
            <span>Vegetarian</span>
          </button>
          <button
            onClick={() => handleDietaryChange('non-veg')}
            className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold inline-flex items-center space-x-1.5 transition-all cursor-pointer ${
              dietaryFilter === 'non-veg'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'bg-[#FAF7F2] text-[#4A4A4A] hover:bg-white border border-[#E8E4DB]'
            }`}
          >
            <Utensils className="w-3 h-3 text-red-600" />
            <span>Non-Vegetarian</span>
          </button>
          <button
            onClick={() => handleDietaryChange('chef')}
            className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold inline-flex items-center space-x-1.5 transition-all cursor-pointer ${
              dietaryFilter === 'chef'
                ? 'bg-[#1A1A1A] text-white shadow-sm'
                : 'bg-[#FAF7F2] text-[#4A4A4A] hover:bg-white border border-[#E8E4DB]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Chef’s Specials</span>
          </button>
        </div>

        {/* Dish Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayedDishes.map((dish) => (
            <div
              key={dish.id}
              className="bg-[#FAF7F2] rounded-[28px] overflow-hidden border border-[#E8E4DB] hover:border-[#5A5A40]/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
            >
              {/* Image Container with Badge */}
              <div className="relative h-56 overflow-hidden bg-[#E8E4DB]">
                <img
                  src={dish.image}
                  alt={dish.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                
                <div className="absolute top-3 left-3 flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-[#1A1A1A]/85 backdrop-blur-sm text-[#FAF7F2] text-[10px] uppercase tracking-widest font-semibold">
                    {dish.categoryName || dish.category}
                  </span>
                  {dish.isChefPick && (
                    <span className="px-2.5 py-1 rounded-full bg-[#5A5A40] text-white text-[10px] uppercase tracking-widest font-bold inline-flex items-center space-x-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Popular</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <div
                    className={`w-5 h-5 rounded-sm border-2 flex items-center justify-center bg-white/95 shadow-sm ${
                      dish.isVeg ? 'border-emerald-700' : 'border-red-800'
                    }`}
                    title={dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        dish.isVeg ? 'bg-emerald-600' : 'bg-red-700'
                      }`}
                    />
                  </div>
                </div>

                {dish.portion && (
                  <div className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] text-white/95 font-medium">
                    {dish.portion}
                  </div>
                )}

                {dish.calories && (
                  <div className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white/95">
                    {dish.calories}
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-xl font-medium text-[#1A1A1A] leading-snug group-hover:text-[#5A5A40] transition-colors">
                      {dish.name}
                    </h3>
                    <span className="font-serif text-lg font-semibold text-[#5A5A40] shrink-0 ml-3">
                      ₹{dish.price}
                    </span>
                  </div>

                  <p className="text-sm text-[#4A4A4A] leading-relaxed line-clamp-3">
                    {dish.description}
                  </p>
                </div>

                {/* Dietary details footer */}
                <div className="pt-3 border-t border-[#E8E4DB] flex items-center justify-between text-xs text-[#666666]">
                  <span className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${dish.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                    <span>{dish.isVeg ? '100% Veg' : 'Non-Vegetarian'}</span>
                  </span>
                  <span className="text-[11px] text-[#5A5A40] font-medium">
                    {dish.portion || 'Freshly made'}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Show All / Show Less Toggle Button (reduces initial scroll time) */}
        {hasMoreDishes && (
          <div className="flex flex-col items-center justify-center space-y-3 mb-16 -mt-6">
            <button
              onClick={() => setShowAllDishes((prev) => !prev)}
              id="btn-toggle-show-all-dishes"
              className="px-8 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center space-x-2.5 cursor-pointer group hover:scale-[1.02]"
            >
              <span>
                {showAllDishes
                  ? 'Show Less (First 8 Dishes)'
                  : `Show All (${filteredDishes.length} Dishes)`}
              </span>
              {showAllDishes ? (
                <ChevronUp className="w-4 h-4 text-[#D1CDBC] group-hover:-translate-y-0.5 transition-transform" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#D1CDBC] group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>

            <p className="text-xs text-[#5A5A40] font-medium">
              {showAllDishes
                ? `Showing all ${filteredDishes.length} dishes in this category`
                : `Showing 8 of ${filteredDishes.length} dishes • Click "Show All" to view full selection`}
            </p>
          </div>
        )}

        {/* Drinks, Shakes & Desserts Callout Box */}
        <div className="rounded-[36px] bg-[#1A1A1A] text-[#FAF7F2] p-8 sm:p-12 shadow-xl border border-[#E8E4DB]/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-[#D1CDBC] font-bold">
              <Coffee className="w-4 h-4" />
              <span>Beverages & Desserts Menu</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal leading-snug">
              Monster Shakes, Fresh Coolers, Artisanal Coffees & Sweet Treats
            </h3>
            <p className="text-sm text-[#FAF7F2]/80 leading-relaxed">
              Pair your meal with our famous Salted Caramel Monster Shake, Lotus Biscoff Cheesecake, Sizzling Brownies, Cold Brews, and refreshing coolers.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={onRequestCellar}
              id="btn-view-drinks-menu"
              className="px-7 py-3.5 rounded-full bg-[#FAF7F2] hover:bg-[#E8E4DB] text-[#1A1A1A] text-[11px] uppercase tracking-widest font-bold transition-colors shadow-md cursor-pointer"
            >
              View Drinks & Desserts
            </button>
            <button
              onClick={onPlanVisit}
              id="btn-reserve-table-menu-banner"
              className="px-7 py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#4A4A30] text-white text-[11px] uppercase tracking-widest font-bold transition-colors shadow-md cursor-pointer"
            >
              Reserve a Table
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
