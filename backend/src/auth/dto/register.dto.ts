import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Muhammad Ali' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'ali@proshop.pk' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '0300 1234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Al-Madina Mobile', required: false })
  @IsString()
  @IsOptional()
  shopName?: string;
}

