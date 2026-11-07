import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Sales & POS')
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'List recent sales invoices' })
  async getAllSales() {
    return this.salesService.getAllSales();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice details by ID' })
  async getSaleById(@Param('id') id: string) {
    return this.salesService.getSaleById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Complete POS sale transaction and generate invoice' })
  async createSale(@Body() body: any, @CurrentUser('id') userId?: string) {
    return this.salesService.createSale(body, userId);
  }
}

