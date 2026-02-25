import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Get all accounts
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        parent: true,
        children: true
      },
      orderBy: { code: 'asc' }
    });

    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get account by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        journalEntryLines: {
          include: {
            journalEntry: true
          },
          orderBy: {
            journalEntry: {
              date: 'desc'
            }
          },
          take: 50
        }
      }
    });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Failed to fetch account' });
  }
});

// Create account
router.post('/', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const { code, name, type, parentId } = req.body;

    if (!code || !name || !type) {
      return res.status(400).json({ error: 'Code, name, and type are required' });
    }

    const account = await prisma.account.create({
      data: {
        code,
        name,
        type,
        parentId
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Account',
        entityId: account.id,
        details: `Created account: ${account.code} - ${account.name}`
      }
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Update account
router.put('/:id', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, parentId, active } = req.body;

    const account = await prisma.account.update({
      where: { id },
      data: {
        name,
        type,
        parentId,
        active
      }
    });

    res.json(account);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.account.delete({ where: { id } });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
