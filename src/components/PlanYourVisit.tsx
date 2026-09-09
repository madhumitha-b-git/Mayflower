import React, { useState, useEffect } from 'react';
import { ReservationState, RestaurantTable, DiningExperienceType, SeatingAreaType } from '../types';
import { OUTLETS, RESTAURANT_TABLES, TIME_SLOTS } from '../data/restaurantData';
import { 
  Calendar, Users, Sparkles, MapPin, Clock, ArrowRight, ArrowLeft, 
  CheckCircle2, AlertCircle, Heart, Download, RefreshCw, X, Shield, 
  Compass, Utensils
} from 'lucide-react';

import { UserProfile, UserReservationRecord } from '../types';
import { addReservationForCurrentUser } from '../lib/authService';
import { getStoredTables, reserveTableForCustomer } from '../data/tableStorage';
import { sendReservationConfirmationEmail } from '../data/emailService';

interface PlanYourVisitProps {
  initialOutlet?: string;
  currentUser?: UserProfile | null;
  onUpdateUser?: (user: UserProfile) => void;
  onRequestSignIn: () => void;
  onBackToWebsite: () => void;
}

const DIETARY_OPTIONS = [
  'Standard / No Restrictions',
  'Vegetarian',
  'Vegan',
  'Jain Friendly',
  'Gluten-Free',
  'Nut Allergy',
  'Eggless',
  'No Onion & Garlic',
  'Dairy-Free'
];

const OCCASION_OPTIONS = [
  'Casual Dining',
  'Birthday Celebration',
  'Anniversary',
  'Romantic Date',
  'Family Gathering',
  'Business Meal',
  'Special Milestone'
];

