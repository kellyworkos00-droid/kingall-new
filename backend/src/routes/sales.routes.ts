import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { Prisma } from '@prisma/client';

const router = Router();

// Get all sales orders
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', customerId, startDate, endDate } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    
    if (customerId) {
      where.customerId = customerId;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate as string);
      if (endDate) where.orderDate.lte = new Date(endDate as string);
    }

    const [salesOrders, total] = await Promise.all([
      prisma.salesOrder.findMany({
        where,
        include: {
          customer: true,
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
      prisma.salesOrder.count({ where })
    ]);

    res.json({
      salesOrders,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get sales orders error:', error);
    res.status(500).json({ error: 'Failed to fetch sales orders' });
  }
});

// Get sales order by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
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

    if (!salesOrder) {
      return res.status(404).json({ error: 'Sales order not found' });
    }

    res.json(salesOrder);
  } catch (error) {
    console.error('Get sales order error:', error);
    res.status(500).json({ error: 'Failed to fetch sales order' });
  }
});

// Create sales order
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, items, discount, tax, paymentMethod, notes, warehouseId } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Customer and items are required' });
    }

    // Calculate totals
    let totalAmount = new Prisma.Decimal(0);
    const processedItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      const itemTotal = new Prisma.Decimal(item.quantity).mul(product.sellingPrice);
      totalAmount = totalAmount.add(itemTotal);

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.sellingPrice,
        total: itemTotal
      });
    }

    const discountAmount = discount ? new Prisma.Decimal(discount) : new Prisma.Decimal(0);
    const taxAmount = tax ? new Prisma.Decimal(tax) : new Prisma.Decimal(0);
    const grandTotal = totalAmount.sub(discountAmount).add(taxAmount);

    // Generate order number
    const count = await prisma.salesOrder.count();
    const orderNumber = `SO-${String(count + 1).padStart(6, '0')}`;

    // Create sales order with transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const salesOrder = await tx.salesOrder.create({
        data: {
          orderNumber,
          customerId,
          userId: req.user!.id,
          totalAmount,
          discount: discountAmount,
          tax: taxAmount,
          grandTotal,
          paidAmount: grandTotal,
          balance: new Prisma.Decimal(0),
          paymentMethod: paymentMethod || 'CASH',
          notes,
          items: {
            create: processedItems
          }
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true
            }
          }
        }
      });

      // Update customer balance if credit
      if (paymentMethod === 'CREDIT') {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            balance: {
              increment: grandTotal
            }
          }
        });
      }

      // Reduce stock for each item
      if (warehouseId) {
        for (const item of items) {
          const stock = await tx.stock.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: warehouseId
              }
            }
          });

          if (stock) {
            if (stock.quantity < item.quantity) {
              throw new Error(`Insufficient stock for product ${item.productId}`);
            }

            await tx.stock.update({
              where: { id: stock.id },
              data: {
                quantity: stock.quantity - item.quantity
              }
            });

            // Record stock movement
            await tx.stockMovement.create({
              data: {
                productId: item.productId,
                fromWarehouseId: warehouseId,
                type: 'OUT',
                quantity: item.quantity,
                notes: `Sales order: ${orderNumber}`,
                userId: req.user!.id
              }
            });
          }
        }
      }

      // Create journal entry for the sale
      const journalEntryNumber = `JE-${String(await tx.journalEntry.count() + 1).padStart(6, '0')}`;
      
      await tx.journalEntry.create({
        data: {
          entryNumber: journalEntryNumber,
          date: new Date(),
          description: `Sales Order ${orderNumber}`,
          type: 'SALE',
          referenceId: salesOrder.id,
          userId: req.user!.id,
          lines: {
            create: [
              {
                accountId: (await tx.account.findFirst({ where: { code: '1100' } }))!.id, // Cash/Bank
                debit: grandTotal,
                credit: new Prisma.Decimal(0),
                description: 'Cash received from sale'
              },
              {
                accountId: (await tx.account.findFirst({ where: { code: '4000' } }))!.id, // Sales Revenue
                debit: new Prisma.Decimal(0),
                credit: grandTotal,
                description: 'Sales revenue'
              }
            ]
          }
        }
      });

      return salesOrder;
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'SalesOrder',
        entityId: result.id,
        details: `Created sales order: ${result.orderNumber}`
      }
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create sales order error:', error);
    res.status(500).json({ error: error.message || 'Failed to create sales order' });
  }
});

// Update sales order
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paidAmount, notes } = req.body;

    const salesOrder = await prisma.salesOrder.update({
      where: { id },
      data: {
        status,
        paidAmount,
        balance: paidAmount ? {
          set: new Prisma.Decimal(0)
        } : undefined,
        notes
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    res.json(salesOrder);
  } catch (error) {
    console.error('Update sales order error:', error);
    res.status(500).json({ error: 'Failed to update sales order' });
  }
});

// Delete sales order
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.salesOrder.delete({ where: { id } });

    res.json({ message: 'Sales order deleted successfully' });
  } catch (error) {
    console.error('Delete sales order error:', error);
    res.status(500).json({ error: 'Failed to delete sales order' });
  }
});

export default router;
