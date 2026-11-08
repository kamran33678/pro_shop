import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@proshop.pk' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
