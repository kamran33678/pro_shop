import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSales() {
    return this.prisma.sale.findMany({
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: {
          include: {
            product: true,
            imeiRecord: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getSaleById(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true, phone: true } },
        items: {
          include: {
            product: true,
            imeiRecord: true,
          },
        },
        payments: true,
      },
    });
    if (!sale) throw new NotFoundException('Sale invoice not found');
    return sale;
  }

  async createSale(
    data: {
      customerId?: string;
      items: {
        productId: string;
        imeiRecordId?: string;
        quantity: number;
        unitPrice: number;
        totalDiscount?: number;
      }[];
      discountAmount?: number;
      paidAmount: number;
      paymentMethod: string;
      notes?: string;
    },
    userId?: string,
  ) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Shopping cart cannot be empty.');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Calculate totals and verify items
      let subtotal = 0;
      let totalCost = 0;

      const preparedItems: any[] = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });
        if (!product) {
          throw new NotFoundException(`Product ${item.productId} not found.`);
        }

        let unitCost = Number(product.purchaseCost);

        // If IMEI tracked
        if (product.isTrackedByImei && item.imeiRecordId) {
          const imeiRecord = await tx.imeiRecord.findUnique({
            where: { id: item.imeiRecordId },
          });
          if (!imeiRecord || imeiRecord.status !== 'AVAILABLE') {
            throw new BadRequestException(`Device IMEI ${imeiRecord?.imei || ''} is no longer available.`);
          }
          unitCost = Number(imeiRecord.purchaseCost);
        } else if (product.currentStock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for "${product.name}". Available: ${product.currentStock}`);
        }

        const itemSubtotal = item.unitPrice * item.quantity;
        const discount = item.totalDiscount || 0;
        const totalPrice = itemSubtotal - discount;
        const grossProfit = totalPrice - (unitCost * item.quantity);

        subtotal += itemSubtotal;
        totalCost += unitCost * item.quantity;

        preparedItems.push({
          productId: item.productId,
          imeiRecordId: item.imeiRecordId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unitCost,
          totalDiscount: discount,
          totalPrice,
          grossProfit,
        });
      }

      const totalDiscount = data.discountAmount || 0;
      const netAmount = subtotal - totalDiscount;
      const paidAmount = data.paidAmount || 0;
      const balanceAmount = Math.max(0, netAmount - paidAmount);
      const changeAmount = Math.max(0, paidAmount - netAmount);

      // 2. Generate unique invoice number
      const invoiceCount = await tx.sale.count();
      const invoiceNumber = `INV-${1000 + invoiceCount + 1}`;

      const activeUserId = userId || (await tx.user.findFirst({ select: { id: true } }))?.id;

      // 3. Create Sale record
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId: data.customerId || null,
          subtotal,
          discountAmount: totalDiscount,
          netAmount,
          paidAmount,
          changeAmount,
          balanceAmount,
          paymentMethod: data.paymentMethod as any,
          status: 'COMPLETED',
          notes: data.notes || null,
          userId: activeUserId!,
        },
      });

      // 4. Create Sale Items and deduct stock
      for (const pItem of preparedItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: pItem.productId,
            imeiRecordId: pItem.imeiRecordId,
            quantity: pItem.quantity,
            unitPrice: pItem.unitPrice,
            unitCost: pItem.unitCost,
            totalDiscount: pItem.totalDiscount,
            totalPrice: pItem.totalPrice,
            grossProfit: pItem.grossProfit,
          },
        });

        // Deduct inventory
        await tx.product.update({
          where: { id: pItem.productId },
          data: { currentStock: { decrement: pItem.quantity } },
        });

        // Update IMEI record status if tracked
        if (pItem.imeiRecordId) {
          await tx.imeiRecord.update({
            where: { id: pItem.imeiRecordId },
            data: {
              status: 'SOLD',
              saleDate: new Date(),
              sellingPrice: pItem.unitPrice,
            },
          });
        }

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            productId: pItem.productId,
            type: 'SALE',
            quantity: -pItem.quantity,
            costPerUnit: pItem.unitCost,
            referenceType: 'SALE',
            referenceId: sale.id,
            reason: `Sold on invoice ${invoiceNumber}`,
            userId: activeUserId!,
          },
        });
      }

      // 5. Record payment
      if (paidAmount > 0) {
        await tx.salePayment.create({
          data: {
            saleId: sale.id,
            customerId: data.customerId || null,
            amount: paidAmount,
            paymentMethod: data.paymentMethod as any,
          },
        });
      }

      // 6. Update Customer balance if credit sale
      if (data.customerId) {
        await tx.customer.update({
          where: { id: data.customerId },
          data: {
            totalPurchases: { increment: netAmount },
            totalPayments: { increment: paidAmount },
            currentBalance: { increment: balanceAmount },
          },
        });
      }

      return this.prisma.sale.findUnique({
        where: { id: sale.id },
        include: {
          customer: true,
          items: { include: { product: true, imeiRecord: true } },
          payments: true,
        },
      });
    });
  }
}

