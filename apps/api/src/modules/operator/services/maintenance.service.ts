import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MaintenanceStatus, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMaintenanceRequestDto } from '../dto/create-maintenance-request.dto';
import { UpdateWorkOrderDto } from '../dto/update-work-order.dto';

function isMaintenanceStatus(value: string): value is MaintenanceStatus {
  return Object.values(MaintenanceStatus).some((status) => status === value);
}

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async createRequest(
    actor: { id: string; role: UserRole },
    dto: CreateMaintenanceRequestDto,
  ) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
      select: { id: true, vendorId: true },
    });
    if (!property) throw new BadRequestException('Property not found');
    if (actor.role === UserRole.VENDOR && property.vendorId !== actor.id) {
      throw new ForbiddenException(
        'Vendors can only create requests for their own properties.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const req = await tx.maintenanceRequest.create({
        data: {
          propertyId: dto.propertyId,
          createdByUserId: actor.id,
          priority: dto.priority,
          title: dto.title.trim(),
          description: dto.description.trim(),
          // your schema requires title; notes field may or may not exist.
          // If you have a notes/internalNotes column, tell me and we'll map it.
        },
      });

      const wo = await tx.workOrder.create({
        data: {
          maintenanceRequestId: req.id,
          status: 'DRAFT',
          notes: dto.notes?.trim() ?? null,
        },
      });

      return { request: req, workOrder: wo };
    });
  }

  async listRequests(params: {
    actor: { id: string; role: UserRole };
    propertyId?: string;
    status?: string;
    limit?: number;
    page?: number;
  }) {
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    const page = Math.max(params.page ?? 1, 1);
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceRequestWhereInput = {};
    if (params.actor.role === UserRole.VENDOR) {
      where.property = { vendorId: params.actor.id };
    }
    if (params.propertyId) where.propertyId = params.propertyId;
    if (params.status) {
      if (!isMaintenanceStatus(params.status)) {
        throw new BadRequestException('Invalid maintenance status');
      }
      where.status = params.status;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.maintenanceRequest.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
        include: { workOrders: true },
      }),
      this.prisma.maintenanceRequest.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async updateWorkOrder(
    actor: { id: string; role: UserRole },
    workOrderId: string,
    dto: UpdateWorkOrderDto,
  ) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can update work orders.');
    }
    const existing = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
    });
    if (!existing) throw new NotFoundException('Work order not found');

    const allowed: Record<string, string[]> = {
      DRAFT: ['APPROVED', 'CANCELLED'],
      APPROVED: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    if (dto.status && !allowed[existing.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition: ${existing.status} -> ${dto.status}`,
      );
    }

    return this.prisma.workOrder.update({
      where: { id: workOrderId },
      data: {
        status: dto.status,
        assignedToUserId:
          dto.assignedToUserId !== undefined ? dto.assignedToUserId : undefined,
        notes:
          dto.notes !== undefined ? (dto.notes?.trim() ?? null) : undefined,
        completedAt: dto.status === 'COMPLETED' ? new Date() : undefined,
        cancelledAt: dto.status === 'CANCELLED' ? new Date() : undefined,
      },
    });
  }
}
