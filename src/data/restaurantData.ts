import { Dish, CarouselSlide, LocationOutlet, RestaurantTable } from '../types';

export const HERO_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    title: 'Explore the uniqueness of',
    accent: 'our bohemian cafe.',
    subtitle: 'UNCOVER CULINARY WONDERS',
    tag: 'Bohemian Sanctuary',
    image: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-slider-2.jpg'
  },
  {
    id: 'slide-2',
    title: 'With fresh food in a',
    accent: 'cozy atmosphere.',
    subtitle: 'DELIGHT YOUR TASTE BUDS',
    tag: 'Italian & Global Cuisine',
    image: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-slider-1.jpg'
  },
  {
    id: 'slide-3',
    title: 'Dine amidst lush greenery &',
    accent: 'warm ambient light.',
    subtitle: 'TRANQUIL BOTANICAL ESCAPE',
    tag: 'Glasshouse Conservatory',
    image: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-1.jpg'
  },
  {
    id: 'slide-4',
    title: 'Handcrafted flavours for your',
    accent: 'cherished moments.',
    subtitle: 'A CULINARY SANCTUARY',
    tag: 'Poes Garden & Anna Nagar',
    image: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-2.jpg'
  },
  {
    id: 'slide-5',
    title: 'From slow cold brews to',
    accent: 'sizzling brownies & shakes.',
    subtitle: 'MOMENTS AT MAYFLOWER',
    tag: 'Artisanal Cafe Fare',
    image: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-3.jpg'
  }
];

