-- ============================================================
-- MAYFLOWER PHASE 1 — SEED DATA
-- Run AFTER schema.sql in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- STAFF USERS
-- Passwords: <role>@1234  (e.g. superadmin@1234)
-- Generate hashes: https://bcrypt-generator.com  (rounds = 10)
-- OR run locally: node -e "const b=require('bcryptjs'); console.log(b.hashSync('manager@1234',10))"
-- Replace every $2b$10$REPLACE_... below with your generated hash
-- ============================================================

INSERT INTO users (id, name, email, password_hash, role) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Super Admin',  'superadmin@mayflower.in',  '$2b$10$REPLACE_SUPERADMIN_HASH',  'SuperAdmin'),
  ('b1000000-0000-0000-0000-000000000002', 'Owner',        'owner@mayflower.in',        '$2b$10$REPLACE_OWNER_HASH',       'Owner'),
  ('b1000000-0000-0000-0000-000000000003', 'Admin',        'admin@mayflower.in',        '$2b$10$REPLACE_ADMIN_HASH',       'Admin'),
  ('b1000000-0000-0000-0000-000000000004', 'Manager PG',   'manager.pg@mayflower.in',   '$2b$10$REPLACE_MANAGER_HASH',     'Manager'),
  ('b1000000-0000-0000-0000-000000000005', 'Manager AN',   'manager.an@mayflower.in',   '$2b$10$REPLACE_MANAGER_HASH',     'Manager'),
  ('b1000000-0000-0000-0000-000000000006', 'Chef Kumar',   'chef@mayflower.in',         '$2b$10$REPLACE_CHEF_HASH',        'Chef'),
  ('b1000000-0000-0000-0000-000000000007', 'HR Priya',     'hr@mayflower.in',           '$2b$10$REPLACE_HR_HASH',          'HR'),
  ('b1000000-0000-0000-0000-000000000008', 'Accountant',   'accounts@mayflower.in',     '$2b$10$REPLACE_ACCOUNTANT_HASH',  'Accountant')
ON CONFLICT (id) DO NOTHING;

-- Assign managers to outlets
UPDATE users SET outlet_id = 'a1000000-0000-0000-0000-000000000001' WHERE id = 'b1000000-0000-0000-0000-000000000004';
UPDATE users SET outlet_id = 'a1000000-0000-0000-0000-000000000002' WHERE id = 'b1000000-0000-0000-0000-000000000005';
UPDATE users SET outlet_id = 'a1000000-0000-0000-0000-000000000001' WHERE id = 'b1000000-0000-0000-0000-000000000006';

-- ============================================================
-- FLOORS — Poes Garden (a1...001)
-- ============================================================

