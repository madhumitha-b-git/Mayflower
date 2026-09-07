import { UserProfile, PointTransaction, LoyaltyTier, UserReservationRecord, UserRole } from '../types';
import { sendWelcomeConfirmationEmail, sendReservationConfirmationEmail, sendGiftCardClaimEmail } from './emailService';

const STORAGE_KEY = 'mayflower_users_db_v4';
const CURRENT_USER_KEY = 'mayflower_current_user_id';
const OTP_STORAGE_KEY = 'mayflower_pending_email_otp';

export interface WelcomeEmailData {
  id: string;
  toEmail: string;
  toName: string;
  subject: string;
  sentAt: string;
  welcomeBonusPoints: number;
  memberId: string;
  bodyHtml: string;
}

export interface UserProfileWithPassword extends UserProfile {
  password?: string;
}

const TODAY = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const SEED_STAFF: UserProfileWithPassword[] = [
  { id: 'usr-superadmin', name: 'Super Admin', phone: '', email: 'superadmin@gmail.com', password: 'superadmin@1234', role: 'SuperAdmin', rewardPoints: 0, tier: 'Sanctuary VIP', totalVisits: 0, joinedDate: TODAY, transactions: [], reservations: [] },
  { id: 'usr-owner', name: 'Owner', phone: '', email: 'owner@gmail.com', password: 'owner@1234', role: 'Owner', rewardPoints: 0, tier: 'Sanctuary VIP', totalVisits: 0, joinedDate: TODAY, transactions: [], reservations: [] },
  { id: 'usr-admin', name: 'Admin', phone: '', email: 'admin@gmail.com', password: 'admin@1234', role: 'Admin', rewardPoints: 0, tier: 'Gold', totalVisits: 0, joinedDate: TODAY, transactions: [], reservations: [] },
  { id: 'usr-manager', name: 'Manager', phone: '', email: 'manager@gmail.com', password: 'manager@1234', role: 'Manager', rewardPoints: 0, tier: 'Gold', totalVisits: 0, joinedDate: TODAY, transactions: [], reservations: [] },
  { id: 'usr-chef', name: 'Chef', phone: '', email: 'chef@gmail.com', password: 'chef@1234', role: 'Chef', rewardPoints: 0, tier: 'Green', totalVisits: 0, joinedDate: TODAY, transactions: [], reservations: [] },
  { id: 'usr-hr', name: 'HR', phone: '', email: 'hr@gmail.com', password: 'hr@1234', role: 'HR', rewardPoints: 0, tier: 'Green', totalVisits: 0, joinedDate: TODAY, transactions: [], reservations: [] },
  { id: 'usr-accountant', name: 'Accountant', phone: '', email: 'accountant@gmail.com', password: 'accountant@1234', role: 'Accountant', rewardPoints: 0, tier: 'Green', totalVisits: 0, joinedDate: TODAY, transactions: [], reservations: [] },
];

const INITIAL_USERS: UserProfileWithPassword[] = SEED_STAFF;

// Get stored users
export const getStoredUsers = (): UserProfileWithPassword[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const stored: UserProfileWithPassword[] = JSON.parse(raw);
    // Always ensure seed staff are present with correct roles
    const merged = stored.filter(u => !SEED_STAFF.find(s => s.id === u.id));
    return [...SEED_STAFF, ...merged];
  } catch {
    return INITIAL_USERS;
  }
};

// Save users DB
export const saveStoredUsers = (users: UserProfileWithPassword[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch {}
};

// Login with email + password
export const loginWithPassword = (emailInput: string, password: string): { success: boolean; user?: UserProfile; message?: string } => {
  const cleanEmail = emailInput.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) return { success: false, message: 'No account found with this email.' };
  if (user.password && user.password !== password) return { success: false, message: 'Incorrect password.' };
  setCurrentUserSession(user.id);
  return { success: true, user };
};

// Get current user session
export const getCurrentUser = (): UserProfile | null => {
  try {
    const userId = localStorage.getItem(CURRENT_USER_KEY);
    if (!userId) return null;
    const users = getStoredUsers();
    const user = users.find((u) => u.id === userId) || null;
    return user;
  } catch {
    return null;
  }
};

