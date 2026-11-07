import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CustomersService } from './customers.service';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'List all customers with search' })
  async getAllCustomers(@Query('search') search?: string) {
    return this.customersService.getAllCustomers(search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer ledger and details' })
  async getCustomerById(@Param('id') id: string) {
    return this.customersService.getCustomerById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new customer' })
  async createCustomer(@Body() body: { name: string; phone: string; email?: string; address?: string }) {
    return this.customersService.createCustomer(body);
  }
}

