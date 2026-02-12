import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import express from 'express';
import { PROPERTY_IMAGES_DIR } from './common/upload/storage-paths';

type CorsOriginCallback = (error: Error | null, allow?: boolean) => void;

function normalizeOrigin(value: string): string {
  const trimmed = value.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
}

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

  const staticAllowedOrigins = new Set<string>([
    'https://rentpropertyuae.vercel.app',
    'http://localhost:3000',
  ]);

  const extraCorsOriginsRaw = process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN;
  if (extraCorsOriginsRaw) {
    for (const raw of extraCorsOriginsRaw.split(',')) {
      const normalized = normalizeOrigin(raw);
      if (normalized) {
        staticAllowedOrigins.add(normalized);
      }
    }
  }

  const vercelPreviewPattern =
    /^https:\/\/rentpropertyuae-[a-z0-9-]+\.vercel\.app$/;

  app.enableCors({
    origin: (origin: string | undefined, callback: CorsOriginCallback) => {
      // Allow non-browser calls (curl, server-to-server) with no Origin header.
      if (!origin) {
        // eslint-disable-next-line no-console
        console.log('[cors] origin=<none> allowed=true');
        callback(null, true);
        return;
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const allowed =
        staticAllowedOrigins.has(normalizedOrigin) ||
        vercelPreviewPattern.test(normalizedOrigin);

      // Temporary proof log for CORS verification.
      // eslint-disable-next-line no-console
      console.log(`[cors] origin=${normalizedOrigin} allowed=${allowed}`);

      if (allowed) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${normalizedOrigin}`));
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept, X-Requested-With',
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
