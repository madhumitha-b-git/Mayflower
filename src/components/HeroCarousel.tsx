import React, { useState, useEffect, useRef } from 'react';
import { HERO_SLIDES } from '../data/restaurantData';
import { ChevronLeft, ChevronRight, Sparkles, Calendar, Play, Pause } from 'lucide-react';

interface HeroCarouselProps {
  onPlanVisit: () => void;
  onExploreMenu: () => void;
}

const SLIDE_DURATION = 3800; // 3.8s for lively autonomous motion picture effect

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onPlanVisit, onExploreMenu }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalSlides = HERO_SLIDES.length;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
    setProgress(0);
  };

  // Preload all high-res images so transitions are instant
  useEffect(() => {
    HERO_SLIDES.forEach((slide) => {
      const img = new Image();
      img.src = slide.image;
    });
  }, []);

  // Autonomous timer with progress bar (does not stop on mouse hover)
  useEffect(() => {
    if (isManuallyPaused) return;

    const interval = 50; // update progress every 50ms
    const step = (interval / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % totalSlides);
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isManuallyPaused, totalSlides]);

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <section
      id="hero"
      className="relative w-full h-[80vh] min-h-[580px] max-h-[820px] overflow-hidden bg-black text-white flex items-center justify-center select-none"
    >
      {/* Background Images with Continuous Autonomous Motion Picture Animation */}
      {HERO_SLIDES.map((slide, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-center brightness-115 saturate-[1.12] contrast-[1.04] transform transition-transform duration-[4500ms] ease-out ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
            />
            {/* Subtle soft gradient only at top and bottom edges - keeping the food bright and appetizing */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />
          </div>
        );
      })}

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center justify-center space-y-6">
        {/* Subtitle / Kicker */}
        <span className="text-[11px] sm:text-[13px] uppercase tracking-[0.3em] sm:tracking-[0.35em] text-[#FAF7F2] font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
          {currentSlide.subtitle || 'UNCOVER CULINARY WONDERS'}
        </span>

        {/* Main Display Headline with smooth fade key */}
        <h1
          key={`title-${currentIndex}`}
          className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-normal leading-[1.08] tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] max-w-4xl transition-all duration-700 animate-fadeIn"
        >
          {currentSlide.title}{' '}
          <span className="italic font-normal block sm:inline text-white">
            {currentSlide.accent}
          </span>
        </h1>

        {/* Action Buttons */}
        <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onExploreMenu}
            id="hero-see-our-menu-btn"
            className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-lg sm:rounded-xl bg-[#FAF7F2] hover:bg-white text-[#1A1A1A] border border-[#E8E4DB] text-[11px] sm:text-xs uppercase tracking-widest font-bold shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>SEE OUR MENU</span>
          </button>

          <button
            onClick={onPlanVisit}
            id="hero-reserve-table-btn"
            className="px-8 sm:px-9 py-3.5 sm:py-4 rounded-lg sm:rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/60 text-[11px] sm:text-xs uppercase tracking-widest font-bold shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer flex items-center space-x-2"
          >
            <Calendar className="w-3.5 h-3.5 text-white/90" />
            <span>RESERVE A TABLE</span>
          </button>
        </div>

        {/* Autonomous Motion Picture Indicator */}
        <div className="pt-3 sm:pt-5 flex items-center space-x-3 text-[10px] uppercase tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <span className="w-2 h-2 rounded-full bg-[#56B3A8] animate-ping" />
          <span>{currentSlide.tag || 'The Mayflower Chennai'}</span>
          <button
            onClick={() => setIsManuallyPaused(!isManuallyPaused)}
            className="ml-2 p-1 rounded-full bg-white/20 hover:bg-white/40 text-white cursor-pointer transition-colors"
            title={isManuallyPaused ? 'Play Slideshow' : 'Pause Slideshow'}
          >
            {isManuallyPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* Navigation Arrow Controls */}
      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/30 hover:bg-black/60 border border-white/25 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/30 hover:bg-black/60 border border-white/25 backdrop-blur-sm text-white flex items-center justify-center transition-all cursor-pointer hover:scale-110"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Autonomous Motion Picture Progress Indicator Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2.5">
        {HERO_SLIDES.map((_, dotIdx) => {
          const isActive = dotIdx === currentIndex;
          return (
            <button
              key={dotIdx}
              onClick={() => {
                setCurrentIndex(dotIdx);
                setProgress(0);
              }}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className="relative h-2 w-10 sm:w-12 rounded-full overflow-hidden bg-white/30 cursor-pointer"
            >
              {isActive && (
                <div
                  className="h-full bg-[#56B3A8] transition-all duration-75 ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
