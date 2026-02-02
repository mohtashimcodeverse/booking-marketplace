import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { AuthModule } from './auth/auth.module';
import { VendorModule } from './vendor/vendor.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';

import { BookingExpiryWorker } from './workers/booking-expiry.worker';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    ScheduleModule.forRoot(), // ✅ REQUIRED for cron jobs

    PrismaModule,
    AvailabilityModule,
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    AuthModule,
    VendorModule,
    HealthModule,
    PropertiesModule,
    BookingsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [
    BookingExpiryWorker, // ✅ registers the background job
  ],
})
export class AppModule {}
