import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Successfully connected to PostgreSQL database');
    } catch (err: any) {
      this.logger.warn('⚠️ Could not connect to PostgreSQL database server yet.');
      this.logger.warn('👉 To connect: set your Neon or PostgreSQL URL in backend/.env (DATABASE_URL)');
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {
      // Ignore disconnect error if wasn't connected
    }
  }
}