export const PlanYourVisit: React.FC<PlanYourVisitProps> = ({ 
  initialOutlet = 'Poes Garden',
  currentUser,
  onUpdateUser,
  onRequestSignIn,
  onBackToWebsite 
}) => {
  // Reservation wizard state
  const [reservation, setReservation] = useState<ReservationState>({
    step: 1,
    selectedOutlet: initialOutlet,
    date: new Date().toISOString().split('T')[0],
    dateLabel: 'Tonight',
    guests: 2,
    guestLabel: '2 Guests (Couple / Pair)',
    experience: 'Dinner',
    seatingArea: 'Garden',
    selectedTable: null,
    timeSlot: '7:30 PM',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    dietaryPreferences: 'Standard / No Restrictions',
    specialOccasion: 'Casual Dining',
    specialNotes: '',
    bookingCode: `MF-${Math.floor(1000 + Math.random() * 9000)}`
  });

  const [hoveredSpace, setHoveredSpace] = useState<SeatingAreaType | null>(null);
  const [showSavedBookings, setShowSavedBookings] = useState(false);
  const [savedBookingsList, setSavedBookingsList] = useState<any[]>([]);
  const [liveTables, setLiveTables] = useState<RestaurantTable[]>([]);

  useEffect(() => {
    setLiveTables(getStoredTables());
  }, [reservation.step]);

  const loadSavedBookings = () => {
    setSavedBookingsList(currentUser?.reservations ?? []);
  };

  // Helper date generators
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + ((7 - today.getDay() + 5) % 7 || 7));

  const formatDateString = (d: Date) => d.toISOString().split('T')[0];
  const formatDisplayDate = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Navigation between steps
  const goToStep = (stepNumber: number) => {
    if (stepNumber < 1) stepNumber = 1;
    if (stepNumber > 8) stepNumber = 8;
    setReservation((prev) => ({ ...prev, step: stepNumber }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Pre-filter tables based on current chosen area using live stored tables
  const currentTablesList = liveTables.length > 0 ? liveTables : RESTAURANT_TABLES;
  const tablesInArea = currentTablesList.filter(
    (t) => t.area === reservation.seatingArea
  );

  // Step 1: Date selection
  const selectDate = (dateVal: string, label: string) => {
    setReservation((prev) => ({
      ...prev,
      date: dateVal,
      dateLabel: label,
      step: 2
    }));
  };

  // Step 2: Guest count selection
  const selectGuests = (count: number) => {
    let label = `${count} Guests`;
    if (count === 1) label = '1 Guest (Solo Journey)';
    else if (count === 2) label = '2 Guests (Intimate / Couple)';
    else if (count === 4) label = '4 Guests (Family / Friends)';
    else if (count >= 6) label = `${count}+ Guests (Gathering)`;

    setReservation((prev) => ({
      ...prev,
      guests: count,
      guestLabel: label,
      step: 3
    }));
  };

  // Step 3: Experience selection
  const selectExperience = (exp: DiningExperienceType) => {
    // Default time based on experience
    const defaultTime = exp === 'Lunch' ? '1:00 PM' : '7:30 PM';
    setReservation((prev) => ({
      ...prev,
      experience: exp,
      timeSlot: defaultTime,
      step: 4
    }));
  };

  // Step 4: Space selection
  const selectSpace = (space: SeatingAreaType) => {
    setReservation((prev) => ({
      ...prev,
      seatingArea: space,
      selectedTable: null, // reset table when space changes
      step: 5
    }));
  };

  // Step 5: Table selection
  const selectTable = (table: RestaurantTable) => {
    if (!table.isAvailable) return;
    setReservation((prev) => ({
      ...prev,
      selectedTable: table,
      step: 6
    }));
  };

  // Step 6: Time selection
  const selectTime = (time: string) => {
    setReservation((prev) => ({
      ...prev,
      timeSlot: time,
      step: 7
    }));
  };

  // Step 7: Final confirmation submission
  const handleConfirmReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequestSignIn();
      return;
    }
    if (!reservation.guestName || !reservation.guestPhone) {
      alert('Please provide your name and phone number for the reservation confirmation.');
      return;
    }
    const code = `MF-${Math.floor(2000 + Math.random() * 7000)}`;
    // Lock table status in tableStorage if a table was chosen
    if (reservation.selectedTable) {
      reserveTableForCustomer(
        reservation.selectedTable.id,
        code,
        reservation.guestName,
        reservation.guestPhone,
        reservation.timeSlot,
        reservation.guests,
        reservation.dietaryPreferences,
        reservation.specialOccasion
      );
      setLiveTables(getStoredTables());
    }

    const newRecord: UserReservationRecord = {
      id: `res-${Date.now()}`,
      bookingCode: code,
      outlet: reservation.selectedOutlet,
      date: reservation.date,
      timeSlot: reservation.timeSlot,
      guests: reservation.guests,
      seatingArea: reservation.seatingArea,
      status: 'Confirmed',
      bookedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    const result = await addReservationForCurrentUser(currentUser, newRecord);
    if (!result.success || !result.user) {
      alert(result.message || 'We could not save your reservation. Please try again.');
      return;
    }
    onUpdateUser?.(result.user);
    if (currentUser.email) {
      sendReservationConfirmationEmail(currentUser.email, currentUser.name, newRecord);
    }

    setReservation((prev) => ({
      ...prev,
      bookingCode: code,
      step: 8
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calendar invite generator (.ics download)
  const downloadCalendarInvite = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Mayflower Restaurant//Reservation Desk//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Dining at Mayflower (${reservation.selectedOutlet})`,
      `DESCRIPTION:Table Reservation at Mayflower Sanctuary (${reservation.bookingCode}). Area: ${reservation.seatingArea} - ${reservation.selectedTable?.name || 'Selected Table'}. Experience: ${reservation.experience}. Dietary: ${reservation.dietaryPreferences}. Occasion: ${reservation.specialOccasion}.`,
      `LOCATION:Mayflower ${reservation.selectedOutlet}, Chennai`,
      `DTSTART:${reservation.date.replace(/-/g, '')}T190000Z`,
      `DTEND:${reservation.date.replace(/-/g, '')}T213000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Mayflower_Reservation_${reservation.bookingCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Steps breadcrumb
  const stepsList = [
    { num: 1, title: 'Date' },
    { num: 2, title: 'Guests' },
    { num: 3, title: 'Experience' },
    { num: 4, title: 'Space' },
    { num: 5, title: 'Table' },
    { num: 6, title: 'Time' },
    { num: 7, title: 'Summary' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Top Header Bar inside Desk */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-[#E8E4DB]">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToWebsite}
              className="p-2.5 rounded-full bg-[#F5F1EB] hover:bg-[#E8E4DB] text-[#1A1A1A] transition-colors cursor-pointer border border-[#E8E4DB]"
              title="Return to Main Restaurant Sanctuary"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 border border-[#E8E4DB] shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
              <img
                src="/mayflower-logo.png"
                alt="The Mayflower"
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#5A5A40] font-bold">
                  Digital Concierge
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40]"></span>
                <span className="text-[11px] text-[#5A5A40] font-medium">Live Sanctuary Desk</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-4xl font-normal text-[#1A1A1A]">
                Plan Your Visit to <span className="italic font-normal text-[#5A5A40]">Mayflower</span>
              </h1>
            </div>
          </div>

          {/* Sanctuary Outlet Switcher & Saved Bookings */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                loadSavedBookings();
                setShowSavedBookings(true);
              }}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF7F2] hover:bg-[#E8E4DB] border border-[#E8E4DB] text-xs font-semibold text-[#1A1A1A] transition-colors flex items-center space-x-1.5 cursor-pointer shadow-sm"
              title="View your saved table bookings on this device"
            >
              <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>My Bookings</span>
            </button>

            <div className="flex items-center space-x-2 bg-[#F5F1EB] p-1.5 rounded-full border border-[#E8E4DB] text-xs">
              <span className="pl-3 pr-1 text-[#5A5A40] font-medium flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="hidden md:inline">Sanctuary:</span>
              </span>
              <select
                value={reservation.selectedOutlet}
                onChange={(e) => setReservation((prev) => ({ ...prev, selectedOutlet: e.target.value }))}
                className="bg-white px-3 py-1.5 rounded-full font-semibold text-[#1A1A1A] border border-[#E8E4DB] focus:outline-none focus:border-[#5A5A40] cursor-pointer"
              >
                {OUTLETS.map((o) => (
                  <option key={o.id} value={o.name}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <>
            {/* Multi-Step Progress Tracker Bar (Steps 1 to 7) */}
            {reservation.step <= 7 && (
          <div className="mb-10">
            <div className="overflow-x-auto no-scrollbar pb-2">
              <div className="flex items-center justify-between min-w-[620px] text-xs">
                {stepsList.map((st) => {
                  const isCurrent = reservation.step === st.num;
                  const isCompleted = reservation.step > st.num;
                  return (
                    <button
                      key={st.num}
                      onClick={() => isCompleted && goToStep(st.num)}
                      disabled={!isCompleted && !isCurrent}
                      className={`flex items-center space-x-2 py-2 px-3.5 rounded-full transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#5A5A40] text-white font-bold shadow-sm'
                          : isCompleted
                          ? 'text-[#1A1A1A] hover:bg-[#F5F1EB] font-medium'
                          : 'text-[#8A8A78]/60 cursor-not-allowed'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-white text-[#5A5A40]'
                            : isCompleted
                            ? 'bg-[#1A1A1A] text-white'
                            : 'bg-[#E8E4DB] text-[#5A5A40]'
                        }`}
                      >
                        {isCompleted ? '✓' : `0${st.num}`}
                      </span>
                      <span className="uppercase tracking-wider text-[11px]">{st.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Progress line */}
            <div className="w-full bg-[#E8E4DB] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#5A5A40] h-full transition-all duration-500 rounded-full"
                style={{ width: `${(Math.min(reservation.step, 7) / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* DUAL COLUMN RESERVATION WORKSPACE */}
        {reservation.step <= 7 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Concierge Guidance & Real-Time Dossier Summary */}
            <div className="lg:col-span-4 bg-[#F5F1EB] rounded-[32px] p-6 sm:p-8 border border-[#E8E4DB] space-y-6">
              
              {/* Host Persona Note */}
              <div className="flex items-center space-x-3 pb-4 border-b border-[#E8E4DB]">
                <div className="w-11 h-11 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-serif text-lg font-bold shrink-0">
                  M
                </div>
                <div>
                  <h4 className="text-sm font-serif font-semibold text-[#1A1A1A]">
                    Mayflower Concierge Desk
                  </h4>
                  <p className="text-xs text-[#5A5A40]">
                    Crafting your bespoke dining table
                  </p>
                </div>
              </div>

              {/* Conversational Prompt Box */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E4DB] text-xs text-[#4A4A4A] leading-relaxed">
                {reservation.step === 1 && (
                  <p>
                    "Welcome. Let us begin with your preferred date. We prepare our fresh morning harvests and pastry ferments according to each evening's seating."
                  </p>
                )}
                {reservation.step === 2 && (
                  <p>
                    "Wonderful. How many guests will be gathering at your table? We accommodate solo diners, intimate couples, and grand celebration banquets."
                  </p>
                )}
                {reservation.step === 3 && (
                  <p>
                    "Each moment of the day carries its own mood at Mayflower. Select whether you are joining us for a leisurely lunch, dinner, or a milestone celebration."
                  </p>
                )}
                {reservation.step === 4 && (
                  <p>
                    "Where would you feel most at ease? Explore our garden pavilion, sunlit arched verandas, central brass dining salon, or private jasmine suite."
                  </p>
                )}
                {reservation.step === 5 && (
                  <p>
                    "Here are the tables prepared in the {reservation.seatingArea}. Review the seating notes to select your favorite view and ambiance."
                  </p>
                )}
                {reservation.step === 6 && (
                  <p>
                    "At what hour should our team have your table warm and awaiting your arrival?"
                  </p>
                )}
                {reservation.step === 7 && (
                  <p>
                    "Review your booking summary below. Share your contact details and dietary notes so our chef and sommelier can prepare for your visit."
                  </p>
                )}
              </div>

              {/* Real-time Ledger Summary */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                  Your Table Dossier
                </span>

                <div className="space-y-2 text-xs">
                  {/* Outlet */}
                  <div className="flex items-center justify-between py-1.5 border-b border-[#E8E4DB]">
                    <span className="text-[#5A5A40]">Sanctuary</span>
                    <span className="font-semibold text-[#1A1A1A]">{reservation.selectedOutlet}</span>
                  </div>

                  {/* Date */}
                  {reservation.step > 1 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-[#E8E4DB]">
                      <span className="text-[#5A5A40]">Date</span>
                      <button
                        onClick={() => goToStep(1)}
                        className="font-semibold text-[#1A1A1A] hover:text-[#5A5A40] hover:underline cursor-pointer"
                      >
                        {reservation.dateLabel} ({reservation.date})
                      </button>
                    </div>
                  )}

                  {/* Guests */}
                  {reservation.step > 2 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-[#E8E4DB]">
                      <span className="text-[#5A5A40]">Guests</span>
                      <button
                        onClick={() => goToStep(2)}
                        className="font-semibold text-[#1A1A1A] hover:text-[#5A5A40] hover:underline cursor-pointer"
                      >
                        {reservation.guestLabel}
                      </button>
                    </div>
                  )}

                  {/* Experience */}
                  {reservation.step > 3 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-[#E8E4DB]">
                      <span className="text-[#5A5A40]">Experience</span>
                      <button
                        onClick={() => goToStep(3)}
                        className="font-semibold text-[#1A1A1A] hover:text-[#5A5A40] hover:underline cursor-pointer"
                      >
                        {reservation.experience} Dining
                      </button>
                    </div>
                  )}

                  {/* Seating Space */}
                  {reservation.step > 4 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-[#E8E4DB]">
                      <span className="text-[#5A5A40]">Space</span>
                      <button
                        onClick={() => goToStep(4)}
                        className="font-semibold text-[#1A1A1A] hover:text-[#5A5A40] hover:underline cursor-pointer"
                      >
                        {reservation.seatingArea}
                      </button>
                    </div>
                  )}

                  {/* Table Selection */}
                  {reservation.step > 5 && reservation.selectedTable && (
                    <div className="flex items-center justify-between py-1.5 border-b border-[#E8E4DB]">
                      <span className="text-[#5A5A40]">Table</span>
                      <button
                        onClick={() => goToStep(5)}
                        className="font-semibold text-[#1A1A1A] hover:text-[#5A5A40] hover:underline cursor-pointer"
                      >
                        {reservation.selectedTable.name} ({reservation.selectedTable.seats} seats)
                      </button>
                    </div>
                  )}

                  {/* Time Slot */}
                  {reservation.step > 6 && (
                    <div className="flex items-center justify-between py-1.5 border-b border-[#E8E4DB]">
                      <span className="text-[#5A5A40]">Time</span>
                      <button
                        onClick={() => goToStep(6)}
                        className="font-semibold text-[#1A1A1A] hover:text-[#5A5A40] hover:underline cursor-pointer"
                      >
                        {reservation.timeSlot}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-2 text-[11px] text-[#5A5A40] space-y-1">
                <p className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                  <span>Tables held for 15 minutes past reservation time</span>
                </p>
                <p className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5A5A40] shrink-0" />
                  <span>No cancellation fees up to 2 hours prior</span>
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN: Interactive Decision Workspace */}
            <div className="lg:col-span-8 bg-[#FAF7F2] rounded-[36px] p-6 sm:p-10 border border-[#E8E4DB] shadow-sm min-h-[500px] flex flex-col justify-between">
              
              <div>
                {/* STEP 1: DATE DECISION */}
                {reservation.step === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                        Step 01 of 07
                      </span>
                      <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
                        When would you like to join us?
                      </h2>
                      <p className="text-sm text-[#4A4A4A] mt-1">
                        Select an evening or afternoon, or pick a custom date on our calendar.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Today Option */}
                      <button
                        onClick={() => selectDate(formatDateString(today), 'Tonight')}
                        className="p-6 rounded-[24px] bg-[#F5F1EB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white text-left transition-all duration-300 border border-[#E8E4DB] group cursor-pointer"
                      >
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] group-hover:text-[#D1CDBC] block mb-1">
                          Immediate Table
                        </span>
                        <h4 className="font-serif text-2xl font-medium">Tonight</h4>
                        <p className="text-xs text-[#4A4A4A] group-hover:text-white/80 mt-1">
                          {formatDisplayDate(today)}
                        </p>
                      </button>

                      {/* Tomorrow Option */}
                      <button
                        onClick={() => selectDate(formatDateString(tomorrow), 'Tomorrow')}
                        className="p-6 rounded-[24px] bg-[#F5F1EB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white text-left transition-all duration-300 border border-[#E8E4DB] group cursor-pointer"
                      >
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] group-hover:text-[#D1CDBC] block mb-1">
                          Next Evening
                        </span>
                        <h4 className="font-serif text-2xl font-medium">Tomorrow</h4>
                        <p className="text-xs text-[#4A4A4A] group-hover:text-white/80 mt-1">
                          {formatDisplayDate(tomorrow)}
                        </p>
                      </button>

                      {/* This Weekend Option */}
                      <button
                        onClick={() => selectDate(formatDateString(nextFriday), 'Upcoming Weekend')}
                        className="p-6 rounded-[24px] bg-[#F5F1EB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white text-left transition-all duration-300 border border-[#E8E4DB] group cursor-pointer"
                      >
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40] group-hover:text-[#D1CDBC] block mb-1">
                          Leisure Weekend
                        </span>
                        <h4 className="font-serif text-2xl font-medium">This Weekend</h4>
                        <p className="text-xs text-[#4A4A4A] group-hover:text-white/80 mt-1">
                          {formatDisplayDate(nextFriday)}
                        </p>
                      </button>
                    </div>

                    {/* Custom Calendar Date Selector */}
                    <div className="pt-4 border-t border-[#E8E4DB]">
                      <label className="block text-[10px] uppercase tracking-wider text-[#5A5A40] font-bold mb-2">
                        Or Choose a Specific Date
                      </label>
                      <div className="flex items-center space-x-3 max-w-sm">
                        <input
                          type="date"
                          min={formatDateString(today)}
                          value={reservation.date}
                          onChange={(e) => {
                            const d = new Date(e.target.value);
                            selectDate(e.target.value, formatDisplayDate(d));
                          }}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8E4DB] text-sm font-semibold text-[#1A1A1A] focus:outline-none focus:border-[#5A5A40]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: GUESTS DECISION */}
                {reservation.step === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                        Step 02 of 07
                      </span>
                      <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
                        Table Party Size
                      </h2>
                      <p className="text-sm text-[#4A4A4A] mt-1">
                        How many guests will be joining this experience?
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { count: 1, label: 'Solo Table', sub: '1 Guest' },
                        { count: 2, label: 'Pair / Couple', sub: '2 Guests' },
                        { count: 3, label: 'Trio', sub: '3 Guests' },
                        { count: 4, label: 'Quartet', sub: '4 Guests' },
                        { count: 5, label: 'Quintet', sub: '5 Guests' },
                        { count: 6, label: 'Celebration', sub: '6 Guests' },
                        { count: 8, label: 'Private Suite', sub: '8 Guests' },
                        { count: 10, label: 'Banquet Loft', sub: '10+ Guests' }
                      ].map((item) => (
                        <button
                          key={item.count}
                          onClick={() => selectGuests(item.count)}
                          className={`p-5 rounded-[20px] text-center transition-all duration-200 border cursor-pointer ${
                            reservation.guests === item.count
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                              : 'bg-[#F5F1EB] text-[#1A1A1A] hover:border-[#5A5A40] border-[#E8E4DB]'
                          }`}
                        >
                          <span className="font-serif text-3xl font-semibold block">{item.count}</span>
                          <span className="text-xs font-semibold block mt-1">{item.label}</span>
                          <span className="text-[11px] opacity-75 block">{item.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3: EXPERIENCE DECISION */}
                {reservation.step === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                        Step 03 of 07
                      </span>
                      <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
                        Select Your Dining Experience
                      </h2>
                      <p className="text-sm text-[#4A4A4A] mt-1">
                        Choose the tempo and occasion for your visit.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Lunch */}
                      <button
                        onClick={() => selectExperience('Lunch')}
                        className="p-6 rounded-[24px] bg-[#F5F1EB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white text-left transition-all duration-300 border border-[#E8E4DB] group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white text-[#5A5A40] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center mb-4">
                          <Utensils className="w-5 h-5" />
                        </div>
                        <h4 className="font-serif text-2xl font-medium">Sunlit Lunch</h4>
                        <p className="text-xs text-[#4A4A4A] group-hover:text-white/80 mt-2 leading-relaxed">
                          Natural light, chilled botanical spritzes, vibrant salads, and wood-fired mains (12:00 PM – 3:30 PM).
                        </p>
                      </button>

                      {/* Dinner */}
                      <button
                        onClick={() => selectExperience('Dinner')}
                        className="p-6 rounded-[24px] bg-[#F5F1EB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white text-left transition-all duration-300 border border-[#E8E4DB] group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white text-[#5A5A40] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center mb-4">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <h4 className="font-serif text-2xl font-medium">Candlelit Dinner</h4>
                        <p className="text-xs text-[#4A4A4A] group-hover:text-white/80 mt-2 leading-relaxed">
                          Ambient brass glow, sommelier cellar pairings, robata cuts, and slow evening courses (6:30 PM – 11:30 PM).
                        </p>
                      </button>

                      {/* Celebration */}
                      <button
                        onClick={() => selectExperience('Celebration')}
                        className="p-6 rounded-[24px] bg-[#F5F1EB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white text-left transition-all duration-300 border border-[#E8E4DB] group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white text-[#5A5A40] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center mb-4">
                          <Heart className="w-5 h-5" />
                        </div>
                        <h4 className="font-serif text-2xl font-medium">Milestone Celebration</h4>
                        <p className="text-xs text-[#4A4A4A] group-hover:text-white/80 mt-2 leading-relaxed">
                          Birthdays, anniversaries, or achievements. Includes personalized menus and handcrafted table florals.
                        </p>
                      </button>

                      {/* Casual Dining */}
                      <button
                        onClick={() => selectExperience('Casual')}
                        className="p-6 rounded-[24px] bg-[#F5F1EB] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white text-left transition-all duration-300 border border-[#E8E4DB] group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white text-[#5A5A40] group-hover:bg-white/20 group-hover:text-white flex items-center justify-center mb-4">
                          <Compass className="w-5 h-5" />
                        </div>
                        <h4 className="font-serif text-2xl font-medium">High Tea & Grazing</h4>
                        <p className="text-xs text-[#4A4A4A] group-hover:text-white/80 mt-2 leading-relaxed">
                          Single-origin coffees, French choux, artisanal mezze boards, and relaxed conversations.
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: CHOOSE YOUR SPACE (FLOOR PLAN) */}
                {reservation.step === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                        Step 04 of 07
                      </span>
                      <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
                        Choose Your Sanctuary Space
                      </h2>
                      <p className="text-sm text-[#4A4A4A] mt-1">
                        Select where in {reservation.selectedOutlet} you wish to be seated.
                      </p>
                    </div>

                    {/* Interactive Architectural Floor Plan Map */}
                    <div className="p-4 bg-[#F5F1EB] rounded-[28px] border border-[#E8E4DB]">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] mb-3 flex items-center justify-between">
                        <span>Sanctuary Floor Layout</span>
                        <span>Click an area to choose</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Space 1: Garden */}
                        <div
                          onClick={() => selectSpace('Garden')}
                          onMouseEnter={() => setHoveredSpace('Garden')}
                          onMouseLeave={() => setHoveredSpace(null)}
                          className={`p-6 rounded-[20px] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                            reservation.seatingArea === 'Garden'
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                              : 'bg-white text-[#1A1A1A] hover:border-[#5A5A40] border-[#E8E4DB]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]">
                                Alfresco Haven
                              </span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8E4DB] text-[#5A5A40] font-bold">
                                4 Tables
                              </span>
                            </div>
                            <h4 className="font-serif text-xl font-semibold mb-1">🌿 Garden Terrace</h4>
                            <p className={`text-xs leading-relaxed ${
                              reservation.seatingArea === 'Garden' ? 'text-white/80' : 'text-[#4A4A4A]'
                            }`}>
                              Surrounded by rain trees, night jasmine, and natural stone lotus fountains. Uncovered breeze dining.
                            </p>
                          </div>
                          <div className="pt-4 mt-4 border-t border-current/10 text-xs flex items-center justify-between font-semibold">
                            <span>Select Garden</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Space 2: Window Veranda */}
                        <div
                          onClick={() => selectSpace('Window')}
                          onMouseEnter={() => setHoveredSpace('Window')}
                          onMouseLeave={() => setHoveredSpace(null)}
                          className={`p-6 rounded-[20px] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                            reservation.seatingArea === 'Window'
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                              : 'bg-white text-[#1A1A1A] hover:border-[#5A5A40] border-[#E8E4DB]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]">
                                Panoramic Glass
                              </span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8E4DB] text-[#5A5A40] font-bold">
                                3 Tables
                              </span>
                            </div>
                            <h4 className="font-serif text-xl font-semibold mb-1">🪟 Arched Window Veranda</h4>
                            <p className={`text-xs leading-relaxed ${
                              reservation.seatingArea === 'Window' ? 'text-white/80' : 'text-[#4A4A4A]'
                            }`}>
                              Sunlit arched glass conservatory overlooking manicured lawns. Climate-controlled with natural views.
                            </p>
                          </div>
                          <div className="pt-4 mt-4 border-t border-current/10 text-xs flex items-center justify-between font-semibold">
                            <span>Select Window Veranda</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Space 3: Main Dining */}
                        <div
                          onClick={() => selectSpace('Main Dining')}
                          onMouseEnter={() => setHoveredSpace('Main Dining')}
                          onMouseLeave={() => setHoveredSpace(null)}
                          className={`p-6 rounded-[20px] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                            reservation.seatingArea === 'Main Dining'
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                              : 'bg-white text-[#1A1A1A] hover:border-[#5A5A40] border-[#E8E4DB]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]">
                                Heart of Sanctuary
                              </span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8E4DB] text-[#5A5A40] font-bold">
                                4 Tables
                              </span>
                            </div>
                            <h4 className="font-serif text-xl font-semibold mb-1">🍽 Main Brass Salon</h4>
                            <p className={`text-xs leading-relaxed ${
                              reservation.seatingArea === 'Main Dining' ? 'text-white/80' : 'text-[#4A4A4A]'
                            }`}>
                              Warm teak wood, hand-beaten brass dome, view of the robata hearth, and curated acoustic jazz soundtrack.
                            </p>
                          </div>
                          <div className="pt-4 mt-4 border-t border-current/10 text-xs flex items-center justify-between font-semibold">
                            <span>Select Main Salon</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Space 4: Private Jasmine Space */}
                        <div
                          onClick={() => selectSpace('Private Space')}
                          onMouseEnter={() => setHoveredSpace('Private Space')}
                          onMouseLeave={() => setHoveredSpace(null)}
                          className={`p-6 rounded-[20px] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                            reservation.seatingArea === 'Private Space'
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                              : 'bg-white text-[#1A1A1A] hover:border-[#5A5A40] border-[#E8E4DB]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase tracking-widest font-bold text-[#5A5A40]">
                                Exclusive Salon
                              </span>
                              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#E8E4DB] text-[#5A5A40] font-bold">
                                2 Suites
                              </span>
                            </div>
                            <h4 className="font-serif text-xl font-semibold mb-1">Private Jasmine Space</h4>
                            <p className={`text-xs leading-relaxed ${
                              reservation.seatingArea === 'Private Space' ? 'text-white/80' : 'text-[#4A4A4A]'
                            }`}>
                              Enclosed heritage room with botanical frescoes, private butler service, and personalized sommelier flights.
                            </p>
                          </div>
                          <div className="pt-4 mt-4 border-t border-current/10 text-xs flex items-center justify-between font-semibold">
                            <span>Select Private Space</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: AVAILABLE TABLES SELECTION */}
                {reservation.step === 5 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                        Step 05 of 07
                      </span>
                      <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
                        Choose Your Table in {reservation.seatingArea}
                      </h2>
                      <p className="text-sm text-[#4A4A4A] mt-1">
                        Visual seating map: available tables are ready to reserve for your party.
                      </p>
                    </div>

                    {/* Table Status Legend */}
                    <div className="flex items-center space-x-6 text-xs text-[#4A4A4A] pb-2 border-b border-[#E8E4DB]">
                      <span className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#5A5A40]"></span>
                        <span>Available Table</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#1A1A1A]"></span>
                        <span>Selected Table</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#E8E4DB]"></span>
                        <span>Reserved by Guest</span>
                      </span>
                    </div>

                    {/* Table Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {tablesInArea.map((table) => {
                        const isSelected = reservation.selectedTable?.id === table.id;
                        return (
                          <div
                            key={table.id}
                            onClick={() => table.isAvailable && selectTable(table)}
                            className={`p-6 rounded-[20px] border transition-all duration-200 flex flex-col justify-between ${
                              !table.isAvailable
                                ? 'bg-[#E8E4DB]/40 border-[#E8E4DB] opacity-50 cursor-not-allowed'
                                : isSelected
                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                                : 'bg-white hover:border-[#5A5A40] border-[#E8E4DB] cursor-pointer shadow-sm'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <span
                                    className={`w-3.5 h-3.5 rounded-full ${
                                      !table.isAvailable
                                        ? 'bg-[#E8E4DB]'
                                        : isSelected
                                        ? 'bg-white'
                                        : 'bg-[#5A5A40]'
                                    }`}
                                  />
                                  <h4 className="font-serif text-lg font-bold">
                                    {table.name}
                                  </h4>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-[#F5F1EB] text-[#1A1A1A] font-semibold">
                                  {table.seats} Seats
                                </span>
                              </div>

                              <p className={`text-xs font-semibold mb-1 ${
                                isSelected ? 'text-[#D1CDBC]' : 'text-[#5A5A40]'
                              }`}>
                                {table.locationDescription}
                              </p>

                              <p className={`text-xs leading-relaxed ${
                                isSelected ? 'text-white/80' : 'text-[#4A4A4A]'
                              }`}>
                                {table.note}
                              </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-current/10 flex items-center justify-between text-xs font-semibold">
                              <span>
                                {!table.isAvailable
                                  ? 'Currently Reserved'
                                  : isSelected
                                  ? 'Selected'
                                  : 'Click to Reserve'}
                              </span>
                              {table.isAvailable && <ArrowRight className="w-4 h-4" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 6: TIME SLOT DECISION */}
                {reservation.step === 6 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                        Step 06 of 07
                      </span>
                      <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
                        Select Seating Time
                      </h2>
                      <p className="text-sm text-[#4A4A4A] mt-1">
                        Curated seating times for {reservation.experience} at {reservation.selectedTable?.name || reservation.seatingArea}.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(TIME_SLOTS[reservation.experience] || TIME_SLOTS.Dinner).map((slot, i) => (
                        <button
                          key={i}
                          disabled={!slot.available}
                          onClick={() => slot.available && selectTime(slot.time)}
                          className={`p-4 rounded-xl text-center font-semibold text-xs transition-all border cursor-pointer ${
                            !slot.available
                              ? 'bg-[#E8E4DB]/40 text-[#8A8A78] border-[#E8E4DB] cursor-not-allowed line-through'
                              : reservation.timeSlot === slot.time
                              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-md'
                              : 'bg-white text-[#1A1A1A] hover:border-[#5A5A40] border-[#E8E4DB]'
                          }`}
                        >
                          <Clock className="w-4 h-4 mx-auto mb-1 text-[#5A5A40]" />
                          <span>{slot.time}</span>
                          {!slot.available && (
                            <span className="text-[10px] block opacity-70">Booked</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 7: RESERVATION SUMMARY & CONTACT CONFIRMATION */}
                {reservation.step === 7 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                        Step 07 of 07
                      </span>
                      <h2 className="font-serif text-3xl font-normal text-[#1A1A1A] mt-1">
                        Review & Complete Your Reservation
                      </h2>
                      <p className="text-sm text-[#4A4A4A] mt-1">
                        Please review your selections and provide your guest details so we can hold your table.
                      </p>
                    </div>

                    {/* Summary Card Dossier */}
                    <div className="bg-[#F5F1EB] rounded-[24px] p-6 border border-[#E8E4DB] space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DB]">
                        <div>
                          <span className="text-[10px] uppercase tracking-widest text-[#5A5A40] font-bold">
                            Sanctuary Table Voucher
                          </span>
                          <h4 className="font-serif text-xl font-bold text-[#1A1A1A]">
                            Mayflower {reservation.selectedOutlet}
                          </h4>
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-[#1A1A1A] text-white font-bold uppercase tracking-wider">
                          Ready to Confirm
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-[#5A5A40] block font-medium">Date</span>
                          <p className="font-bold text-[#1A1A1A] mt-0.5">{reservation.dateLabel} ({reservation.date})</p>
                        </div>
                        <div>
                          <span className="text-[#5A5A40] block font-medium">Time</span>
                          <p className="font-bold text-[#1A1A1A] mt-0.5">{reservation.timeSlot}</p>
                        </div>
                        <div>
                          <span className="text-[#5A5A40] block font-medium">Guests</span>
                          <p className="font-bold text-[#1A1A1A] mt-0.5">{reservation.guests} Guests</p>
                        </div>
                        <div>
                          <span className="text-[#5A5A40] block font-medium">Table / Area</span>
                          <p className="font-bold text-[#1A1A1A] mt-0.5">
                            {reservation.selectedTable ? reservation.selectedTable.name : reservation.seatingArea}
                          </p>
                        </div>
                      </div>

                      {/* Realtime Badges for Dietary & Occasion */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 mt-3 border-t border-[#E8E4DB] text-xs">
                        <div className="bg-white/60 p-2.5 rounded-xl border border-[#E8E4DB]">
                          <span className="text-[#5A5A40] block font-medium text-[10px] uppercase tracking-wider">
                            Dietary Preference:
                          </span>
                          <p className="font-semibold text-[#1A1A1A] mt-0.5">
                            {reservation.dietaryPreferences || 'Standard / No Restrictions'}
                          </p>
                        </div>
                        <div className="bg-white/60 p-2.5 rounded-xl border border-[#E8E4DB]">
                          <span className="text-[#5A5A40] block font-medium text-[10px] uppercase tracking-wider">
                            Special Occasion:
                          </span>
                          <p className="font-semibold text-[#1A1A1A] mt-0.5">
                            {reservation.specialOccasion || 'Casual Dining'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Guest Contact Information Form */}
                    <form onSubmit={handleConfirmReservation} className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase tracking-wider text-[#5A5A40] font-bold">
                          Guest Contact Details
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              required
                              value={reservation.guestName}
                              onChange={(e) => setReservation((prev) => ({ ...prev, guestName: e.target.value }))}
                              placeholder="e.g. Radhika Menon"
                              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] text-sm focus:outline-none focus:border-[#5A5A40] text-[#1A1A1A]"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                              Mobile Phone Number *
                            </label>
                            <input
                              type="tel"
                              required
                              value={reservation.guestPhone}
                              onChange={(e) => setReservation((prev) => ({ ...prev, guestPhone: e.target.value }))}
                              placeholder="+91 98400 12345"
                              className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] text-sm focus:outline-none focus:border-[#5A5A40] text-[#1A1A1A]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">
                            Email Address (Optional)
                          </label>
                          <input
                            type="email"
                            value={reservation.guestEmail}
                            onChange={(e) => setReservation((prev) => ({ ...prev, guestEmail: e.target.value }))}
                            placeholder="name@domain.com"
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] text-sm focus:outline-none focus:border-[#5A5A40] text-[#1A1A1A]"
                          />
                        </div>
                      </div>

                      {/* SEPARATED SECTION 1: DIETARY PREFERENCES */}
                      <div className="p-5 rounded-2xl bg-[#F5F1EB] border border-[#E8E4DB] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Utensils className="w-4 h-4 text-[#5A5A40]" />
                            <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                              Dietary Preferences & Allergies
                            </label>
                          </div>
                          <span className="text-[10px] text-[#5A5A40] font-medium">Chef & Kitchen Prep</span>
                        </div>

                        <p className="text-[11px] text-[#5A5A40]">
                          Select from common dietary options or specify allergies below:
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {DIETARY_OPTIONS.map((opt) => {
                            const isSelected = reservation.dietaryPreferences === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setReservation((prev) => ({ ...prev, dietaryPreferences: opt }))}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#5A5A40] text-white shadow-xs'
                                    : 'bg-white hover:bg-[#FAF7F2] text-[#4A4A4A] border border-[#E8E4DB]'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        <div>
                          <input
                            type="text"
                            value={reservation.dietaryPreferences}
                            onChange={(e) => setReservation((prev) => ({ ...prev, dietaryPreferences: e.target.value }))}
                            placeholder="Type custom dietary notes or specific allergies (e.g. severe shellfish allergy, low sodium)..."
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] text-sm focus:outline-none focus:border-[#5A5A40] text-[#1A1A1A]"
                          />
                        </div>
                      </div>

                      {/* SEPARATED SECTION 2: SPECIAL OCCASIONS */}
                      <div className="p-5 rounded-2xl bg-[#F5F1EB] border border-[#E8E4DB] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-[#5A5A40]" />
                            <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wide">
                              Special Occasion & Celebration
                            </label>
                          </div>
                          <span className="text-[10px] text-[#5A5A40] font-medium">Hospitality Team</span>
                        </div>

                        <p className="text-[11px] text-[#5A5A40]">
                          Let us know the nature of your visit so we can arrange special touches:
                        </p>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {OCCASION_OPTIONS.map((occ) => {
                            const isSelected = reservation.specialOccasion === occ;
                            return (
                              <button
                                key={occ}
                                type="button"
                                onClick={() => setReservation((prev) => ({ ...prev, specialOccasion: occ }))}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                                    : 'bg-white hover:bg-[#FAF7F2] text-[#4A4A4A] border border-[#E8E4DB]'
                                }`}
                              >
                                {occ}
                              </button>
                            );
                          })}
                        </div>

                        <div>
                          <input
                            type="text"
                            value={reservation.specialOccasion}
                            onChange={(e) => setReservation((prev) => ({ ...prev, specialOccasion: e.target.value }))}
                            placeholder="Type specific celebration details (e.g. 5th Anniversary, birthday candle on tiramisu, quiet corner)..."
                            className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E8E4DB] text-sm focus:outline-none focus:border-[#5A5A40] text-[#1A1A1A]"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                        <button
                          type="submit"
                          id="btn-confirm-reservation-final"
                          className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#5A5A40] hover:bg-[#4A4A30] text-white text-[11px] uppercase tracking-widest font-bold shadow-sm transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Reservation</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => goToStep(1)}
                          className="text-xs text-[#5A5A40] hover:text-[#1A1A1A] underline cursor-pointer"
                        >
                          Change selections from start
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Bottom Step Navigation Buttons (Prev / Next) */}
              <div className="pt-8 mt-8 border-t border-[#E8E4DB] flex items-center justify-between">
                {reservation.step > 1 ? (
                  <button
                    onClick={() => goToStep(reservation.step - 1)}
                    className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#5A5A40] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                ) : (
                  <button
                    onClick={onBackToWebsite}
                    className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#5A5A40] hover:text-[#1A1A1A] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Website</span>
                  </button>
                )}

                {reservation.step < 7 && (
                  <button
                    onClick={() => goToStep(reservation.step + 1)}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-[11px] uppercase tracking-widest font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 text-[#D1CDBC]" />
                  </button>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* STEP 8: CONFIRMATION STATE */
          <div className="max-w-2xl mx-auto bg-[#FAF7F2] rounded-[36px] p-8 sm:p-12 border border-[#E8E4DB] shadow-lg text-center space-y-8 animate-fadeIn">
            
            <div className="w-20 h-20 rounded-full bg-[#F5F1EB] text-[#5A5A40] border border-[#E8E4DB] flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold block">
                Booking Confirmed
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1A1A1A]">
                Your table is waiting for you.
              </h2>
              <p className="text-base text-[#4A4A4A] max-w-lg mx-auto leading-relaxed">
                Dear {reservation.guestName || 'Guest'}, we are delighted to welcome you to the botanical sanctuary at Mayflower {reservation.selectedOutlet}.
              </p>
            </div>

            {/* Confirmation Voucher Box */}
            <div className="bg-[#F5F1EB] rounded-[24px] p-6 border border-[#E8E4DB] text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DB]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#E8E4DB] shrink-0 overflow-hidden">
                    <img
                      src="/mayflower-logo.png"
                      alt="The Mayflower"
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#5A5A40] font-bold">Booking Reference</span>
                    <p className="font-mono text-xl font-bold text-[#1A1A1A]">{reservation.bookingCode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-[#5A5A40] font-bold">Experience</span>
                  <p className="font-serif font-semibold text-[#1A1A1A]">{reservation.experience}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[#5A5A40]">Sanctuary</span>
                  <p className="font-semibold text-[#1A1A1A]">{reservation.selectedOutlet}</p>
                </div>
                <div>
                  <span className="text-[#5A5A40]">Date & Time</span>
                  <p className="font-semibold text-[#1A1A1A]">{reservation.date} at {reservation.timeSlot}</p>
                </div>
                <div>
                  <span className="text-[#5A5A40]">Party Size</span>
                  <p className="font-semibold text-[#1A1A1A]">{reservation.guests} Guests</p>
                </div>
                <div>
                  <span className="text-[#5A5A40]">Table</span>
                  <p className="font-semibold text-[#1A1A1A]">{reservation.selectedTable ? reservation.selectedTable.name : reservation.seatingArea}</p>
                </div>
                <div>
                  <span className="text-[#5A5A40]">Phone</span>
                  <p className="font-semibold text-[#1A1A1A]">{reservation.guestPhone}</p>
                </div>
                <div>
                  <span className="text-[#5A5A40]">Dietary</span>
                  <p className="font-semibold text-[#1A1A1A] truncate">{reservation.dietaryPreferences || 'Standard / None'}</p>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-[#E8E4DB]/60">
                  <span className="text-[#5A5A40]">Special Occasion & Requests</span>
                  <p className="font-semibold text-[#1A1A1A]">{reservation.specialOccasion || 'Casual Dining'}</p>
                </div>
              </div>
            </div>

            {/* Post Confirmation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={downloadCalendarInvite}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#5A5A40] hover:bg-[#4A4A30] text-white text-[11px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D1CDBC]" />
                <span>Add to Calendar (.ics)</span>
              </button>

              <button
                onClick={() => goToStep(1)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#FAF7F2] hover:bg-[#E8E4DB] text-[#1A1A1A] border border-[#E8E4DB] text-[11px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-[#5A5A40]" />
                <span>Modify Reservation</span>
              </button>

              <button
                onClick={onBackToWebsite}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-[11px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Explore Restaurant</span>
              </button>
            </div>

            <p className="text-xs text-[#5A5A40]">
              A confirmation dispatch has been logged. Should you require amendments, contact our concierge at <a href="tel:+914448927701" className="underline font-semibold text-[#1A1A1A]">+91 44 4892 7701</a>.
            </p>

          </div>
        )}
        </>

        {/* SAVED BOOKINGS MODAL DIALOG */}
        {showSavedBookings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-[#FAF7F2] rounded-[32px] max-w-lg w-full p-6 sm:p-8 border border-[#E8E4DB] shadow-2xl relative max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DB]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#5A5A40] text-white flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#1A1A1A]">My Saved Reservations</h3>
                    <p className="text-[11px] text-[#5A5A40]">Synced to your Mayflower account</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSavedBookings(false)}
                  className="w-8 h-8 rounded-full bg-[#E8E4DB] hover:bg-[#D1CDBC] text-[#1A1A1A] flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {savedBookingsList.length === 0 ? (
                  <div className="text-center py-10 space-y-2 text-[#666666]">
                    <p className="text-sm">No reservations saved on your account yet.</p>
                    <p className="text-xs">Complete the booking process while signed in to see it here.</p>
                  </div>
                ) : (
                  savedBookingsList.map((b, idx) => (
                    <div 
                      key={idx}
                      className="p-4 rounded-2xl bg-white border border-[#E8E4DB] space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#5A5A40] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E8E4DB]">
                          {b.bookingCode}
                        </span>
                        <span className="text-[11px] text-[#5A5A40] font-medium">
                          {b.outlet}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-[#1A1A1A]">
                        <span>{b.guests} Guests</span>
                        <span>{b.date} • {b.timeSlot}</span>
                      </div>
                      <div className="text-[11px] text-[#666666] flex items-center justify-between pt-1 border-t border-[#E8E4DB]/60">
                        <span>{b.experience} • {b.selectedTable?.name || b.seatingArea}</span>
                        <span>{b.status}</span>
                      </div>
                      {(b.dietaryPreferences || b.specialOccasion) && (
                        <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                          {b.dietaryPreferences && (
                            <span className="bg-[#F5F1EB] text-[#5A5A40] px-2 py-0.5 rounded-md border border-[#E8E4DB]">
                              🍽️ {b.dietaryPreferences}
                            </span>
                          )}
                          {b.specialOccasion && (
                            <span className="bg-[#F5F1EB] text-[#1A1A1A] px-2 py-0.5 rounded-md border border-[#E8E4DB]">
                              ✨ {b.specialOccasion}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-[#E8E4DB] flex items-center justify-between">
                <button
                  onClick={() => setShowSavedBookings(false)}
                  className="ml-auto px-6 py-2.5 rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