INSERT INTO floors (id, outlet_id, name, sort_order) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Glasshouse Conservatory', 1),
  ('f1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Courtyard Garden',        2),
  ('f1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Mezzanine',               3),
  ('f1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'Private Booths',          4)
ON CONFLICT (id) DO NOTHING;

-- FLOORS — Anna Nagar (a1...002)
INSERT INTO floors (id, outlet_id, name, sort_order) VALUES
  ('f2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Main Dining',   1),
  ('f2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Garden Patio',  2),
  ('f2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Private Room',  3)
ON CONFLICT (id) DO NOTHING;

-- FLOORS — Egmore (a1...003)
INSERT INTO floors (id, outlet_id, name, sort_order) VALUES
  ('f3000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'Main Hall',     1),
  ('f3000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 'Terrace',       2)
ON CONFLICT (id) DO NOTHING;

-- FLOORS — Palavakkam ECR (a1...004)
INSERT INTO floors (id, outlet_id, name, sort_order) VALUES
  ('f4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'Beachside Deck', 1),
  ('f4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'Indoor Lounge',  2)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- TABLES — Poes Garden
-- ============================================================

INSERT INTO tables (outlet_id, floor_id, name, seats, position_x, position_y) VALUES
  -- Glasshouse Conservatory
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'GH-01', 2, 10, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'GH-02', 2, 30, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'GH-03', 4, 50, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'GH-04', 4, 70, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000001', 'GH-05', 6, 10, 40),
  -- Courtyard Garden
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 'CY-01', 4, 10, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 'CY-02', 4, 40, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 'CY-03', 6, 70, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000002', 'CY-04', 2, 10, 50),
  -- Mezzanine
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000003', 'MZ-01', 2, 10, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000003', 'MZ-02', 4, 40, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000003', 'MZ-03', 4, 70, 10),
  -- Private Booths
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000004', 'PB-01', 4, 10, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000004', 'PB-02', 4, 40, 10),
  ('a1000000-0000-0000-0000-000000000001', 'f1000000-0000-0000-0000-000000000004', 'PB-03', 8, 70, 10);

-- TABLES — Anna Nagar
INSERT INTO tables (outlet_id, floor_id, name, seats, position_x, position_y) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000001', 'MD-01', 2, 10, 10),
  ('a1000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000001', 'MD-02', 2, 30, 10),
  ('a1000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000001', 'MD-03', 4, 50, 10),
  ('a1000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000001', 'MD-04', 4, 70, 10),
  ('a1000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000002', 'GP-01', 4, 10, 10),
  ('a1000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000002', 'GP-02', 6, 40, 10),
  ('a1000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000003', 'PR-01', 8, 10, 10);

-- TABLES — Egmore
INSERT INTO tables (outlet_id, floor_id, name, seats, position_x, position_y) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'f3000000-0000-0000-0000-000000000001', 'MH-01', 2, 10, 10),
  ('a1000000-0000-0000-0000-000000000003', 'f3000000-0000-0000-0000-000000000001', 'MH-02', 4, 30, 10),
  ('a1000000-0000-0000-0000-000000000003', 'f3000000-0000-0000-0000-000000000001', 'MH-03', 4, 50, 10),
  ('a1000000-0000-0000-0000-000000000003', 'f3000000-0000-0000-0000-000000000002', 'TR-01', 4, 10, 10),
  ('a1000000-0000-0000-0000-000000000003', 'f3000000-0000-0000-0000-000000000002', 'TR-02', 6, 40, 10);

-- TABLES — Palavakkam
INSERT INTO tables (outlet_id, floor_id, name, seats, position_x, position_y) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'f4000000-0000-0000-0000-000000000001', 'BD-01', 2, 10, 10),
  ('a1000000-0000-0000-0000-000000000004', 'f4000000-0000-0000-0000-000000000001', 'BD-02', 4, 30, 10),
  ('a1000000-0000-0000-0000-000000000004', 'f4000000-0000-0000-0000-000000000001', 'BD-03', 4, 50, 10),
  ('a1000000-0000-0000-0000-000000000004', 'f4000000-0000-0000-0000-000000000001', 'BD-04', 6, 70, 10),
  ('a1000000-0000-0000-0000-000000000004', 'f4000000-0000-0000-0000-000000000002', 'IL-01', 4, 10, 10),
  ('a1000000-0000-0000-0000-000000000004', 'f4000000-0000-0000-0000-000000000002', 'IL-02', 4, 40, 10);

-- ============================================================
-- MENU ITEMS (outlet_id NULL = available at all outlets)
-- ============================================================

INSERT INTO menu_items (outlet_id, category, name, description, price, is_veg, is_chef_pick, sort_order) VALUES

  -- DIM SUMS
  (NULL, 'Dim Sums', 'Veg Crystal Dumpling',        'Steamed crystal skin, mixed vegetables',              280, TRUE,  FALSE, 1),
  (NULL, 'Dim Sums', 'Prawn Har Gow',               'Classic steamed prawn dumplings',                     320, FALSE, TRUE,  2),
  (NULL, 'Dim Sums', 'Chicken Siu Mai',             'Open-top steamed chicken & mushroom',                 300, FALSE, FALSE, 3),
  (NULL, 'Dim Sums', 'Truffle Edamame Dumpling',    'Steamed, truffle oil, edamame filling',               360, TRUE,  TRUE,  4),
  (NULL, 'Dim Sums', 'Crispy Taro Dumpling',        'Deep-fried taro shell, vegetable filling',            290, TRUE,  FALSE, 5),
  (NULL, 'Dim Sums', 'Pork & Ginger Dumpling',      'Steamed pork with fresh ginger',                      310, FALSE, FALSE, 6),

  -- STARTERS
  (NULL, 'Starters', 'Crispy Corn',                 'Wok-tossed corn, butter pepper sauce',                220, TRUE,  FALSE, 1),
  (NULL, 'Starters', 'Chicken Satay',               'Grilled skewers, peanut sauce',                       320, FALSE, TRUE,  2),
  (NULL, 'Starters', 'Mushroom Bruschetta',         'Sourdough toast, sautéed mushrooms, truffle oil',     280, TRUE,  FALSE, 3),
  (NULL, 'Starters', 'Calamari Fritti',             'Crispy squid rings, aioli dip',                       380, FALSE, FALSE, 4),
  (NULL, 'Starters', 'Avocado Toast',               'Multigrain toast, smashed avocado, chilli flakes',    320, TRUE,  TRUE,  5),
  (NULL, 'Starters', 'Prawn Tempura',               'Light battered prawns, ponzu dipping sauce',          420, FALSE, FALSE, 6),

  -- SOURDOUGH PIZZAS
  (NULL, 'Sourdough Pizzas', 'Margherita',          'San Marzano tomato, fresh mozzarella, basil',         480, TRUE,  FALSE, 1),
  (NULL, 'Sourdough Pizzas', 'Truffle Mushroom',    'Wild mushrooms, truffle cream, parmesan',             580, TRUE,  TRUE,  2),
  (NULL, 'Sourdough Pizzas', 'BBQ Chicken',         'Smoked chicken, BBQ sauce, red onion, jalapeño',      560, FALSE, FALSE, 3),
  (NULL, 'Sourdough Pizzas', 'Prawn Aglio',         'Garlic butter prawns, cherry tomato, rocket',         620, FALSE, TRUE,  4),
  (NULL, 'Sourdough Pizzas', 'Four Cheese',         'Mozzarella, cheddar, parmesan, gorgonzola',           540, TRUE,  FALSE, 5),
  (NULL, 'Sourdough Pizzas', 'Pesto Veggie',        'Basil pesto, zucchini, bell peppers, olives',         500, TRUE,  FALSE, 6),

  -- PASTAS & RAVIOLI
  (NULL, 'Pastas & Ravioli', 'Spaghetti Aglio e Olio', 'Garlic, olive oil, chilli, parmesan',              380, TRUE,  FALSE, 1),
  (NULL, 'Pastas & Ravioli', 'Penne Arrabbiata',    'Spicy tomato sauce, fresh basil',                     360, TRUE,  FALSE, 2),
  (NULL, 'Pastas & Ravioli', 'Chicken Alfredo',     'Creamy white sauce, grilled chicken, fettuccine',     480, FALSE, TRUE,  3),
  (NULL, 'Pastas & Ravioli', 'Mushroom Ravioli',    'Handmade ravioli, wild mushroom, sage butter',        520, TRUE,  TRUE,  4),
  (NULL, 'Pastas & Ravioli', 'Prawn Linguine',      'Garlic butter prawns, white wine, cherry tomato',     560, FALSE, FALSE, 5),
  (NULL, 'Pastas & Ravioli', 'Spinach Ricotta Ravioli', 'Handmade, spinach ricotta, tomato cream',         500, TRUE,  FALSE, 6),

  -- BURGERS
  (NULL, 'Burgers', 'Classic Veggie Burger',        'Beetroot patty, lettuce, tomato, chipotle mayo',      380, TRUE,  FALSE, 1),
  (NULL, 'Burgers', 'Smash Burger',                 'Double smash patty, American cheese, pickles',        480, FALSE, TRUE,  2),
  (NULL, 'Burgers', 'Crispy Chicken Burger',        'Buttermilk fried chicken, coleslaw, sriracha',        440, FALSE, FALSE, 3),
  (NULL, 'Burgers', 'Mushroom Swiss Burger',        'Portobello patty, Swiss cheese, caramelised onion',   420, TRUE,  FALSE, 4),

  -- ASIAN BOWLS
  (NULL, 'Asian Bowls', 'Khao Suey',               'Burmese coconut curry noodle bowl, condiments',        480, FALSE, TRUE,  1),
  (NULL, 'Asian Bowls', 'Veg Khao Suey',           'Burmese coconut curry, tofu, noodles',                 440, TRUE,  FALSE, 2),
  (NULL, 'Asian Bowls', 'Teriyaki Chicken Bowl',   'Steamed rice, teriyaki chicken, pickled cucumber',     460, FALSE, FALSE, 3),
  (NULL, 'Asian Bowls', 'Tofu Poke Bowl',          'Sushi rice, marinated tofu, edamame, sesame',          420, TRUE,  TRUE,  4),
  (NULL, 'Asian Bowls', 'Thai Green Curry Bowl',   'Jasmine rice, Thai green curry, vegetables',           440, TRUE,  FALSE, 5),

  -- MONSTER SHAKES
  (NULL, 'Monster Shakes', 'Salted Caramel Shake', 'Vanilla ice cream, salted caramel, whipped cream',     320, TRUE,  TRUE,  1),
  (NULL, 'Monster Shakes', 'Kit Kat Shake',        'Chocolate ice cream, Kit Kat crumble, fudge drizzle',  340, TRUE,  FALSE, 2),
  (NULL, 'Monster Shakes', 'Nutella Hazelnut Shake','Nutella, hazelnut gelato, roasted hazelnuts',          360, TRUE,  TRUE,  3),
  (NULL, 'Monster Shakes', 'Strawberry Cheesecake Shake', 'Strawberry, cream cheese, graham cracker',      340, TRUE,  FALSE, 4),

  -- MOCKTAILS & COOLERS
  (NULL, 'Mocktails & Coolers', 'Virgin Mojito',   'Fresh mint, lime, soda, sugar syrup',                  180, TRUE,  FALSE, 1),
  (NULL, 'Mocktails & Coolers', 'Watermelon Cooler','Fresh watermelon, mint, lime, chilli salt rim',        200, TRUE,  FALSE, 2),
  (NULL, 'Mocktails & Coolers', 'Blue Lagoon',     'Blue curacao syrup, lemon, soda',                       190, TRUE,  FALSE, 3),
  (NULL, 'Mocktails & Coolers', 'Passion Fruit Fizz','Passion fruit, ginger ale, lime',                     210, TRUE,  TRUE,  4),
  (NULL, 'Mocktails & Coolers', 'Lychee Lemonade', 'Fresh lychee, lemon, sparkling water',                  200, TRUE,  FALSE, 5),

  -- ARTISANAL COFFEES
  (NULL, 'Artisanal Coffees', 'Flat White',        'Double ristretto, steamed micro-foam milk',             180, TRUE,  FALSE, 1),
  (NULL, 'Artisanal Coffees', 'Cold Brew',         '18-hour cold brew, served over ice',                    200, TRUE,  TRUE,  2),
  (NULL, 'Artisanal Coffees', 'Dalgona Coffee',    'Whipped coffee foam, chilled milk',                     220, TRUE,  FALSE, 3),
  (NULL, 'Artisanal Coffees', 'Hazelnut Latte',    'Espresso, hazelnut syrup, steamed milk',                210, TRUE,  FALSE, 4),
  (NULL, 'Artisanal Coffees', 'Matcha Latte',      'Ceremonial grade matcha, oat milk',                     230, TRUE,  TRUE,  5),

  -- DESSERTS
  (NULL, 'Desserts', 'Sizzling Brownie',           'Warm chocolate brownie, vanilla ice cream, fudge',      280, TRUE,  TRUE,  1),
  (NULL, 'Desserts', 'Lotus Biscoff Cheesecake',   'No-bake cheesecake, Biscoff crust, caramel drizzle',    320, TRUE,  TRUE,  2),
  (NULL, 'Desserts', 'Chocolate Mousse',           'Dark chocolate mousse, raspberry coulis',               260, TRUE,  FALSE, 3),
  (NULL, 'Desserts', 'Tiramisu',                   'Classic Italian, mascarpone, espresso-soaked ladyfingers', 300, TRUE, FALSE, 4),
  (NULL, 'Desserts', 'Mango Panna Cotta',          'Alphonso mango, vanilla panna cotta, mango gel',        280, TRUE,  FALSE, 5);

-- ============================================================
-- SOP CHECKLISTS
-- ============================================================

INSERT INTO sop_checklists (outlet_id, category, name, description, assigned_role, created_by) VALUES

  -- Opening SOPs (all outlets)
  ('a1000000-0000-0000-0000-000000000001', 'Opening', 'Morning Opening Checklist',
   'Daily opening tasks before first service', 'Manager', 'b1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000001', 'Kitchen', 'Kitchen Prep Checklist',
   'Mise en place, equipment check, temperature logs', 'Chef', 'b1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000001', 'Hygiene', 'Daily Hygiene & Sanitation',
   'Surface sanitisation, handwash stations, waste disposal', 'Chef', 'b1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000001', 'Floor', 'Floor Setup & Table Lay',
   'Table linen, cutlery placement, condiment refill', 'Manager', 'b1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000001', 'Closing', 'End of Day Closing Checklist',
   'Cash reconciliation, equipment shutdown, security check', 'Manager', 'b1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000001', 'Quality Checks', 'Food Quality & Plating Standards',
   'Portion control, temperature checks, presentation standards', 'Chef', 'b1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000001', 'Customer Service', 'Guest Experience Standards',
   'Greeting, seating, order taking, complaint handling', 'Manager', 'b1000000-0000-0000-0000-000000000004'),
  ('a1000000-0000-0000-0000-000000000001', 'Equipment', 'Equipment Maintenance Log',
   'Daily equipment inspection, fault reporting', 'Chef', 'b1000000-0000-0000-0000-000000000004'),

  -- Anna Nagar SOPs
  ('a1000000-0000-0000-0000-000000000002', 'Opening', 'Morning Opening Checklist',
   'Daily opening tasks before first service', 'Manager', 'b1000000-0000-0000-0000-000000000005'),
  ('a1000000-0000-0000-0000-000000000002', 'Kitchen', 'Kitchen Prep Checklist',
   'Mise en place, equipment check, temperature logs', 'Chef', 'b1000000-0000-0000-0000-000000000005'),
  ('a1000000-0000-0000-0000-000000000002', 'Closing', 'End of Day Closing Checklist',
   'Cash reconciliation, equipment shutdown, security check', 'Manager', 'b1000000-0000-0000-0000-000000000005');

-- ============================================================
-- INTEGRATION CONFIG (inactive placeholders)
-- ============================================================

INSERT INTO integration_config (name, config, is_active) VALUES
  ('petpooja',  '{"api_url": "", "api_key": "", "outlet_ids": {}}', FALSE),
  ('loyalty',   '{"provider": "internal", "points_per_visit": 10}', TRUE),
  ('resend',    '{"from": "noreply@mayflower.in"}',                  TRUE),
  ('razorpay',  '{"key_id": "", "webhook_secret": ""}',              FALSE)
ON CONFLICT (name) DO NOTHING;