// Set user session
export const setCurrentUserSession = (userId: string | null) => {
  try {
    if (userId) {
      localStorage.setItem(CURRENT_USER_KEY, userId);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch {
    // Ignore
  }
};

// Determine loyalty tier
export const calculateTier = (points: number): LoyaltyTier => {
  if (points >= 2000) return 'Sanctuary VIP';
  if (points >= 800) return 'Gold';
  return 'Green';
};

// Generate official welcome confirmation email HTML
export const generateWelcomeEmailData = (email: string, name: string, memberId: string): WelcomeEmailData => {
  const sentAt = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return {
    id: `email-${Date.now()}`,
    toEmail: email,
    toName: name,
    subject: `🌸 Welcome to Mayflower Sanctuary Rewards — Account Confirmed!`,
    sentAt,
    welcomeBonusPoints: 200,
    memberId,
    bodyHtml: `
      <div style="font-family: 'Playfair Display', Georgia, serif; color: #1A1A1A; max-width: 600px; margin: 0 auto; border: 1px solid #E8E4DB; border-radius: 20px; overflow: hidden; background: #FAF7F2;">
        <div style="background: #2D4030; color: #FAF7F2; padding: 32px; text-align: center;">
          <h1 style="font-size: 26px; margin: 0; font-weight: 400; letter-spacing: 2px;">THE MAYFLOWER</h1>
          <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #D1CDBC; margin-top: 6px;">CAFE &amp; DINING &bull; CHENNAI</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="font-size: 22px; color: #1A1A1A; margin-top: 0;">Welcome to the Sanctuary, ${name}!</h2>
          <p style="font-size: 14px; color: #4A4A4A; line-height: 1.6;">
            Your Mayflower account has been successfully registered and confirmed via Email verification.
          </p>
          <div style="background: #ffffff; border: 1px solid #E8E4DB; border-radius: 14px; padding: 20px; margin: 24px 0; text-align: center;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #5A5A40; font-weight: bold;">Account Member ID</span>
            <div style="font-family: monospace; font-size: 20px; font-weight: bold; color: #2D4030; margin-top: 4px;">${memberId}</div>
            <div style="margin-top: 12px; font-size: 13px; color: #2D4030; font-weight: bold;">
              ⭐ +200 Welcome Bonus Reward Points Credited
            </div>
          </div>
          <p style="font-size: 13px; color: #666666;">
            Use your reward points to track table reservations, earn 10 points per ₹100 spent on global dining, and redeem Mayflower Moment Gift Cards!
          </p>
        </div>
      </div>
    `
  };
};

// Request OTP for Email Address
export const requestEmailOTP = (emailInput: string, nameInput?: string): { otp: string; targetEmail: string; isNewUser: boolean } => {
  const cleanEmail = emailInput.trim().toLowerCase();
  const users = getStoredUsers();
  
  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  // Generate random 6-digit OTP code (default master code 4821 supported for easy dev testing)
  const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  
  sessionStorage.setItem(
    OTP_STORAGE_KEY,
    JSON.stringify({
      targetEmail: cleanEmail,
      otp: generatedOTP,
      isNewUser: !existing,
      createdAt: Date.now()
    })
  );

  // Trigger async API call to Gmail SMTP serverless endpoint for inbox dispatch
  const recipientName = nameInput || existing?.name || cleanEmail.split('@')[0];

  fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cleanEmail,
      otp: generatedOTP,
      name: recipientName
    })
  }).catch((err) => {
    console.log('[Gmail OTP Dispatch Notice]:', err);
  });

  return { otp: generatedOTP, targetEmail: cleanEmail, isNewUser: !existing };
};

// Verify Email OTP & Login / Register
export const verifyEmailOTPAndLogin = (
  emailInput: string,
  enteredOTP: string,
  userName?: string,
  selectedRole: UserRole = 'Customer',
  password?: string
): { success: boolean; user?: UserProfile; welcomeEmail?: WelcomeEmailData; message?: string } => {
  const cleanEmail = emailInput.trim().toLowerCase();
  const storedData = sessionStorage.getItem(OTP_STORAGE_KEY);

  if (!storedData) {
    return { success: false, message: 'OTP expired. Please request a new verification code.' };
  }

  const parsed = JSON.parse(storedData);
  const cleanEntered = enteredOTP.trim();
  
  // Accept generated OTP or master shortcut '4821' for fast developer testing
  if (parsed.otp !== cleanEntered && cleanEntered !== '4821') {
    return { success: false, message: `Invalid code. Enter the 6-digit OTP sent to your email or master code 4821.` };
  }

  let users = getStoredUsers();
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  let welcomeEmail: WelcomeEmailData | undefined = undefined;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (!user) {
    const newUserId = `usr-${Date.now()}`;
    const formattedName = userName?.trim() || cleanEmail.split('@')[0];

    const newUser: UserProfileWithPassword = {
      id: newUserId,
      name: formattedName,
      phone: '',
      email: cleanEmail,
      password: password || undefined,
      rewardPoints: 200,
      tier: 'Green',
      role: selectedRole,
      totalVisits: 1,
      joinedDate: todayStr,
      transactions: [
        {
          id: `tx-welcome-${Date.now()}`,
          type: 'earned_signup',
          points: 200,
          description: 'Welcome Bonus on Registering Mayflower Account',
          date: todayStr
        }
      ],
      reservations: []
    };
    user = newUser;

    welcomeEmail = generateWelcomeEmailData(cleanEmail, formattedName, newUserId);

    users = [user, ...users];
    saveStoredUsers(users);

    // Trigger automated Welcome Email dispatch to user's real email inbox
    sendWelcomeConfirmationEmail(cleanEmail, formattedName, newUserId);
  } else {
    // Update role if explicitly selected
    if (selectedRole && user.role !== selectedRole) {
      user.role = selectedRole;
      const idx = users.findIndex((u) => u.id === user?.id);
      if (idx !== -1) {
        users[idx].role = selectedRole;
        saveStoredUsers(users);
      }
    }
  }

  setCurrentUserSession(user.id);
  sessionStorage.removeItem(OTP_STORAGE_KEY);

  return { success: true, user, welcomeEmail };
};

