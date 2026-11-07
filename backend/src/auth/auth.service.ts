import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerOwner(dto: RegisterOwnerDto) {
    // 1. Check if owner already exists
    const existingOwner = await this.prisma.user.findFirst({
      where: { role: 'OWNER' },
    });

    if (existingOwner) {
      throw new BadRequestException('Shop owner account is already registered. Additional accounts must be created from settings.');
    }

    // 2. Check if email or username already in use
    const emailExists = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (emailExists) {
      throw new ConflictException('An account with this email address already exists.');
    }

    if (dto.username) {
      const usernameExists = await this.prisma.user.findUnique({
        where: { username: dto.username.toLowerCase().trim() },
      });
      if (usernameExists) {
        throw new ConflictException('An account with this username already exists.');
      }
    }

    // 3. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    // 4. Create owner user in database
    const owner = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email.toLowerCase().trim(),
        username: dto.username ? dto.username.toLowerCase().trim() : null,
        phone: dto.phone || null,
        passwordHash,
        role: 'OWNER',
        status: 'ACTIVE',
        permissions: ['*'],
      },
    });

    // 5. Update shop setting if shopName provided
    if (dto.shopName) {
      await this.prisma.shopSetting.upsert({
        where: { id: 'default' },
        update: { shopName: dto.shopName },
        create: {
          id: 'default',
          shopName: dto.shopName,
          currency: 'PKR',
          timezone: 'Asia/Karachi',
        },
      });
    }

    // 6. Generate JWT token
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
      },
    };
  }

  async login(dto: LoginDto) {
    const identifier = dto.identifier.toLowerCase().trim();

    // Find by email or username
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials. User not found.');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException(`Account is ${user.status.toLowerCase()}. Please contact administrator.`);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password.');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

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
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}