export const MENU_ITEMS: Dish[] = [
  // 1. DIM SUMS & DUMPLINGS
  {
    id: 'm-ds1',
    name: 'Water Chestnut & Corn Dim Sum',
    category: 'dim-sum',
    categoryName: 'Dim Sums',
    cuisine: 'dim-sum',
    description: 'Translucent steamed crystal dumplings packed with crunchy water chestnuts and sweet golden corn. Served with house chilli dip.',
    price: 380,
    isVeg: true,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80',
    portion: '4 pcs',
    calories: '180 kcal'
  },
  {
    id: 'm-ds2',
    name: 'Truffle Edamame Crystal Dumplings',
    category: 'dim-sum',
    categoryName: 'Dim Sums',
    cuisine: 'dim-sum',
    description: 'Delicate steamed dumplings filled with mashed green edamame beans and a hint of fragrant truffle oil. Served with seasoned soy sauce.',
    price: 440,
    isVeg: true,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
    portion: '4 pcs',
    calories: '195 kcal'
  },
  {
    id: 'm-ds3',
    name: 'Chicken & Prawn Sui Mai',
    category: 'dim-sum',
    categoryName: 'Dim Sums',
    cuisine: 'dim-sum',
    description: 'Open-topped steamed wonton parcels filled with juicy minced chicken and seasoned tiger prawns, finished with a touch of sesame.',
    price: 460,
    isVeg: false,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=800&q=80',
    portion: '4 pcs',
    calories: '240 kcal'
  },
  {
    id: 'm-ds4',
    name: 'Prawn Har Gau',
    category: 'dim-sum',
    categoryName: 'Dim Sums',
    cuisine: 'dim-sum',
    description: 'Classic Cantonese steamed crystal dumplings with chopped fresh prawns and spring bamboo shoots in thin translucent wrappers.',
    price: 480,
    isVeg: false,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    portion: '4 pcs',
    calories: '210 kcal'
  },
  {
    id: 'm-ds5',
    name: 'Cream Cheese & Water Chestnut Dumpling',
    category: 'dim-sum',
    categoryName: 'Dim Sums',
    cuisine: 'dim-sum',
    description: 'Smooth melted cream cheese paired with diced crunchy water chestnuts, garlic, and fresh chives in delicate pleated dough.',
    price: 410,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    portion: '4 pcs',
    calories: '220 kcal'
  },
  {
    id: 'm-ds6',
    name: 'Chicken Dim Sum Clear Soup',
    category: 'dim-sum',
    categoryName: 'Dim Sums',
    cuisine: 'dim-sum',
    description: 'Warm, comforting clear chicken broth with tender steamed chicken dumplings, fresh baby bok choy, and ginger scallion oil.',
    price: 360,
    isVeg: false,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    portion: '1 bowl',
    calories: '160 kcal'
  },

  // 2. STARTERS & SMALL PLATES
  {
    id: 'm-st1',
    name: 'Panko Crispy Chicken',
    category: 'starters',
    categoryName: 'Starters',
    cuisine: 'starters',
    description: 'Iconic Mayflower signature: tender boneless chicken breast coated in Japanese panko crumbs, fried golden crispy. Served with smoked garlic aioli.',
    price: 460,
    isVeg: false,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80',
    portion: 'Generous portion',
    calories: '450 kcal'
  },
  {
    id: 'm-st1-b',
    name: 'Tangy Asian Orange Chicken',
    category: 'starters',
    categoryName: 'Starters',
    cuisine: 'starters',
    description: 'Crispy wok-tossed chicken bites glazed in a bittersweet mandarin orange chilli sauce with toasted sesame seeds and fresh scallions.',
    price: 480,
    isVeg: false,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80',
    portion: 'Generous sharing',
    calories: '470 kcal'
  },
  {
    id: 'm-st2',
    name: 'Crispy Lotus Stem in Honey Chilli',
    category: 'starters',
    categoryName: 'Starters',
    cuisine: 'starters',
    description: 'Thinly sliced crispy fried lotus root tossed in a hot wok with honey, garlic chilli glaze, roasted white sesame seeds, and spring onions.',
    price: 390,
    isVeg: true,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    portion: 'Sharing plate',
    calories: '290 kcal'
  },
  {
    id: 'm-st3',
    name: 'Chicken Peanut Satay Skewers',
    category: 'starters',
    categoryName: 'Starters',
    cuisine: 'starters',
    description: 'Char-grilled chicken skewers marinated with lemongrass and turmeric, served with warm, thick roasted peanut dipping sauce.',
    price: 450,
    isVeg: false,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
    portion: '4 skewers',
    calories: '380 kcal'
  },
  {
    id: 'm-st4',
    name: 'Falafel & Hummus Plate',
    category: 'starters',
    categoryName: 'Starters',
    cuisine: 'starters',
    description: 'Crispy chickpea falafels served with smooth house hummus, extra virgin olive oil, pickled cucumber, olives, and warm pita bread.',
    price: 420,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=800&q=80',
    portion: 'Platter with 2 pitas',
    calories: '410 kcal'
  },
  {
    id: 'm-st5',
    name: 'Vietnamese Fresh Summer Rolls',
    category: 'starters',
    categoryName: 'Starters',
    cuisine: 'starters',
    description: 'Chilled rice paper rolls wrapped with cucumber ribbons, shredded carrots, rice noodles, fresh mint, and tofu with sweet spicy dip.',
    price: 370,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    portion: '4 rolls',
    calories: '170 kcal'
  },
  {
    id: 'm-st6',
    name: 'Loaded Peri Peri Fries',
    category: 'starters',
    categoryName: 'Starters',
    cuisine: 'starters',
    description: 'Crisp golden french fries dusted generously with our house peri peri spice mix, served with herb mayo dip.',
    price: 260,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=800&q=80',
    portion: 'Basket',
    calories: '320 kcal'
  },
  {
    id: 'm-st7',
    name: 'Jalapeno Cheese Poppers',
    category: 'starters',
    categoryName: 'Starters',
    cuisine: 'starters',
    description: 'Golden fried crispy breadcrumb bites stuffed with gooey melted cheddar, mozzarella, and spicy pickled jalapenos.',
    price: 360,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    portion: '6 pcs',
    calories: '340 kcal'
  },

  // 3. SOURDOUGH PIZZAS
  {
    id: 'm-pz1',
    name: 'Margherita Sourdough Pizza',
    category: 'pizza',
    categoryName: 'Pizzas',
    cuisine: 'pizza',
    description: '24-hour slow fermented hand-stretched sourdough crust with classic Italian tomato sauce, fresh mozzarella, extra virgin olive oil, and fresh basil.',
    price: 480,
    isVeg: true,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    portion: '11 inch (6 slices)',
    calories: '680 kcal'
  },
  {
    id: 'm-pz2',
    name: 'Smoked BBQ Chicken Pizza',
    category: 'pizza',
    categoryName: 'Pizzas',
    cuisine: 'pizza',
    description: 'Tender pulled chicken tossed in rich smoky BBQ sauce, caramelized onions, mozzarella cheese, and fresh coriander on crisp sourdough crust.',
    price: 560,
    isVeg: false,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
    portion: '11 inch (6 slices)',
    calories: '760 kcal'
  },
  {
    id: 'm-pz3',
    name: 'Mayflower Exotica Veg Pizza',
    category: 'pizza',
    categoryName: 'Pizzas',
    cuisine: 'pizza',
    description: 'Loaded with sliced button mushrooms, bell peppers, sweet corn kernels, black olives, tomato marinara, and gooey mozzarella.',
    price: 510,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    portion: '11 inch (6 slices)',
    calories: '710 kcal'
  },
  {
    id: 'm-pz4',
    name: 'Pepperoni & Jalapeno Sourdough',
    category: 'pizza',
    categoryName: 'Pizzas',
    cuisine: 'pizza',
    description: 'Generous slices of pepperoni, spicy pickled jalapenos, rich tomato sauce, and melted mozzarella with seasoned oregano crust.',
    price: 590,
    isVeg: false,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    portion: '11 inch (6 slices)',
    calories: '810 kcal'
  },
  {
    id: 'm-pz5',
    name: 'Truffled Forest Mushroom Pizza',
    category: 'pizza',
    categoryName: 'Pizzas',
    cuisine: 'pizza',
    description: 'Sautéed button and shiitake mushrooms, white cream sauce, melted mozzarella cheese, fresh thyme, and aromatic truffle oil.',
    price: 540,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=800&q=80',
    portion: '11 inch (6 slices)',
    calories: '720 kcal'
  },
  {
    id: 'm-pz6',
    name: 'Spiced Lamb Keema Pizza',
    category: 'pizza',
    categoryName: 'Pizzas',
    cuisine: 'pizza',
    description: 'Slow-cooked seasoned minced lamb keema with red onions, chopped green chillies, mint, and mozzarella cheese on wood-fired crust.',
    price: 590,
    isVeg: false,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
    portion: '11 inch (6 slices)',
    calories: '830 kcal'
  },

  // 4. CRAFTED PASTAS & RAVIOLI
  {
    id: 'm-ps1',
    name: 'Mayflower Pink Sauce Penne',
    category: 'pasta',
    categoryName: 'Pastas',
    cuisine: 'pasta',
    description: 'Penne pasta tossed in our chef’s popular signature blend of rich tomato sauce and velvety cream cheese sauce with fresh basil.',
    price: 480,
    isVeg: true,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
    portion: 'Main portion',
    calories: '540 kcal'
  },
  {
    id: 'm-ps2',
    name: 'Fettuccine Alfredo',
    category: 'pasta',
    categoryName: 'Pastas',
    cuisine: 'pasta',
    description: 'Fresh fettuccine pasta coated in a creamy butter and parmesan sauce with fresh cracked black pepper and garlic bread.',
    price: 480,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=800&q=80',
    portion: 'Main portion',
    calories: '590 kcal'
  },
  {
    id: 'm-ps3',
    name: 'Wild Mushroom Ravioli',
    category: 'pasta',
    categoryName: 'Pastas',
    cuisine: 'pasta',
    description: 'Handmade pasta parcels stuffed with forest mushrooms and creamy ricotta cheese, finished in herb butter and shaved parmesan.',
    price: 520,
    isVeg: true,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=800&q=80',
    portion: '6 large ravioli',
    calories: '480 kcal'
  },
  {
    id: 'm-ps4',
    name: 'Spaghetti Aglio e Olio with Prawns',
    category: 'pasta',
    categoryName: 'Pastas',
    cuisine: 'pasta',
    description: 'Al dente spaghetti tossed in golden garlic slices, extra virgin olive oil, chilli flakes, fresh parsley, and succulent seared prawns.',
    price: 560,
    isVeg: false,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
    portion: 'Main portion',
    calories: '490 kcal'
  },
  {
    id: 'm-ps5',
    name: 'Classic Cacio e Pepe',
    category: 'pasta',
    categoryName: 'Pastas',
    cuisine: 'pasta',
    description: 'Traditional Roman simplicity: spaghetti swirled with rich aged pecorino cheese, pasta broth, and freshly cracked black peppercorns.',
    price: 460,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=800&q=80',
    portion: 'Main portion',
    calories: '460 kcal'
  },

  // 5. BURGERS & SANDWICHES
  {
    id: 'm-bg1',
    name: 'Southern Fried Chicken Burger',
    category: 'burgers',
    categoryName: 'Burgers',
    cuisine: 'burgers',
    description: 'Crispy buttermilk fried chicken fillet, spicy house mayonnaise, melted cheddar cheese, and pickles in a toasted brioche bun. Served with potato fries.',
    price: 480,
    isVeg: false,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    portion: 'Burger + Fries',
    calories: '680 kcal'
  },
  {
    id: 'm-bg2',
    name: 'Mayflower Classic Angus Burger',
    category: 'burgers',
    categoryName: 'Burgers',
    cuisine: 'burgers',
    description: 'Flame-grilled tender meat patty with double cheddar, caramelized onions, fresh tomatoes, lettuce, and secret burger spread with fries.',
    price: 540,
    isVeg: false,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=800&q=80',
    portion: 'Burger + Fries',
    calories: '740 kcal'
  },
  {
    id: 'm-bg3',
    name: 'Truffle Mushroom & Halloumi Burger',
    category: 'burgers',
    categoryName: 'Burgers',
    cuisine: 'burgers',
    description: 'Grilled halloumi cheese steak with sautéed garlic mushrooms, truffle aioli, and crisp lettuce on toasted brioche with seasoned fries.',
    price: 460,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    portion: 'Burger + Fries',
    calories: '590 kcal'
  },
  {
    id: 'm-bg4',
    name: 'Grilled Chicken Club Sandwich',
    category: 'burgers',
    categoryName: 'Burgers',
    cuisine: 'burgers',
    description: 'Triple-layer toasted sandwich with herb-grilled chicken breast, fried egg, cheddar slice, tomatoes, and mayo. Served with salted crisps.',
    price: 440,
    isVeg: false,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
    portion: '4 cut quarters + fries',
    calories: '560 kcal'
  },

  // 6. ASIAN MAINS & BOWLS
  {
    id: 'm-as1',
    name: 'Burmese Khao Suey (Chicken / Veg)',
    category: 'asian-bowls',
    categoryName: 'Asian Bowls',
    cuisine: 'asian-bowls',
    description: 'Mayflower’s star comfort bowl: A rich and creamy spiced coconut curry soup served with noodles, crispy fried garlic, roasted peanuts, shallots, and fresh lime.',
    price: 520,
    isVeg: false,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=800&q=80',
    portion: 'Large sharing bowl + 6 condiments',
    calories: '620 kcal'
  },
  {
    id: 'm-as2',
    name: 'Nasi Goreng with Chicken Satay',
    category: 'asian-bowls',
    categoryName: 'Asian Bowls',
    cuisine: 'asian-bowls',
    description: 'Indonesian wok-fried rice with sweet soy, vegetables, and chicken, topped with a fried sunny-side-up egg and grilled chicken satay skewers.',
    price: 520,
    isVeg: false,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
    portion: 'Full platter',
    calories: '650 kcal'
  },
  {
    id: 'm-as3',
    name: 'Pan-Fried Wanton Mee Noodles',
    category: 'asian-bowls',
    categoryName: 'Asian Bowls',
    cuisine: 'asian-bowls',
    description: 'Springy egg noodles tossed in savoury dark sauce with greens and spring onions, accompanied by crispy fried chicken wantons and chilli sauce.',
    price: 460,
    isVeg: false,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=800&q=80',
    portion: 'Main bowl',
    calories: '510 kcal'
  },
  {
    id: 'm-as4',
    name: 'Thai Green Curry with Jasmine Rice',
    category: 'asian-bowls',
    categoryName: 'Asian Bowls',
    cuisine: 'asian-bowls',
    description: 'Fragrant green curry simmered with coconut milk, Asian vegetables, bamboo shoots, and fresh sweet basil. Served with hot steamed jasmine rice.',
    price: 490,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
    portion: 'Curry bowl + Rice',
    calories: '530 kcal'
  },
  {
    id: 'm-as5',
    name: 'Moon Fan Fried Rice',
    category: 'asian-bowls',
    categoryName: 'Asian Bowls',
    cuisine: 'asian-bowls',
    description: 'Cantonese-style wok-tossed jasmine rice with shiitake mushrooms, scallions, sweet peppers, and toasted sesame oil.',
    price: 420,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
    portion: 'Sharing bowl',
    calories: '440 kcal'
  },

  // 7. DESSERTS & BEVERAGES
  {
    id: 'm-ds-sw1',
    name: 'Sizzler Brownie with Vanilla Ice Cream',
    category: 'desserts-beverages',
    categoryName: 'Desserts & Drinks',
    cuisine: 'desserts-beverages',
    description: 'Freshly baked rich chocolate fudge brownie served sizzling on a hot cast-iron plate with a scoop of vanilla ice cream and warm chocolate fudge.',
    price: 340,
    isVeg: true,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    portion: 'Sizzling platter',
    calories: '490 kcal'
  },
  {
    id: 'm-ds-sw2',
    name: 'Lotus Biscoff Cheesecake',
    category: 'desserts-beverages',
    categoryName: 'Desserts & Drinks',
    cuisine: 'desserts-beverages',
    description: 'Velvety baked cream cheesecake layered with warm melted Lotus Biscoff spread and topped with crunchy caramelized biscuit crumble.',
    price: 350,
    isVeg: true,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    portion: '1 generous slice',
    calories: '420 kcal'
  },
  {
    id: 'm-ds-sw3',
    name: 'Layered Belgian Chocolate Mousse',
    category: 'desserts-beverages',
    categoryName: 'Desserts & Drinks',
    cuisine: 'desserts-beverages',
    description: 'Silky, airy triple layers of dark, milk, and white Belgian chocolate mousse dusted with fine cocoa powder.',
    price: 320,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    portion: 'Glass cup',
    calories: '360 kcal'
  },
  {
    id: 'm-ds-sw4',
    name: 'Salted Caramel Monster Shake',
    category: 'desserts-beverages',
    categoryName: 'Desserts & Drinks',
    cuisine: 'desserts-beverages',
    description: 'Thick, creamy milkshake blended with vanilla ice cream, salted caramel drizzle, whipped cream, and crunchy pretzels.',
    price: 310,
    isVeg: true,
    isChefPick: true,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    portion: '400 ml jar',
    calories: '480 kcal'
  },
  {
    id: 'm-ds-sw5',
    name: 'Pina Colada Mocktail',
    category: 'desserts-beverages',
    categoryName: 'Desserts & Drinks',
    cuisine: 'desserts-beverages',
    description: 'Chilled tropical refresher made with pure pineapple juice, rich coconut cream, crushed ice, and a maraschino cherry.',
    price: 260,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=800&q=80',
    portion: '350 ml tall glass',
    calories: '180 kcal'
  },
  {
    id: 'm-ds-sw6',
    name: 'Cold Brew Coffee',
    category: 'desserts-beverages',
    categoryName: 'Desserts & Drinks',
    cuisine: 'desserts-beverages',
    description: 'Smooth, 16-hour slow steeped dark roast coffee served chilled over ice with or without milk.',
    price: 220,
    isVeg: true,
    isChefPick: false,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    portion: '300 ml glass',
    calories: '15 kcal'
  }
];

