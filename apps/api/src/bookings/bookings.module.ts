// src/bookings/bookings.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from '../modules/prisma/prisma.service';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { CancellationPolicyService } from './policies/cancellation.policy';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService, CancellationPolicyService],
})
export class BookingsModule {}
