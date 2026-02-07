import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OperatorServiceConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getEffectiveOpsInclusions(propertyId: string): Promise<{
    includeCleaning: boolean;
    includeInspection: boolean;
    includeLinen: boolean;
    includeRestock: boolean;
    includeMaintenance: boolean;
  }> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        serviceConfig: {
          select: {
            cleaningRequired: true,
            inspectionRequired: true,
            linenChangeRequired: true,
            restockRequired: true,
            maintenanceIncluded: true, // ✅ correct per DMMF
            servicePlan: {
              select: {
                includesCleaning: true,
                includesInspection: true,
                includesLinen: true,
                includesRestock: true,
                includesMaintenance: true,
              },
            },
          },
        },
      },
    });

    const cfg = property?.serviceConfig ?? null;
    const plan = cfg?.servicePlan ?? null;

    return {
      includeCleaning: cfg?.cleaningRequired ?? plan?.includesCleaning ?? false,
      includeInspection:
        cfg?.inspectionRequired ?? plan?.includesInspection ?? false,
      includeLinen: cfg?.linenChangeRequired ?? plan?.includesLinen ?? false,
      includeRestock: cfg?.restockRequired ?? plan?.includesRestock ?? false,
      includeMaintenance:
        cfg?.maintenanceIncluded ?? plan?.includesMaintenance ?? false,
    };
  }
}
