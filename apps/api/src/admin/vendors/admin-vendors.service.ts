import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class AdminVendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    const items = await this.prisma.vendorProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, fullName: true, role: true } },
      },
    });

    return { items };
  }
}
