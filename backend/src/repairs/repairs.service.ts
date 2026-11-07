import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RepairsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllRepairs(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return this.prisma.repairJob.findMany({
      where,
      include: {
        customer: true,
        assignedTechnician: {
          select: { id: true, name: true, role: true },
        },
        partsUsed: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRepairById(id: string) {
    const job = await this.prisma.repairJob.findUnique({
      where: { id },
      include: {
        customer: true,
        assignedTechnician: true,
        partsUsed: { include: { product: true } },
        statusHistory: true,
      },
    });
    if (!job) throw new NotFoundException('Repair job not found');
    return job;
  }

  async createRepair(data: {
    customerName: string;
    customerPhone: string;
    deviceBrand: string;
    deviceModel: string;
    imeiOrSerial?: string;
    reportedProblem: string;
    deviceCondition?: string;
    accessoriesReceived?: string;
    estimatedCost?: number;
    labourCharge?: number;
    assignedTechnicianId?: string;
  }) {
    // 1. Find or create customer
    let customer = await this.prisma.customer.findUnique({
      where: { phone: data.customerPhone.trim() },
    });

    if (!customer) {
      customer = await this.prisma.customer.create({
        data: {
          name: data.customerName.trim(),
          phone: data.customerPhone.trim(),
        },
      });
    }

    // 2. Generate unique ticket number
    const count = await this.prisma.repairJob.count();
    const ticketNumber = `REP-${1000 + count + 1}`;

    const labourCharge = data.labourCharge || 0;
    const finalAmount = labourCharge;

    const job = await this.prisma.repairJob.create({
      data: {
        ticketNumber,
        customerId: customer.id,
        deviceBrand: data.deviceBrand,
        deviceModel: data.deviceModel,
        imeiOrSerial: data.imeiOrSerial || null,
        reportedProblem: data.reportedProblem,
        deviceCondition: data.deviceCondition || null,
        accessoriesReceived: data.accessoriesReceived || null,
        estimatedCost: data.estimatedCost || 0,
        labourCharge,
        finalAmount,
        balanceAmount: finalAmount,
        status: 'RECEIVED',
        assignedTechnicianId: data.assignedTechnicianId || null,
      },
      include: {
        customer: true,
        assignedTechnician: true,
      },
    });

    await this.prisma.repairStatusHistory.create({
      data: {
        repairJobId: job.id,
        status: 'RECEIVED',
        notes: 'Device received from customer',
      },
    });

    return job;
  }

  async updateStatus(id: string, status: string, notes?: string, userId?: string) {
    const job = await this.prisma.repairJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Repair job not found');

    const updated = await this.prisma.repairJob.update({
      where: { id },
      data: {
        status,
        deliveryDate: status === 'DELIVERED' ? new Date() : job.deliveryDate,
      },
    });

    await this.prisma.repairStatusHistory.create({
      data: {
        repairJobId: id,
        status,
        notes: notes || `Status changed to ${status}`,
        updatedById: userId || null,
      },
    });

    return updated;
  }

  async addPartUsed(repairJobId: string, productId: string, quantity: number = 1, unitPrice: number, userId?: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product/Part not found');

    if (product.currentStock < quantity) {
      throw new BadRequestException(`Insufficient stock. Only ${product.currentStock} units available.`);
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Decrement inventory
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: { decrement: quantity } },
      });

      // 2. Log stock movement
      const systemUser = userId || (await tx.user.findFirst({ select: { id: true } }))?.id;
      if (systemUser) {
        await tx.stockMovement.create({
          data: {
            productId,
            type: 'REPAIR_PART_USAGE',
            quantity: -quantity,
            costPerUnit: product.purchaseCost,
            referenceType: 'REPAIR',
            referenceId: repairJobId,
            reason: `Used in repair job ${repairJobId}`,
            userId: systemUser,
          },
        });
      }

      // 3. Add to repair parts
      const partCost = Number(product.purchaseCost) * quantity;
      const partTotal = unitPrice * quantity;

      const repairPart = await tx.repairPart.create({
        data: {
          repairJobId,
          productId,
          quantity,
          unitCost: product.purchaseCost,
          unitPrice,
          totalCost: partCost,
          totalPrice: partTotal,
        },
      });

      // 4. Update repair totals
      const job = await tx.repairJob.findUnique({ where: { id: repairJobId } });
      if (job) {
        const newPartsCost = Number(job.partsCost) + partCost;
        const newFinal = Number(job.labourCharge) + Number(job.partsCost) + partTotal;
        const newBalance = newFinal - Number(job.paidAmount);

        await tx.repairJob.update({
          where: { id: repairJobId },
          data: {
            partsCost: newPartsCost,
            finalAmount: newFinal,
            balanceAmount: newBalance,
          },
        });
      }

      return repairPart;
    });
  }
}

