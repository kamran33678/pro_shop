import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    // 1. Today's Sales & Gross Profit
    const todaySales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: startOfToday },
        status: 'COMPLETED',
      },
      include: { items: true },
    });

    let todaySalesTotal = 0;
    let todayGrossProfitTotal = 0;

    for (const sale of todaySales) {
      todaySalesTotal += Number(sale.netAmount);
      for (const item of sale.items) {
        todayGrossProfitTotal += Number(item.grossProfit);
      }
    }

    // 2. Today's Expenses
    const todayExpenses = await this.prisma.expense.findMany({
      where: { createdAt: { gte: startOfToday } },
    });
    const todayExpensesTotal = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const todayNetProfitTotal = todayGrossProfitTotal - todayExpensesTotal;

    // 3. Monthly Sales
    const monthSales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'COMPLETED',
      },
      select: { netAmount: true },
    });
    const monthlySalesTotal = monthSales.reduce((sum, s) => sum + Number(s.netAmount), 0);

    // 4. Monthly Expenses
    const monthExpenses = await this.prisma.expense.findMany({
      where: { createdAt: { gte: startOfMonth } },
      select: { amount: true },
    });
    const monthlyExpensesTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    // 5. Total Products & Inventory Valuation
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { currentStock: true, purchaseCost: true },
    });

    const totalProducts = products.length;
    let totalInventoryQty = 0;
    let inventoryValue = 0;

    for (const p of products) {
      totalInventoryQty += p.currentStock;
      inventoryValue += p.currentStock * Number(p.purchaseCost);
    }

    // 6. Receivables & Payables
    const customers = await this.prisma.customer.findMany({
      select: { currentBalance: true },
    });
    const customerReceivables = customers.reduce((sum, c) => sum + Number(c.currentBalance), 0);

    const suppliers = await this.prisma.supplier.findMany({
      select: { currentBalance: true },
    });
    const supplierPayables = suppliers.reduce((sum, s) => sum + Number(s.currentBalance), 0);

    // 7. Repair Jobs
    const totalRepairs = await this.prisma.repairJob.count();
    const pendingRepairs = await this.prisma.repairJob.count({
      where: {
        status: { in: ['RECEIVED', 'UNDER_INSPECTION', 'WAITING_FOR_PARTS', 'WAITING_FOR_APPROVAL', 'IN_PROGRESS'] },
      },
    });

    return {
      todaySales: todaySalesTotal,
      todayGrossProfit: todayGrossProfitTotal,
      todayNetProfit: todayNetProfitTotal,
      totalProducts,
      totalInventoryQty,
      inventoryValue,
      customerReceivables,
      supplierPayables,
      monthlySales: monthlySalesTotal,
      monthlyExpenses: monthlyExpensesTotal,
      totalRepairs,
      pendingRepairs,
    };
  }
}

