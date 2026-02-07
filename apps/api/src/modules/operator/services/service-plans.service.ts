import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServicePlanDto } from '../dto/create-service-plan.dto';
import { UpdateServicePlanDto } from '../dto/update-service-plan.dto';

@Injectable()
export class ServicePlansService {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: { includeInactive?: boolean }) {
    const includeInactive = params.includeInactive ?? false;

    return this.prisma.servicePlan.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
    });
  }

  async getById(id: string) {
    const plan = await this.prisma.servicePlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Service plan not found');
    return plan;
  }

  async create(dto: CreateServicePlanDto) {
    const code = dto.code.trim().toUpperCase();

    // type is already validated by DTO enum
    try {
      return await this.prisma.servicePlan.create({
        data: {
          type: dto.type,
          code,
          name: dto.name.trim(),
          description: dto.description?.trim() ?? null,
          managementFeeBps: dto.managementFeeBps,
          includesCleaning: dto.includesCleaning,
          includesInspection: dto.includesInspection,
          includesLinen: dto.includesLinen,
          includesRestock: dto.includesRestock,
          includesMaintenance: dto.includesMaintenance,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new BadRequestException(
          'A service plan with this code already exists',
        );
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateServicePlanDto) {
    await this.getById(id);

    return this.prisma.servicePlan.update({
      where: { id },
      data: {
        type: dto.type,
        name: dto.name?.trim(),
        description:
          dto.description !== undefined
            ? (dto.description?.trim() ?? null)
            : undefined,
        managementFeeBps: dto.managementFeeBps,
        includesCleaning: dto.includesCleaning,
        includesInspection: dto.includesInspection,
        includesLinen: dto.includesLinen,
        includesRestock: dto.includesRestock,
        includesMaintenance: dto.includesMaintenance,
        isActive: dto.isActive,
      },
    });
  }
}
