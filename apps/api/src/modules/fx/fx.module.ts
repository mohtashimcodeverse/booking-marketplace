import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import {
  FxRatesAdminController,
  FxRatesPublicController,
} from './fx-rates.controller';
import { FxRatesService } from './fx-rates.service';

@Module({
  imports: [PrismaModule],
  controllers: [FxRatesPublicController, FxRatesAdminController],
  providers: [FxRatesService],
  exports: [FxRatesService],
})
export class FxModule {}
