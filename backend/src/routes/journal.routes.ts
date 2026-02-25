import { Router, Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { Prisma } from '@prisma/client';

const router = Router();

// Get all journal entries
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', startDate, endDate, type } = req.query;
    
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    
    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const [journalEntries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          lines: {
            include: {
              account: true
            }
          }
        },
        skip,
        take,
        orderBy: { date: 'desc' }
      }),
      prisma.journalEntry.count({ where })
    ]);

    res.json({
      journalEntries,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    console.error('Get journal entries error:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Get journal entry by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const journalEntry = await prisma.journalEntry.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lines: {
          include: {
            account: true
          }
        }
      }
    });

    if (!journalEntry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    res.json(journalEntry);
  } catch (error) {
    console.error('Get journal entry error:', error);
    res.status(500).json({ error: 'Failed to fetch journal entry' });
  }
});

// Create journal entry
router.post('/', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const { date, description, type, lines } = req.body;

    if (!description || !lines || lines.length < 2) {
      return res.status(400).json({ error: 'Description and at least 2 lines are required' });
    }

    // Validate double-entry (debits = credits)
    let totalDebit = new Prisma.Decimal(0);
    let totalCredit = new Prisma.Decimal(0);

    for (const line of lines) {
      totalDebit = totalDebit.add(new Prisma.Decimal(line.debit || 0));
      totalCredit = totalCredit.add(new Prisma.Decimal(line.credit || 0));
    }

    if (!totalDebit.equals(totalCredit)) {
      return res.status(400).json({ error: 'Debits must equal credits' });
    }

    // Generate entry number
    const count = await prisma.journalEntry.count();
    const entryNumber = `JE-${String(count + 1).padStart(6, '0')}`;

    const result = await prisma.$transaction(async (tx: any) => {
      const journalEntry = await tx.journalEntry.create({
        data: {
          entryNumber,
          date: date ? new Date(date) : new Date(),
          description,
          type: type || 'JOURNAL',
          userId: req.user!.id,
          lines: {
            create: lines.map((line: any) => ({
              accountId: line.accountId,
              debit: new Prisma.Decimal(line.debit || 0),
              credit: new Prisma.Decimal(line.credit || 0),
              description: line.description
            }))
          }
        },
        include: {
          lines: {
            include: {
              account: true
            }
          }
        }
      });

      // Update account balances
      for (const line of lines) {
        const account = await tx.account.findUnique({
          where: { id: line.accountId }
        });

        if (account) {
          const debitAmount = new Prisma.Decimal(line.debit || 0);
          const creditAmount = new Prisma.Decimal(line.credit || 0);
          
          let newBalance = account.balance;

          // For asset and expense accounts, debit increases balance
          // For liability, equity, and revenue accounts, credit increases balance
          if (account.type === 'ASSET' || account.type === 'EXPENSE') {
            newBalance = newBalance.add(debitAmount).sub(creditAmount);
          } else {
            newBalance = newBalance.add(creditAmount).sub(debitAmount);
          }

          await tx.account.update({
            where: { id: line.accountId },
            data: { balance: newBalance }
          });
        }
      }

      return journalEntry;
    });

    await prisma.activityLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'JournalEntry',
        entityId: result.id,
        details: `Created journal entry: ${result.entryNumber}`
      }
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Create journal entry error:', error);
    res.status(500).json({ error: error.message || 'Failed to create journal entry' });
  }
});

// Delete journal entry
router.delete('/:id', authenticate, authorize('ADMIN', 'ACCOUNTANT'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.journalEntry.delete({ where: { id } });

    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Delete journal entry error:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;
