import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RepairsService } from './repairs.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Mobile Repairing')
@Controller('repairs')
export class RepairsController {
  constructor(private readonly repairsService: RepairsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all repair jobs with optional status filter' })
  async getAllRepairs(@Query('status') status?: string) {
    return this.repairsService.getAllRepairs(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get repair job details' })
  async getRepairById(@Param('id') id: string) {
    return this.repairsService.getRepairById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new repair ticket' })
  async createRepair(@Body() body: any) {
    return this.repairsService.createRepair(body);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update repair status' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
    @CurrentUser('id') userId?: string,
  ) {
    return this.repairsService.updateStatus(id, body.status, body.notes, userId);
  }

  @Post(':id/parts')
  @ApiOperation({ summary: 'Deduct spare part from inventory and add to repair job' })
  async addPart(
    @Param('id') id: string,
    @Body() body: { productId: string; quantity: number; unitPrice: number },
    @CurrentUser('id') userId?: string,
  ) {
    return this.repairsService.addPartUsed(id, body.productId, body.quantity, body.unitPrice, userId);
  }
}

