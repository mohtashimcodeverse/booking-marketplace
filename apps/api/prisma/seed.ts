import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, PropertyStatus, UserRole, VendorStatus, ServicePlanType, VendorAgreementStatus, PropertyMediaCategory } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Shared password for all seeded users
 * - set SEED_PASSWORD in apps/api/.env if you want a custom one
 */
const SEED_PASSWORD = (process.env.SEED_PASSWORD ?? 'Password123!').trim();

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// deterministic pseudo-random (no external deps)
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function rand() {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rand() * arr.length)]!;
}

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

type AreaSeed = {
  city: string;
  area: string;
  // approximate centers for map realism
  lat: number;
  lng: number;
};

const AREAS: readonly AreaSeed[] = [
  { city: 'Dubai', area: 'Downtown Dubai', lat: 25.1972, lng: 55.2744 },
  { city: 'Dubai', area: 'Dubai Marina', lat: 25.0772, lng: 55.1406 },
  { city: 'Dubai', area: 'Palm Jumeirah', lat: 25.1124, lng: 55.1390 },
  { city: 'Dubai', area: 'JBR', lat: 25.0785, lng: 55.1333 },
  { city: 'Dubai', area: 'Business Bay', lat: 25.1850, lng: 55.2690 },
  { city: 'Dubai', area: 'DIFC', lat: 25.2132, lng: 55.2796 },
  { city: 'Dubai', area: 'JLT', lat: 25.0686, lng: 55.1423 },
  { city: 'Dubai', area: 'Al Barsha', lat: 25.1052, lng: 55.1951 },
  { city: 'Dubai', area: 'City Walk', lat: 25.2046, lng: 55.2560 },
  { city: 'Dubai', area: 'Creek Harbour', lat: 25.1978, lng: 55.3322 },
  { city: 'Dubai', area: 'Jumeirah Village Circle', lat: 25.0602, lng: 55.2083 },
  { city: 'Dubai', area: 'Dubai Hills', lat: 25.0816, lng: 55.2401 },
  { city: 'Dubai', area: 'The Greens', lat: 25.0956, lng: 55.1658 },
] as const;

// Real Unsplash image IDs (stable, hotlink-friendly)
const UNSPLASH_IDS = [
  'photo-1505693416388-ac5ce068fe85',
  'photo-1560067174-8943bd8f1fbd',
  'photo-1522708323590-d24dbb6b0267',
  'photo-1502672260266-1c1ef2d93688',
  'photo-1502005229762-cf1b2da7c5d6',
  'photo-1493809842364-78817add7ffb',
  'photo-1507089947368-19c1da9775ae',
  'photo-1501183638710-841dd1904471',
  'photo-1484154218962-a197022b5858',
  'photo-1512917774080-9991f1c4c750',
  'photo-1505691938895-1758d7feb511',
  'photo-1523217582562-09d0def993a6',
  'photo-1524758631624-e2822e304c36',
  'photo-1549187774-b4e9b0445b41',
] as const;

