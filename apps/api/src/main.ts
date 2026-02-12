import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import express from 'express';
import { PROPERTY_IMAGES_DIR } from './common/upload/storage-paths';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API prefix
  app.setGlobalPrefix('api');

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Cookies + security headers
  app.use(cookieParser());
  app.use(helmet());

  /**
   * Public static assets
   * - ONLY property images are public
   * - Ownership / verification docs must NEVER be public
   */
  app.use(
    '/uploads/properties/images',
    express.static(PROPERTY_IMAGES_DIR),
  );

  /**
   * ============================
   * ✅ CORS (PRODUCTION SAFE)
   * ============================
   *
   * Supports:
   * - Vercel frontend
   * - Local development
   * - Multiple origins (comma-separated)
   *
   * IMPORTANT:
   * - No trailing slashes
   * - Exact match with browser Origin
   */
  const corsOriginsRaw =
    process.env.CORS_ORIGINS ??
    process.env.CORS_ORIGIN ??
    'http://localhost:3000';

  const corsOrigins = corsOriginsRaw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
    // Normalize: remove trailing slash to match browser Origin exactly
    .map((o) => (o.endsWith('/') ? o.slice(0, -1) : o));

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  /**
   * Validation
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  /**
   * Swagger
   */
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Booking Marketplace API')
    .setDescription('API for booking marketplace (customer / vendor / admin)')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT ?? 10000);

  console.log(`Starting API listener on 0.0.0.0:${port}...`);
  await app.listen(port, '0.0.0.0');

  console.log(`✅ API running on port ${port}`);
  console.log(`📚 Swagger docs: /docs`);
}

void bootstrap();
