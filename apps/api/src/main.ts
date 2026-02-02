import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Security + cookies
  app.use(cookieParser());
  app.use(helmet());

  // Static uploads (local dev + staging)
  // Stored by multer at: <apps/api>/uploads/properties/...
  // Served at:          http://host/uploads/properties/...
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // CORS (single source of truth)
  // Example: CORS_ORIGIN="http://localhost:3000,https://rentpropertyuae.vercel.app"
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

  // Listen ONCE
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);

  console.log(`✅ API running: http://localhost:${port}/api`);
  console.log(`📚 Swagger:     http://localhost:${port}/docs`);
}

void bootstrap();
