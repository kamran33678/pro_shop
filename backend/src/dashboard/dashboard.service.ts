import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------
  // 1. OVERALL DASHBOARD SUMMARY METRICS
  // -------------------------------------------------------------
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
        status: { in: ['RECEIVED', 'UNDER_INSPECTION', 'WAITING_FOR_PARTS', 'WAITING_FOR_APPROVAL', 'IN_PROGRESS', 'READY_FOR_DELIVERY'] },
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

  // -------------------------------------------------------------
  // A. TODAY'S SALES DETAIL
  // -------------------------------------------------------------
  async getTodaySalesDetails(dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, brand: true } },
            imeiRecord: { select: { id: true, imei: true } },
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalSales = 0;
    let cashSales = 0;
    let creditSales = 0;
    let totalDiscount = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    for (const s of sales) {
      const net = Number(s.netAmount);
      const paid = Number(s.paidAmount);
      const bal = Number(s.balanceAmount);

      totalSales += net;
      totalDiscount += Number(s.discountAmount);
      totalPaid += paid;
      totalBalance += bal;

      if (s.paymentMethod === 'CASH') {
        cashSales += paid;
      }
      if (bal > 0) {
        creditSales += bal;
      }
    }

    return {
      date: startOfDay.toISOString(),
      totalSales,
      totalTransactions: sales.length,
      cashSales,
      creditSales,
      totalPaid,
      totalBalance,
      totalDiscount,
      averageOrderValue: sales.length > 0 ? Math.round(totalSales / sales.length) : 0,
      sales,
    };
  }

  // -------------------------------------------------------------
  // B. TODAY'S GROSS PROFIT DETAIL
  // -------------------------------------------------------------
  async getTodayGrossProfitDetails(dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: 'COMPLETED',
      },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                category: { select: { name: true } },
              },
            },
            imeiRecord: { select: { imei: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let grossProfit = 0;

    const productMap = new Map<string, any>();
    const itemRecords: any[] = [];

    for (const s of sales) {
      for (const item of s.items) {
        const itemRev = Number(item.totalPrice);
        const itemC = Number(item.unitCost) * item.quantity;
        const itemGp = Number(item.grossProfit);

        totalRevenue += itemRev;
        totalCost += itemC;
        grossProfit += itemGp;

        // Group by product
        const pId = item.productId;
        if (!productMap.has(pId)) {
          productMap.set(pId, {
            productId: pId,
            name: item.product?.name || 'Unknown',
            sku: item.product?.sku || '',
            category: item.product?.category?.name || 'General',
            unitsSold: 0,
            revenue: 0,
            cost: 0,
            grossProfit: 0,
          });
        }
        const p = productMap.get(pId);
        p.unitsSold += item.quantity;
        p.revenue += itemRev;
        p.cost += itemC;
        p.grossProfit += itemGp;

        // Individual item log
        itemRecords.push({
          id: item.id,
          invoiceNumber: s.invoiceNumber,
          saleDate: s.createdAt,
          customerName: s.customer?.name || 'Walking Customer',
          productName: item.product?.name,
          sku: item.product?.sku,
          imei: item.imeiRecord?.imei || null,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          unitCost: Number(item.unitCost),
          totalPrice: itemRev,
          grossProfit: itemGp,
          marginPercent: itemRev > 0 ? Math.round((itemGp / itemRev) * 100) : 0,
        });
      }
    }

    const productBreakdown = Array.from(productMap.values()).map((p) => ({
      ...p,
      marginPercent: p.revenue > 0 ? Math.round((p.grossProfit / p.revenue) * 100) : 0,
    }));

    const grossMarginPercent =
      totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

    return {
      date: startOfDay.toISOString(),
      totalRevenue,
      totalCost,
      grossProfit,
      grossMarginPercent,
      productBreakdown,
      itemRecords,
    };
  }

  // -------------------------------------------------------------
  // C. TODAY'S NET PROFIT DETAIL
  // -------------------------------------------------------------
  async getTodayNetProfitDetails(dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // 1. Gross Profit from completed sales
    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: 'COMPLETED',
      },
      include: { items: true },
    });

    let totalRevenue = 0;
    let totalCogs = 0;
    let grossProfit = 0;

    for (const s of sales) {
      totalRevenue += Number(s.netAmount);
      for (const item of s.items) {
        totalCogs += Number(item.unitCost) * item.quantity;
        grossProfit += Number(item.grossProfit);
      }
    }

    // 2. Expenses today
    const expenses = await this.prisma.expense.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        category: true,
        paymentAccount: { select: { id: true, name: true, code: true } },
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const operatingExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = grossProfit - operatingExpenses;
    const netProfitMargin =
      totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // Group expenses by category
    const categoryMap = new Map<string, number>();
    for (const e of expenses) {
      const catName = e.category?.name || 'General Expense';
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(e.amount));
    }
    const expenseBreakdown = Array.from(categoryMap.entries()).map(([name, amount]) => ({
      name,
      amount,
    }));

    return {
      date: startOfDay.toISOString(),
      totalRevenue,
      totalCogs,
      grossProfit,
      operatingExpenses,
      netProfit,
      netProfitMargin,
      expenseBreakdown,
      expenses,
    };
  }

  // -------------------------------------------------------------
  // D. MONTHLY SALES DETAIL & TRENDS
  // -------------------------------------------------------------
  async getMonthlySalesDetails(month?: number, year?: number) {
    const now = new Date();
    const currentYear = year || now.getFullYear();
    const currentMonth = month !== undefined ? month : now.getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const prevMonthStart = new Date(currentYear, currentMonth - 1, 1);
    const prevMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Current month sales
    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        status: 'COMPLETED',
      },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Previous month total for comparison
    const prevSales = await this.prisma.sale.findMany({
      where: {
        createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
        status: 'COMPLETED',
      },
      select: { netAmount: true },
    });
    const previousMonthSales = prevSales.reduce((sum, s) => sum + Number(s.netAmount), 0);

    let monthlyTotal = 0;
    let cashSales = 0;
    let creditSales = 0;

    // Daily breakdown map
    const daysInMonth = endOfMonth.getDate();
    const dailyMap = new Map<number, { amount: number; count: number }>();
    for (let d = 1; d <= daysInMonth; d++) {
      dailyMap.set(d, { amount: 0, count: 0 });
    }

    for (const s of sales) {
      const net = Number(s.netAmount);
      const paid = Number(s.paidAmount);
      const bal = Number(s.balanceAmount);

      monthlyTotal += net;
      cashSales += paid;
      creditSales += bal;

      const day = new Date(s.createdAt).getDate();
      const curr = dailyMap.get(day) || { amount: 0, count: 0 };
      curr.amount += net;
      curr.count += 1;
      dailyMap.set(day, curr);
    }

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dailyTrend = Array.from(dailyMap.entries()).map(([day, val]) => ({
      day: `${day} ${monthNames[currentMonth].substring(0, 3)}`,
      dayNumber: day,
      amount: val.amount,
      count: val.count,
    }));

    const growthPercent =
      previousMonthSales > 0
        ? Math.round(((monthlyTotal - previousMonthSales) / previousMonthSales) * 100)
        : 100;

    return {
      monthName: `${monthNames[currentMonth]} ${currentYear}`,
      monthlyTotal,
      monthlyOrders: sales.length,
      cashSales,
      creditSales,
      previousMonthSales,
      growthPercent,
      dailyTrend,
      sales,
      summary: {
        year: currentYear,
        month: currentMonth + 1,
        monthName: `${monthNames[currentMonth]} ${currentYear}`,
        totalSales: monthlyTotal,
        totalOrders: sales.length,
        cashSales,
        creditSales,
        growthPercent,
      },
    };
  }

  // -------------------------------------------------------------
  // E. INVENTORY VALUATION DETAIL
  // -------------------------------------------------------------
  async getInventoryValuationDetails() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        imeiRecords: {
          select: { id: true, imei: true, status: true, purchaseCost: true, sellingPrice: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    let totalInventoryValue = 0;
    let totalRetailValue = 0;
    let totalStockQty = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const productValuations = products.map((p) => {
      const stock = p.currentStock;
      const cost = Number(p.purchaseCost);
      const price = Number(p.sellingPrice);

      const itemCostVal = stock * cost;
      const itemRetailVal = stock * price;
      const projectedProfit = itemRetailVal - itemCostVal;

      totalInventoryValue += itemCostVal;
      totalRetailValue += itemRetailVal;
      totalStockQty += stock;

      let status = 'IN_STOCK';
      if (stock === 0) {
        status = 'OUT_OF_STOCK';
        outOfStockCount++;
      } else if (stock <= p.minStockLevel) {
        status = 'LOW_STOCK';
        lowStockCount++;
      }

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        categoryName: p.category?.name || 'General',
        brand: p.brand || '—',
        model: p.model || '—',
        currentStock: stock,
        minStockLevel: p.minStockLevel,
        purchaseCost: cost,
        sellingPrice: price,
        totalCostValue: itemCostVal,
        totalRetailValue: itemRetailVal,
        projectedProfit,
        status,
        isTrackedByImei: p.isTrackedByImei,
        availableImeisCount: p.imeiRecords.filter((i) => i.status === 'AVAILABLE').length,
      };
    });

    // Recent stock movements
    const recentMovements = await this.prisma.stockMovement.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, sku: true } },
        user: { select: { name: true } },
      },
    });

    return {
      totalProducts: products.length,
      totalStockQty,
      totalInventoryValue,
      totalRetailValue,
      potentialProfit: totalRetailValue - totalInventoryValue,
      lowStockCount,
      outOfStockCount,
      products: productValuations,
      recentMovements,
      summary: {
        totalPurchaseValuation: totalInventoryValue,
        totalRetailValuation: totalRetailValue,
        projectedProfit: totalRetailValue - totalInventoryValue,
        totalStockUnits: totalStockQty,
        totalProducts: products.length,
        lowStockCount,
        outOfStockCount,
      },
    };
  }

  // -------------------------------------------------------------
  // F. CUSTOMER RECEIVABLES (UDHAAR) DETAIL
  // -------------------------------------------------------------
  async getCustomerReceivablesDetails() {
    const customers = await this.prisma.customer.findMany({
      orderBy: { currentBalance: 'desc' },
      include: {
        sales: {
          where: { balanceAmount: { gt: 0 } },
          select: {
            id: true,
            invoiceNumber: true,
            createdAt: true,
            netAmount: true,
            paidAmount: true,
            balanceAmount: true,
          },
        },
        salePayments: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            amount: true,
            paymentMethod: true,
            createdAt: true,
          },
        },
      },
    });

    let totalReceivables = 0;
    let customersWithBalanceCount = 0;

    const customerList = customers.map((c) => {
      const bal = Number(c.currentBalance);
      totalReceivables += bal;
      if (bal > 0) customersWithBalanceCount++;

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || '—',
        address: c.address || '—',
        openingBalance: Number(c.openingBalance),
        currentBalance: bal,
        totalPurchases: Number(c.totalPurchases),
        totalPayments: Number(c.totalPayments),
        unpaidInvoices: c.sales,
        recentPayments: c.salePayments,
      };
    });

    // All outstanding invoices across shop
    const outstandingInvoices = await this.prisma.sale.findMany({
      where: { balanceAmount: { gt: 0 } },
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalReceivables,
      totalCustomers: customers.length,
      customersWithBalanceCount,
      customers: customerList,
      outstandingInvoices,
      summary: {
        totalReceivables,
        debtorsCount: customersWithBalanceCount,
      },
    };
  }

  // -------------------------------------------------------------
  // G. SUPPLIER PAYABLES DETAIL
  // -------------------------------------------------------------
  async getSupplierPayablesDetails() {
    const suppliers = await this.prisma.supplier.findMany({
      orderBy: { currentBalance: 'desc' },
      include: {
        purchases: {
          where: { balanceAmount: { gt: 0 } },
          select: {
            id: true,
            invoiceNumber: true,
            createdAt: true,
            netAmount: true,
            paidAmount: true,
            balanceAmount: true,
            status: true,
          },
        },
      },
    });

    let totalPayables = 0;
    let suppliersWithBalanceCount = 0;

    const supplierList = suppliers.map((s) => {
      const bal = Number(s.currentBalance);
      totalPayables += bal;
      if (bal > 0) suppliersWithBalanceCount++;

      return {
        id: s.id,
        name: s.name,
        companyName: s.companyName || s.name,
        phone: s.phone,
        email: s.email || '—',
        address: s.address || '—',
        currentBalance: bal,
        unpaidPurchases: s.purchases,
      };
    });

    // Unpaid purchases
    const pendingPurchases = await this.prisma.purchase.findMany({
      where: { balanceAmount: { gt: 0 } },
      include: {
        supplier: { select: { name: true, companyName: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalPayables,
      totalSuppliers: suppliers.length,
      suppliersWithBalanceCount,
      suppliers: supplierList,
      pendingPurchases,
      summary: {
        totalPayables,
        creditorsCount: suppliersWithBalanceCount,
      },
    };
  }

  // -------------------------------------------------------------
  // H. ACTIVE REPAIR TICKETS DETAIL
  // -------------------------------------------------------------
  async getActiveRepairsDetails() {
    const activeStatuses: any[] = [
      'RECEIVED',
      'UNDER_INSPECTION',
      'WAITING_FOR_PARTS',
      'WAITING_FOR_APPROVAL',
      'IN_PROGRESS',
      'READY_FOR_DELIVERY',
    ];

    const repairJobs = await this.prisma.repairJob.findMany({
      where: {
        status: { in: activeStatuses },
      },
      include: {
        customer: true,
        assignedTechnician: { select: { id: true, name: true, phone: true } },
        partsUsed: {
          include: { product: { select: { name: true, sku: true } } },
        },
      },
      orderBy: { receivingDate: 'desc' },
    });

    const statusCounts: Record<string, number> = {
      RECEIVED: 0,
      UNDER_INSPECTION: 0,
      WAITING_FOR_PARTS: 0,
      WAITING_FOR_APPROVAL: 0,
      IN_PROGRESS: 0,
      READY_FOR_DELIVERY: 0,
    };

    let totalEstimated = 0;
    let totalFinal = 0;
    let totalPaid = 0;
    let totalBalance = 0;

    for (const job of repairJobs) {
      if (statusCounts[job.status] !== undefined) {
        statusCounts[job.status]++;
      }
      totalEstimated += Number(job.estimatedCost);
      totalFinal += Number(job.finalAmount);
      totalPaid += Number(job.paidAmount);
      totalBalance += Number(job.balanceAmount);
    }

    // Historical completed repairs count
    const completedCount = await this.prisma.repairJob.count({
      where: { status: 'DELIVERED' },
    });

    return {
      totalActive: repairJobs.length,
      completedCount,
      statusCounts,
      totalEstimated,
      totalFinal,
      totalPaid,
      totalBalance,
      tickets: repairJobs,
      summary: {
        totalActive: repairJobs.length,
        byStatus: statusCounts,
        totalEstimatedCharges: totalEstimated,
        totalFinalCharges: totalFinal,
        totalPaid,
        totalBalanceDue: totalBalance,
      },
    };
  }
}
