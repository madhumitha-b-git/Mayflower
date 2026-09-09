export type MenuCategoryType = 
  | 'all'
  | 'dim-sum'
  | 'starters'
  | 'pizza'
  | 'pasta'
  | 'burgers'
  | 'asian-bowls'
  | 'desserts-beverages';

export type CuisineType = MenuCategoryType | string;

export interface Dish {
  id: string;
  name: string;
  category: MenuCategoryType;
  categoryName?: string;
  cuisine?: string;
  description: string;
  price: number;
  isVeg: boolean;
  isChefPick: boolean;
  image: string;
  portion?: string;
  calories?: string;
}

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  accent: string;
}

export interface LocationOutlet {
  id: string;
  name: string;
  tagline: string;
  address: string;
  hours: string;
  phone: string;
  description: string;
  image: string;
  icon: string;
  mapCoordinates: { x: number; y: number }; // Percentage for interactive map
  highlights: string[];
  gmapUrl?: string;
}

export type SeatingAreaType = 'Garden' | 'Window' | 'Main Dining' | 'Private Space';

export type TableStatus = 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Blocked';

export interface RestaurantTable {
  id: string;
  name: string;
  area: SeatingAreaType;
  seats: number;
  locationDescription: string;
  note: string;
  isAvailable: boolean;
  status?: TableStatus;
  isChefRecommended?: boolean;
  assignedGuestName?: string;
  assignedGuestPhone?: string;
  assignedBookingCode?: string;
  assignedTimeSlot?: string;
  assignedGuestsCount?: number;
  assignedDietary?: string;
  assignedOccasion?: string;
}

export type DiningExperienceType = 'Lunch' | 'Dinner' | 'Celebration' | 'Casual';

export interface ReservationState {
  step: number; // 1 to 8
  selectedOutlet: string;
  date: string;
  dateLabel: string;
  guests: number;
  guestLabel: string;
  experience: DiningExperienceType;
  seatingArea: SeatingAreaType;
  selectedTable: RestaurantTable | null;
  timeSlot: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  dietaryPreferences: string;
  specialOccasion: string;
  specialNotes: string;
  bookingCode: string;
}

export type ActiveModalType = 'none' | 'franchise' | 'feedback' | 'general' | 'cellar' | 'drinks' | 'auth' | 'loyalty';

export type LoyaltyTier = 'Green' | 'Gold' | 'Sanctuary VIP';

export interface PointTransaction {
  id: string;
  type: 'earned_signup' | 'earned_visit' | 'earned_dining' | 'redeemed_giftcard';
  points: number;
  description: string;
  date: string;
}

export interface UserReservationRecord {
  id: string;
  bookingCode: string;
  outlet: string;
  date: string;
  timeSlot: string;
  guests: number;
  seatingArea: string;
  status: 'Confirmed' | 'Completed';
  bookedAt: string;
}

export type UserRole = 'SuperAdmin' | 'Owner' | 'Admin' | 'Manager' | 'Chef' | 'HR' | 'Accountant' | 'Customer';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  rewardPoints: number;
  tier: LoyaltyTier;
  role?: UserRole;
  totalVisits: number;
  joinedDate: string;
  transactions: PointTransaction[];
  reservations?: UserReservationRecord[];
}
