import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpsTaskStatus, OpsTaskType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateOpsTaskDto } from '../dto/update-ops-task.dto';

function isOpsTaskStatus(value: string): value is OpsTaskStatus {
  return Object.values(OpsTaskStatus).some((status) => status === value);
}

function isOpsTaskType(value: string): value is OpsTaskType {
  return Object.values(OpsTaskType).some((type) => type === value);
}

@Injectable()
export class OpsTasksService {
  constructor(private readonly prisma: PrismaService) {}

  private buildVendorScope(actor: { id: string; role: UserRole }) {
    if (actor.role !== UserRole.VENDOR) return {};
    return { property: { vendorId: actor.id } };
  }

  async list(params: {
    actor: { id: string; role: UserRole };
    propertyId?: string;
    bookingId?: string;
    status?: string;
    type?: string;
    assignedToUserId?: string;
    limit?: number;
    page?: number;
  }) {
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    const page = Math.max(params.page ?? 1, 1);
    const skip = (page - 1) * limit;

    const where: Prisma.OpsTaskWhereInput = {
      ...this.buildVendorScope(params.actor),
    };
    if (params.propertyId) where.propertyId = params.propertyId;
    if (params.bookingId) where.bookingId = params.bookingId;
    if (params.status) {
      if (!isOpsTaskStatus(params.status)) {
        throw new BadRequestException('Invalid ops task status');
      }
      where.status = params.status;
    }
    if (params.type) {
      if (!isOpsTaskType(params.type)) {
        throw new BadRequestException('Invalid ops task type');
      }
      where.type = params.type;
    }
    if (params.assignedToUserId)
      where.assignedToUserId = params.assignedToUserId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.opsTask.findMany({
        where,
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.opsTask.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async getById(id: string, actor: { id: string; role: UserRole }) {
    const item = await this.prisma.opsTask.findFirst({
      where: {
        id,
        ...this.buildVendorScope(actor),
      },
    });
    if (!item) throw new NotFoundException('Ops task not found.');
    return item;
  }

  async update(
    id: string,
    dto: UpdateOpsTaskDto,
    actor: { id: string; role: UserRole },
  ) {
    if (actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admin can update ops tasks.');
    }
    const existing = await this.getById(id, actor);

    const allowed: Record<string, string[]> = {
      PENDING: ['ASSIGNED', 'CANCELLED'],
      ASSIGNED: ['IN_PROGRESS', 'DONE', 'CANCELLED'],
      IN_PROGRESS: ['DONE', 'CANCELLED'],
      DONE: [],
      CANCELLED: [],
    };

    if (dto.status && !allowed[existing.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition: ${existing.status} -> ${dto.status}`,
      );
    }

    return this.prisma.opsTask.update({
      where: { id },
      data: {
        status: dto.status,
        assignedToUserId:
          dto.assignedToUserId !== undefined ? dto.assignedToUserId : undefined,
        notes:
          dto.notes !== undefined ? (dto.notes?.trim() ?? null) : undefined,
        completedAt: dto.status === 'DONE' ? new Date() : undefined,
        cancelledAt: dto.status === 'CANCELLED' ? new Date() : undefined,
      },
    });
  }
}
