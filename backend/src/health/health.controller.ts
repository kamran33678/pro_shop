import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('System Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API and Database Health Status' })
  async getHealth() {
    let dbStatus = 'disconnected';
    let isOwnerSetup = false;

    try {
      // Check database connection and whether owner account exists
      const userCount = await this.prisma.user.count({
        where: { role: 'OWNER' },
      });
      dbStatus = 'connected';
      isOwnerSetup = userCount > 0;
    } catch (err: any) {
      dbStatus = `error: ${err.message || 'unable to connect'}`;
    }

    return {
      status: 'ok',
      service: 'PRO SHOP API Server',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      isOwnerSetup,
      version: '1.0.0',
    };
  }
}
