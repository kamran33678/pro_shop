import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { RepairsModule } from './repairs/repairs.module';
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    ProductsModule,
    RepairsModule,
    CustomersModule,
    SalesModule,
    DashboardModule,
  ],
})
export class AppModule {}
