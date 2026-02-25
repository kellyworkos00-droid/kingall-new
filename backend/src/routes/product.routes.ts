import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all products
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', search, categoryId } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { sku: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          stocks: {
            include: {
              warehouse: true
            }
          }
        },
        skip,
        take,
        orderBy: { name: 'asc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        stocks: {
          include: {
            warehouse: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'STOREKEEPER'), async (req: AuthRequest, res: Response) => {
  try {
    const { sku, name, description, categoryId, costPrice, sellingPrice, reorderLevel, barcode } = req.body;

    if (!sku || !name || !categoryId || !costPrice || !sellingPrice) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description,
        categoryId,
        costPrice,
        sellingPrice,
        reorderLevel: reorderLevel || 10,
        barcode
      },
      include: {
        category: true
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Product',
        entityId: product.id,
        details: `Created product: ${product.name} (${product.sku})`
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER', 'STOREKEEPER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, categoryId, costPrice, sellingPrice, reorderLevel, barcode, active } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        categoryId,
        costPrice,
        sellingPrice,
        reorderLevel,
        barcode,
        active
      },
      include: {
        category: true
      }
    });

    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get low stock products
router.get('/alerts/low-stock', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true
      },
      include: {
        category: true,
        stocks: {
          include: {
            warehouse: true
          }
        }
      }
    });

    const lowStockProducts = products.filter((product: any) => {
      const totalStock = product.stocks.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
      return totalStock <= product.reorderLevel;
    });

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

export default router;
