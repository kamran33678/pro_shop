import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { Express } from 'express';
const cookieParser = require('cookie-parser');

let cachedServer: Express;

async function bootstrapServer(): Promise<Express> {
  if (!cachedServer) {
    const expressApp = express();

    // Friendly root endpoint for health & browser checks
    expressApp.get('/', (req, res) => {
      res.json({
        status: 'online',
        service: 'PRO SHOP Cloud API Server',
        database: 'Neon PostgreSQL',
        timestamp: new Date().toISOString(),
        endpoints: {
          health: '/api/health',
          docs: '/api/docs',
          categories: '/api/products/categories',
        },
      });
    });

    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    app.setGlobalPrefix('api');
    app.use(cookieParser());
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

    app.enableCors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

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
    cachedServer = expressApp;
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}
