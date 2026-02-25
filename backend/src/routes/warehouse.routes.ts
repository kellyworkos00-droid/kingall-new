import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all warehouses
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: { stocks: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(warehouses);
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// Create warehouse
router.post('/', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, location } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const warehouse = await prisma.warehouse.create({
      data: { name, location }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Warehouse',
        entityId: warehouse.id,
        details: `Created warehouse: ${warehouse.name}`
      }
    });

    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ error: 'Failed to create warehouse' });
  }
});

// Update warehouse
router.put('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, location, active } = req.body;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { name, location, active }
    });

    res.json(warehouse);
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({ error: 'Failed to update warehouse' });
  }
});

// Delete warehouse
router.delete('/:id', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.warehouse.delete({ where: { id } });

    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ error: 'Failed to delete warehouse' });
  }
});

export default router;
