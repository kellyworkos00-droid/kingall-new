import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all suppliers
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', search } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        include: {
          _count: {
            select: { purchaseOrders: true }
          }
        },
        skip,
        take,
        orderBy: { name: 'asc' }
      }),
      prisma.supplier.count({ where })
    ]);

    res.json({
      suppliers,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get supplier by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: {
          orderBy: { orderDate: 'desc' },
          take: 10
        }
      }
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Create supplier
router.post('/', authenticate, authorize('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        email,
        phone,
        address
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Supplier',
        entityId: supplier.id,
        details: `Created supplier: ${supplier.name}`
      }
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

// Update supplier
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, active } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        active
      }
    });

    res.json(supplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

// Delete supplier
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.supplier.delete({ where: { id } });

    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

export default router;
