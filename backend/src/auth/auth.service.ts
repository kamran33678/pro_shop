import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // -------------------------------------------------------------
  // INITIAL OWNER SETUP
  // -------------------------------------------------------------
  async registerOwner(dto: RegisterOwnerDto) {
    const existingOwner = await this.prisma.user.findFirst({
      where: { OR: [{ role: 'OWNER' }, { role: 'ADMIN' }] },
    });

    if (existingOwner) {
      throw new BadRequestException(
        'Shop owner account is already registered. Additional accounts must be created by Admin from Employees settings.',
      );
    }

    const email = dto.email.toLowerCase().trim();
    const emailExists = await this.prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const owner = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        username: dto.username ? dto.username.toLowerCase().trim() : null,
        phone: dto.phone?.trim() || null,
        passwordHash,
        role: 'OWNER',
        status: 'ACTIVE',
        permissions: ['*'],
      },
    });

    if (dto.shopName) {
      await this.prisma.shopSetting.upsert({
        where: { id: 'default' },
        update: { shopName: dto.shopName.trim() },
        create: {
          id: 'default',
          shopName: dto.shopName.trim(),
          currency: 'PKR',
          timezone: 'Asia/Karachi',
        },
      });
    }

    const token = this.jwtService.sign({
      sub: owner.id,
      email: owner.email,
      role: owner.role,
    });

    return {
      message: 'Owner account successfully created',
      accessToken: token,
      user: {
        id: owner.id,
        name: owner.name,
        email: owner.email,
        username: owner.username,
        role: owner.role,
        permissions: owner.permissions,
      },
    };
  }

  // -------------------------------------------------------------
  // GENERAL USER REGISTRATION (SIGN UP)
  // -------------------------------------------------------------
  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();

    // Check duplicate email
    const emailExists = await this.prisma.user.findUnique({ where: { email } });
    if (emailExists) {
      throw new ConflictException('An account with this email address already exists.');
    }

    // Check if an Owner/Admin already exists in system
    const ownerExists = await this.prisma.user.findFirst({
      where: { OR: [{ role: 'OWNER' }, { role: 'ADMIN' }] },
    });

    // If no admin exists, this first user becomes OWNER with full permissions
    // If admin already exists, public signup becomes STAFF with restricted default permissions
    const isFirstAdmin = !ownerExists;
    const role: any = isFirstAdmin ? 'OWNER' : 'STAFF';
    const permissions = isFirstAdmin ? ['*'] : ['pos', 'repairs', 'inventory'];

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim() || null,
        passwordHash,
        role,
        status: 'ACTIVE',
        permissions,
      },
    });

    if (isFirstAdmin && dto.shopName) {
      await this.prisma.shopSetting.upsert({
        where: { id: 'default' },
        update: { shopName: dto.shopName.trim() },
        create: {
          id: 'default',
          shopName: dto.shopName.trim(),
          currency: 'PKR',
          timezone: 'Asia/Karachi',
        },
      });
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: isFirstAdmin ? 'Shop Administrator account created.' : 'Staff account created successfully.',
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  // -------------------------------------------------------------
  // LOGIN (AUTHENTICATION)
  // -------------------------------------------------------------
  async login(dto: LoginDto) {
    const identifier = (dto.identifier || dto.email || '').toLowerCase().trim();

    if (!identifier) {
      throw new BadRequestException('Email address or username is required.');
    }

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials. User not found.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(
        `Account is ${user.status.toLowerCase()}. Please contact your shop administrator.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password.');
    }

    // Set token expiration (longer if rememberMe is true)
    const expiresIn = dto.rememberMe ? '30d' : '7d';
    const token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      { expiresIn },
    );

    return {
      message: 'Login successful',
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
      },
    };
  }

  // -------------------------------------------------------------
  // CURRENT USER PROFILE
  // -------------------------------------------------------------
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        status: true,
        permissions: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User session invalid or user not found.');
    }

    return user;
  }

  // -------------------------------------------------------------
  // FORGOT PASSWORD
  // -------------------------------------------------------------
  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Do not reveal email existence if security policy, but provide clean message
      return {
        success: true,
        message: 'If an account exists with this email address, a password reset procedure has been initiated.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    return {
      success: true,
      message: 'Password reset request generated successfully.',
      resetToken, // Returned so frontend can navigate directly or show reset option
      expiresAt: resetTokenExpiry.toISOString(),
    };
  }

  // -------------------------------------------------------------
  // RESET PASSWORD
  // -------------------------------------------------------------
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: dto.token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Password reset link is invalid or has expired.');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      success: true,
      message: 'Your password has been reset successfully. You can now log in with your new password.',
    };
  }

  // -------------------------------------------------------------
  // ADMIN STAFF MANAGEMENT
  // -------------------------------------------------------------
  async listStaff() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        status: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createStaff(dto: CreateStaffDto) {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('A staff account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const permissions = dto.permissions && dto.permissions.length > 0
      ? dto.permissions
      : ['pos', 'repairs', 'inventory'];

    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        phone: dto.phone?.trim() || null,
        passwordHash,
        role: dto.role as any,
        status: 'ACTIVE',
        permissions,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        permissions: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateStaff(id: string, dto: UpdateStaffDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Staff account not found.');

    const updateData: any = {};
    if (dto.name) updateData.name = dto.name.trim();
    if (dto.phone !== undefined) updateData.phone = dto.phone?.trim() || null;
    if (dto.status) updateData.status = dto.status;
    if (dto.role) updateData.role = dto.role;
    if (dto.permissions) updateData.permissions = dto.permissions;
    if (dto.password) {
      updateData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        permissions: true,
        createdAt: true,
      },
    });
  }

  async deleteStaff(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Staff account not found.');

    if (user.role === 'OWNER' || user.role === 'ADMIN') {
      throw new ForbiddenException('Cannot delete the primary Shop Administrator / Owner account.');
    }

    await this.prisma.user.delete({ where: { id } });
    return { success: true, message: `Staff account ${user.name} removed successfully.` };
  }
}
