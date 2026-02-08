import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVendorServiceAgreementDto } from '../dto/create-vendor-service-agreement.dto';
import { UpdateVendorServiceAgreementStatusDto } from '../dto/update-vendor-service-agreement-status.dto';

@Injectable()
export class VendorServiceAgreementsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { vendorId?: string; includeTerminated?: boolean }) {
    const where: Prisma.VendorServiceAgreementWhereInput = {};
    if (params.vendorId) where.vendorProfileId = params.vendorId;
    if (!params.includeTerminated) where.status = { not: 'TERMINATED' };

    return this.prisma.vendorServiceAgreement.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: { servicePlan: true },
    });
  }

  async getById(id: string) {
    const item = await this.prisma.vendorServiceAgreement.findUnique({
      where: { id },
      include: { servicePlan: true },
    });
    if (!item)
      throw new NotFoundException('Vendor service agreement not found');
    return item;
  }

  async create(dto: CreateVendorServiceAgreementDto) {
    const vendor = await this.prisma.vendorProfile.findUnique({
      where: { id: dto.vendorId },
      select: { id: true },
    });
    if (!vendor) throw new BadRequestException('Vendor not found');

    const plan = await this.prisma.servicePlan.findUnique({
      where: { id: dto.servicePlanId },
      select: { id: true },
    });
    if (!plan) throw new BadRequestException('Service plan not found');

    return this.prisma.vendorServiceAgreement.create({
      data: {
        vendorProfileId: dto.vendorId,
        servicePlanId: dto.servicePlanId,
        status: 'ACTIVE',
        startDate: new Date(dto.startDate), // REQUIRED
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        agreedManagementFeeBps: dto.agreedManagementFeeBps,
        notes: dto.notes?.trim() ?? null,
      },
      include: { servicePlan: true },
    });
  }

  async updateStatus(id: string, dto: UpdateVendorServiceAgreementStatusDto) {
    const existing = await this.getById(id);

    const allowed: Record<string, string[]> = {
      ACTIVE: ['PAUSED', 'TERMINATED'],
      PAUSED: ['ACTIVE', 'TERMINATED'],
      TERMINATED: [],
    };

    if (existing.status === dto.status) return existing;

    if (!allowed[existing.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid status transition: ${existing.status} -> ${dto.status}`,
      );
    }

    // Schema note:
    // VendorServiceAgreement has approvedAt + approvedByAdminId, but no pausedAt/terminatedAt.
    // We will set approvedAt only when moving to ACTIVE (meaning "approved & active").
    return this.prisma.vendorServiceAgreement.update({
      where: { id },
      data: {
        status: dto.status,
        approvedAt: dto.status === 'ACTIVE' ? new Date() : undefined,
        // If you want to store pause/terminate reasons, that needs a new column or audit table.
      },
      include: { servicePlan: true },
    });
  }
}