export const BEVERAGE_ITEMS = [
  {
    category: 'Monster Shakes',
    items: [
      { name: 'Salted Caramel Monster Shake', desc: 'Loaded with vanilla ice cream, salted caramel, and pretzel crumble', price: 310 },
      { name: 'Kit Kat Shake', desc: 'Thick blended chocolate shake with Kit Kat pieces and chocolate sauce', price: 290 },
      { name: 'Nutella Hazelnut Shake', desc: 'Creamy shake with pure Nutella spread and roasted hazelnuts', price: 320 },
      { name: 'Classic Strawberry Shake', desc: 'Blended with fresh strawberry puree and vanilla ice cream', price: 280 },
    ]
  },
  {
    category: 'Mocktails & Coolers',
    items: [
      { name: 'Pina Colada Mocktail', desc: 'Chilled pineapple juice with coconut cream and crushed ice', price: 260 },
      { name: 'Hibiscus Mint Iced Tea', desc: 'Fresh brewed hibiscus tea with mint leaves and lemon', price: 220 },
      { name: 'Fresh Mint & Lime Lemonade', desc: 'Classic freshly squeezed lemon cooler with crushed mint', price: 180 },
      { name: 'Green Apple Fizz', desc: 'Tart green apple syrup, sparkling soda, and lime juice', price: 240 },
    ]
  },
  {
    category: 'Coffee & Hot Drinks',
    items: [
      { name: 'Cold Brew Coffee', desc: '16-hour slow steeped smooth chilled coffee over ice', price: 220 },
      { name: 'Belgian Hot Chocolate', desc: 'Rich, velvety melted Belgian chocolate with warm steamed milk', price: 250 },
      { name: 'Cafe Latte / Cappuccino', desc: 'Double espresso shot with silky textured milk foam', price: 210 },
      { name: 'Iced Caramel Macchiato', desc: 'Espresso poured over chilled milk, vanilla, and caramel drizzle', price: 240 },
    ]
  },
  {
    category: 'Desserts',
    items: [
      { name: 'Sizzler Brownie with Vanilla Ice Cream', desc: 'Warm fudge brownie served sizzling with vanilla ice cream', price: 340 },
      { name: 'Lotus Biscoff Cheesecake', desc: 'Creamy cheesecake topped with melted Biscoff spread', price: 350 },
      { name: 'Layered Chocolate Mousse', desc: 'Triple layers of dark, milk, and white Belgian chocolate', price: 320 },
      { name: 'Classic Italian Tiramisu', desc: 'Espresso-soaked ladyfingers with whipped mascarpone cream', price: 340 },
    ]
  }
];

