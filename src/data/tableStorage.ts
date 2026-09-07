import { RestaurantTable, TableStatus } from '../types';
import { RESTAURANT_TABLES } from './restaurantData';

const TABLE_STORAGE_KEY = 'mayflower_restaurant_tables_v2';

// Get stored tables with live statuses
export const getStoredTables = (): RestaurantTable[] => {
  try {
    const raw = localStorage.getItem(TABLE_STORAGE_KEY);
    if (!raw) {
      // Map initial tables with default status
      const initial = RESTAURANT_TABLES.map((t) => ({
        ...t,
        status: t.isAvailable ? ('Available' as TableStatus) : ('Reserved' as TableStatus)
      }));
      localStorage.setItem(TABLE_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed: RestaurantTable[] = JSON.parse(raw);
    return parsed;
  } catch {
    return RESTAURANT_TABLES.map((t) => ({
      ...t,
      status: t.isAvailable ? ('Available' as TableStatus) : ('Reserved' as TableStatus)
    }));
  }
};

// Save updated tables list
export const saveStoredTables = (tables: RestaurantTable[]) => {
  try {
    localStorage.setItem(TABLE_STORAGE_KEY, JSON.stringify(tables));
  } catch {
    // LocalStorage fallback
  }
};

// Update a single table's status & details
export const updateTableStatus = (
  tableId: string,
  newStatus: TableStatus,
  assignmentData?: {
    guestName?: string;
    guestPhone?: string;
    bookingCode?: string;
    timeSlot?: string;
    guestsCount?: number;
    dietary?: string;
    occasion?: string;
  }
): RestaurantTable[] => {
  const tables = getStoredTables();
  const index = tables.findIndex((t) => t.id === tableId);
  if (index === -1) return tables;

  const isAvailable = newStatus === 'Available';
  
  if (newStatus === 'Available') {
    // Clear assignment when set back to Available
    tables[index] = {
      ...tables[index],
      status: newStatus,
      isAvailable,
      assignedGuestName: undefined,
      assignedGuestPhone: undefined,
      assignedBookingCode: undefined,
      assignedTimeSlot: undefined,
      assignedGuestsCount: undefined,
      assignedDietary: undefined,
      assignedOccasion: undefined
    };
  } else {
    tables[index] = {
      ...tables[index],
      status: newStatus,
      isAvailable,
      assignedGuestName: assignmentData?.guestName ?? tables[index].assignedGuestName,
      assignedGuestPhone: assignmentData?.guestPhone ?? tables[index].assignedGuestPhone,
      assignedBookingCode: assignmentData?.bookingCode ?? tables[index].assignedBookingCode,
      assignedTimeSlot: assignmentData?.timeSlot ?? tables[index].assignedTimeSlot,
      assignedGuestsCount: assignmentData?.guestsCount ?? tables[index].assignedGuestsCount,
      assignedDietary: assignmentData?.dietary ?? tables[index].assignedDietary,
      assignedOccasion: assignmentData?.occasion ?? tables[index].assignedOccasion
    };
  }

  saveStoredTables(tables);
  return tables;
};

// Helper for customer reservation to lock table as Reserved
export const reserveTableForCustomer = (
  tableId: string,
  bookingCode: string,
  guestName: string,
  guestPhone: string,
  timeSlot: string,
  guestsCount: number,
  dietary?: string,
  occasion?: string
): RestaurantTable[] => {
  return updateTableStatus(tableId, 'Reserved', {
    guestName,
    guestPhone,
    bookingCode,
    timeSlot,
    guestsCount,
    dietary,
    occasion
  });
};
