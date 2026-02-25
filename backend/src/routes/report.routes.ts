import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { Prisma } from '@prisma/client';

const router = Router();

// Sales report
router.get('/sales', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, customerId } = req.query;

    const where: any = {};
    
    if (customerId) {
      where.customerId = customerId;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate as string);
      if (endDate) where.orderDate.lte = new Date(endDate as string);
    }

    const salesOrders = await prisma.salesOrder.findMany({
      where,
      include: {
        customer: true,
        user: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { orderDate: 'desc' }
    });

    const summary = {
      totalOrders: salesOrders.length,
      totalRevenue: salesOrders.reduce((sum: any, order: any) => sum.add(order.grandTotal), new Prisma.Decimal(0)).toString(),
      totalDiscount: salesOrders.reduce((sum: any, order: any) => sum.add(order.discount), new Prisma.Decimal(0)).toString(),
      totalTax: salesOrders.reduce((sum: any, order: any) => sum.add(order.tax), new Prisma.Decimal(0)).toString()
    };

    res.json({
      summary,
      orders: salesOrders
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({ error: 'Failed to generate sales report' });
  }
});

// Purchase report
router.get('/purchases', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, supplierId } = req.query;

    const where: any = {};
    
    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate as string);
      if (endDate) where.orderDate.lte = new Date(endDate as string);
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        user: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { orderDate: 'desc' }
    });

    const summary = {
      totalOrders: purchaseOrders.length,
      totalPurchases: purchaseOrders.reduce((sum: any, order: any) => sum.add(order.grandTotal), new Prisma.Decimal(0)).toString(),
      totalPaid: purchaseOrders.reduce((sum: any, order: any) => sum.add(order.paidAmount), new Prisma.Decimal(0)).toString(),
      totalBalance: purchaseOrders.reduce((sum, order) => sum.add(order.balance), new Prisma.Decimal(0)).toString()
    };

    res.json({
      summary,
      orders: purchaseOrders
    });
  } catch (error) {
    console.error('Purchase report error:', error);
    res.status(500).json({ error: 'Failed to generate purchase report' });
  }
});

// Inventory valuation report
router.get('/inventory-valuation', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stocks = await prisma.stock.findMany({
      include: {
        product: {
          include: {
            category: true
          }
        },
        warehouse: true
      }
    });

    const valuation = stocks.map(stock => {
      const costValue = new Prisma.Decimal(stock.quantity).mul(stock.product.costPrice);
      const sellingValue = new Prisma.Decimal(stock.quantity).mul(stock.product.sellingPrice);
      
      return {
        product: stock.product.name,
        sku: stock.product.sku,
        category: stock.product.category.name,
        warehouse: stock.warehouse.name,
        quantity: stock.quantity,
        costPrice: stock.product.costPrice.toString(),
        sellingPrice: stock.product.sellingPrice.toString(),
        costValue: costValue.toString(),
        sellingValue: sellingValue.toString(),
        potentialProfit: sellingValue.sub(costValue).toString()
      };
    });

    const summary = {
      totalItems: valuation.length,
      totalCostValue: valuation.reduce((sum, item) => sum + parseFloat(item.costValue), 0).toFixed(2),
      totalSellingValue: valuation.reduce((sum, item) => sum + parseFloat(item.sellingValue), 0).toFixed(2),
      totalPotentialProfit: valuation.reduce((sum, item) => sum + parseFloat(item.potentialProfit), 0).toFixed(2)
    };

    res.json({
      summary,
      items: valuation
    });
  } catch (error) {
    console.error('Inventory valuation report error:', error);
    res.status(500).json({ error: 'Failed to generate inventory valuation report' });
  }
});

// Customer statement
router.get('/customer-statement/:customerId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { customerId } = req.params;
    const { startDate, endDate } = req.query;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const where: any = { customerId };
    
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate as string);
      if (endDate) where.orderDate.lte = new Date(endDate as string);
    }

    const transactions = await prisma.salesOrder.findMany({
      where,
      orderBy: { orderDate: 'asc' }
    });

    res.json({
      customer,
      transactions,
      balance: customer.balance.toString()
    });
  } catch (error) {
    console.error('Customer statement error:', error);
    res.status(500).json({ error: 'Failed to generate customer statement' });
  }
});

// Supplier statement
router.get('/supplier-statement/:supplierId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { supplierId } = req.params;
    const { startDate, endDate } = req.query;

    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    const where: any = { supplierId };
    
    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(startDate as string);
      if (endDate) where.orderDate.lte = new Date(endDate as string);
    }

    const transactions = await prisma.purchaseOrder.findMany({
      where,
      orderBy: { orderDate: 'asc' }
    });

    res.json({
      supplier,
      transactions,
      balance: supplier.balance.toString()
    });
  } catch (error) {
    console.error('Supplier statement error:', error);
    res.status(500).json({ error: 'Failed to generate supplier statement' });
  }
});