export const OUTLETS: LocationOutlet[] = [
  {
    id: 'poes-garden',
    name: 'Poes Garden',
    tagline: 'Garden Cafe & Glasshouse Dining',
    address: '17, Kasturi Rangan Rd, Poes Garden, Alwarpet, Chennai, Tamil Nadu 600018',
    hours: '11:00 AM – 11:00 PM (Daily)',
    phone: '80981 89000',
    description: 'Our flagship cafe in Poes Garden under shade trees. Features an airy glass conservatory, leafy open courtyard, and comfortable indoor dining.',
    image: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-1.jpg',
    icon: 'Flower2',
    mapCoordinates: { x: 52, y: 48 },
    highlights: ['Glasshouse Seating', 'Valet Parking', 'Outdoor Courtyard', 'Pet Friendly'],
    gmapUrl: 'https://maps.google.com/?q=Mayflower+17+Kasturi+Rangan+Rd+Poes+Garden+Alwarpet+Chennai'
  },
  {
    id: 'palavakkam',
    name: 'Palavakkam',
    tagline: 'Breezy Seaside Courtyard',
    address: '28, MGR Salai, Palavakkam, Chennai – 600041, Tamil Nadu',
    hours: '11:00 AM – 11:00 PM (Daily)',
    phone: '80981 89000',
    description: 'Located along MGR Salai, Palavakkam, this beachside cafe offers breezy palm-shaded seating, wood-fired pizzas, and gourmet coffee.',
    image: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-2.jpg',
    icon: 'Waves',
    mapCoordinates: { x: 62, y: 72 },
    highlights: ['Beach Breeze', 'Outdoor Cabanas', 'Wood-Fired Pizza', 'Ample Parking'],
    gmapUrl: 'https://maps.google.com/?q=Mayflower+28+MGR+Salai+Palavakkam+Chennai'
  },
  {
    id: 'egmore',
    name: 'Egmore',
    tagline: 'Art District Cafe & Espresso Bar',
    address: '57, Gandhi Irwin Road, Egmore, Chennai – 600008, Tamil Nadu',
    hours: '11:00 AM – 11:00 PM (Daily)',
    phone: '80981 89000',
    description: 'A bright, high-ceilinged cafe on Gandhi Irwin Road. Combines freshly brewed coffees and delicious food with warm wooden tables and local art.',
    image: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-3.jpg',
    icon: 'Coffee',
    mapCoordinates: { x: 48, y: 38 },
    highlights: ['Fresh Coffee Bar', 'Quiet Study Tables', 'Art Gallery Wall', 'Wheelchair Friendly'],
    gmapUrl: 'https://maps.google.com/?q=Mayflower+57+Gandhi+Irwin+Road+Egmore+Chennai'
  },
  {
    id: 'anna-nagar',
    name: 'Anna Nagar',
    tagline: 'Spacious Two-Level Cafe & Terrace',
    address: 'J9, 6th Ave, J Block, Annanagar East, Chennai – 600102, Tamil Nadu',
    hours: '11:00 AM – 11:00 PM (Daily)',
    phone: '80981 89000',
    description: 'A two-story cafe with hanging plants, natural light, and an open terrace in Annanagar East.',
    image: 'https://swirllifestyle.com/wp-content/uploads/2024/03/mayflower-slider-2.jpg',
    icon: 'Sparkles',
    mapCoordinates: { x: 38, y: 28 },
    highlights: ['Open Terrace', 'Private Mezzanine', 'Group Dining', 'Dessert Counter'],
    gmapUrl: 'https://maps.google.com/?q=Mayflower+J9+6th+Ave+J+Block+Annanagar+East+Chennai'
  }
];

