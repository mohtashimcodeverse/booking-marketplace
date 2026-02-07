import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';

async function bootstrap() {
  // ✅ Normal JSON parsing is fine since TELR-only mode: raw-body middleware not required
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // ✅ Normal JSON parsing for all routes
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Security + cookies
  app.use(cookieParser());
  app.use(helmet());

  /**
   * ✅ Public static assets
   *
   * IMPORTANT:
   * - Public: property listing images (safe)
   * - Private: ownership/verification documents (must NEVER be publicly served)
   *
   * Images are stored at: <apps/api>/uploads/properties/images/...
   * Served at:            http://host/uploads/properties/images/...
   */
  app.use(
    '/uploads/properties/images',
    express.static(join(process.cwd(), 'uploads', 'properties', 'images')),
  );

  // CORS (single source of truth)
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  });

  // Validation (before routes run)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booking Marketplace API')
    .setDescription('API for booking marketplace (customer/vendor/admin)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  console.log(`✅ API running: http://localhost:${port}/api`);
  console.log(`📚 Swagger:     http://localhost:${port}/docs`);
}

void bootstrap();
