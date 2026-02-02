import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import {
  CreateVendorProfileDto,
  UpdateVendorProfileDto,
} from './vendor-profile.dto';

@Injectable()
export class VendorProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profile = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    return {
      exists: Boolean(profile),
      profile,
    };
  }

  async createMyProfile(userId: string, dto: CreateVendorProfileDto) {
    const existing = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      // Idempotent create
      return existing;
    }

    const displayName = dto.displayName?.trim();
    if (!displayName) {
      throw new BadRequestException('displayName is required.');
    }

    return this.prisma.vendorProfile.create({
      data: {
        userId,
        displayName,
        companyName: dto.companyName?.trim() || null,
        phone: dto.phone?.trim() || null,
        // status uses DB default (e.g., PENDING)
      },
    });
  }

  async updateMyProfile(userId: string, dto: UpdateVendorProfileDto) {
    const existing = await this.prisma.vendorProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      throw new BadRequestException(
        'Vendor profile does not exist yet. Create it first.',
      );
    }

    const displayName = dto.displayName?.trim();
    const companyName = dto.companyName?.trim();
    const phone = dto.phone?.trim();

    return this.prisma.vendorProfile.update({
      where: { userId },
      data: {
        displayName: displayName || undefined,
        companyName: companyName || undefined,
        phone: phone || undefined,
      },
    });
  }
}
