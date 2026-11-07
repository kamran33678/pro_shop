import { Controller, Post, Get, Body, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-owner')
  @ApiOperation({ summary: 'Register the first shop owner (Initial Setup)' })
  @ApiResponse({ status: 201, description: 'Owner created successfully' })
  @ApiResponse({ status: 400, description: 'Owner already registered or validation error' })
  async registerOwner(
    @Body() dto: RegisterOwnerDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.registerOwner(dto);
    res.cookie('pro_shop_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in with email/username and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    res.cookie('pro_shop_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getCurrentUser(userId);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out and clear session cookie' })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('pro_shop_token');
    return { message: 'Logged out successfully' };
  }
}

