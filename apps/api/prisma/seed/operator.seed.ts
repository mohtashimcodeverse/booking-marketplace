import { PrismaClient, ServicePlanType } from '@prisma/client';

type SeedResult = {
  created: number;
  updated: number;
};

export async function seedOperatorLayer(prisma: PrismaClient): Promise<SeedResult> {
  let created = 0;
  let updated = 0;

  // Frank Porter–style: keep plan codes stable forever (used in code + reporting)
  const plans = [
    {
      code: 'FP_LIST',
      type: ServicePlanType.LISTING_ONLY,
      name: 'Listing Only',
      description: 'We only list and manage bookings. Owner handles operations.',
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
      description: 'We manage bookings + core ops. Some responsibilities remain with the owner.',
      managementFeeBps: 1500, // 15.00% (adjust later if needed)
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
      description: 'Full Frank Porter–style managed program: bookings + operations + maintenance coordination.',
      managementFeeBps: 1900, // 19.00% (your target model)
      includesCleaning: true,
      includesLinen: true,
      includesInspection: true,
      includesRestock: true,
      includesMaintenance: true,
      isActive: true,
    },
  ] as const;

  for (const p of plans) {
    const existing = await prisma.servicePlan.findUnique({ where: { code: p.code } });

    if (!existing) {
      await prisma.servicePlan.create({ data: p });
      created++;
      continue;
    }

    // Keep code stable; allow updating attributes safely
    await prisma.servicePlan.update({
      where: { code: p.code },
      data: {
        type: p.type,
        name: p.name,
        description: p.description,
        managementFeeBps: p.managementFeeBps,
        includesCleaning: p.includesCleaning,
        includesLinen: p.includesLinen,
        includesInspection: p.includesInspection,
        includesRestock: p.includesRestock,
        includesMaintenance: p.includesMaintenance,
        isActive: p.isActive,
      },
    });
    updated++;
  }

  return { created, updated };
}