// Profit & Loss statement
router.get('/profit-loss', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    // Get revenue accounts
    const revenueAccounts = await prisma.account.findMany({
      where: { type: 'REVENUE' },
      include: {
        journalEntryLines: {
          where: startDate || endDate ? {
            journalEntry: {
              date: dateFilter
            }
          } : undefined
        }
      }
    });

    const totalRevenue = revenueAccounts.reduce((sum, account) => {
      const accountTotal = account.journalEntryLines.reduce((lineSum, line) => 
        lineSum.add(line.credit).sub(line.debit), new Prisma.Decimal(0)
      );
      return sum.add(accountTotal);
    }, new Prisma.Decimal(0));

    // Get expense accounts
    const expenseAccounts = await prisma.account.findMany({
      where: { type: 'EXPENSE' },
      include: {
        journalEntryLines: {
          where: startDate || endDate ? {
            journalEntry: {
              date: dateFilter
            }
          } : undefined
        }
      }
    });

    const totalExpenses = expenseAccounts.reduce((sum, account) => {
      const accountTotal = account.journalEntryLines.reduce((lineSum, line) => 
        lineSum.add(line.debit).sub(line.credit), new Prisma.Decimal(0)
      );
      return sum.add(accountTotal);
    }, new Prisma.Decimal(0));

    const netProfit = totalRevenue.sub(totalExpenses);

    res.json({
      revenue: {
        total: totalRevenue.toString(),
        accounts: revenueAccounts.map(acc => ({
          name: acc.name,
          code: acc.code,
          balance: acc.balance.toString()
        }))
      },
      expenses: {
        total: totalExpenses.toString(),
        accounts: expenseAccounts.map(acc => ({
          name: acc.name,
          code: acc.code,
          balance: acc.balance.toString()
        }))
      },
      netProfit: netProfit.toString()
    });
  } catch (error) {
    console.error('Profit & Loss report error:', error);
    res.status(500).json({ error: 'Failed to generate Profit & Loss report' });
  }
});

// Balance Sheet
router.get('/balance-sheet', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const assets = await prisma.account.findMany({
      where: { type: 'ASSET' }
    });

    const liabilities = await prisma.account.findMany({
      where: { type: 'LIABILITY' }
    });

    const equity = await prisma.account.findMany({
      where: { type: 'EQUITY' }
    });

    const totalAssets = assets.reduce((sum, acc) => sum.add(acc.balance), new Prisma.Decimal(0));
    const totalLiabilities = liabilities.reduce((sum, acc) => sum.add(acc.balance), new Prisma.Decimal(0));
    const totalEquity = equity.reduce((sum, acc) => sum.add(acc.balance), new Prisma.Decimal(0));

    res.json({
      assets: {
        total: totalAssets.toString(),
        accounts: assets.map(acc => ({
          name: acc.name,
          code: acc.code,
          balance: acc.balance.toString()
        }))
      },
      liabilities: {
        total: totalLiabilities.toString(),
        accounts: liabilities.map(acc => ({
          name: acc.name,
          code: acc.code,
          balance: acc.balance.toString()
        }))
      },
      equity: {
        total: totalEquity.toString(),
        accounts: equity.map(acc => ({
          name: acc.name,
          code: acc.code,
          balance: acc.balance.toString()
        }))
      },
      totalLiabilitiesAndEquity: totalLiabilities.add(totalEquity).toString()
    });
  } catch (error) {
    console.error('Balance Sheet report error:', error);
    res.status(500).json({ error: 'Failed to generate Balance Sheet' });
  }
});

// Trial Balance
router.get('/trial-balance', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      where: { active: true },
      orderBy: { code: 'asc' }
    });

    const trialBalance = accounts.map(account => {
      const debit = ['ASSET', 'EXPENSE'].includes(account.type) && account.balance.greaterThan(0)
        ? account.balance.toString()
        : '0.00';
      
      const credit = ['LIABILITY', 'EQUITY', 'REVENUE'].includes(account.type) && account.balance.greaterThan(0)
        ? account.balance.toString()
        : '0.00';

      return {
        code: account.code,
        name: account.name,
        type: account.type,
        debit,
        credit
      };
    });

    const totalDebit = trialBalance.reduce((sum, acc) => sum + parseFloat(acc.debit), 0).toFixed(2);
    const totalCredit = trialBalance.reduce((sum, acc) => sum + parseFloat(acc.credit), 0).toFixed(2);

    res.json({
      accounts: trialBalance,
      totalDebit,
      totalCredit,
      balanced: totalDebit === totalCredit
    });
  } catch (error) {
    console.error('Trial Balance report error:', error);
    res.status(500).json({ error: 'Failed to generate Trial Balance' });
  }
});

export default router;
