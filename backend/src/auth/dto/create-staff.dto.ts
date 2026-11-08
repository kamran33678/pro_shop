import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffDto {
  @ApiProperty({ example: 'Zahid Khan' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'zahid@proshop.pk' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '0312 9876543', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Staff123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'STAFF', enum: ['STAFF', 'MANAGER', 'SALESPERSON', 'TECHNICIAN'] })
  @IsString()
  @IsNotEmpty()
  role: 'STAFF' | 'MANAGER' | 'SALESPERSON' | 'TECHNICIAN';

  @ApiProperty({ example: ['pos', 'repairs'], type: [String], required: false })
  @IsArray()
  @IsOptional()
  permissions?: string[];
}
