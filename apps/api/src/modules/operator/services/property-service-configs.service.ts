import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertPropertyServiceConfigDto } from '../dto/upsert-property-service-config.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class PropertyServiceConfigsService {
  constructor(private readonly prisma: PrismaService) {}

  async getByPropertyIdForActor(
    actor: { id: string; role: UserRole },
    propertyId: string,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, vendorId: true },
    });
    if (!property) throw new BadRequestException('Property not found');

    if (actor.role === UserRole.VENDOR && property.vendorId !== actor.id) {
      throw new ForbiddenException('Not allowed to view this property config.');
    }

    return this.prisma.propertyServiceConfig.findUnique({
      where: { propertyId },
      include: { servicePlan: true },
    });
  }

  async upsertByActor(
    actor: { id: string; role: UserRole },
    dto: UpsertPropertyServiceConfigDto,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
      select: { id: true, vendorId: true },
    });
    if (!property) throw new BadRequestException('Property not found');

    if (actor.role === UserRole.VENDOR && property.vendorId !== actor.id) {
      throw new ForbiddenException('Not allowed to configure this property.');
    }

    const plan = await this.prisma.servicePlan.findUnique({
      where: { id: dto.servicePlanId },
      select: { id: true },
    });
    if (!plan) throw new BadRequestException('Service plan not found');

    // currency required by schema
    if (!dto.currency?.trim())
      throw new BadRequestException('currency is required');

    return this.prisma.propertyServiceConfig.upsert({
      where: { propertyId: dto.propertyId },
      create: {
        propertyId: dto.propertyId,
        servicePlanId: dto.servicePlanId,
        currency: dto.currency.trim().toUpperCase(),

        cleaningRequired: dto.cleaningRequired ?? null,
        inspectionRequired: dto.inspectionRequired ?? null,
        linenChangeRequired: dto.linenChangeRequired ?? null,
        restockRequired: dto.restockRequired ?? null,
        maintenanceIncluded: dto.maintenanceIncluded ?? null,

        guestCleaningFee: dto.guestCleaningFee ?? null,
        linenFee: dto.linenFee ?? null,
        inspectionFee: dto.inspectionFee ?? null,
        restockFee: dto.restockFee ?? null,
      },
      update: {
        servicePlanId: dto.servicePlanId,
        currency: dto.currency.trim().toUpperCase(),

        cleaningRequired:
          dto.cleaningRequired !== undefined ? dto.cleaningRequired : undefined,
        inspectionRequired:
          dto.inspectionRequired !== undefined
            ? dto.inspectionRequired
            : undefined,
        linenChangeRequired:
          dto.linenChangeRequired !== undefined
            ? dto.linenChangeRequired
            : undefined,
        restockRequired:
          dto.restockRequired !== undefined ? dto.restockRequired : undefined,
        maintenanceIncluded:
          dto.maintenanceIncluded !== undefined
            ? dto.maintenanceIncluded
            : undefined,

        guestCleaningFee:
          dto.guestCleaningFee !== undefined ? dto.guestCleaningFee : undefined,
        linenFee: dto.linenFee !== undefined ? dto.linenFee : undefined,
        inspectionFee:
          dto.inspectionFee !== undefined ? dto.inspectionFee : undefined,
        restockFee: dto.restockFee !== undefined ? dto.restockFee : undefined,
      },
      include: { servicePlan: true },
    });
  }
}
