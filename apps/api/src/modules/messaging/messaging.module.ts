import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import {
  AdminMessagesController,
  UserMessagesController,
  VendorMessagesController,
} from './messaging.controller';
import { MessagingService } from './messaging.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    AdminMessagesController,
    VendorMessagesController,
    UserMessagesController,
  ],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
