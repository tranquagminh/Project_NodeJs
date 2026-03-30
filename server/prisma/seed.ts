import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // ==================== USERS ====================
  const hashedPassword = await bcrypt.hash('Admin@123', 12);
  const userPassword = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@kinetic.com' },
    update: {},
    create: {
      email: 'admin@kinetic.com',
      password: hashedPassword,
      fullName: 'KINETIC Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      email: 'alex@example.com',
      password: userPassword,
      fullName: 'Alexander Strickland',
      phone: '+1-555-0100',
      role: 'USER',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Users seeded');

  // ==================== ADDRESS ====================
  await prisma.address.create({
    data: {
      userId: user1.id,
      firstName: 'Alexander',
      lastName: 'Strickland',
      phone: '+1-555-0100',
      addressLine1: '123 Main Street',
      city: 'New York',
      postalCode: '10001',
      country: 'US',
      isDefault: true,
    },
  });

  console.log('✅ Addresses seeded');

  // ==================== BRANDS ====================
  const kinetic = await prisma.brand.create({
    data: { name: 'KINETIC', slug: 'kinetic', description: 'High Performance Engineered for the Elite Athlete. Precision in Every Frame.', isActive: true },
  });

  const yonex = await prisma.brand.create({
    data: { name: 'YONEX', slug: 'yonex', description: 'World leader in badminton equipment', isActive: true },
  });

  const mizuno = await prisma.brand.create({
    data: { name: 'Mizuno', slug: 'mizuno', description: 'Premium sports footwear and equipment', isActive: true },
  });

  console.log('✅ Brands seeded');

  // ==================== CATEGORIES ====================
  // Level 1
  const rackets = await prisma.category.create({
    data: { name: 'Rackets', slug: 'rackets', description: 'Pro-grade badminton rackets', level: 1, sortOrder: 1 },
  });
  const shoes = await prisma.category.create({
    data: { name: 'Shoes', slug: 'shoes', description: 'Performance court shoes', level: 1, sortOrder: 2 },
  });
  const apparel = await prisma.category.create({
    data: { name: 'Apparel', slug: 'apparel', description: 'Badminton clothing and sportswear', level: 1, sortOrder: 3 },
  });
  const shuttlecocks = await prisma.category.create({
    data: { name: 'Shuttlecocks', slug: 'shuttlecocks', description: 'Tournament and training shuttlecocks', level: 1, sortOrder: 4 },
  });
  const strings = await prisma.category.create({
    data: { name: 'Strings', slug: 'strings', description: 'Performance badminton strings', level: 1, sortOrder: 5 },
  });
  const accessories = await prisma.category.create({
    data: { name: 'Accessories', slug: 'accessories', description: 'Bags, grips, and equipment', level: 1, sortOrder: 6 },
  });

  // Level 2 — Racket Series
  const astroxSeries = await prisma.category.create({
    data: { name: 'Astrox Series', slug: 'astrox-series', description: 'Offensive Dominance — Head Heavy', parentId: rackets.id, level: 2, sortOrder: 1 },
  });
  const nanoflareSeries = await prisma.category.create({
    data: { name: 'Nanoflare Series', slug: 'nanoflare-series', description: 'Lightning Speed — Head Light', parentId: rackets.id, level: 2, sortOrder: 2 },
  });
  const arcsaberSeries = await prisma.category.create({
    data: { name: 'Arcsaber Series', slug: 'arcsaber-series', description: 'Surgical Control — Even Balance', parentId: rackets.id, level: 2, sortOrder: 3 },
  });

  // Level 2 — Shoes
  await prisma.category.create({
    data: { name: 'Power Cushion', slug: 'power-cushion', description: 'Cushioned performance shoes', parentId: shoes.id, level: 2, sortOrder: 1 },
  });
  await prisma.category.create({
    data: { name: 'Court Shoes', slug: 'court-shoes', description: 'All-court badminton shoes', parentId: shoes.id, level: 2, sortOrder: 2 },
  });

  // Level 2 — Shuttlecocks
  await prisma.category.create({
    data: { name: 'Tournament', slug: 'tournament-shuttlecocks', description: 'Competition-grade feather shuttlecocks', parentId: shuttlecocks.id, level: 2, sortOrder: 1 },
  });
  await prisma.category.create({
    data: { name: 'Training', slug: 'training-shuttlecocks', description: 'Practice and training shuttlecocks', parentId: shuttlecocks.id, level: 2, sortOrder: 2 },
  });

  // Level 2 — Accessories
  await prisma.category.create({
    data: { name: 'Bags', slug: 'bags', description: 'Racket bags and tournament bags', parentId: accessories.id, level: 2, sortOrder: 1 },
  });
  await prisma.category.create({
    data: { name: 'Grips', slug: 'grips', description: 'Replacement and overgrips', parentId: accessories.id, level: 2, sortOrder: 2 },
  });
  await prisma.category.create({
    data: { name: 'Equipment', slug: 'equipment', description: 'Other badminton equipment', parentId: accessories.id, level: 2, sortOrder: 3 },
  });

  console.log('✅ Categories seeded');

  // ==================== PRODUCTS ====================

  // --- Racket: Astrox 88 D Pro ---
  const astrox88d = await prisma.product.create({
    data: {
      name: 'ASTROX 88 D PRO',
      slug: 'astrox-88-d-pro',
      description: 'The ASTROX 88 D PRO is designed for the back-court player, delivering decisive power for continuous attacks.',
      shortDescription: 'Offensive back-court racket with explosive power',
      categoryId: astroxSeries.id,
      brandId: kinetic.id,
      basePrice: 235.00,
      sku: 'KIN-AX88D-PRO',
      status: 'ACTIVE',
      isFeatured: true,
      isNewArrival: false,
      metaTitle: 'ASTROX 88 D PRO — Offensive Dominance | KINETIC',
      metaDescription: 'Back-court power racket with Rotational Generator System and Namd Carbon technology.',
    },
  });

  await prisma.productSpec.create({
    data: {
      productId: astrox88d.id,
      flex: 'STIFF',
      frame: 'HM Graphite / VOLUME CUT RESIN / Tungsten',
      shaft: 'HM Graphite / Namd',
      jointType: 'New Built-in T-Joint',
      weightGrip: '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4, 5, 6',
      recommendedTension: '4U: 20 - 28 lbs / 3U: 21 - 29 lbs',
      skillLevel: 'PROFESSIONAL',
      playStyle: 'POWER_HEAD_HEAVY',
      series: 'Astrox',
      technologies: ['Rotational Generator System', 'Namd Carbon', 'Volume Cut Resin'],
    },
  });

  await prisma.productImage.createMany({
    data: [
      { productId: astrox88d.id, url: '/images/products/astrox-88d-pro-main.jpg', alt: 'ASTROX 88 D PRO', sortOrder: 0, isMain: true },
      { productId: astrox88d.id, url: '/images/products/astrox-88d-pro-side.jpg', alt: 'ASTROX 88 D PRO Side', sortOrder: 1 },
      { productId: astrox88d.id, url: '/images/products/astrox-88d-pro-detail.jpg', alt: 'ASTROX 88 D PRO Detail', sortOrder: 2 },
    ],
  });

  await prisma.productVariant.createMany({
    data: [
      { productId: astrox88d.id, name: 'BG80 - Leather - G5 - 26lbs', sku: 'KIN-AX88D-BG80-LTH-G5', price: 235.00, stock: 15, attributes: { string: 'YONEX BG80', gripType: 'LEATHER', gripSize: 'G5', tension: 26 } },
      { productId: astrox88d.id, name: 'NANOGY 98 - Leather - G5 - 24lbs', sku: 'KIN-AX88D-NG98-LTH-G5', price: 235.00, stock: 10, attributes: { string: 'NANOGY 98', gripType: 'LEATHER', gripSize: 'G5', tension: 24 } },
      { productId: astrox88d.id, name: 'BG80 - Towel - G4 - 28lbs', sku: 'KIN-AX88D-BG80-TWL-G4', price: 235.00, stock: 8, attributes: { string: 'YONEX BG80', gripType: 'TOWEL', gripSize: 'G4', tension: 28 } },
    ],
  });

  // --- Racket: Astrox 100 ZZ ---
  const astrox100zz = await prisma.product.create({
    data: {
      name: 'ASTROX 100 ZZ',
      slug: 'astrox-100-zz',
      description: 'Engineered for the relentless attacker. Featuring the hyper slim shaft and Rotational Generator System for unprecedented power and swing speed.',
      shortDescription: 'Ultimate offensive racket with hyper slim shaft',
      categoryId: astroxSeries.id,
      brandId: kinetic.id,
      basePrice: 295.00,
      sku: 'KIN-AX100ZZ',
      status: 'ACTIVE',
      isFeatured: true,
      isNewArrival: true,
    },
  });

  await prisma.productSpec.create({
    data: {
      productId: astrox100zz.id,
      flex: 'STIFF',
      frame: 'HM Graphite / Namd / Tungsten',
      shaft: 'HM Graphite / Namd',
      jointType: 'New Built-in T-Joint',
      weightGrip: '4U (Avg. 83g) G5',
      recommendedTension: '4U: 21 - 29 lbs',
      skillLevel: 'PROFESSIONAL',
      playStyle: 'POWER_HEAD_HEAVY',
      series: 'Astrox',
      technologies: ['Rotational Generator System', 'Namd Carbon', 'Power Assist Bumper'],
    },
  });

  await prisma.productImage.create({
    data: { productId: astrox100zz.id, url: '/images/products/astrox-100-zz-main.jpg', alt: 'ASTROX 100 ZZ', sortOrder: 0, isMain: true },
  });

  await prisma.productVariant.create({
    data: { productId: astrox100zz.id, name: 'BG65 - Leather - G5 - 25lbs', sku: 'KIN-AX100ZZ-BG65-G5', price: 295.00, stock: 12, attributes: { string: 'BG65', gripType: 'LEATHER', gripSize: 'G5', tension: 25 } },
  });

  // --- Racket: Nanoflare 800 ---
  const nanoflare800 = await prisma.product.create({
    data: {
      name: 'NANOFLARE 800',
      slug: 'nanoflare-800',
      description: 'A speed-focused racket with a head-light balance, designed for fast-paced rallies and quick drive shots.',
      shortDescription: 'Head-light speed racket for aggressive drives',
      categoryId: nanoflareSeries.id,
      brandId: kinetic.id,
      basePrice: 240.00,
      sku: 'KIN-NF800',
      status: 'ACTIVE',
      isFeatured: false,
      isNewArrival: true,
    },
  });

  await prisma.productSpec.create({
    data: {
      productId: nanoflare800.id,
      flex: 'STIFF',
      frame: 'HM Graphite / TORAYCA M40X / VOLUME CUT RESIN',
      shaft: 'HM Graphite / ULTRA PE FIBER',
      jointType: 'New Built-in T-Joint',
      weightGrip: '4U (Avg. 83g) G5',
      recommendedTension: '4U: 20 - 28 lbs',
      skillLevel: 'PROFESSIONAL',
      playStyle: 'SPEED_HEAD_LIGHT',
      series: 'Nanoflare',
      technologies: ['Sonic Flare System', 'TORAYCA M40X'],
    },
  });

  await prisma.productImage.create({
    data: { productId: nanoflare800.id, url: '/images/products/nanoflare-800-main.jpg', alt: 'NANOFLARE 800', sortOrder: 0, isMain: true },
  });

  await prisma.productVariant.create({
    data: { productId: nanoflare800.id, name: 'BG80 - Leather - G5 - 26lbs', sku: 'KIN-NF800-BG80-G5', price: 240.00, stock: 18, attributes: { string: 'YONEX BG80', gripType: 'LEATHER', gripSize: 'G5', tension: 26 } },
  });

  // --- Racket: Nanoflare 700 ---
  await prisma.product.create({
    data: {
      name: 'NANOFLARE 700',
      slug: 'nanoflare-700',
      description: 'Lightweight speed racket for quick, aggressive play.',
      shortDescription: 'Speed-oriented lightweight racket',
      categoryId: nanoflareSeries.id,
      brandId: kinetic.id,
      basePrice: 210.00,
      sku: 'KIN-NF700',
      status: 'ACTIVE',
      isNewArrival: false,
      images: { create: { url: '/images/products/nanoflare-700-main.jpg', alt: 'NANOFLARE 700', sortOrder: 0, isMain: true } },
      spec: { create: { flex: 'MEDIUM', skillLevel: 'INTERMEDIATE', playStyle: 'SPEED_HEAD_LIGHT', series: 'Nanoflare' } },
      variants: { create: { name: 'BG65 - Leather - G5', sku: 'KIN-NF700-BG65-G5', price: 210.00, stock: 20, attributes: { string: 'BG65', gripType: 'LEATHER', gripSize: 'G5', tension: 24 } } },
    },
  });

  // --- Racket: Arcsaber 11 Pro ---
  await prisma.product.create({
    data: {
      name: 'ARCSABER 11 PRO',
      slug: 'arcsaber-11-pro',
      description: 'Precision control racket with even balance for surgical placement and tight net play.',
      shortDescription: 'Even-balance control racket',
      categoryId: arcsaberSeries.id,
      brandId: kinetic.id,
      basePrice: 255.00,
      sku: 'KIN-ARC11P',
      status: 'ACTIVE',
      isFeatured: false,
      isNewArrival: false,
      images: { create: { url: '/images/products/arcsaber-11-pro-main.jpg', alt: 'ARCSABER 11 PRO', sortOrder: 0, isMain: true } },
      spec: { create: { flex: 'STIFF', skillLevel: 'PROFESSIONAL', playStyle: 'CONTROL_EVEN_BALANCE', series: 'Arcsaber', technologies: ['Pocketing Booster', 'Control Assist Bumper'] } },
      variants: { create: { name: 'BG80 - Leather - G5', sku: 'KIN-ARC11P-BG80-G5', price: 255.00, stock: 14, attributes: { string: 'YONEX BG80', gripType: 'LEATHER', gripSize: 'G5', tension: 25 } } },
    },
  });

  // --- Racket: Arcsaber 7 Pro ---
  await prisma.product.create({
    data: {
      name: 'ARCSABER 7 PRO',
      slug: 'arcsaber-7-pro',
      description: 'Control-oriented racket with enhanced repulsion for accurate shot-making.',
      shortDescription: 'Control racket with enhanced repulsion',
      categoryId: arcsaberSeries.id,
      brandId: kinetic.id,
      basePrice: 226.00,
      sku: 'KIN-ARC7P',
      status: 'ACTIVE',
      isNewArrival: false,
      images: { create: { url: '/images/products/arcsaber-7-pro-main.jpg', alt: 'ARCSABER 7 PRO', sortOrder: 0, isMain: true } },
      spec: { create: { flex: 'MEDIUM', skillLevel: 'INTERMEDIATE', playStyle: 'CONTROL_EVEN_BALANCE', series: 'Arcsaber' } },
      variants: { create: { name: 'BG65 - Leather - G5', sku: 'KIN-ARC7P-BG65-G5', price: 226.00, stock: 16, attributes: { string: 'BG65', gripType: 'LEATHER', gripSize: 'G5', tension: 24 } } },
    },
  });

  console.log('✅ Rackets seeded (6 products)');

  // --- Shoes: Power Cushion 65 Z3 ---
  const shoes1 = await prisma.product.create({
    data: {
      name: 'POWER CUSHION 65 Z3',
      slug: 'power-cushion-65-z3',
      description: 'Top-of-the-line tournament shoes with Power Cushion+ for ultimate comfort and responsiveness.',
      shortDescription: 'Tournament court shoes with superior cushioning',
      categoryId: shoes.id,
      brandId: kinetic.id,
      basePrice: 165.00,
      sku: 'KIN-PC65Z3',
      status: 'ACTIVE',
      isFeatured: false,
      isNewArrival: true,
      images: { create: { url: '/images/products/power-cushion-65z3-main.jpg', alt: 'POWER CUSHION 65 Z3', sortOrder: 0, isMain: true } },
    },
  });

  await prisma.productVariant.createMany({
    data: [
      { productId: shoes1.id, name: 'US 9 - White/Blue', sku: 'KIN-PC65Z3-9-WB', price: 165.00, stock: 10, attributes: { size: '9 US', color: 'White/Blue' } },
      { productId: shoes1.id, name: 'US 10 - White/Blue', sku: 'KIN-PC65Z3-10-WB', price: 165.00, stock: 12, attributes: { size: '10 US', color: 'White/Blue' } },
      { productId: shoes1.id, name: 'US 10.5 - Racing Red', sku: 'KIN-PC65Z3-105-RR', price: 165.00, stock: 8, attributes: { size: '10.5 US', color: 'Racing Red' } },
      { productId: shoes1.id, name: 'US 11 - White/Blue', sku: 'KIN-PC65Z3-11-WB', price: 165.00, stock: 6, attributes: { size: '11 US', color: 'White/Blue' } },
    ],
  });

  // --- Shoes: Aero-Speed Pro 900 (from checkout design) ---
  const shoes2 = await prisma.product.create({
    data: {
      name: 'AERO-SPEED PRO 900',
      slug: 'aero-speed-pro-900',
      description: 'Lightweight speed-oriented court shoe for agile players.',
      shortDescription: 'Lightweight speed court shoe',
      categoryId: shoes.id,
      brandId: kinetic.id,
      basePrice: 245.00,
      sku: 'KIN-ASP900',
      status: 'ACTIVE',
      images: { create: { url: '/images/products/aero-speed-pro-900-main.jpg', alt: 'AERO-SPEED PRO 900', sortOrder: 0, isMain: true } },
    },
  });

  await prisma.productVariant.create({
    data: { productId: shoes2.id, name: 'US 10 - White', sku: 'KIN-ASP900-10-W', price: 245.00, stock: 10, attributes: { size: '10 US', color: 'White' } },
  });

  // --- Shoes: V-Drive Court Elite (from checkout design) ---
  await prisma.product.create({
    data: {
      name: 'V-DRIVE COURT ELITE',
      slug: 'v-drive-court-elite',
      description: 'Premium court shoe with exceptional grip and stability.',
      shortDescription: 'Premium stability court shoe',
      categoryId: shoes.id,
      brandId: mizuno.id,
      basePrice: 160.00,
      sku: 'MIZ-VDCE',
      status: 'ACTIVE',
      images: { create: { url: '/images/products/v-drive-court-elite-main.jpg', alt: 'V-DRIVE COURT ELITE', sortOrder: 0, isMain: true } },
      variants: { create: { name: 'US 10.5 - Racing Red', sku: 'MIZ-VDCE-105-RR', price: 160.00, stock: 7, attributes: { size: '10.5 US', color: 'Racing Red' } } },
    },
  });

  console.log('✅ Shoes seeded');

  // --- Accessories: Pro Tournament Bag ---
  await prisma.product.create({
    data: {
      name: 'PRO TOURNAMENT BAG',
      slug: 'pro-tournament-bag',
      description: 'Premium 6-racket tournament bag with thermal compartment.',
      shortDescription: '6-racket tournament bag',
      categoryId: accessories.id,
      brandId: kinetic.id,
      basePrice: 95.00,
      sku: 'KIN-PTB6',
      status: 'ACTIVE',
      images: { create: { url: '/images/products/pro-tournament-bag-main.jpg', alt: 'PRO TOURNAMENT BAG', sortOrder: 0, isMain: true } },
      variants: { create: { name: 'Navy/Gold', sku: 'KIN-PTB6-NG', price: 95.00, stock: 25, attributes: { color: 'Navy/Gold' } } },
    },
  });

  // --- Shuttlecocks: Aerosena 50 ---
  await prisma.product.create({
    data: {
      name: 'AEROSENA 50 (12PK)',
      slug: 'aerosena-50-12pk',
      description: 'Tournament-grade feather shuttlecocks with consistent flight characteristics.',
      shortDescription: 'Tournament feather shuttlecocks',
      categoryId: shuttlecocks.id,
      brandId: kinetic.id,
      basePrice: 42.00,
      sku: 'KIN-AS50-12',
      status: 'ACTIVE',
      isNewArrival: true,
      images: { create: { url: '/images/products/aerosena-50-main.jpg', alt: 'AEROSENA 50', sortOrder: 0, isMain: true } },
      variants: { create: { name: 'Speed 77 - 12 Pack', sku: 'KIN-AS50-77-12', price: 42.00, stock: 50, attributes: { speed: 77, pack: 12 } } },
    },
  });

  console.log('✅ Accessories & Shuttlecocks seeded');

  // ==================== BANNERS ====================
  await prisma.banner.createMany({
    data: [
      {
        title: 'ASTROX 100 ZZ',
        subtitle: 'Engineered for the relentless attacker. Featuring the hyper slim shaft and Rotational Generator System for unprecedented power and swing speed.',
        image: '/images/banners/astrox-100-zz-hero.jpg',
        link: '/products/astrox-100-zz',
        ctaPrimary: 'SHOP NOW',
        ctaSecondary: 'EXPLORE TECHNOLOGY',
        position: 'HOME_HERO',
        sortOrder: 1,
        isActive: true,
      },
      {
        title: 'PRO-GRADE RACKETS',
        subtitle: 'Experience the ultimate fusion of aerodynamics and structural integrity. Our 2024 collection features enhanced graphite frames for explosive power and surgical control.',
        image: '/images/banners/rackets-category-hero.jpg',
        link: '/rackets',
        position: 'CATEGORY_HERO',
        sortOrder: 1,
        isActive: true,
      },
    ],
  });

  console.log('✅ Banners seeded');

  // ==================== ATHLETES (Team Kinetic) ====================
  await prisma.athlete.createMany({
    data: [
      { name: 'Viktor Axelsen', title: 'World #1 Champion', image: '/images/athletes/viktor-axelsen.jpg', sortOrder: 1, isActive: true },
      { name: 'An Se-Young', title: 'World #1 Champion', image: '/images/athletes/an-se-young.jpg', sortOrder: 2, isActive: true },
      { name: 'Kento Momota', title: 'Former World Champion', image: '/images/athletes/kento-momota.jpg', sortOrder: 3, isActive: true },
    ],
  });

  console.log('✅ Athletes seeded');

  // ==================== TECHNOLOGIES ====================
  await prisma.technology.createMany({
    data: [
      {
        name: 'Power Cushion+',
        slug: 'power-cushion-plus',
        shortDescription: 'A new age in shock absorption for badminton footwear.',
        fullDescription: 'Power Cushion+ delivers 28% more shock absorption and 62% more energy return compared to standard cushioning systems.',
        statLabel: 'Energy Return',
        statValue: '62%',
        sortOrder: 1,
        isActive: true,
      },
      {
        name: 'Rotational Generator System',
        slug: 'rotational-generator-system',
        shortDescription: 'By applying the counterbalance theory, weight is distributed throughout the grip end, frame top and the joint for maximum control.',
        fullDescription: 'The transition to the next shot can be performed smoothly, with rapid succession. Weight distribution optimized for 28% more racket turnover speed.',
        statLabel: 'More Racket Turnover',
        statValue: '28%',
        sortOrder: 2,
        isActive: true,
      },
      {
        name: 'Namd Carbon',
        slug: 'namd-carbon',
        shortDescription: 'A world-first, new dimension graphite material.',
        fullDescription: 'Namd, greatly improves the adhesion of the graphite fibers and resin by attaching nanomaterials directly to the graphite fiber. Optimal flex pattern provides increased shuttle hold for enhanced power control.',
        sortOrder: 3,
        isActive: true,
      },
      {
        name: 'Sonic Flare System',
        slug: 'sonic-flare-system',
        shortDescription: 'Cutting-edge frame design for ultra-fast swing speed.',
        fullDescription: 'The Sonic Flare System combines a new graphite material with an aero frame shape for improved swing speed and shuttle acceleration.',
        sortOrder: 4,
        isActive: true,
      },
    ],
  });

  console.log('✅ Technologies seeded');

  // ==================== COUPONS ====================
  await prisma.coupon.create({
    data: {
      code: 'KINETIC10',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 100,
      maxDiscount: 50,
      usageLimit: 100,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'FREESHIPVIP',
      type: 'FIXED_AMOUNT',
      value: 25,
      minOrderAmount: 200,
      usageLimit: 50,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
  });

  console.log('✅ Coupons seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────');
  console.log('Admin: admin@kinetic.com / Admin@123');
  console.log('User:  alex@example.com / User@123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
