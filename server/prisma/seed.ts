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
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('test1234', 12);
  const alexPassword = await bcrypt.hash('User@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@volta.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@volta.com',
      password: adminPassword,
      fullName: 'VOLTA Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  // Test user used by Playwright e2e tests
  await prisma.user.upsert({
    where: { email: 'test_playwright@volta.com' },
    update: {},
    create: {
      email: 'test_playwright@volta.com',
      password: userPassword,
      fullName: 'Playwright Tester',
      role: 'USER',
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'alex@example.com' },
    update: {},
    create: {
      email: 'alex@example.com',
      password: alexPassword,
      fullName: 'Alexander Strickland',
      phone: '+1-555-0100',
      role: 'USER',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('✅ Users seeded');

  // ==================== BRANDS ====================
  const volta = await prisma.brand.upsert({
    where: { slug: 'volta' },
    update: {},
    create: { name: 'VOLTA', slug: 'volta', description: 'High Performance Engineered for the Elite Athlete.', isActive: true },
  });
  const yonex = await prisma.brand.upsert({
    where: { slug: 'yonex' },
    update: {},
    create: { name: 'YONEX', slug: 'yonex', description: 'World leader in badminton equipment.', isActive: true },
  });
  const mizuno = await prisma.brand.upsert({
    where: { slug: 'mizuno' },
    update: {},
    create: { name: 'Mizuno', slug: 'mizuno', description: 'Premium sports footwear and equipment.', isActive: true },
  });
  await prisma.brand.upsert({
    where: { slug: 'babolat' },
    update: {},
    create: { name: 'Babolat', slug: 'babolat', description: 'Precision racket sports equipment.', isActive: true },
  });

  console.log('✅ Brands seeded');

  // ==================== CATEGORIES ====================
  // Level 1 roots
  const rackets = await prisma.category.upsert({
    where: { slug: 'rackets' },
    update: {},
    create: { name: 'Rackets', slug: 'rackets', description: 'Pro-grade badminton rackets', level: 1, sortOrder: 1 },
  });
  const shoes = await prisma.category.upsert({
    where: { slug: 'shoes' },
    update: {},
    create: { name: 'Shoes', slug: 'shoes', description: 'Performance court shoes', level: 1, sortOrder: 2 },
  });
  const apparel = await prisma.category.upsert({
    where: { slug: 'apparel' },
    update: {},
    create: { name: 'Apparel', slug: 'apparel', description: 'Badminton clothing and sportswear', level: 1, sortOrder: 3 },
  });
  const shuttlecocks = await prisma.category.upsert({
    where: { slug: 'shuttlecocks' },
    update: {},
    create: { name: 'Shuttlecocks', slug: 'shuttlecocks', description: 'Tournament and training shuttlecocks', level: 1, sortOrder: 4 },
  });
  const strings = await prisma.category.upsert({
    where: { slug: 'strings' },
    update: {},
    create: { name: 'Strings', slug: 'strings', description: 'Performance badminton strings', level: 1, sortOrder: 5 },
  });
  const accessories = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: { name: 'Accessories', slug: 'accessories', description: 'Bags, grips, and equipment', level: 1, sortOrder: 6 },
  });

  // Level 2 — Racket series
  const astroxSeries = await prisma.category.upsert({
    where: { slug: 'astrox-series' },
    update: {},
    create: { name: 'Astrox Series', slug: 'astrox-series', description: 'Offensive Dominance — Head Heavy', parentId: rackets.id, level: 2, sortOrder: 1 },
  });
  const nanoflareSeries = await prisma.category.upsert({
    where: { slug: 'nanoflare-series' },
    update: {},
    create: { name: 'Nanoflare Series', slug: 'nanoflare-series', description: 'Lightning Speed — Head Light', parentId: rackets.id, level: 2, sortOrder: 2 },
  });
  const arcsaberSeries = await prisma.category.upsert({
    where: { slug: 'arcsaber-series' },
    update: {},
    create: { name: 'Arcsaber Series', slug: 'arcsaber-series', description: 'Surgical Control — Even Balance', parentId: rackets.id, level: 2, sortOrder: 3 },
  });

  // Level 2 — Shoes
  await prisma.category.upsert({ where: { slug: 'power-cushion' }, update: {}, create: { name: 'Power Cushion', slug: 'power-cushion', description: 'Cushioned performance shoes', parentId: shoes.id, level: 2, sortOrder: 1 } });
  await prisma.category.upsert({ where: { slug: 'court-shoes' }, update: {}, create: { name: 'Court Shoes', slug: 'court-shoes', description: 'All-court badminton shoes', parentId: shoes.id, level: 2, sortOrder: 2 } });

  // Level 2 — Shuttlecocks
  await prisma.category.upsert({ where: { slug: 'tournament-shuttlecocks' }, update: {}, create: { name: 'Tournament', slug: 'tournament-shuttlecocks', description: 'Competition-grade feather shuttlecocks', parentId: shuttlecocks.id, level: 2, sortOrder: 1 } });
  await prisma.category.upsert({ where: { slug: 'training-shuttlecocks' }, update: {}, create: { name: 'Training', slug: 'training-shuttlecocks', description: 'Practice and training shuttlecocks', parentId: shuttlecocks.id, level: 2, sortOrder: 2 } });

  // Level 2 — Accessories
  await prisma.category.upsert({ where: { slug: 'bags' }, update: {}, create: { name: 'Bags', slug: 'bags', description: 'Racket bags and tournament bags', parentId: accessories.id, level: 2, sortOrder: 1 } });
  await prisma.category.upsert({ where: { slug: 'grips' }, update: {}, create: { name: 'Grips', slug: 'grips', description: 'Replacement and overgrips', parentId: accessories.id, level: 2, sortOrder: 2 } });
  await prisma.category.upsert({ where: { slug: 'equipment' }, update: {}, create: { name: 'Equipment', slug: 'equipment', description: 'Other badminton equipment', parentId: accessories.id, level: 2, sortOrder: 3 } });

  console.log('✅ Categories seeded');

  // ==================== TECHNOLOGIES ====================
  // Seed first so we can reference IDs in ProductSpec
  const techRGS = await prisma.technology.upsert({
    where: { slug: 'rotational-generator-system' },
    update: {},
    create: {
      name: 'Rotational Generator System',
      slug: 'rotational-generator-system',
      shortDescription: 'Weight distributed at grip end, frame top and joint for maximum control and rapid shot transition.',
      fullDescription: 'By applying the counterbalance theory, weight is distributed throughout the grip end, frame top and the joint for maximum control. The transition to the next shot can be performed smoothly, with rapid succession. Weight distribution optimized for 28% more racket turnover speed.',
      statLabel: 'More Racket Turnover',
      statValue: '28%',
      sortOrder: 1,
      isActive: true,
    },
  });

  const techNamd = await prisma.technology.upsert({
    where: { slug: 'namd-carbon' },
    update: {},
    create: {
      name: 'Namd Carbon',
      slug: 'namd-carbon',
      shortDescription: 'World-first graphite material with nanomaterial adhesion for explosive power control.',
      fullDescription: 'Namd greatly improves the adhesion of the graphite fibers and resin by attaching nanomaterials directly to the graphite fiber. Optimal flex pattern provides increased shuttle hold for enhanced power control.',
      sortOrder: 2,
      isActive: true,
    },
  });

  const techPowerCushion = await prisma.technology.upsert({
    where: { slug: 'power-cushion-plus' },
    update: {},
    create: {
      name: 'Power Cushion+',
      slug: 'power-cushion-plus',
      shortDescription: 'Next-generation shock absorption delivering 62% more energy return for badminton footwear.',
      fullDescription: 'Power Cushion+ delivers 28% more shock absorption and 62% more energy return compared to standard cushioning systems. The multi-layer compound absorbs impact shock efficiently and returns energy for explosive movement.',
      statLabel: 'Energy Return',
      statValue: '62%',
      sortOrder: 3,
      isActive: true,
    },
  });

  const techAeroBox = await prisma.technology.upsert({
    where: { slug: 'aero-box-frame' },
    update: {},
    create: {
      name: 'Aero+Box Frame',
      slug: 'aero-box-frame',
      shortDescription: 'Hybrid aero-box cross-section combines aerodynamic swing with rigid repulsion power.',
      fullDescription: 'The Aero+Box frame cross-section combines a box-shaped frame for rigidity and repulsion with an aerodynamic shape for faster swing speed. Delivers the best of both frame architectures in a single design.',
      statLabel: 'Frame Rigidity',
      statValue: '+15%',
      sortOrder: 4,
      isActive: true,
    },
  });

  const techEnergyBoost = await prisma.technology.upsert({
    where: { slug: 'energy-boost-cap' },
    update: {},
    create: {
      name: 'Energy Boost CAP',
      slug: 'energy-boost-cap',
      shortDescription: 'Enhanced cap design that amplifies flex and snap-back energy at point of impact.',
      fullDescription: 'The Energy Boost CAP uses a redesigned cap structure to increase the flex range of the shaft. On impact, the cap amplifies the snap-back force, transferring more energy to the shuttlecock for a more powerful, faster shot.',
      statLabel: 'Power Transfer',
      statValue: '+20%',
      sortOrder: 5,
      isActive: true,
    },
  });

  const techSonicFlare = await prisma.technology.upsert({
    where: { slug: 'sonic-flare-system' },
    update: {},
    create: {
      name: 'Sonic Flare System',
      slug: 'sonic-flare-system',
      shortDescription: 'Cutting-edge frame design combining new graphite material with aero frame shape for ultra-fast swing speed.',
      fullDescription: 'The Sonic Flare System combines a new graphite material with an aero frame shape for improved swing speed and shuttle acceleration. Designed for players who rely on speed and deception.',
      sortOrder: 6,
      isActive: true,
    },
  });

  console.log('✅ Technologies seeded');

  // ==================== PRODUCTS ====================

  // ─── RACKET 1: Astrox 88 D Pro — POWER (Head Heavy) ───
  const astrox88d = await prisma.product.upsert({
    where: { slug: 'astrox-88-d-pro' },
    update: {},
    create: {
      name: 'ASTROX 88 D PRO',
      slug: 'astrox-88-d-pro',
      description: 'The ASTROX 88 D PRO is designed for the back-court player, delivering decisive power for continuous attacks. The steep angle smash is more powerful than ever with the new ROTATIONAL GENERATOR SYSTEM.',
      shortDescription: 'Offensive back-court racket with explosive power',
      categoryId: astroxSeries.id,
      brandId: volta.id,
      basePrice: 235.00,
      sku: 'VLT-AX88D-PRO',
      status: 'ACTIVE',
      isFeatured: true,
      isNewArrival: false,
      metaTitle: 'ASTROX 88 D PRO — Offensive Dominance | VOLTA',
      metaDescription: 'Back-court power racket with Rotational Generator System and Namd Carbon technology.',
    },
  });

  await prisma.productSpec.upsert({
    where: { productId: astrox88d.id },
    update: {},
    create: {
      productId: astrox88d.id,
      flex: 'STIFF',
      frameMaterial: 'HM Graphite / VOLUME CUT RESIN / Tungsten',
      shaftMaterial: 'HM Graphite / Namd',
      jointType: 'New Built-in T-Joint',
      weightGripDesc: '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4, 5, 6',
      recommendedTension: '4U: 20–28 lbs / 3U: 21–29 lbs',
      maxTensionByWeight: { '3U': 29, '4U': 28 },
      skillLevel: 'PROFESSIONAL',
      playStyle: 'POWER_HEAD_HEAVY',
      series: 'Astrox',
      technologyIds: [techRGS.id, techNamd.id],
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: astrox88d.id, url: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg', alt: 'ASTROX 88 D PRO', sortOrder: 0, isMain: true },
      { productId: astrox88d.id, url: 'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg', alt: 'ASTROX 88 D PRO Side', sortOrder: 1 },
    ],
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: astrox88d.id, name: '4U G5', sku: 'VLT-AX88D-4U-G5', price: 235.00, stock: 15, attributes: { weight: '4U', gripSize: 'G5' } },
      { productId: astrox88d.id, name: '3U G4', sku: 'VLT-AX88D-3U-G4', price: 235.00, stock: 10, attributes: { weight: '3U', gripSize: 'G4' } },
      { productId: astrox88d.id, name: '3U G5', sku: 'VLT-AX88D-3U-G5', price: 235.00, stock: 8, attributes: { weight: '3U', gripSize: 'G5' } },
    ],
  });

  // ─── RACKET 2: Astrox 100 ZZ — POWER (flagship) ───
  const astrox100zz = await prisma.product.upsert({
    where: { slug: 'astrox-100-zz' },
    update: {},
    create: {
      name: 'ASTROX 100 ZZ',
      slug: 'astrox-100-zz',
      description: 'Engineered for the relentless attacker. Featuring the hyper slim shaft and Rotational Generator System for unprecedented power and swing speed. The ultimate weapon for offensive doubles players.',
      shortDescription: 'Ultimate offensive racket with hyper slim shaft',
      categoryId: astroxSeries.id,
      brandId: volta.id,
      basePrice: 295.00,
      sku: 'VLT-AX100ZZ',
      status: 'ACTIVE',
      isFeatured: true,
      isNewArrival: true,
      metaTitle: 'ASTROX 100 ZZ — Ultimate Offensive Weapon | VOLTA',
      metaDescription: 'Flagship offensive racket with hyper slim shaft and Rotational Generator System.',
    },
  });

  await prisma.productSpec.upsert({
    where: { productId: astrox100zz.id },
    update: {},
    create: {
      productId: astrox100zz.id,
      flex: 'STIFF',
      frameMaterial: 'HM Graphite / Namd / Tungsten',
      shaftMaterial: 'HM Graphite / Namd',
      jointType: 'New Built-in T-Joint',
      weightGripDesc: '4U (Avg. 83g) G5',
      recommendedTension: '4U: 21–29 lbs',
      maxTensionByWeight: { '4U': 29 },
      skillLevel: 'PROFESSIONAL',
      playStyle: 'POWER_HEAD_HEAVY',
      series: 'Astrox',
      technologyIds: [techRGS.id, techNamd.id, techAeroBox.id],
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: astrox100zz.id, url: 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg', alt: 'ASTROX 100 ZZ', sortOrder: 0, isMain: true },
    ],
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: astrox100zz.id, name: '4U G5', sku: 'VLT-AX100ZZ-4U-G5', price: 295.00, stock: 12, attributes: { weight: '4U', gripSize: 'G5' } },
      { productId: astrox100zz.id, name: '4U G6', sku: 'VLT-AX100ZZ-4U-G6', price: 295.00, stock: 7, attributes: { weight: '4U', gripSize: 'G6' } },
    ],
  });

  // ─── RACKET 3: Nanoflare 800 — SPEED (Head Light) ───
  const nanoflare800 = await prisma.product.upsert({
    where: { slug: 'nanoflare-800' },
    update: {},
    create: {
      name: 'NANOFLARE 800',
      slug: 'nanoflare-800',
      description: 'A speed-focused racket with a head-light balance, designed for fast-paced rallies and quick drive shots. The Sonic Flare System delivers explosive acceleration for lightning-fast swings.',
      shortDescription: 'Head-light speed racket for aggressive drives',
      categoryId: nanoflareSeries.id,
      brandId: volta.id,
      basePrice: 240.00,
      sku: 'VLT-NF800',
      status: 'ACTIVE',
      isFeatured: false,
      isNewArrival: true,
    },
  });

  await prisma.productSpec.upsert({
    where: { productId: nanoflare800.id },
    update: {},
    create: {
      productId: nanoflare800.id,
      flex: 'STIFF',
      frameMaterial: 'HM Graphite / TORAYCA M40X / VOLUME CUT RESIN',
      shaftMaterial: 'HM Graphite / ULTRA PE FIBER',
      jointType: 'New Built-in T-Joint',
      weightGripDesc: '4U (Avg. 83g) G5',
      recommendedTension: '4U: 20–28 lbs',
      maxTensionByWeight: { '4U': 28 },
      skillLevel: 'PROFESSIONAL',
      playStyle: 'SPEED_HEAD_LIGHT',
      series: 'Nanoflare',
      technologyIds: [techSonicFlare.id, techEnergyBoost.id],
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: nanoflare800.id, url: 'https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg', alt: 'NANOFLARE 800', sortOrder: 0, isMain: true },
    ],
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: nanoflare800.id, name: '4U G5', sku: 'VLT-NF800-4U-G5', price: 240.00, stock: 18, attributes: { weight: '4U', gripSize: 'G5' } },
      { productId: nanoflare800.id, name: '5U G5', sku: 'VLT-NF800-5U-G5', price: 240.00, stock: 9, attributes: { weight: '5U', gripSize: 'G5' } },
    ],
  });

  // ─── RACKET 4: Nanoflare 700 — SPEED (Intermediate) ───
  const nanoflare700 = await prisma.product.upsert({
    where: { slug: 'nanoflare-700' },
    update: {},
    create: {
      name: 'NANOFLARE 700',
      slug: 'nanoflare-700',
      description: 'Lightweight speed racket for quick, aggressive play. Ideal for intermediate players developing a speed-based game.',
      shortDescription: 'Speed-oriented lightweight racket for intermediate players',
      categoryId: nanoflareSeries.id,
      brandId: volta.id,
      basePrice: 210.00,
      sku: 'VLT-NF700',
      status: 'ACTIVE',
      isNewArrival: false,
    },
  });

  await prisma.productSpec.upsert({
    where: { productId: nanoflare700.id },
    update: {},
    create: {
      productId: nanoflare700.id,
      flex: 'MEDIUM',
      weightGripDesc: '4U (Avg. 83g) G5 / 5U (Avg. 78g) G5',
      recommendedTension: '4U: 19–27 lbs',
      maxTensionByWeight: { '4U': 27, '5U': 26 },
      skillLevel: 'INTERMEDIATE',
      playStyle: 'SPEED_HEAD_LIGHT',
      series: 'Nanoflare',
      technologyIds: [techSonicFlare.id],
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [{ productId: nanoflare700.id, url: 'https://images.pexels.com/photos/35300321/pexels-photo-35300321.jpeg', alt: 'NANOFLARE 700', sortOrder: 0, isMain: true }],
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: nanoflare700.id, name: '4U G5', sku: 'VLT-NF700-4U-G5', price: 210.00, stock: 20, attributes: { weight: '4U', gripSize: 'G5' } },
      { productId: nanoflare700.id, name: '5U G5', sku: 'VLT-NF700-5U-G5', price: 210.00, stock: 14, attributes: { weight: '5U', gripSize: 'G5' } },
    ],
  });

  // ─── RACKET 5: Arcsaber 11 Pro — CONTROL (Even Balance) ───
  const arcsaber11 = await prisma.product.upsert({
    where: { slug: 'arcsaber-11-pro' },
    update: {},
    create: {
      name: 'ARCSABER 11 PRO',
      slug: 'arcsaber-11-pro',
      description: 'Precision control racket with even balance for surgical placement and tight net play. The Aero+Box frame delivers both aerodynamic swing speed and rigid repulsion power.',
      shortDescription: 'Even-balance control racket for surgical placement',
      categoryId: arcsaberSeries.id,
      brandId: volta.id,
      basePrice: 255.00,
      sku: 'VLT-ARC11P',
      status: 'ACTIVE',
      isFeatured: false,
      isNewArrival: false,
    },
  });

  await prisma.productSpec.upsert({
    where: { productId: arcsaber11.id },
    update: {},
    create: {
      productId: arcsaber11.id,
      flex: 'STIFF',
      frameMaterial: 'HM Graphite / Tungsten',
      shaftMaterial: 'HM Graphite',
      jointType: 'New Built-in T-Joint',
      weightGripDesc: '4U (Avg. 83g) G5 / 3U (Avg. 88g) G4',
      recommendedTension: '4U: 20–28 lbs / 3U: 21–29 lbs',
      maxTensionByWeight: { '3U': 29, '4U': 28 },
      skillLevel: 'PROFESSIONAL',
      playStyle: 'CONTROL_EVEN_BALANCE',
      series: 'Arcsaber',
      technologyIds: [techAeroBox.id, techEnergyBoost.id],
    },
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [{ productId: arcsaber11.id, url: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg', alt: 'ARCSABER 11 PRO', sortOrder: 0, isMain: true }],
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: arcsaber11.id, name: '4U G5', sku: 'VLT-ARC11P-4U-G5', price: 255.00, stock: 14, attributes: { weight: '4U', gripSize: 'G5' } },
      { productId: arcsaber11.id, name: '3U G4', sku: 'VLT-ARC11P-3U-G4', price: 255.00, stock: 8, attributes: { weight: '3U', gripSize: 'G4' } },
    ],
  });

  // ─── RACKET 6: Arcsaber 7 Pro — CONTROL (Intermediate) ───
  await prisma.product.upsert({
    where: { slug: 'arcsaber-7-pro' },
    update: {},
    create: {
      name: 'ARCSABER 7 PRO',
      slug: 'arcsaber-7-pro',
      description: 'Control-oriented racket with enhanced repulsion for accurate shot-making. Perfect entry point for players developing precision over power.',
      shortDescription: 'Control racket with enhanced repulsion',
      categoryId: arcsaberSeries.id,
      brandId: volta.id,
      basePrice: 226.00,
      sku: 'VLT-ARC7P',
      status: 'ACTIVE',
      isNewArrival: false,
      images: { create: { url: 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg', alt: 'ARCSABER 7 PRO', sortOrder: 0, isMain: true } },
      spec: {
        create: {
          flex: 'MEDIUM',
          weightGripDesc: '4U (Avg. 83g) G5',
          recommendedTension: '4U: 19–27 lbs',
          maxTensionByWeight: { '4U': 27 },
          skillLevel: 'INTERMEDIATE',
          playStyle: 'CONTROL_EVEN_BALANCE',
          series: 'Arcsaber',
          technologyIds: [techAeroBox.id],
        },
      },
      variants: {
        create: [
          { name: '4U G5', sku: 'VLT-ARC7P-4U-G5', price: 226.00, stock: 16, attributes: { weight: '4U', gripSize: 'G5' } },
          { name: '4U G6', sku: 'VLT-ARC7P-4U-G6', price: 226.00, stock: 10, attributes: { weight: '4U', gripSize: 'G6' } },
        ],
      },
    },
  });

  console.log('✅ Rackets seeded (6 products)');

  // ─── SHOES: Power Cushion 65 Z3 ───
  const shoes1 = await prisma.product.upsert({
    where: { slug: 'power-cushion-65-z3' },
    update: {},
    create: {
      name: 'POWER CUSHION 65 Z3',
      slug: 'power-cushion-65-z3',
      description: 'Top-of-the-line tournament shoes with Power Cushion+ for ultimate comfort and responsiveness. Round sole design for multi-directional movement on any court surface.',
      shortDescription: 'Tournament court shoes with superior Power Cushion+ cushioning',
      categoryId: shoes.id,
      brandId: volta.id,
      basePrice: 165.00,
      sku: 'VLT-PC65Z3',
      status: 'ACTIVE',
      isFeatured: true,
      isNewArrival: true,
      images: { create: { url: 'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg', alt: 'POWER CUSHION 65 Z3', sortOrder: 0, isMain: true } },
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: shoes1.id, name: 'EU 42 / White-Blue', sku: 'VLT-PC65Z3-42-WB', price: 165.00, stock: 10, attributes: { sizeEU: 42, sizeUS: 9, sizeCM: 26.5, color: 'White/Blue', width: 'STANDARD' } },
      { productId: shoes1.id, name: 'EU 43 / White-Blue', sku: 'VLT-PC65Z3-43-WB', price: 165.00, stock: 12, attributes: { sizeEU: 43, sizeUS: 9.5, sizeCM: 27, color: 'White/Blue', width: 'STANDARD' } },
      { productId: shoes1.id, name: 'EU 44 / White-Blue', sku: 'VLT-PC65Z3-44-WB', price: 165.00, stock: 8, attributes: { sizeEU: 44, sizeUS: 10, sizeCM: 27.5, color: 'White/Blue', width: 'STANDARD' } },
      { productId: shoes1.id, name: 'EU 44 / Racing Red', sku: 'VLT-PC65Z3-44-RR', price: 165.00, stock: 6, attributes: { sizeEU: 44, sizeUS: 10, sizeCM: 27.5, color: 'Racing Red', width: 'STANDARD' } },
    ],
  });

  // ─── SHOES: Aero-Speed Pro 900 ───
  const shoes2 = await prisma.product.upsert({
    where: { slug: 'aero-speed-pro-900' },
    update: {},
    create: {
      name: 'AERO-SPEED PRO 900',
      slug: 'aero-speed-pro-900',
      description: 'Lightweight speed-oriented court shoe engineered for agile players who rely on rapid footwork and explosive direction changes.',
      shortDescription: 'Lightweight speed court shoe for agile players',
      categoryId: shoes.id,
      brandId: volta.id,
      basePrice: 245.00,
      sku: 'VLT-ASP900',
      status: 'ACTIVE',
      images: { create: { url: 'https://images.pexels.com/photos/19902436/pexels-photo-19902436.jpeg', alt: 'AERO-SPEED PRO 900', sortOrder: 0, isMain: true } },
      variants: {
        create: [
          { name: 'EU 42 / White', sku: 'VLT-ASP900-42-W', price: 245.00, stock: 10, attributes: { sizeEU: 42, sizeUS: 9, sizeCM: 26.5, color: 'White', width: 'STANDARD' } },
          { name: 'EU 44 / Black', sku: 'VLT-ASP900-44-BK', price: 245.00, stock: 8, attributes: { sizeEU: 44, sizeUS: 10, sizeCM: 27.5, color: 'Black', width: 'STANDARD' } },
        ],
      },
    },
  });

  console.log('✅ Shoes seeded');

  // ─── SHUTTLECOCKS: Aerosena 50 ───
  await prisma.product.upsert({
    where: { slug: 'aerosena-50-12pk' },
    update: {},
    create: {
      name: 'AEROSENA 50 (12PK)',
      slug: 'aerosena-50-12pk',
      description: 'Tournament-grade goose feather shuttlecocks with consistent flight characteristics and responsive speed. Ideal for competitive training and tournament play.',
      shortDescription: 'Tournament goose feather shuttlecocks — 12 per tube',
      categoryId: shuttlecocks.id,
      brandId: volta.id,
      basePrice: 42.00,
      sku: 'VLT-AS50-12',
      status: 'ACTIVE',
      isNewArrival: true,
      images: { create: { url: 'https://images.pexels.com/photos/35300321/pexels-photo-35300321.jpeg', alt: 'AEROSENA 50', sortOrder: 0, isMain: true } },
      variants: {
        create: [
          { name: 'Speed 76 - 12pk', sku: 'VLT-AS50-76-12', price: 42.00, stock: 60, attributes: { speed: 76, material: 'FEATHER_GOOSE', grade: 'TOURNAMENT', packSize: 12 } },
          { name: 'Speed 77 - 12pk', sku: 'VLT-AS50-77-12', price: 42.00, stock: 80, attributes: { speed: 77, material: 'FEATHER_GOOSE', grade: 'TOURNAMENT', packSize: 12 } },
          { name: 'Speed 78 - 12pk', sku: 'VLT-AS50-78-12', price: 42.00, stock: 50, attributes: { speed: 78, material: 'FEATHER_GOOSE', grade: 'TOURNAMENT', packSize: 12 } },
        ],
      },
    },
  });

  console.log('✅ Shuttlecocks seeded');

  // ─── ACCESSORIES: Pro Tournament Bag ───
  await prisma.product.upsert({
    where: { slug: 'pro-tournament-bag' },
    update: {},
    create: {
      name: 'PRO TOURNAMENT BAG',
      slug: 'pro-tournament-bag',
      description: 'Premium 6-racket tournament bag with thermal compartment to protect strings, separate shoe compartment, and padded shoulder straps.',
      shortDescription: '6-racket tournament bag with thermal compartment',
      categoryId: accessories.id,
      brandId: volta.id,
      basePrice: 95.00,
      sku: 'VLT-PTB6',
      status: 'ACTIVE',
      images: { create: { url: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg', alt: 'PRO TOURNAMENT BAG', sortOrder: 0, isMain: true } },
      variants: {
        create: [
          { name: 'Navy/Gold', sku: 'VLT-PTB6-NG', price: 95.00, stock: 25, attributes: { color: 'Navy/Gold' } },
          { name: 'Black/Silver', sku: 'VLT-PTB6-BS', price: 95.00, stock: 20, attributes: { color: 'Black/Silver' } },
        ],
      },
    },
  });

  console.log('✅ Accessories seeded');

  // ─── STRINGS: BG80 ───
  await prisma.product.upsert({
    where: { slug: 'yonex-bg80' },
    update: {},
    create: {
      name: 'BG80 Performance String',
      slug: 'yonex-bg80',
      description: 'The BG80 is a high-repulsion, durable string favoured by offensive players worldwide. Its 0.68mm gauge balances repulsion power and durability for sustained competitive play.',
      shortDescription: 'High-repulsion string for offensive players — 0.68mm',
      categoryId: strings.id,
      brandId: yonex.id,
      basePrice: 12.00,
      sku: 'YNX-BG80-10M',
      status: 'ACTIVE',
      images: { create: { url: 'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg', alt: 'BG80 String', sortOrder: 0, isMain: true } },
      variants: {
        create: [
          { name: 'White - 10m', sku: 'YNX-BG80-WHT', price: 12.00, stock: 100, attributes: { gauge: 0.68, color: 'White', length: 10 } },
          { name: 'Yellow - 10m', sku: 'YNX-BG80-YLW', price: 12.00, stock: 80, attributes: { gauge: 0.68, color: 'Yellow', length: 10 } },
        ],
      },
    },
  });

  console.log('✅ Strings seeded');

  // ==================== MODULE 2: STRINGING SERVICE SEED EXTENSION ====================

  // --- Get BG80 product (already seeded above) ---
  const bg80Product = await prisma.product.findUniqueOrThrow({ where: { slug: 'yonex-bg80' } });

  // --- Update BG80 spec with string-specific fields ---
  await prisma.productSpec.upsert({
    where: { productId: bg80Product.id },
    update: { stringMaxTension: 30, stringRecommendedMin: 20, stringRecommendedMax: 28, stringRepulsion: 5, stringDurability: 3, stringControl: 3 },
    create: { productId: bg80Product.id, stringMaxTension: 30, stringRecommendedMin: 20, stringRecommendedMax: 28, stringRepulsion: 5, stringDurability: 3, stringControl: 3 },
  });

  // --- String 2: BG65 Power (most popular, durable) ---
  const bg65 = await prisma.product.upsert({
    where: { slug: 'yonex-bg65' },
    update: {},
    create: {
      name: 'BG65 Power String',
      slug: 'yonex-bg65',
      description: "The world's most popular badminton string. 0.70mm gauge delivers excellent durability with reliable repulsion — ideal for everyday players who string often.",
      shortDescription: "World's most popular string — 0.70mm durable repulsion",
      categoryId: strings.id,
      brandId: yonex.id,
      basePrice: 9.00,
      sku: 'YNX-BG65-10M',
      status: 'ACTIVE',
      images: { create: { url: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg', alt: 'BG65 String', sortOrder: 0, isMain: true } },
      variants: {
        create: [
          { name: 'White - 10m', sku: 'YNX-BG65-WHT', price: 9.00, stock: 150, attributes: { gauge: 0.70, color: 'White', length: 10 } },
          { name: 'Blue - 10m',  sku: 'YNX-BG65-BLU', price: 9.00, stock: 90,  attributes: { gauge: 0.70, color: 'Blue',  length: 10 } },
        ],
      },
    },
  });
  await prisma.productSpec.upsert({
    where: { productId: bg65.id },
    update: {},
    create: { productId: bg65.id, stringMaxTension: 30, stringRecommendedMin: 18, stringRecommendedMax: 28, stringRepulsion: 3, stringDurability: 5, stringControl: 3 },
  });

  // --- String 3: Aerobite Control (hybrid, spin & touch) ---
  const aerobite = await prisma.product.upsert({
    where: { slug: 'yonex-aerobite' },
    update: {},
    create: {
      name: 'Aerobite Control String',
      slug: 'yonex-aerobite',
      description: 'AEROBITE hybrid string (0.67mm main × 0.72mm cross) delivers superior shuttle grip and spin control. Designed for net players and control-oriented singles.',
      shortDescription: 'Hybrid control string — 0.67mm × 0.72mm, spin & touch',
      categoryId: strings.id,
      brandId: yonex.id,
      basePrice: 15.00,
      sku: 'YNX-AEROBITE-10M',
      status: 'ACTIVE',
      images: { create: { url: 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg', alt: 'Aerobite String', sortOrder: 0, isMain: true } },
      variants: {
        create: [
          { name: 'White/Grey - 10m', sku: 'YNX-AEROBITE-WG', price: 15.00, stock: 60, attributes: { gauge: 0.67, color: 'White/Grey', length: 10 } },
        ],
      },
    },
  });
  await prisma.productSpec.upsert({
    where: { productId: aerobite.id },
    update: {},
    create: { productId: aerobite.id, stringMaxTension: 28, stringRecommendedMin: 19, stringRecommendedMax: 26, stringRepulsion: 4, stringDurability: 3, stringControl: 5 },
  });

  console.log('✅ String specs seeded (BG80, BG65, Aerobite)');

  // --- Update racket specs: defaultTensionByWeight + recommendedStringIds ---
  const arcsaber7Product = await prisma.product.findUniqueOrThrow({ where: { slug: 'arcsaber-7-pro' } });

  await Promise.all([
    // Astrox 88 D Pro — power → recommend BG80 (primary) + Aerobite
    prisma.productSpec.update({
      where: { productId: astrox88d.id },
      data: {
        defaultTensionByWeight: { '3U': 27, '4U': 26 },
        recommendedStringIds: [bg80Product.id, aerobite.id],
      },
    }),
    // Astrox 100 ZZ — aggressive power → BG80 primary + Aerobite
    prisma.productSpec.update({
      where: { productId: astrox100zz.id },
      data: {
        defaultTensionByWeight: { '4U': 27 },
        recommendedStringIds: [bg80Product.id, aerobite.id],
      },
    }),
    // Nanoflare 800 — speed → BG65 primary (durable for speed play) + Aerobite
    prisma.productSpec.update({
      where: { productId: nanoflare800.id },
      data: {
        defaultTensionByWeight: { '4U': 26, '5U': 24 },
        recommendedStringIds: [bg65.id, aerobite.id],
      },
    }),
    // Nanoflare 700 — intermediate speed → BG65 primary (easy on durability)
    prisma.productSpec.update({
      where: { productId: nanoflare700.id },
      data: {
        defaultTensionByWeight: { '4U': 25, '5U': 24 },
        recommendedStringIds: [bg65.id],
      },
    }),
    // Arcsaber 11 Pro — control → Aerobite primary + BG80
    prisma.productSpec.update({
      where: { productId: arcsaber11.id },
      data: {
        defaultTensionByWeight: { '3U': 27, '4U': 26 },
        recommendedStringIds: [aerobite.id, bg80Product.id],
      },
    }),
    // Arcsaber 7 Pro — intermediate control → BG65 primary
    prisma.productSpec.update({
      where: { productId: arcsaber7Product.id },
      data: {
        defaultTensionByWeight: { '4U': 25 },
        recommendedStringIds: [bg65.id, aerobite.id],
      },
    }),
  ]);

  console.log('✅ Racket specs updated with defaultTensionByWeight + recommendedStringIds');

  // ==================== BANNERS ====================
  await prisma.banner.upsert({
    where: { id: 'banner-hero-1' },
    update: {},
    create: {
      id: 'banner-hero-1',
      title: 'ASTROX 100 ZZ',
      subtitle: 'Engineered for the relentless attacker. Featuring the hyper slim shaft and Rotational Generator System for unprecedented power and swing speed.',
      image: 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg',
      link: '/products/astrox-100-zz',
      ctaPrimary: 'SHOP NOW',
      ctaSecondary: 'EXPLORE TECHNOLOGY',
      position: 'HOME_HERO',
      sortOrder: 1,
      isActive: true,
    },
  });

  await prisma.banner.upsert({
    where: { id: 'banner-cat-rackets' },
    update: {},
    create: {
      id: 'banner-cat-rackets',
      title: 'PRO-GRADE RACKETS',
      subtitle: 'Experience the ultimate fusion of aerodynamics and structural integrity.',
      image: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg',
      link: '/products',
      position: 'CATEGORY_HERO',
      sortOrder: 1,
      isActive: true,
    },
  });

  console.log('✅ Banners seeded');

  // ==================== ATHLETES ====================
  await prisma.athlete.deleteMany({});
  await prisma.athlete.createMany({
    data: [
      { name: 'Viktor Axelsen', title: 'World #1 Champion', image: 'https://images.pexels.com/photos/8007421/pexels-photo-8007421.jpeg', sortOrder: 1, isActive: true },
      { name: 'An Se-Young', title: "World #1 Women's Champion", image: 'https://images.pexels.com/photos/10544231/pexels-photo-10544231.jpeg', sortOrder: 2, isActive: true },
      { name: 'Kento Momota', title: 'Former World Champion', image: 'https://images.pexels.com/photos/8007173/pexels-photo-8007173.jpeg', sortOrder: 3, isActive: true },
    ],
  });

  console.log('✅ Athletes seeded');

  // ==================== COUPONS ====================
  // WELCOME10: 10% off, max 100k discount, min order 200k, unlimited uses
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10',
      description: 'Giảm 10% tối đa 100.000₫ cho đơn từ 200.000₫',
      type: 'PERCENTAGE',
      value: 10,
      minOrderAmount: 200_000,
      maxDiscount: 100_000,
      usageLimit: null,
      usagePerUser: 1,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-12-31'),
      isActive: true,
    },
  });

  // SAVE50K: fixed 50k off, min order 500k
  await prisma.coupon.upsert({
    where: { code: 'SAVE50K' },
    update: {},
    create: {
      code: 'SAVE50K',
      description: 'Giảm thẳng 50.000₫ cho đơn từ 500.000₫',
      type: 'FIXED_AMOUNT',
      value: 50_000,
      minOrderAmount: 500_000,
      usageLimit: 500,
      usagePerUser: 2,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2027-12-31'),
      isActive: true,
    },
  });

  // EXPIRED20: already expired — for testing expired-coupon rejection
  await prisma.coupon.upsert({
    where: { code: 'EXPIRED20' },
    update: {},
    create: {
      code: 'EXPIRED20',
      description: 'Mã đã hết hạn — chỉ dùng để test',
      type: 'PERCENTAGE',
      value: 20,
      minOrderAmount: 0,
      usageLimit: null,
      usagePerUser: 1,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    },
  });

  console.log('✅ Coupons seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('─────────────────────────────────────────');
  console.log('Admin:    admin@volta.com        / admin123');
  console.log('E2E user: test_playwright@volta.com / test1234');
  console.log('User:     alex@example.com       / User@123');
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
