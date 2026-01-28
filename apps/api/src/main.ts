import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({
    origin: corsOrigin.split(',').map((s) => s.trim()),
    credentials: true,
  });

  app.setGlobalPrefix('api');

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidUnknownValues: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);


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
  // eslint-disable-next-line no-console
  console.log(`✅ API running: http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`📚 Swagger:     http://localhost:${port}/docs`);
}

void bootstrap();
