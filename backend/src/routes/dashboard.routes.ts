import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { Prisma } from '@prisma/client';

const router = Router();

// Get dashboard stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const where = startDate || endDate ? { orderDate: dateFilter } : {};

    // Get sales data
    const salesOrders = await prisma.salesOrder.findMany({
      where,
      select: {
        grandTotal: true,
        totalAmount: true,
        discount: true,
        tax: true
      }
    });

const totalRevenue = salesOrders.reduce((sum: any, order: any) =>
      sum.add(order.grandTotal), new Prisma.Decimal(0)
    );

    // Get purchase data
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: startDate || endDate ? { orderDate: dateFilter } : {},
      select: {
        grandTotal: true
      }
    });

const totalPurchases = purchaseOrders.reduce((sum: any, order: any) =>
      sum.add(order.grandTotal), new Prisma.Decimal(0)
    );

    // Get customer balances (receivables)
    const customers = await prisma.customer.findMany({
      select: { balance: true }
    });

const totalReceivables = customers.reduce((sum: any, customer: any) =>
      sum.add(customer.balance), new Prisma.Decimal(0)
    );

    // Get supplier balances (payables)
    const suppliers = await prisma.supplier.findMany({
      select: { balance: true }
    });

const totalPayables = suppliers.reduce((sum: any, supplier: any) =>
      sum.add(supplier.balance), new Prisma.Decimal(0)
    );

    // Get stock value
    const stocks = await prisma.stock.findMany({
      include: {
        product: {
          select: {
            costPrice: true
          }
        }
      }
    });

const stockValue = stocks.reduce((sum: any, stock: any) =>
      sum.add(new Prisma.Decimal(stock.quantity).mul(stock.product.costPrice)), 
      new Prisma.Decimal(0)
    );

    // Get low stock count
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        stocks: true
      }
    });

    const lowStockCount = products.filter((product: any) => {
      const totalStock = product.stocks.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
      return totalStock <= product.reorderLevel;
    }).length;

    // Get counts
    const [totalCustomers, totalSuppliers, totalProducts, salesCount] = await Promise.all([
      prisma.customer.count({ where: { active: true } }),
      prisma.supplier.count({ where: { active: true } }),
      prisma.product.count({ where: { active: true } }),
      prisma.salesOrder.count({ where })
    ]);

    // Calculate profit (simplified - revenue - purchases)
    const profit = totalRevenue.sub(totalPurchases);

    res.json({
      revenue: totalRevenue.toString(),
      purchases: totalPurchases.toString(),
      profit: profit.toString(),
      receivables: totalReceivables.toString(),
      payables: totalPayables.toString(),
      stockValue: stockValue.toString(),
      lowStockCount,
      totalCustomers,
      totalSuppliers,
      totalProducts,
      salesCount
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get sales trend
router.get('/sales-trend', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'month' } = req.query;

    // Get sales for last 12 months or 30 days
    const sales = await prisma.salesOrder.findMany({
      where: {
        orderDate: {
          gte: period === 'month' 
            ? new Date(new Date().setMonth(new Date().getMonth() - 12))
            : new Date(new Date().setDate(new Date().getDate() - 30))
        }
      },
      select: {
        orderDate: true,
        grandTotal: true
      },
      orderBy: {
        orderDate: 'asc'
      }
    });

    // Group by period
    const grouped: any = {};
    
    sales.forEach((sale: any) => {
      const key = period === 'month'
        ? `${sale.orderDate.getFullYear()}-${String(sale.orderDate.getMonth() + 1).padStart(2, '0')}`
        : sale.orderDate.toISOString().split('T')[0];

      if (!grouped[key]) {
        grouped[key] = new Prisma.Decimal(0);
      }
      grouped[key] = grouped[key].add(sale.grandTotal);
    });

    const trend = Object.entries(grouped).map(([period, total]: [string, any]) => ({
      period,
      total: total.toString()
    }));

    res.json(trend);
  } catch (error) {
    console.error('Get sales trend error:', error);
    res.status(500).json({ error: 'Failed to fetch sales trend' });
  }
});

// Get top products
router.get('/top-products', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    const topProducts = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.sku,
        SUM(soi.quantity) as total_quantity,
        SUM(soi.total) as total_sales
      FROM "Product" p
      INNER JOIN "SalesOrderItem" soi ON p.id = soi."productId"
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_sales DESC
      LIMIT ${parseInt(limit as string)}
    `;

    res.json(topProducts);
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({ error: 'Failed to fetch top products' });
  }
});

// Get recent activities
router.get('/recent-activities', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '20' } = req.query;

    const activities = await prisma.activityLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit as string)
    });

    res.json(activities);
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

export default router;
