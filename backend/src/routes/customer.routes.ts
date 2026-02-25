import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all customers
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

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { salesOrders: true }
          }
        },
        skip,
        take,
        orderBy: { name: 'asc' }
      }),
      prisma.customer.count({ where })
    ]);

    res.json({
      customers,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        salesOrders: {
          orderBy: { orderDate: 'desc' },
          take: 10
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, address, creditLimit } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        address,
        creditLimit: creditLimit || 0
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Customer',
        entityId: customer.id,
        details: `Created customer: ${customer.name}`
      }
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, creditLimit, active } = req.body;

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        creditLimit,
        active
      }
    });

    res.json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.customer.delete({ where: { id } });

    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
