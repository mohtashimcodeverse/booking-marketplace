import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { ManualPaymentsProvider } from './providers/manual.provider';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService, ManualPaymentsProvider],
})
export class PaymentsModule {}
