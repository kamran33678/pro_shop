import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOwnerDto {
  @ApiProperty({ example: 'Muhammad Usman' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'owner@proshop.pk' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'usman_owner', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: '+92 300 1234567', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'PRO SHOP Mobile & Electronics', required: false })
  @IsString()
  @IsOptional()
  shopName?: string;
}

