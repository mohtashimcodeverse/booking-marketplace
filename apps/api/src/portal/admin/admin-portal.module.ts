import { Module } from '@nestjs/common';
import { AdminPortalController } from './admin-portal.controller';
import { AdminPortalService } from './admin-portal.service';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Module({
  controllers: [AdminPortalController],
  providers: [AdminPortalService, PrismaService],
})
export class AdminPortalModule {}
