import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard & Detailed Analytics')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get live business performance metrics' })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('today-sales')
  @ApiOperation({ summary: 'Get detailed breakdown of today sales and transactions' })
  async getTodaySales(@Query('date') date?: string) {
    return this.dashboardService.getTodaySalesDetails(date);
  }

  @Get('gross-profit')
  @ApiOperation({ summary: 'Get detailed gross profit and product margins' })
  async getGrossProfit(@Query('date') date?: string) {
    return this.dashboardService.getTodayGrossProfitDetails(date);
  }

  @Get('net-profit')
  @ApiOperation({ summary: 'Get detailed net profit after operational expenses' })
  async getNetProfit(@Query('date') date?: string) {
    return this.dashboardService.getTodayNetProfitDetails(date);
  }

  @Get('monthly-sales')
  @ApiOperation({ summary: 'Get monthly sales analytics and daily trends' })
  async getMonthlySales(
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    const m = month !== undefined ? parseInt(month, 10) : undefined;
    const y = year !== undefined ? parseInt(year, 10) : undefined;
    return this.dashboardService.getMonthlySalesDetails(m, y);
  }

  @Get('inventory-valuation')
  @ApiOperation({ summary: 'Get total inventory valuation and stock levels' })
  async getInventoryValuation() {
    return this.dashboardService.getInventoryValuationDetails();
  }

  @Get('customer-receivables')
  @ApiOperation({ summary: 'Get customer receivables and credit sales (Udhaar)' })
  async getCustomerReceivables() {
    return this.dashboardService.getCustomerReceivablesDetails();
  }

  @Get('supplier-payables')
  @ApiOperation({ summary: 'Get supplier payables and pending invoices' })
  async getSupplierPayables() {
    return this.dashboardService.getSupplierPayablesDetails();
  }

  @Get('active-repairs')
  @ApiOperation({ summary: 'Get active repair tickets with status and device breakdown' })
  async getActiveRepairs() {
    return this.dashboardService.getActiveRepairsDetails();
  }
}