// Login with Email ID Only (No OTP required for returning/quick login)
export const loginByEmailOnly = (
  emailInput: string
): { success: boolean; user: UserProfile; welcomeEmail?: WelcomeEmailData } => {
  const cleanEmail = emailInput.trim().toLowerCase();
  let users = getStoredUsers();
  let user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  let welcomeEmail: WelcomeEmailData | undefined = undefined;

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (!user) {
    const newUserId = `usr-${Date.now()}`;
    const formattedName = cleanEmail.split('@')[0];

    user = {
      id: newUserId,
      name: formattedName,
      phone: '',
      email: cleanEmail,
      rewardPoints: 200,
      tier: 'Green',
      role: 'Customer',
      totalVisits: 1,
      joinedDate: todayStr,
      transactions: [
        {
          id: `tx-welcome-${Date.now()}`,
          type: 'earned_signup',
          points: 200,
          description: 'Welcome Bonus on Registering Mayflower Account',
          date: todayStr
        }
      ],
      reservations: []
    };

    welcomeEmail = generateWelcomeEmailData(cleanEmail, formattedName, newUserId);

    users = [user, ...users];
    saveStoredUsers(users);

    // Trigger welcome email
    sendWelcomeConfirmationEmail(cleanEmail, formattedName, newUserId);
  }

  setCurrentUserSession(user.id);
  return { success: true, user, welcomeEmail };
};

// Add reservation record
export const addReservationToUser = (userId: string, reservation: UserReservationRecord): UserProfile | null => {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const currentReservations = users[idx].reservations || [];
  const updatedReservations = [reservation, ...currentReservations];
  const updatedPoints = users[idx].rewardPoints + 150;
  const updatedTier = calculateTier(updatedPoints);

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const newTx: PointTransaction = {
    id: `tx-res-${Date.now()}`,
    type: 'earned_visit',
    points: 150,
    description: `Table Reservation Bonus (${reservation.outlet} - ${reservation.bookingCode})`,
    date: todayStr
  };

  users[idx] = {
    ...users[idx],
    rewardPoints: updatedPoints,
    tier: updatedTier,
    totalVisits: users[idx].totalVisits + 1,
    reservations: updatedReservations,
    transactions: [newTx, ...users[idx].transactions]
  };

  saveStoredUsers(users);

  // Trigger automated Seat Reservation Confirmation Email dispatch to user's real email inbox
  sendReservationConfirmationEmail(users[idx].email, users[idx].name, reservation);

  return users[idx];
};

// Deduct points (e.g. gift card redemption)
export const deductPointsFromUser = (userId: string, points: number, description: string, cardCode?: string): { success: boolean; user?: UserProfile; message?: string } => {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false, message: 'User not found.' };

  if (users[idx].rewardPoints < points) {
    return {
      success: false,
      message: `Insufficient points balance. You need ${points} PTS (Current: ${users[idx].rewardPoints} PTS).`
    };
  }

  const todayStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const updatedPoints = users[idx].rewardPoints - points;
  const updatedTier = calculateTier(updatedPoints);

  const newTx: PointTransaction = {
    id: `tx-red-${Date.now()}`,
    type: 'redeemed_giftcard',
    points: -points,
    description,
    date: todayStr
  };

  users[idx] = {
    ...users[idx],
    rewardPoints: updatedPoints,
    tier: updatedTier,
    transactions: [newTx, ...users[idx].transactions]
  };

  saveStoredUsers(users);

  // Trigger automated Happiness Gift Card Claim Email dispatch to user's real email inbox
  const voucherCode = cardCode || `MF-HAP-${Math.floor(1000 + Math.random() * 9000)}`;
  sendGiftCardClaimEmail(users[idx].email, users[idx].name, description, voucherCode, points);

  return { success: true, user: users[idx] };
};
