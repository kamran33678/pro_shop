import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCustomers(search?: string) {
    const where: any = {};
    if (search) {
      const s = search.trim();
      where.OR = [
        { name: { contains: s } },
        { phone: { contains: s } },
        { email: { contains: s } },
      ];
    }
    return this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { sales: true, repairJobs: true },
        },
      },
    });
  }

  async getCustomerById(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        sales: { take: 10, orderBy: { createdAt: 'desc' } },
        repairJobs: { take: 10, orderBy: { createdAt: 'desc' } },
        salePayments: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async createCustomer(data: { name: string; phone: string; email?: string; address?: string }) {
    const existing = await this.prisma.customer.findUnique({
      where: { phone: data.phone.trim() },
    });
    if (existing) {
      throw new ConflictException(`Customer with phone number "${data.phone}" already exists.`);
    }
    return this.prisma.customer.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
      },
    });
  }
}

