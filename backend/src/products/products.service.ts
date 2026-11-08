import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(name: string, description?: string) {
    const existing = await this.prisma.category.findUnique({
      where: { name },
    });
    if (existing) {
      throw new ConflictException('Category with this name already exists.');
    }
    return this.prisma.category.create({
      data: { name, description },
    });
  }

  async getAllProducts(query?: { search?: string; categoryId?: string }) {
    const where: any = { isActive: true };

    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query?.search) {
      const s = query.search.trim();
      where.OR = [
        { name: { contains: s } },
        { sku: { contains: s } },
        { barcode: { contains: s } },
        { brand: { contains: s } },
        { model: { contains: s } },
        { imeiRecords: { some: { imei: { contains: s } } } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        imeiRecords: {
          where: { status: 'AVAILABLE' },
          select: { id: true, imei: true, status: true, purchaseCost: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        imeiRecords: true,
        variants: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(dto: CreateProductDto, userId?: string) {
    // Generate SKU if not provided
    const sku = dto.sku ? dto.sku.trim().toUpperCase() : `SKU-${Date.now().toString().slice(-6)}`;

    // Verify barcode uniqueness if provided
    if (dto.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: dto.barcode.trim() },
      });
      if (existingBarcode) {
        throw new ConflictException(`Barcode "${dto.barcode}" is already registered for product "${existingBarcode.name}".`);
      }
    }

    // Verify IMEI uniqueness if IMEI tracked
    if (dto.isTrackedByImei && dto.imeis && dto.imeis.length > 0) {
      const existingImeis = await this.prisma.imeiRecord.findMany({
        where: { imei: { in: dto.imeis } },
        select: { imei: true },
      });
      if (existingImeis.length > 0) {
        throw new BadRequestException(`IMEI ${existingImeis.map((i) => i.imei).join(', ')} is already registered in the system.`);
      }
    }

    const currentStock = dto.isTrackedByImei && dto.imeis ? dto.imeis.length : (dto.currentStock || 0);

    // Save product in database transaction
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: dto.name.trim(),
          sku,
          barcode: dto.barcode ? dto.barcode.trim() : null,
          categoryId: dto.categoryId,
          brand: dto.brand?.trim() || null,
          model: dto.model?.trim() || null,
          description: dto.description || null,
          purchaseCost: dto.purchaseCost,
          sellingPrice: dto.sellingPrice,
          currentStock,
          minStockLevel: dto.minStockLevel || 5,
          isTrackedByImei: !!dto.isTrackedByImei,
          warrantyDetails: dto.warrantyDetails || null,
        },
      });

      // Register individual IMEIs if tracked
      if (dto.isTrackedByImei && dto.imeis && dto.imeis.length > 0) {
        await tx.imeiRecord.createMany({
          data: dto.imeis.map((imei) => ({
            imei: imei.trim(),
            productId: product.id,
            status: 'AVAILABLE',
            purchaseCost: dto.purchaseCost,
            sellingPrice: dto.sellingPrice,
          })),
        });
      }

      // Record opening stock movement if stock > 0
      if (currentStock > 0) {
        // Find system user or fallback
        const systemUser = userId || (await tx.user.findFirst({ select: { id: true } }))?.id;
        if (systemUser) {
          await tx.stockMovement.create({
            data: {
              productId: product.id,
              type: 'OPENING_STOCK',
              quantity: currentStock,
              costPerUnit: dto.purchaseCost,
              referenceType: 'OPENING_STOCK',
              reason: 'Initial inventory registration',
              userId: systemUser,
            },
          });
        }
      }

      return product;
    }, {
      timeout: 20000,
      maxWait: 10000,
    });
  }

  async lookupBarcode(barcode: string) {
    const code = barcode.trim();
    // 1. Check Product barcode or SKU
    const product = await this.prisma.product.findFirst({
      where: {
        isActive: true,
        OR: [{ barcode: code }, { sku: code }],
      },
      include: {
        category: true,
        imeiRecords: { where: { status: 'AVAILABLE' } },
      },
    });

    if (product) {
      return { found: true, type: 'BARCODE', product };
    }

    return { found: false, code };
  }

  async lookupImei(imei: string) {
    const code = imei.trim();
    const imeiRecord = await this.prisma.imeiRecord.findUnique({
      where: { imei: code },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    if (imeiRecord) {
      return { found: true, type: 'IMEI', imeiRecord, product: imeiRecord.product };
    }

    return { found: false, imei: code };
  }

  async universalLookup(codeStr: string) {
    const code = codeStr.trim();

    // 1. Check IMEI Record first (e.g. 15 digits)
    const imeiRecord = await this.prisma.imeiRecord.findUnique({
      where: { imei: code },
      include: {
        product: {
          include: { category: true },
        },
      },
    });

    if (imeiRecord) {
      return {
        found: true,
        type: 'IMEI',
        code,
        imeiRecord,
        product: imeiRecord.product,
      };
    }

    // 2. Check Product Barcode or SKU
    const product = await this.prisma.product.findFirst({
      where: {
        isActive: true,
        OR: [{ barcode: code }, { sku: code }],
      },
      include: {
        category: true,
        imeiRecords: { where: { status: 'AVAILABLE' } },
      },
    });

    if (product) {
      return {
        found: true,
        type: 'PRODUCT',
        code,
        product,
      };
    }

    return {
      found: false,
      code,
    };
  }

  async quickScanStockIn(
    data: {
      code: string;
      quantity?: number;
    },
    userId?: string,
  ) {
    const code = data.code.trim();
    const qty = Math.max(1, data.quantity || 1);

    // 1. Check if barcode matches existing product
    const product = await this.prisma.product.findFirst({
      where: {
        isActive: true,
        OR: [{ barcode: code }, { sku: code }],
      },
      include: { category: true },
    });

    if (product) {
      if (product.isTrackedByImei) {
        return {
          requiresImei: true,
          product,
          message: `Product "${product.name}" is IMEI-tracked. Please enter specific device IMEIs to add to stock.`,
        };
      }

      // Increment currentStock
      const updated = await this.prisma.product.update({
        where: { id: product.id },
        data: { currentStock: { increment: qty } },
        include: { category: true },
      });

      const activeUserId = userId || (await this.prisma.user.findFirst({ select: { id: true } }))?.id;
      if (activeUserId) {
        await this.prisma.stockMovement.create({
          data: {
            productId: product.id,
            type: 'PURCHASE',
            quantity: qty,
            costPerUnit: product.purchaseCost,
            referenceType: 'SCAN_STOCK_IN',
            reason: `Scanned barcode stock-in (+${qty})`,
            userId: activeUserId,
          },
        });
      }

      return {
        success: true,
        isNew: false,
        product: updated,
        addedQuantity: qty,
        newStock: updated.currentStock,
        message: `Stock updated! "${updated.name}" +${qty} units added (Now: ${updated.currentStock} in stock)`,
      };
    }

    // 2. Check if code is an IMEI
    const imei = await this.prisma.imeiRecord.findUnique({
      where: { imei: code },
      include: { product: true },
    });

    if (imei) {
      return {
        success: true,
        isNew: false,
        product: imei.product,
        imeiRecord: imei,
        newStock: imei.product.currentStock,
        message: `Device with IMEI ${code} already in stock (Status: ${imei.status})`,
      };
    }

    // 3. Not found: return flag so frontend can offer 1-click Quick Register
    return {
      success: false,
      notFound: true,
      code,
      message: `Barcode/IMEI "${code}" not registered yet. Please save product details.`,
    };
  }
}

