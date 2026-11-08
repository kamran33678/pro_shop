import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Response } from 'express';

@ApiTags('Authentication & Access Control')
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
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return result;
  }

  @Post('register')
  @ApiOperation({ summary: 'Public registration for new users' })
  @ApiResponse({ status: 201, description: 'Account registered successfully' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    res.cookie('pro_shop_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
    const maxAge = dto.rememberMe
      ? 30 * 24 * 60 * 60 * 1000 // 30 days
      : 7 * 24 * 60 * 60 * 1000;  // 7 days

    res.cookie('pro_shop_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
    });
    return result;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset token for registered email' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using time-limited token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
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

  // -------------------------------------------------------------
  // ADMIN STAFF MANAGEMENT ENDPOINTS
  // -------------------------------------------------------------
  @Get('staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all staff members and employees (Admin only)' })
  async listStaff() {
    return this.authService.listStaff();
  }

  @Post('staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new staff account with custom permissions (Admin only)' })
  async createStaff(@Body() dto: CreateStaffDto) {
    return this.authService.createStaff(dto);
  }

  @Patch('staff/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update staff account status or permissions (Admin only)' })
  async updateStaff(@Param('id') id: string, @Body() dto: UpdateStaffDto) {
    return this.authService.updateStaff(id, dto);
  }

  @Delete('staff/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('OWNER', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete staff account (Admin only)' })
  async deleteStaff(@Param('id') id: string) {
    return this.authService.deleteStaff(id);
  }
}
