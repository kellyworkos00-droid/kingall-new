import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get stock for all products
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { warehouseId } = req.query;

    const where: any = {};
    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    const stocks = await prisma.stock.findMany({
      where,
      include: {
        product: {
          include: {
            category: true
          }
        },
        warehouse: true
      },
      orderBy: {
        product: {
          name: 'asc'
        }
      }
    });

    res.json(stocks);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ error: 'Failed to fetch stock' });
  }
});

// Get stock movements
router.get('/movements', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', productId, type } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (productId) where.productId = productId;
    if (type) where.type = type;

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        include: {
          product: true,
          fromWarehouse: true,
          toWarehouse: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ]);

    res.json({
      movements,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Create stock movement (IN, OUT, ADJUSTMENT, TRANSFER)
router.post('/movements', authenticate, authorize('ADMIN', 'MANAGER', 'STOREKEEPER'), async (req: AuthRequest, res: Response) => {
  try {
    const { productId, fromWarehouseId, toWarehouseId, type, quantity, notes } = req.body;

    if (!productId || !type || !quantity) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          fromWarehouseId,
          toWarehouseId,
          type,
          quantity,
          notes,
          userId: req.user!.id
        }
      });

      // Update stock levels based on movement type
      if (type === 'IN' && toWarehouseId) {
        // Stock IN - increase stock at destination warehouse
        const existingStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: toWarehouseId
            }
          }
        });

        if (existingStock) {
          await tx.stock.update({
            where: { id: existingStock.id },
            data: { quantity: existingStock.quantity + quantity }
          });
        } else {
          await tx.stock.create({
            data: {
              productId,
              warehouseId: toWarehouseId,
              quantity
            }
          });
        }
      } else if (type === 'OUT' && fromWarehouseId) {
        // Stock OUT - decrease stock at source warehouse
        const existingStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: fromWarehouseId
            }
          }
        });

        if (!existingStock || existingStock.quantity < quantity) {
          throw new Error('Insufficient stock');
        }

        await tx.stock.update({
          where: { id: existingStock.id },
          data: { quantity: existingStock.quantity - quantity }
        });
      } else if (type === 'TRANSFER' && fromWarehouseId && toWarehouseId) {
        // Transfer - decrease from source, increase at destination
        const fromStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: fromWarehouseId
            }
          }
        });

        if (!fromStock || fromStock.quantity < quantity) {
          throw new Error('Insufficient stock');
        }

        await tx.stock.update({
          where: { id: fromStock.id },
          data: { quantity: fromStock.quantity - quantity }
        });

        const toStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: toWarehouseId
            }
          }
        });

        if (toStock) {
          await tx.stock.update({
            where: { id: toStock.id },
            data: { quantity: toStock.quantity + quantity }
          });
        } else {
          await tx.stock.create({
            data: {
              productId,
              warehouseId: toWarehouseId,
              quantity
            }
          });
        }
      } else if (type === 'ADJUSTMENT' && toWarehouseId) {
        // Adjustment - set stock to specific quantity
        const existingStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId: toWarehouseId
            }
          }
        });

        if (existingStock) {
          await tx.stock.update({
            where: { id: existingStock.id },
            data: { quantity }
          });
        } else {
          await tx.stock.create({
            data: {
              productId,
              warehouseId: toWarehouseId,
              quantity
            }
          });
        }
      }

      return movement;
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'StockMovement',
        entityId: result.id,
        details: `Stock movement: ${type} - Quantity: ${quantity}`
      }
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create stock movement error:', error);
    res.status(500).json({ error: error.message || 'Failed to create stock movement' });
  }
});

export default router;
