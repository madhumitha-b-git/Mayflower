export type UserRole = 'SuperAdmin' | 'Owner' | 'Admin' | 'Manager' | 'Chef' | 'HR' | 'Accountant' | 'Customer';
export type OutletStatus = 'active' | 'inactive' | 'coming_soon';
export type TableStatus = 'Available' | 'Reserved' | 'Occupied' | 'Cleaning' | 'Blocked';
export type ReservationStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'No-show';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Escalated';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type FeedbackStatus = 'New' | 'Reviewed' | 'Resolved';
export type FranchiseStatus = 'New' | 'Under Review' | 'Contacted' | 'Qualified' | 'Closed';
export type SopCategory = 'Opening' | 'Closing' | 'Kitchen' | 'Floor' | 'Hygiene' | 'Equipment' | 'Customer Service' | 'Quality Checks' | 'Other';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