function unsplashUrl(id: string, w: number) {
  // keep it deterministic, avoid random query params
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

type SeedAmenity = {
  key: string;
  name: string;
  groupKey: string;
  sortOrder: number;
};

type SeedAmenityGroup = { key: string; name: string; sortOrder: number };

const AMENITY_GROUPS: readonly SeedAmenityGroup[] = [
  { key: 'ESSENTIALS', name: 'Essentials', sortOrder: 10 },
  { key: 'KITCHEN', name: 'Kitchen', sortOrder: 20 },
  { key: 'BATHROOM', name: 'Bathroom', sortOrder: 30 },
  { key: 'BEDROOM_LAUNDRY', name: 'Bedroom & Laundry', sortOrder: 40 },
  { key: 'HEATING_COOLING', name: 'Heating & Cooling', sortOrder: 50 },
  { key: 'ENTERTAINMENT', name: 'Entertainment', sortOrder: 60 },
  { key: 'FAMILY', name: 'Family', sortOrder: 70 },
  { key: 'BUILDING', name: 'Building', sortOrder: 80 },
  { key: 'OUTDOOR', name: 'Outdoor', sortOrder: 90 },
  { key: 'SAFETY', name: 'Safety', sortOrder: 100 },
] as const;

const AMENITIES: readonly SeedAmenity[] = [
  // Essentials
  { key: 'WIFI', name: 'Wi-Fi', groupKey: 'ESSENTIALS', sortOrder: 10 },
  { key: 'TOWELS', name: 'Towels', groupKey: 'ESSENTIALS', sortOrder: 20 },
  { key: 'BED_LINENS', name: 'Bed linens', groupKey: 'ESSENTIALS', sortOrder: 30 },
  { key: 'SHAMPOO', name: 'Shampoo', groupKey: 'ESSENTIALS', sortOrder: 40 },
  { key: 'BASIC_TOILETRIES', name: 'Basic toiletries', groupKey: 'ESSENTIALS', sortOrder: 50 },

  // Kitchen
  { key: 'KITCHEN', name: 'Kitchen', groupKey: 'KITCHEN', sortOrder: 10 },
  { key: 'REFRIGERATOR', name: 'Refrigerator', groupKey: 'KITCHEN', sortOrder: 20 },
  { key: 'MICROWAVE', name: 'Microwave', groupKey: 'KITCHEN', sortOrder: 30 },
  { key: 'OVEN', name: 'Oven', groupKey: 'KITCHEN', sortOrder: 40 },
  { key: 'STOVE', name: 'Stove', groupKey: 'KITCHEN', sortOrder: 50 },
  { key: 'KETTLE', name: 'Kettle', groupKey: 'KITCHEN', sortOrder: 60 },
  { key: 'COFFEE_MAKER', name: 'Coffee maker', groupKey: 'KITCHEN', sortOrder: 70 },
  { key: 'DISHES_CUTLERY', name: 'Dishes & cutlery', groupKey: 'KITCHEN', sortOrder: 80 },

  // Bathroom
  { key: 'HOT_WATER', name: 'Hot water', groupKey: 'BATHROOM', sortOrder: 10 },
  { key: 'HAIR_DRYER', name: 'Hair dryer', groupKey: 'BATHROOM', sortOrder: 20 },

  // Bedroom & Laundry
  { key: 'HANGERS', name: 'Hangers', groupKey: 'BEDROOM_LAUNDRY', sortOrder: 10 },
  { key: 'IRON', name: 'Iron', groupKey: 'BEDROOM_LAUNDRY', sortOrder: 20 },
  { key: 'WASHING_MACHINE', name: 'Washing machine', groupKey: 'BEDROOM_LAUNDRY', sortOrder: 30 },

  // Heating & Cooling
  { key: 'AIR_CONDITIONING', name: 'Air conditioning', groupKey: 'HEATING_COOLING', sortOrder: 10 },
  { key: 'HEATING', name: 'Heating', groupKey: 'HEATING_COOLING', sortOrder: 20 },

  // Entertainment
  { key: 'TV', name: 'TV', groupKey: 'ENTERTAINMENT', sortOrder: 10 },
  { key: 'NETFLIX', name: 'Netflix', groupKey: 'ENTERTAINMENT', sortOrder: 20 },

  // Family
  { key: 'BABY_COT', name: 'Baby cot / crib', groupKey: 'FAMILY', sortOrder: 10 },
  { key: 'HIGH_CHAIR', name: 'High chair', groupKey: 'FAMILY', sortOrder: 20 },

  // Building
  { key: 'ELEVATOR', name: 'Elevator', groupKey: 'BUILDING', sortOrder: 10 },
  { key: 'GYM', name: 'Gym', groupKey: 'BUILDING', sortOrder: 20 },
  { key: 'POOL', name: 'Pool', groupKey: 'BUILDING', sortOrder: 30 },
  { key: 'PARKING', name: 'Free parking', groupKey: 'BUILDING', sortOrder: 40 },
  { key: 'DOORMAN', name: 'Doorman', groupKey: 'BUILDING', sortOrder: 50 },

  // Outdoor
  { key: 'BALCONY', name: 'Balcony', groupKey: 'OUTDOOR', sortOrder: 10 },

  // Safety
  { key: 'SMOKE_ALARM', name: 'Smoke alarm', groupKey: 'SAFETY', sortOrder: 10 },
  { key: 'FIRE_EXTINGUISHER', name: 'Fire extinguisher', groupKey: 'SAFETY', sortOrder: 20 },
  { key: 'FIRST_AID_KIT', name: 'First aid kit', groupKey: 'SAFETY', sortOrder: 30 },
] as const;

async function cleanAll() {
  // Operator layer
  await prisma.workOrder.deleteMany().catch(() => undefined);
  await prisma.maintenanceRequest.deleteMany().catch(() => undefined);
  await prisma.opsTask.deleteMany().catch(() => undefined);
  await prisma.propertyServiceConfig.deleteMany().catch(() => undefined);
  await prisma.vendorServiceAgreement.deleteMany().catch(() => undefined);
  await prisma.servicePlan.deleteMany().catch(() => undefined);

  // Payments/Cancellation/Booking
  await prisma.paymentEvent.deleteMany().catch(() => undefined);
  await prisma.refund.deleteMany().catch(() => undefined);
  await prisma.payment.deleteMany().catch(() => undefined);

  await prisma.bookingCancellation.deleteMany().catch(() => undefined);
  await prisma.cancellationPolicyConfig.deleteMany().catch(() => undefined);

  await prisma.bookingIdempotency.deleteMany().catch(() => undefined);
  await prisma.booking.deleteMany().catch(() => undefined);

  // Availability
  await prisma.propertyHold.deleteMany().catch(() => undefined);
  await prisma.propertyCalendarDay.deleteMany().catch(() => undefined);
  await prisma.propertyAvailabilitySettings.deleteMany().catch(() => undefined);

  // Listing
  await prisma.media.deleteMany().catch(() => undefined);

  // Amenities
  await prisma.propertyAmenity.deleteMany().catch(() => undefined);
  await prisma.amenity.deleteMany().catch(() => undefined);
  await prisma.amenityGroup.deleteMany().catch(() => undefined);

  await prisma.location.deleteMany().catch(() => undefined);

  // Listing / users
  await prisma.propertyReview.deleteMany().catch(() => undefined);
  await prisma.propertyDocument.deleteMany().catch(() => undefined);

  await prisma.property.deleteMany().catch(() => undefined);
  await prisma.vendorProfile.deleteMany().catch(() => undefined);
  await prisma.user.deleteMany().catch(() => undefined);
}

async function seedAmenityCatalog() {
  for (const g of AMENITY_GROUPS) {
    await prisma.amenityGroup.upsert({
      where: { key: g.key },
      create: { key: g.key, name: g.name, sortOrder: g.sortOrder, isActive: true },
      update: { name: g.name, sortOrder: g.sortOrder, isActive: true },
    });
  }

  const groups = await prisma.amenityGroup.findMany({ where: { isActive: true } });
  const groupByKey = new Map(groups.map((x) => [x.key, x.id]));

  function groupId(key: string) {
    const id = groupByKey.get(key);
    if (!id) throw new Error(`AmenityGroup missing: ${key}`);
    return id;
  }

  for (const a of AMENITIES) {
    await prisma.amenity.upsert({
      where: { key: a.key },
      create: {
        key: a.key,
        name: a.name,
        icon: null,
        groupId: groupId(a.groupKey),
        sortOrder: a.sortOrder,
        isActive: true,
      },
      update: {
        name: a.name,
        groupId: groupId(a.groupKey),
        sortOrder: a.sortOrder,
        isActive: true,
      },
    });
  }

  // safe backfill
  const essentialsId = groupId('ESSENTIALS');
  await prisma.amenity.updateMany({ where: { groupId: null }, data: { groupId: essentialsId } });

  const all = await prisma.amenity.findMany({ select: { id: true, key: true } });
  return { amenityByKey: new Map(all.map((x) => [x.key, x.id])) };
}

async function seedServicePlans() {
  const plans = [
    {
      code: 'FP_LIST',
      type: ServicePlanType.LISTING_ONLY,
      name: 'Listing Only',
      description: 'We list and manage bookings. Owner handles operations.',
      managementFeeBps: 0,
      includesCleaning: false,
      includesLinen: false,
      includesInspection: false,
      includesRestock: false,
      includesMaintenance: false,
      isActive: true,
    },
    {
      code: 'FP_SEMI',
      type: ServicePlanType.SEMI_MANAGED,
      name: 'Semi-Managed',
      description: 'Bookings + core ops. Some responsibilities remain with owner.',
      managementFeeBps: 1500,
      includesCleaning: true,
      includesLinen: true,
      includesInspection: true,
      includesRestock: false,
      includesMaintenance: true,
      isActive: true,
    },
    {
      code: 'FP_FULL',
      type: ServicePlanType.FULLY_MANAGED,
      name: 'Fully Managed',
      description: 'Full program: bookings + operations + maintenance coordination.',
      managementFeeBps: 1900,
      includesCleaning: true,
      includesLinen: true,
      includesInspection: true,
      includesRestock: true,
      includesMaintenance: true,
      isActive: true,
    },
  ] as const;

  for (const p of plans) {
    await prisma.servicePlan.upsert({
      where: { code: p.code },
      create: p,
      update: { ...p },
    });
  }

  const seeded = await prisma.servicePlan.findMany();
  const byCode = new Map(seeded.map((x) => [x.code, x]));
  const list = byCode.get('FP_LIST');
  const semi = byCode.get('FP_SEMI');
  const full = byCode.get('FP_FULL');
  if (!list || !semi || !full) throw new Error('ServicePlan seeding failed');
  return { list, semi, full };
}

type SeedVendor = {
  userId: string;
  email: string;
  vendorProfileId: string;
  agreementId: string;
  planCode: 'FP_LIST' | 'FP_SEMI' | 'FP_FULL';
};

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is missing. Put it in apps/api/.env');

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await cleanAll();

  // -----------------------------
  // USERS
  // -----------------------------

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash,
      role: UserRole.ADMIN,
      fullName: 'Demo Admin',
      isEmailVerified: true,
    },
  });

  // 6 vendors
  const vendorEmails = [
    'vendor.alpha@demo.com',
    'vendor.bravo@demo.com',
    'vendor.charlie@demo.com',
    'vendor.delta@demo.com',
    'vendor.echo@demo.com',
    'vendor.foxtrot@demo.com',
  ] as const;

  const vendorsUsers = await Promise.all(
    vendorEmails.map((email, idx) =>
      prisma.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.VENDOR,
          fullName: `Vendor ${idx + 1}`,
          isEmailVerified: true,
        },
      }),
    ),
  );

  const vendorProfiles = await Promise.all(
    vendorsUsers.map((u, idx) =>
      prisma.vendorProfile.create({
        data: {
          userId: u.id,
          displayName: `Vendor ${idx + 1}`,
          companyName: `Vendor ${idx + 1} Hospitality`,
          phone: `+971 50 0000${String(idx + 1).padStart(2, '0')}`,
          status: VendorStatus.APPROVED,
        },
      }),
    ),
  );

  // 12 customers
  const customerEmails = Array.from({ length: 12 }).map((_, i) => `customer${i + 1}@demo.com`);
  const customers = await Promise.all(
    customerEmails.map((email, idx) =>
      prisma.user.create({
        data: {
          email,
          passwordHash,
          role: UserRole.CUSTOMER,
          fullName: `Customer ${idx + 1}`,
          isEmailVerified: true,
        },
      }),
    ),
  );

  // -----------------------------
  // AMENITIES CATALOG
  // -----------------------------
  const { amenityByKey } = await seedAmenityCatalog();

  // -----------------------------
  // OPERATOR: SERVICE PLANS + AGREEMENTS
  // -----------------------------
  const { list, semi, full } = await seedServicePlans();

  // assign vendor plans (mix)
  const vendorPlanCodes: Array<'FP_LIST' | 'FP_SEMI' | 'FP_FULL'> = ['FP_FULL', 'FP_SEMI', 'FP_FULL', 'FP_LIST', 'FP_SEMI', 'FP_FULL'];

  const now = new Date();

  const seededVendors: SeedVendor[] = [];

  for (let i = 0; i < vendorsUsers.length; i++) {
    const user = vendorsUsers[i]!;
    const vp = vendorProfiles[i]!;
    const code = vendorPlanCodes[i]!;
    const plan = code === 'FP_LIST' ? list : code === 'FP_SEMI' ? semi : full;

    const agreement = await prisma.vendorServiceAgreement.create({
      data: {
        vendorProfileId: vp.id,
        servicePlanId: plan.id,
        status: VendorAgreementStatus.ACTIVE,
        startDate: now,
        endDate: null,
        agreedManagementFeeBps: plan.managementFeeBps,
        notes: `Seed agreement (${plan.name}).`,
        approvedByAdminId: admin.id,
        approvedAt: now,
      },
    });

    seededVendors.push({
      userId: user.id,
      email: user.email,
      vendorProfileId: vp.id,
      agreementId: agreement.id,
      planCode: code,
    });
  }

  // -----------------------------
  // PROPERTIES (26)
  // -----------------------------
  const rand = mulberry32(20260206);

  const TITLES = [
    'Skyline Studio Retreat',
    'Marina View Apartment',
    'Downtown Luxe Residence',
    'Palm Resort Suite',
    'Canal-Side Business Bay Stay',
    'DIFC City Apartment',
    'Family-Ready Two Bedroom',
    'Minimalist Urban Escape',
    'Premium High-Floor View',
    'Quiet Community Home',
    'Modern Designer Flat',
    'Serviced Comfort Suite',
  ] as const;

  const propertyCount = 26;
  const properties: { id: string; slug: string; vendorEmail: string; status: PropertyStatus }[] = [];

  // amenity “profiles” for realism
  const amenityProfiles: readonly string[][] = [
    ['WIFI', 'AIR_CONDITIONING', 'TV', 'KITCHEN', 'REFRIGERATOR', 'MICROWAVE', 'ELEVATOR', 'POOL', 'GYM', 'PARKING'],
    ['WIFI', 'AIR_CONDITIONING', 'TV', 'KITCHEN', 'OVEN', 'COFFEE_MAKER', 'DISHES_CUTLERY', 'DOORMAN', 'POOL'],
    ['WIFI', 'AIR_CONDITIONING', 'TV', 'KITCHEN', 'REFRIGERATOR', 'PARKING', 'BALCONY', 'SMOKE_ALARM', 'FIRE_EXTINGUISHER'],
    ['WIFI', 'AIR_CONDITIONING', 'TV', 'KITCHEN', 'MICROWAVE', 'ELEVATOR', 'GYM', 'SMOKE_ALARM', 'FIRST_AID_KIT'],
  ] as const;

  const statusMix: readonly PropertyStatus[] = [
    PropertyStatus.PUBLISHED,
    PropertyStatus.PUBLISHED,
    PropertyStatus.PUBLISHED,
    PropertyStatus.APPROVED,
    PropertyStatus.APPROVED,
    PropertyStatus.UNDER_REVIEW,
    PropertyStatus.UNDER_REVIEW,
    PropertyStatus.CHANGES_REQUESTED,
    PropertyStatus.DRAFT,
  ] as const;

  for (let i = 0; i < propertyCount; i++) {
    const vendor = seededVendors[i % seededVendors.length]!;
    const area = pick(rand, AREAS);
    const titleBase = pick(rand, TITLES);
    const bedrooms = clamp(1 + Math.floor(rand() * 4), 1, 5);
    const bathrooms = clamp(1 + Math.floor(rand() * 3), 1, 4);
    const maxGuests = clamp(2 + bedrooms + Math.floor(rand() * 3), 2, 10);

    const basePrice = clamp(24000 + Math.floor(rand() * 90000), 24000, 120000);
    const cleaningFee = clamp(3000 + Math.floor(rand() * 7000), 3000, 12000);

    const status = statusMix[i % statusMix.length]!;
    const slug = `${slugify(`${titleBase} ${area.area}`)}-${i + 1}`;

    const lat = area.lat + (rand() - 0.5) * 0.02;
    const lng = area.lng + (rand() - 0.5) * 0.02;

    const created = await prisma.property.create({
      data: {
        vendorId: vendor.userId,
        title: `${titleBase} • ${area.area}`,
        slug,
        description:
          'A professionally managed stay with hotel-grade standards and backend-verified availability. Seed content for UI realism.',
        city: area.city,
        area: area.area,
        address: `${Math.floor(10 + rand() * 80)} ${area.area}, Dubai`,
        lat,
        lng,

        maxGuests,
        bedrooms,
        bathrooms,

        basePrice,
        cleaningFee,
        currency: 'PKR',

        minNights: clamp(1 + Math.floor(rand() * 3), 1, 4),
        maxNights: null,
        isInstantBook: rand() > 0.75,

        status,

        media: {
          createMany: {
            data: [
              // COVER-ish first image (we keep category OTHER in schema; UI can treat first as cover)
              { url: unsplashUrl(pick(rand, UNSPLASH_IDS), 2400), alt: 'Cover', sortOrder: 0, category: PropertyMediaCategory.OTHER },

              // Required categories (submit workflow wants these)
              { url: unsplashUrl(pick(rand, UNSPLASH_IDS), 1600), alt: 'Living room', sortOrder: 1, category: PropertyMediaCategory.LIVING_ROOM },
              { url: unsplashUrl(pick(rand, UNSPLASH_IDS), 1600), alt: 'Bedroom', sortOrder: 2, category: PropertyMediaCategory.BEDROOM },
              { url: unsplashUrl(pick(rand, UNSPLASH_IDS), 1600), alt: 'Bathroom', sortOrder: 3, category: PropertyMediaCategory.BATHROOM },
              { url: unsplashUrl(pick(rand, UNSPLASH_IDS), 1600), alt: 'Kitchen', sortOrder: 4, category: PropertyMediaCategory.KITCHEN },

              // Extras for nicer galleries
              { url: unsplashUrl(pick(rand, UNSPLASH_IDS), 1600), alt: 'Exterior', sortOrder: 5, category: PropertyMediaCategory.EXTERIOR },
              { url: unsplashUrl(pick(rand, UNSPLASH_IDS), 1600), alt: 'Amenities', sortOrder: 6, category: PropertyMediaCategory.AMENITY },
              { url: unsplashUrl(pick(rand, UNSPLASH_IDS), 1600), alt: 'Another angle', sortOrder: 7, category: PropertyMediaCategory.OTHER },
            ],
          },
        },
      },
      select: { id: true, slug: true, status: true },
    });

    properties.push({ id: created.id, slug: created.slug, vendorEmail: vendor.email, status: created.status });

    // Attach amenities
    const profile = pick(rand, amenityProfiles);
    const chosenKeys = uniq(profile.filter((k) => amenityByKey.has(k)));

    const rows = chosenKeys
      .map((k) => amenityByKey.get(k))
      .filter((x): x is string => typeof x === 'string');

    if (rows.length > 0) {
      await prisma.propertyAmenity.createMany({
        data: rows.map((amenityId) => ({ propertyId: created.id, amenityId })),
        skipDuplicates: true,
      });
    }

    // PropertyServiceConfig based on vendor plan
    const plan = vendor.planCode === 'FP_LIST' ? list : vendor.planCode === 'FP_SEMI' ? semi : full;
    await prisma.propertyServiceConfig.create({
      data: {
        propertyId: created.id,
        servicePlanId: plan.id,
        vendorAgreementId: vendor.agreementId,
        // keep overrides null so plan defaults are the source of truth
        cleaningRequired: null,
        linenChangeRequired: null,
        inspectionRequired: null,
        restockRequired: null,
        maintenanceIncluded: null,
        guestCleaningFee: null,
        linenFee: null,
        inspectionFee: null,
        restockFee: null,
        currency: 'PKR',
      },
    });

    // Cancellation policy config (optional but makes UI richer)
    await prisma.cancellationPolicyConfig.create({
      data: {
        propertyId: created.id,
        version: `seed-v1-${i + 1}`,
        isActive: true,
        freeCancelBeforeHours: 72,
        partialRefundBeforeHours: 48,
        noRefundWithinHours: 24,
        penaltyValue: 20,
      },
    });
  }

  // -----------------------------
  // DONE
  // -----------------------------
  // eslint-disable-next-line no-console
  console.log('✅ Seed complete');
  // eslint-disable-next-line no-console
  console.log('--- LOGINS (shared password) ---');
  // eslint-disable-next-line no-console
  console.log({ password: SEED_PASSWORD });
  // eslint-disable-next-line no-console
  console.log({ admin: admin.email });
  // eslint-disable-next-line no-console
  console.log({ vendors: seededVendors.map((v) => v.email) });
  // eslint-disable-next-line no-console
  console.log({ customers: customers.map((c) => c.email) });
  // eslint-disable-next-line no-console
  console.log('--- PROPERTIES ---');
  // eslint-disable-next-line no-console
  console.table(properties.map((p) => ({ slug: p.slug, status: p.status, vendor: p.vendorEmail })));
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('❌ Seed failed:', e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
