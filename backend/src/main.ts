import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Express } from 'express';
const cookieParser = require('cookie-parser');

export async function createApp(expressInstance?: Express) {
  const app = expressInstance
    ? await NestFactory.create(AppModule, new ExpressAdapter(expressInstance))
    : await NestFactory.create(AppModule);

  // Global prefix for all API endpoints
  app.setGlobalPrefix('api');

  // Middleware
  const cookieMiddleware = typeof cookieParser === 'function' ? cookieParser : (cookieParser as any).default;
  if (cookieMiddleware) {
    app.use(cookieMiddleware());
  }

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration - allow all origins (local, mobile, tunnels, vercel)
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('PRO SHOP API')
    .setDescription('Complete Mobile Shop Management System REST API Documentation')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'PRO SHOP API Documentation',
  });

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 PRO SHOP Backend is running on: http://localhost:${port}/api`);
  console.log(`📚 Swagger Documentation is available on: http://localhost:${port}/api/docs`);
}

// Only listen directly when not running in serverless environment
if (!process.env.VERCEL && !process.env.SERVERLESS) {
  bootstrap();
}
