import React, { useState, useEffect } from 'react';
import { RestaurantTable, TableStatus, SeatingAreaType } from '../types';
import { OUTLETS } from '../data/restaurantData';
import { getStoredTables, updateTableStatus } from '../data/tableStorage';
import { 
  Layout, CheckCircle2, Clock, User, X, RefreshCw, AlertCircle, 
  Sparkles, Filter, Edit3, Shield, MapPin, ChevronRight, Utensils
} from 'lucide-react';

interface ManagerFloorMapProps {
  onClose?: () => void;
}

export const ManagerFloorMap: React.FC<ManagerFloorMapProps> = ({ onClose }) => {
  const [selectedOutlet, setSelectedOutlet] = useState<string>('Poes Garden');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('All');
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [activeTableModal, setActiveTableModal] = useState<RestaurantTable | null>(null);

  // Form state for assigning a guest / walk-in to table
  const [assignName, setAssignName] = useState('');
  const [assignPhone, setAssignPhone] = useState('');
  const [assignTime, setAssignTime] = useState('7:30 PM');
  const [assignGuests, setAssignGuests] = useState(2);
  const [assignNotes, setAssignNotes] = useState('');

  // Refresh tables from local storage
  const loadTables = () => {
    setTables(getStoredTables());
  };

  useEffect(() => {
    loadTables();
  }, []);

  // Filter tables for current view
  const filteredTables = tables.filter((t) => {
    if (selectedAreaFilter !== 'All' && t.area !== selectedAreaFilter) return false;
    return true;
  });

  // Calculate live statistics
  const totalCount = tables.length;
  const availableCount = tables.filter((t) => (t.status || (t.isAvailable ? 'Available' : 'Reserved')) === 'Available').length;
  const reservedCount = tables.filter((t) => (t.status || (t.isAvailable ? 'Available' : 'Reserved')) === 'Reserved').length;
  const occupiedCount = tables.filter((t) => t.status === 'Occupied').length;
  const cleaningCount = tables.filter((t) => t.status === 'Cleaning').length;
  const blockedCount = tables.filter((t) => t.status === 'Blocked').length;
  
  const occupancyRate = totalCount > 0 ? Math.round(((reservedCount + occupiedCount) / totalCount) * 100) : 0;

  // Status color styles mapping
  const getStatusBadgeStyle = (status: TableStatus = 'Available') => {
    switch (status) {
      case 'Available':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          cardBorder: 'hover:border-emerald-500',
          indicatorBg: 'bg-emerald-500'
        };
      case 'Reserved':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          cardBorder: 'border-amber-400',
          indicatorBg: 'bg-amber-500'
        };
      case 'Occupied':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          cardBorder: 'border-rose-400',
          indicatorBg: 'bg-rose-500'
        };
      case 'Cleaning':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
          cardBorder: 'border-sky-400',
          indicatorBg: 'bg-sky-500'
        };
      case 'Blocked':
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-300',
          dot: 'bg-gray-400',
          cardBorder: 'border-gray-300 opacity-60',
          indicatorBg: 'bg-gray-400'
        };
    }
  };

  const handleStatusChange = (tableId: string, newStatus: TableStatus) => {
    const updated = updateTableStatus(tableId, newStatus, {
      guestName: assignName || undefined,
      guestPhone: assignPhone || undefined,
      timeSlot: assignTime || undefined,
      guestsCount: assignGuests,
      occasion: assignNotes || undefined
    });
    setTables(updated);
    if (activeTableModal && activeTableModal.id === tableId) {
      const fresh = updated.find((t) => t.id === tableId) || null;
      setActiveTableModal(fresh);
    }
  };

  const handleOpenModal = (t: RestaurantTable) => {
    setActiveTableModal(t);
    setAssignName(t.assignedGuestName || '');
    setAssignPhone(t.assignedGuestPhone || '');
    setAssignTime(t.assignedTimeSlot || '7:30 PM');
    setAssignGuests(t.assignedGuestsCount || t.seats);
    setAssignNotes(t.assignedOccasion || '');
  };

  return (
    <div className="bg-[#FAF7F2] text-[#1A1A1A] rounded-[32px] border border-[#E8E4DB] shadow-lg p-6 sm:p-8 space-y-6">
      
      {/* Top Header & Sanctuary Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E4DB]">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-[#5A5A40] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#5A5A40] font-bold">
                PRD Section 09 • Live Floor Control
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#1A1A1A]">
              Manager Visual Floor Map &amp; Table Management
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#F5F1EB] px-3 py-1.5 rounded-full border border-[#E8E4DB] text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span className="font-semibold text-[#5A5A40]">Sanctuary:</span>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="bg-white px-3 py-1 rounded-full font-bold text-[#1A1A1A] border border-[#E8E4DB] focus:outline-none cursor-pointer"
            >
              {OUTLETS.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-[#F5F1EB] hover:bg-[#E8E4DB] text-[#1A1A1A] transition-colors cursor-pointer border border-[#E8E4DB]"
              title="Close Manager Floor Map"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Real-time Sanctuary Metrics Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-[#E8E4DB] text-center shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#5A5A40] block">Total Tables</span>
          <span className="font-serif text-2xl font-bold text-[#1A1A1A]">{totalCount}</span>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-center shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800 block">Available</span>
          <span className="font-serif text-2xl font-bold text-emerald-700">{availableCount}</span>
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 block">Reserved</span>
          <span className="font-serif text-2xl font-bold text-amber-700">{reservedCount}</span>
        </div>

        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-rose-800 block">Occupied</span>
          <span className="font-serif text-2xl font-bold text-rose-700">{occupiedCount}</span>
        </div>

        <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 text-center shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-sky-800 block">Cleaning</span>
          <span className="font-serif text-2xl font-bold text-sky-700">{cleaningCount}</span>
        </div>

        <div className="bg-gray-100 p-4 rounded-2xl border border-gray-300 text-center shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-700 block">Blocked</span>
          <span className="font-serif text-2xl font-bold text-gray-700">{blockedCount}</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#1A1A1A] text-white p-4 rounded-2xl text-center shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-[#D1CDBC] block">Occupancy</span>
          <span className="font-serif text-2xl font-bold">{occupancyRate}%</span>
        </div>
      </div>

      {/* Filter Tabs by Seating Area & Live Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-[#E8E4DB]">
        
        {/* Seating Area Filter Tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'All', label: 'All Sanctuary Areas' },
            { id: 'Garden', label: '🌿 Garden Terrace' },
            { id: 'Window', label: '🪟 Arched Window' },
            { id: 'Main Dining', label: '🍽 Main Salon' },
            { id: 'Private Space', label: 'Private Suite' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedAreaFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                selectedAreaFilter === tab.id
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'bg-[#F5F1EB] hover:bg-[#E8E4DB] text-[#4A4A4A] border border-[#E8E4DB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Live Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-[#5A5A40]">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Available</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Reserved</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Occupied</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
            <span>Cleaning</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
            <span>Blocked</span>
          </span>
        </div>
      </div>

      {/* Visual Architectural Floor Map Grid Layout */}
      <div className="bg-[#F5F1EB] p-6 sm:p-8 rounded-[28px] border border-[#E8E4DB] space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5A5A40] flex items-center space-x-2">
            <span>Visual Floor Canvas ({selectedOutlet})</span>
            <span className="text-gray-400">• Click any table to update status or assign guests</span>
          </span>
          <button
            onClick={loadTables}
            className="text-xs text-[#5A5A40] hover:text-[#1A1A1A] flex items-center space-x-1 font-semibold cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh State</span>
          </button>
        </div>

        {/* Visual Table Cards Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((t) => {
            const currentStatus: TableStatus = t.status || (t.isAvailable ? 'Available' : 'Reserved');
            const style = getStatusBadgeStyle(currentStatus);

            return (
              <div
                key={t.id}
                onClick={() => handleOpenModal(t)}
                className={`p-5 rounded-2xl bg-white border-2 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md ${style.cardBorder} flex flex-col justify-between space-y-3 relative group`}
              >
                {/* Table Header Row */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E4DB]">
                    <div className="flex items-center space-x-2">
                      <span className={`w-3 h-3 rounded-full ${style.indicatorBg}`} />
                      <h4 className="font-serif font-bold text-base text-[#1A1A1A]">{t.name}</h4>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${style.bg}`}>
                      {currentStatus}
                    </span>
                  </div>

                  {/* Seats & Location */}
                  <div className="flex items-center justify-between text-xs text-[#5A5A40] mt-2 font-medium">
                    <span className="flex items-center space-x-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{t.seats} Seats</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#5A5A40] px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#E8E4DB]">
                      {t.area}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#666666] mt-1 italic truncate">
                    {t.locationDescription}
                  </p>
                </div>

                {/* Assignment Details Box (If Reserved or Occupied) */}
                {t.assignedGuestName ? (
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E4DB] text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-[#1A1A1A]">
                      <span className="truncate">{t.assignedGuestName}</span>
                      <span className="font-mono text-[10px] text-[#5A5A40]">{t.assignedBookingCode || 'Walk-in'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#5A5A40]">
                      <span>🕒 {t.assignedTimeSlot || '7:30 PM'}</span>
                      <span>👥 {t.assignedGuestsCount || t.seats} Guests</span>
                    </div>
                    {t.assignedOccasion && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded block truncate font-medium border border-amber-200">
                        ✨ {t.assignedOccasion}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#8A8A78] pt-2 border-t border-[#E8E4DB]/60 flex items-center justify-between font-medium">
                    <span>{currentStatus === 'Available' ? 'Ready for Walk-in / Booking' : 'No Guest Assigned'}</span>
                    <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE TABLE CONTROL MODAL */}
      {activeTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF7F2] rounded-[32px] max-w-md w-full p-6 sm:p-8 border border-[#E8E4DB] shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E4DB]">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5A5A40]">
                  Table Management Control
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#1A1A1A]">
                  {activeTableModal.name} ({activeTableModal.area})
                </h3>
              </div>
              <button
                onClick={() => setActiveTableModal(null)}
                className="w-8 h-8 rounded-full bg-[#E8E4DB] hover:bg-[#D1CDBC] text-[#1A1A1A] flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Status Selector Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider block">
                Update Live Table Status
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { status: 'Available', label: '🟢 Available', color: 'hover:bg-emerald-100 border-emerald-300' },
                  { status: 'Reserved', label: '🟡 Reserved', color: 'hover:bg-amber-100 border-amber-300' },
                  { status: 'Occupied', label: '🔴 Occupied', color: 'hover:bg-rose-100 border-rose-300' },
                  { status: 'Cleaning', label: '🔵 Cleaning', color: 'hover:bg-sky-100 border-sky-300' },
                  { status: 'Blocked', label: '⚪ Blocked', color: 'hover:bg-gray-200 border-gray-300' }
                ].map((opt) => {
                  const isCurrent = (activeTableModal.status || (activeTableModal.isAvailable ? 'Available' : 'Reserved')) === opt.status;
                  return (
                    <button
                      key={opt.status}
                      type="button"
                      onClick={() => handleStatusChange(activeTableModal.id, opt.status as TableStatus)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        isCurrent
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                          : `bg-white text-[#1A1A1A] border-[#E8E4DB] ${opt.color}`
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guest Assignment Form */}
            <div className="space-y-4 pt-3 border-t border-[#E8E4DB]">
              <h4 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">
                Assign Walk-in or Guest Details
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#5A5A40] font-semibold mb-1">Guest Name</label>
                  <input
                    type="text"
                    value={assignName}
                    onChange={(e) => setAssignName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DB] text-sm focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#5A5A40] font-semibold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={assignPhone}
                      onChange={(e) => setAssignPhone(e.target.value)}
                      placeholder="+91 98400 12345"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DB] text-sm focus:outline-none focus:border-[#5A5A40]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#5A5A40] font-semibold mb-1">Time Slot</label>
                    <input
                      type="text"
                      value={assignTime}
                      onChange={(e) => setAssignTime(e.target.value)}
                      placeholder="7:30 PM"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DB] text-sm focus:outline-none focus:border-[#5A5A40]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#5A5A40] font-semibold mb-1">Special Notes / Occasion</label>
                  <input
                    type="text"
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="e.g. Birthday cake request, window preference"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DB] text-sm focus:outline-none focus:border-[#5A5A40]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#E8E4DB] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  handleStatusChange(activeTableModal.id, 'Available');
                  setActiveTableModal(null);
                }}
                className="px-4 py-2.5 rounded-full bg-white border border-[#E8E4DB] text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Reset / Clear Table
              </button>

              <button
                type="button"
                onClick={() => {
                  handleStatusChange(
                    activeTableModal.id,
                    (activeTableModal.status || 'Available') === 'Available' ? 'Reserved' : activeTableModal.status!
                  );
                  setActiveTableModal(null);
                }}
                className="px-6 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#4A4A30] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Save Table State
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
