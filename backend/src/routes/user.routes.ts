import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all users (Admin/Manager only)
router.get('/', authenticate, authorize('ADMIN', 'MANAGER'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user (Admin only)
router.post('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'User',
        entityId: user.id,
        details: `Created user: ${user.email}`
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, active } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { name, role, active },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        updatedAt: true
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'User',
        entityId: user.id,
        details: `Updated user: ${user.email}`
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'User',
        entityId: id,
        details: 'Deleted user'
      }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
