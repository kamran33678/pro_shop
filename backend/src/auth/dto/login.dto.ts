import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'owner@proshop.pk', required: false })
  @IsString()
  @IsOptional()
  identifier?: string;

  @ApiProperty({ example: 'owner@proshop.pk', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
