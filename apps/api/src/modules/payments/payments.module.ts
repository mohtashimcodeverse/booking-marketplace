import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { PaymentsController } from './payments.controller';
import { PaymentsWebhooksController } from './payments.webhooks.controller';
import { PaymentsService } from './payments.service';

import { ManualPaymentsProvider } from './providers/manual.provider';
import { TelrPaymentsProvider } from './providers/telr.provider';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [PaymentsController, PaymentsWebhooksController],
  providers: [PaymentsService, ManualPaymentsProvider, TelrPaymentsProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
