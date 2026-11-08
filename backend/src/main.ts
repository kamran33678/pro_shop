import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';
const cookieParser = require('cookie-parser');

let cachedApp: Express;

async function bootstrapServer(): Promise<Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );

  // Global prefix for all API endpoints
  app.setGlobalPrefix('api');

  // Middleware
  app.use(cookieParser());

  // Global validation pipe
  app.use(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = frontendUrl.split(',').map((u) => u.trim());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        origin.includes('loca.lt')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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

  await app.init();
  cachedApp = expressApp;
  return cachedApp;
}

// When running locally in standalone node environment (not in Vercel lambda)
if (!process.env.VERCEL) {
  bootstrapServer().then((server) => {
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`🚀 PRO SHOP Backend is running on: http://localhost:${port}/api`);
      console.log(`📚 Swagger Documentation is available on: http://localhost:${port}/api/docs`);
    });
  });
}

// Serverless handler for Vercel
export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}
