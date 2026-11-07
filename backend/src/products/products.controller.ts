import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Products & Inventory')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List all product categories' })
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category' })
  async createCategory(@Body() body: { name: string; description?: string }) {
    return this.productsService.createCategory(body.name, body.description);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active products with filters' })
  async getAllProducts(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.productsService.getAllProducts({ search, categoryId });
  }

  @Post()
  @ApiOperation({ summary: 'Add a new product with optional barcode, IMEI tracking, and opening stock' })
  async createProduct(@Body() dto: CreateProductDto, @CurrentUser('id') userId?: string) {
    return this.productsService.createProduct(dto, userId);
  }

  @Get('lookup/barcode/:barcode')
  @ApiOperation({ summary: 'Lookup product by barcode value' })
  async lookupBarcode(@Param('barcode') barcode: string) {
    return this.productsService.lookupBarcode(barcode);
  }

  @Get('lookup/imei/:imei')
  @ApiOperation({ summary: 'Lookup device by IMEI' })
  async lookupImei(@Param('imei') imei: string) {
    return this.productsService.lookupImei(imei);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product details by ID' })
  async getProductById(@Param('id') id: string) {
    return this.productsService.getProductById(id);
  }
}

