import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AdminContactController,
  PublicContactController,
} from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  controllers: [PublicContactController, AdminContactController],
  providers: [ContactService, PrismaService],
  exports: [ContactService],
})
export class ContactModule {}
