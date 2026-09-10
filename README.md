# The Mayflower - Restaurant & Table Reservations (Chennai)

A responsive digital dining and reservation platform for **The Mayflower** in Chennai, showcasing authentic menus, bohemian botanical atmosphere, multi-outlet guide, and interactive table bookings.

🌐 **Live Demo Website:** [https://ais-pre-ku2tq4xjj6x7p53xmt4ald-799168898636.asia-east1.run.app](https://ais-pre-ku2tq4xjj6x7p53xmt4ald-799168898636.asia-east1.run.app)

---

## 🌿 Key Features

1. **Experience & Atmosphere Showcase**:
   - **Global Flavours**: International dishes and authentic cuisine spread (dim sums, sourdough pizzas, pasta, Khao Suey).
   - **Bohemian Ambience**: Cozy cafe interiors, cane lighting, floral touches, and ambient warmth.
   - **Green & Serene**: Lush indoor foliage, glasshouse conservatory dining, and tranquil outdoor garden seating.
   - **Moments at Mayflower**: Crafted for family weekend meals, friendly catchups, dates, and peaceful reading.

2. **Authentic Chennai Menu**:
   - Real menu items from The Mayflower (Poes Garden, Anna Nagar, Egmore, Palavakkam on ECR).
   - Category filters: Dim Sums, Starters, Sourdough Pizzas, Pastas & Ravioli, Burgers, Asian Bowls.
   - Vegetarian and Non-Vegetarian dietary filters with exact pricing in ₹.

3. **Beverages & Desserts Menu**:
   - Signature Monster Shakes (Salted Caramel, Kit Kat, Nutella Hazelnut).
   - Mocktails & Coolers, Artisanal Coffees & Cold Brews.
   - Desserts: Sizzling Brownies, Lotus Biscoff Cheesecakes, Chocolate Mousse.

4. **Interactive 7-Step Reservation Concierge**:
   - Multi-outlet selection (Poes Garden, Anna Nagar, Egmore, Palavakkam).
   - Visual floor plan and table picker (Glasshouse Conservatory, Courtyard, Mezzanine, Private Booths).
   - Real-time slot availability, dietary preferences, and guest details.
   - Instant confirmation voucher with unique Booking Code (e.g., `MF-4821`).
   - Saved bookings history stored in browser `localStorage`.
   - **Add to Calendar (.ics)** export for Google Calendar, Apple Calendar, and Outlook.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Animations**: CSS Transitions & Motion
- **Build Tool**: Vite
- **Storage**: Browser LocalStorage & ICS Calendar Generation

---

## 🚀 Running Locally

1. **Clone the repository**:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd <REPO_FOLDER>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

---

## 👥 Authors & Academic Submission

- Built for **The Mayflower Chennai** Project Submission.

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

The full schema SQL is at `supabase/schema.sql`. Run it in **Supabase Dashboard → SQL Editor**.

### Tables Overview

| Table | Purpose |
|---|---|
| `user_profiles` | All users — customers and staff. Linked 1:1 to `auth.users`. |
| `staff_shifts` | Shift schedules per staff member |
| `leave_requests` | Leave and shift-swap requests from staff |
| `tasks` | Operational tasks assigned across roles and outlets |
| `checklists` | SOP checklists per role and outlet |
| `checklist_completions` | Per-staff completion records for checklists |
| `reservations` | Normalized reservation records (replaces JSONB array) |
| `feedback` | Customer feedback submissions per outlet |
| `audit_logs` | System-wide activity and audit trail |

---

### `user_profiles`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | FK → `auth.users(id)` |
| `name` | text | Full name |
| `email` | text | Login email |
| `phone` | text | Reservation contact number |
| `mobile` | text | Staff mobile number |
| `role` | text | `SuperAdmin` / `Owner` / `Admin` / `Manager` / `Chef` / `HR` / `Accountant` / `Customer` |
| `outlet` | text | Assigned outlet (staff only) |
| `is_active` | boolean | Account enabled/disabled |
| `reward_points` | integer | Loyalty points (customers) |
| `tier` | text | `Green` / `Gold` / `Sanctuary VIP` |
| `total_visits` | integer | Dining visit count |
| `joined_date` | text | Human-readable join date |
| `transactions` | jsonb | Loyalty point transaction history |
| `reservations` | jsonb | Legacy reservation history (customers) |
| `created_at` | timestamptz | Row creation timestamp |

---

### `staff_shifts`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `staff_id` | uuid | FK → `user_profiles(id)` |
| `outlet` | text | Outlet name |
| `shift_date` | date | Date of shift |
| `start_time` | time | Shift start |
| `end_time` | time | Shift end |
| `shift_type` | text | `Regular` / `Split` / `On-Call` / `Holiday` |
| `status` | text | `Scheduled` / `Completed` / `Absent` / `Swapped` |
| `notes` | text | Optional notes |

---

### `leave_requests`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `staff_id` | uuid | FK → `user_profiles(id)` |
| `request_type` | text | `Leave` / `Shift Swap` / `Early Out` / `Late Start` |
| `from_date` | date | Start of leave |
| `to_date` | date | End of leave |
| `reason` | text | Optional reason |
| `status` | text | `Pending` / `Approved` / `Rejected` |
| `reviewed_by` | uuid | FK → `user_profiles(id)` (HR/Admin) |
| `reviewed_at` | timestamptz | When reviewed |

---

### `tasks`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | Task title |
| `description` | text | Details |
| `assigned_to` | uuid | FK → `user_profiles(id)` |
| `assigned_role` | text | Role-level assignment |
| `outlet` | text | Outlet scope |
| `priority` | text | `Low` / `Normal` / `High` / `Urgent` |
| `status` | text | `Open` / `In Progress` / `Done` / `Escalated` |
| `due_date` | date | Deadline |
| `created_by` | uuid | FK → `user_profiles(id)` |

---

### `checklists`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `title` | text | Checklist name |
| `role` | text | Target role |
| `outlet` | text | Outlet scope (null = all) |
| `frequency` | text | `Daily` / `Weekly` / `Monthly` / `One-Time` |
| `items` | jsonb | Array of `{ id, label, done }` |

---

### `reservations`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `booking_code` | text | Unique booking reference (e.g. `MF-4821`) |
| `customer_id` | uuid | FK → `user_profiles(id)` |
| `outlet` | text | Outlet name |
| `reservation_date` | date | Date of dining |
| `time_slot` | text | e.g. `7:30 PM` |
| `guests` | integer | Party size |
| `seating_area` | text | e.g. `Garden`, `Private Space` |
| `status` | text | `Confirmed` / `Completed` / `Cancelled` / `No-Show` |
| `dietary_prefs` | text | Dietary requirements |
| `special_occasion` | text | e.g. `Birthday`, `Anniversary` |
| `table_id` | text | Assigned table reference |

---

### `feedback`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `customer_id` | uuid | FK → `user_profiles(id)` |
| `outlet` | text | Outlet name |
| `reservation_id` | uuid | FK → `reservations(id)` |
| `rating` | integer | 1–5 |
| `category` | text | `Food` / `Service` / `Ambience` / `General` / `Complaint` |
| `message` | text | Feedback text |
| `is_resolved` | boolean | Resolution status |
| `resolved_by` | uuid | FK → `user_profiles(id)` |

---

### `audit_logs`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `actor_id` | uuid | FK → `user_profiles(id)` |
| `actor_name` | text | Snapshot of name at time of action |
| `actor_role` | text | Snapshot of role |
| `action` | text | Description of action |
| `entity` | text | Affected entity type |
| `entity_id` | text | Affected entity ID |
| `outlet` | text | Outlet context |
| `metadata` | jsonb | Additional context |

---

### Row Level Security Summary

| Table | Customer | Staff (Chef/HR/etc.) | Manager/Admin | SuperAdmin/Owner |
|---|---|---|---|---|
| `user_profiles` | Own row only | Own row only | Read all | Full access |
| `reservations` | Own only | — | Read + update | Full access |
| `staff_shifts` | — | Own only | Read all | Full access |
| `leave_requests` | — | Submit own | Approve/reject | Full access |
| `tasks` | — | Assigned only | Create + manage | Full access |
| `checklists` | — | Role-scoped | Read + complete | Full access |
| `feedback` | Submit own | — | Read + resolve | Full access |
| `audit_logs` | — | — | Read only | Read only |

---

## 🔐 Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key
VITE_SUPABASE_SERVICE_KEY=your-secret-service-role-key
```

> ⚠️ `VITE_SUPABASE_SERVICE_KEY` is the service role key. It is used **only** in the SuperAdmin dashboard for staff account creation via `auth.admin.createUser()`. Never expose this in customer-facing code.
