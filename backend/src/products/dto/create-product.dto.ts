import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Samsung Galaxy A15' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'SAM-A15-128', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: '8806091234567', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'category-id-here' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ example: 'Samsung', required: false })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ example: 'Galaxy A15', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ example: '6GB RAM, 128GB Storage, Dual SIM', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 42000 })
  @IsNumber()
  @Min(0)
  purchaseCost: number;

  @ApiProperty({ example: 46500 })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({ example: 5, required: false })
  @IsNumber()
  @IsOptional()
  currentStock?: number;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @IsOptional()
  minStockLevel?: number;

  @ApiProperty({ example: true, description: 'True for mobile phones/watches tracked by IMEI' })
  @IsBoolean()
  @IsOptional()
  isTrackedByImei?: boolean;

  @ApiProperty({ example: ['356987123456789'], required: false, description: 'List of IMEIs for opening stock' })
  @IsOptional()
  imeis?: string[];

  @ApiProperty({ example: '1 Year Official Warranty', required: false })
  @IsString()
  @IsOptional()
  warrantyDetails?: string;
}

