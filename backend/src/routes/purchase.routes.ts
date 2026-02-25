import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { Prisma } from '@prisma/client';

const router = Router();

// Get all purchase orders
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', supplierId, startDate, endDate } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    
    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate as string);
      if (endDate) where.orderDate.lte = new Date(endDate as string);
    }

    const [purchaseOrders, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          items: {
            include: {
              product: true
            }
          }
        },
        skip,
        take,
        orderBy: { orderDate: 'desc' }
      }),
      prisma.purchaseOrder.count({ where })
    ]);

    res.json({
      purchaseOrders,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: 'Failed to fetch purchase orders' });
  }
});

// Get purchase order by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json(purchaseOrder);
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ error: 'Failed to fetch purchase order' });
  }
});

// Create purchase order
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const { supplierId, items, discount, tax, notes } = req.body;

    if (!supplierId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Supplier and items are required' });
    }

    // Calculate totals
    let totalAmount = new Prisma.Decimal(0);
    const processedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      const itemTotal = new Prisma.Decimal(item.quantity).mul(new Prisma.Decimal(item.unitPrice || product.costPrice));
      totalAmount = totalAmount.add(itemTotal);

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice || product.costPrice,
        total: itemTotal
      });
    }

    const discountAmount = discount ? new Prisma.Decimal(discount) : new Prisma.Decimal(0);
    const taxAmount = tax ? new Prisma.Decimal(tax) : new Prisma.Decimal(0);
    const grandTotal = totalAmount.sub(discountAmount).add(taxAmount);

    // Generate order number
    const count = await prisma.purchaseOrder.count();
    const orderNumber = `PO-${String(count + 1).padStart(6, '0')}`;

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        userId: req.user!.id,
        totalAmount,
        discount: discountAmount,
        tax: taxAmount,
        grandTotal,
        paidAmount: new Prisma.Decimal(0),
        balance: grandTotal,
        status: 'pending',
        notes,
        items: {
          create: processedItems
        }
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Update supplier balance
    await prisma.supplier.update({
      where: { id: supplierId },
      data: {
        balance: {
          increment: grandTotal
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'PurchaseOrder',
        entityId: purchaseOrder.id,
        details: `Created purchase order: ${purchaseOrder.orderNumber}`
      }
    });

    res.status(201).json(purchaseOrder);
  } catch (error: any) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: error.message || 'Failed to create purchase order' });
  }
});

// Receive goods (update stock)
router.post('/:id/receive', authenticate, authorize('ADMIN', 'MANAGER', 'STOREKEEPER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { warehouseId } = req.body;

    if (!warehouseId) {
      return res.status(400).json({ error: 'Warehouse is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const purchaseOrder = await tx.purchaseOrder.findUnique({
        where: { id },
        include: {
          items: true
        }
      });

      if (!purchaseOrder) {
        throw new Error('Purchase order not found');
      }

      if (purchaseOrder.status === 'received') {
        throw new Error('Purchase order already received');
      }

      // Update stock for each item
      for (const item of purchaseOrder.items) {
        const stock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: warehouseId
            }
          }
        });

        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantity: stock.quantity + item.quantity
            }
          });
        } else {
          await tx.stock.create({
            data: {
              productId: item.productId,
              warehouseId: warehouseId,
              quantity: item.quantity
            }
          });
        }

        // Record stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            toWarehouseId: warehouseId,
            type: 'IN',
            quantity: item.quantity,
            notes: `Purchase order: ${purchaseOrder.orderNumber}`,
            userId: req.user!.id
          }
        });
      }

      // Update purchase order status
      const updatedPO = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: 'received',
          receivedDate: new Date()
        },
        include: {
          supplier: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      return updatedPO;
    });

    res.json(result);
  } catch (error: any) {
    console.error('Receive goods error:', error);
    res.status(500).json({ error: error.message || 'Failed to receive goods' });
  }
});

// Update purchase order
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paidAmount, notes } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id }
    });

    if (!purchaseOrder) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    const newBalance = purchaseOrder.grandTotal.sub(new Prisma.Decimal(paidAmount || purchaseOrder.paidAmount));

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        paidAmount: paidAmount ? new Prisma.Decimal(paidAmount) : undefined,
        balance: newBalance,
        notes
      },
      include: {
        supplier: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ error: 'Failed to update purchase order' });
  }
});

// Delete purchase order
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.purchaseOrder.delete({ where: { id } });

    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ error: 'Failed to delete purchase order' });
  }
});

export default router;
