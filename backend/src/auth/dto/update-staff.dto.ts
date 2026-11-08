import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateStaffDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ required: false, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @IsString()
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

  @ApiProperty({ required: false, enum: ['STAFF', 'MANAGER', 'SALESPERSON', 'TECHNICIAN'] })
  @IsString()
  @IsOptional()
  role?: 'STAFF' | 'MANAGER' | 'SALESPERSON' | 'TECHNICIAN';

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @IsOptional()
  permissions?: string[];

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  password?: string;
}