export const RESTAURANT_TABLES: RestaurantTable[] = [
  // Garden Space
  {
    id: 'G1',
    name: 'Table G-01',
    area: 'Garden',
    seats: 2,
    locationDescription: 'Beside the natural stone lotus fountain',
    note: 'Intimate setting, soft ambient trickle, evening fairy lights',
    isAvailable: true
  },
  {
    id: 'G2',
    name: 'Table G-02',
    area: 'Garden',
    seats: 4,
    locationDescription: 'Under the spreading frangipani canopy',
    note: 'Generous teak round table, dappled shade, very serene',
    isAvailable: true,
    isChefRecommended: true
  },
  {
    id: 'G3',
    name: 'Table G-03',
    area: 'Garden',
    seats: 6,
    locationDescription: 'Garden pergola pavilion with hanging ferns',
    note: 'Spacious banquette, ideal for family lunches and celebrations',
    isAvailable: true
  },
  {
    id: 'G4',
    name: 'Table G-04',
    area: 'Garden',
    seats: 2,
    locationDescription: 'Corner nook surrounded by night-blooming jasmine',
    note: 'Romantic seclusion, fragrant evening breeze',
    isAvailable: false // reserved
  },

  // Window Veranda
  {
    id: 'W1',
    name: 'Table W-11',
    area: 'Window',
    seats: 2,
    locationDescription: 'Arched conservatory window with garden views',
    note: 'Natural sunlight by day, gentle candlelight by night',
    isAvailable: true,
    isChefRecommended: true
  },
  {
    id: 'W2',
    name: 'Table W-12',
    area: 'Window',
    seats: 4,
    locationDescription: 'Centre glass bay with panoramic lawn vista',
    note: 'Plush olive velvet chairs, unobstructed outdoor view',
    isAvailable: true
  },
  {
    id: 'W3',
    name: 'Table W-14',
    area: 'Window',
    seats: 2,
    locationDescription: 'South bay window overlooking the herb nursery',
    note: 'Quiet and bright, preferred for conversational dining',
    isAvailable: false
  },

  // Main Dining
  {
    id: 'M1',
    name: 'Table M-21',
    area: 'Main Dining',
    seats: 4,
    locationDescription: 'Centre salon beneath hand-beaten brass dome',
    note: 'Vibrant dining room atmosphere, view of open hearth',
    isAvailable: true
  },
  {
    id: 'M2',
    name: 'Table M-22',
    area: 'Main Dining',
    seats: 2,
    locationDescription: 'Booth banquette with woven cane backrest',
    note: 'Cozy cushioned seating, warm amber lighting',
    isAvailable: true
  },
  {
    id: 'M3',
    name: 'Table M-23',
    area: 'Main Dining',
    seats: 6,
    locationDescription: 'Polished walnut table flanking the wine library',
    note: 'Sommelier adjacent, perfect for multi-course wine pairings',
    isAvailable: true,
    isChefRecommended: true
  },
  {
    id: 'M4',
    name: 'Table M-24',
    area: 'Main Dining',
    seats: 8,
    locationDescription: 'Grand communal table in the primary salon',
    note: 'Spacious banquet arrangement with brass floral centerpiece',
    isAvailable: true
  },

  // Private Jasmine Space
  {
    id: 'P1',
    name: 'The Jasmine Suite Table',
    area: 'Private Space',
    seats: 8,
    locationDescription: 'Enclosed salon with hand-painted botanical murals',
    note: 'Dedicated butler service, bespoke tasting menu options',
    isAvailable: true,
    isChefRecommended: true
  },
  {
    id: 'P2',
    name: 'The Conservatory Mezzanine',
    area: 'Private Space',
    seats: 12,
    locationDescription: 'Elevated loft overlooking the dining hall',
    note: 'Private bar access, acoustic dampening, custom playlist control',
    isAvailable: true
  }
];

export const TIME_SLOTS = {
  Lunch: [
    { time: '12:00 PM', available: true },
    { time: '12:30 PM', available: true },
    { time: '1:00 PM', available: true },
    { time: '1:30 PM', available: true },
    { time: '2:00 PM', available: true },
    { time: '2:30 PM', available: false },
    { time: '3:00 PM', available: true }
  ],
  Dinner: [
    { time: '6:30 PM', available: true },
    { time: '7:00 PM', available: true },
    { time: '7:30 PM', available: true },
    { time: '8:00 PM', available: false },
    { time: '8:30 PM', available: true },
    { time: '9:00 PM', available: true },
    { time: '9:30 PM', available: true },
    { time: '10:00 PM', available: true }
  ],
  Celebration: [
    { time: '1:00 PM (Lunch Banquet)', available: true },
    { time: '7:00 PM (Sunset Soirée)', available: true },
    { time: '8:30 PM (Grand Dinner)', available: true }
  ],
  Casual: [
    { time: '12:30 PM', available: true },
    { time: '4:00 PM (Afternoon Tea)', available: true },
    { time: '5:00 PM (High Tea & Mezze)', available: true },
    { time: '7:00 PM', available: true },
    { time: '9:00 PM', available: true }
  ]
};
