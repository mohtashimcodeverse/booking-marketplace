import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OpsTaskStatus, type OpsTaskType } from '@prisma/client';

@Injectable()
export class OperatorOpsGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  async onBookingConfirmed(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        propertyId: true,
        checkOut: true,
        status: true,
      },
    });

    if (!booking) return;
    if (booking.status !== 'CONFIRMED') return;

    const cfg = await this.prisma.propertyServiceConfig.findUnique({
      where: { propertyId: booking.propertyId },
      select: {
        cleaningRequired: true,
        inspectionRequired: true,
        linenChangeRequired: true,
        restockRequired: true,
        maintenanceIncluded: true, // exists but OpsTaskType has no MAINTENANCE in V1
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
    });

    const plan = cfg?.servicePlan ?? null;

    const includeCleaning =
      cfg?.cleaningRequired ?? plan?.includesCleaning ?? false;
    const includeInspection =
      cfg?.inspectionRequired ?? plan?.includesInspection ?? false;
    const includeLinen =
      cfg?.linenChangeRequired ?? plan?.includesLinen ?? false;
    const includeRestock =
      cfg?.restockRequired ?? plan?.includesRestock ?? false;

    const tasksToCreate: Array<{ type: OpsTaskType; dueAt: Date }> = [];
    const dueAt = booking.checkOut;

    if (includeCleaning) tasksToCreate.push({ type: 'CLEANING', dueAt });
    if (includeInspection) tasksToCreate.push({ type: 'INSPECTION', dueAt });
    if (includeLinen) tasksToCreate.push({ type: 'LINEN', dueAt });
    if (includeRestock) tasksToCreate.push({ type: 'RESTOCK', dueAt });

    if (tasksToCreate.length === 0) return;

    const existing = await this.prisma.opsTask.findMany({
      where: { bookingId: booking.id },
      select: { type: true },
    });

    const existingTypes = new Set<OpsTaskType>(existing.map((t) => t.type));

    const createData = tasksToCreate
      .filter((t) => !existingTypes.has(t.type))
      .map((t) => ({
        bookingId: booking.id,
        propertyId: booking.propertyId,
        type: t.type,
        status: OpsTaskStatus.PENDING,
        scheduledFor: t.dueAt,
        dueAt: t.dueAt,
        notes: null,
      }));

    if (createData.length === 0) return;

    await this.prisma.opsTask.createMany({
      data: createData,
      skipDuplicates: true,
    });
  }

  async onBookingCancelled(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true },
    });
    if (!booking) return;

    await this.prisma.opsTask.updateMany({
      where: {
        bookingId,
        status: {
          in: [
            OpsTaskStatus.PENDING,
            OpsTaskStatus.ASSIGNED,
            OpsTaskStatus.IN_PROGRESS,
          ],
        },
      },
      data: {
        status: OpsTaskStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
  }
}
