import 'dotenv/config';
import {
  PrismaClient,
  PropertyStatus,
  UserRole,
  VendorStatus,
  type Property,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Put it in apps/api/.env');
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Clean (order matters due to relations)
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.media.deleteMany();
  await prisma.property.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.user.deleteMany();

  // Admin
  const admin = await prisma.user.create({
    data: { email: 'admin@demo.com', passwordHash, role: UserRole.ADMIN },
  });

  // Vendors
  const vendor1 = await prisma.user.create({
    data: { email: 'vendor1@demo.com', passwordHash, role: UserRole.VENDOR },
  });
  const vendor2 = await prisma.user.create({
    data: { email: 'vendor2@demo.com', passwordHash, role: UserRole.VENDOR },
  });

  await prisma.vendorProfile.createMany({
    data: [
      {
        userId: vendor1.id,
        displayName: 'Vendor One',
        companyName: 'Vendor One Stays',
        phone: '+92 300 0000001',
        status: VendorStatus.APPROVED,
      },
      {
        userId: vendor2.id,
        displayName: 'Vendor Two',
        companyName: 'Vendor Two Homes',
        phone: '+92 300 0000002',
        status: VendorStatus.APPROVED,
      },
    ],
  });

  // Customers
  const customers = await Promise.all(
    Array.from({ length: 5 }).map((_, i) =>
      prisma.user.create({
        data: { email: `customer${i + 1}@demo.com`, passwordHash, role: UserRole.CUSTOMER },
      }),
    ),
  );

  // Properties
  const sampleProps = [
    { title: 'Luxury Downtown Apartment', city: 'Dubai', area: 'Downtown', price: 45000 },
    { title: 'Marina View Studio', city: 'Dubai', area: 'Dubai Marina', price: 32000 },
    { title: 'Palm Jumeirah Resort Suite', city: 'Dubai', area: 'Palm Jumeirah', price: 90000 },
    { title: 'Modern Business Bay Flat', city: 'Dubai', area: 'Business Bay', price: 38000 },
    { title: 'Cozy JLT Apartment', city: 'Dubai', area: 'JLT', price: 28000 },
    { title: 'City Walk Premium Stay', city: 'Dubai', area: 'City Walk', price: 52000 },
    { title: 'Creek Harbour Escape', city: 'Dubai', area: 'Creek Harbour', price: 41000 },
    { title: 'Minimalist Al Barsha Home', city: 'Dubai', area: 'Al Barsha', price: 25000 },
  ];

  const vendors = [vendor1, vendor2];

  const properties: Property[] = [];

  for (let i = 0; i < sampleProps.length; i++) {
    const v = vendors[i % vendors.length];
    const p = sampleProps[i];
    const slug = `${slugify(p.title)}-${i + 1}`;

    const created = await prisma.property.create({
      data: {
        vendorId: v.id,
        title: p.title,
        slug,
        description: 'Seed listing for development. Replace content later.',
        city: p.city,
        area: p.area,
        maxGuests: 2 + (i % 4),
        bedrooms: 1 + (i % 3),
        bathrooms: 1 + (i % 2),
        basePrice: p.price,
        cleaningFee: 5000,
        currency: 'PKR',
        status: PropertyStatus.PUBLISHED,
        media: {
          createMany: {
            data: [
              { url: 'https://picsum.photos/seed/1/1200/800', alt: 'Cover', sortOrder: 0 },
              { url: 'https://picsum.photos/seed/2/1200/800', alt: 'Living', sortOrder: 1 },
              { url: 'https://picsum.photos/seed/3/1200/800', alt: 'Bedroom', sortOrder: 2 },
            ],
          },
        },
      },
    });

    properties.push(created);
  }

  // Bookings (simple)
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 6; i++) {
    const customer = customers[i % customers.length];
    const property = properties[i % properties.length];

    const checkIn = new Date(now.getTime() + (i + 2) * day);
    const checkOut = new Date(now.getTime() + (i + 5) * day);

    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / day));
    const totalAmount = property.basePrice * nights + property.cleaningFee;

    await prisma.booking.create({
      data: {
        customerId: customer.id,
        propertyId: property.id,
        checkIn,
        checkOut,
        adults: 2,
        children: i % 2,
        totalAmount,
        currency: 'PKR',
        payment: {
          create: {
            amount: totalAmount,
            currency: 'PKR',
            providerRef: `seed_${i + 1}`,
          },
        },
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log('✅ Seed complete');
  // eslint-disable-next-line no-console
  console.log({
    admin: admin.email,
    vendors: [vendor1.email, vendor2.email],
    customers: customers.map((c) => c.email),
    properties: properties.map((p) => p.slug),
  });
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
