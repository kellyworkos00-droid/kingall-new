import { PrismaClient, UserRole, AccountType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  console.log('Creating users...');
  
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const ownerPassword = await bcrypt.hash('owner@2026', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@kellyos.com' },
    update: {},
    create: {
      email: 'admin@kellyos.com',
      password: adminPassword,
      name: 'System Admin',
      role: UserRole.ADMIN
    }
  });

  const owner = await prisma.user.upsert({
    where: { email: 'pkingori14@gmail.com' },
    update: {},
    create: {
      email: 'pkingori14@gmail.com',
      password: ownerPassword,
      name: 'Owner',
      role: UserRole.ADMIN
    }
  });

  console.log('✅ Users created');

  // Create Chart of Accounts
  console.log('Creating chart of accounts...');

  const accounts = [
    // Assets (1000-1999)
    { code: '1000', name: 'Assets', type: AccountType.ASSET },
    { code: '1100', name: 'Cash and Bank', type: AccountType.ASSET },
    { code: '1200', name: 'Accounts Receivable', type: AccountType.ASSET },
    { code: '1300', name: 'Inventory', type: AccountType.ASSET },
    { code: '1400', name: 'Prepaid Expenses', type: AccountType.ASSET },
    { code: '1500', name: 'Fixed Assets', type: AccountType.ASSET },
    { code: '1510', name: 'Equipment', type: AccountType.ASSET },
    { code: '1520', name: 'Vehicles', type: AccountType.ASSET },
    { code: '1530', name: 'Buildings', type: AccountType.ASSET },

    // Liabilities (2000-2999)
    { code: '2000', name: 'Liabilities', type: AccountType.LIABILITY },
    { code: '2100', name: 'Accounts Payable', type: AccountType.LIABILITY },
    { code: '2200', name: 'Short-term Loans', type: AccountType.LIABILITY },
    { code: '2300', name: 'Long-term Loans', type: AccountType.LIABILITY },
    { code: '2400', name: 'Accrued Expenses', type: AccountType.LIABILITY },

    // Equity (3000-3999)
    { code: '3000', name: 'Equity', type: AccountType.EQUITY },
    { code: '3100', name: 'Owner\'s Equity', type: AccountType.EQUITY },
    { code: '3200', name: 'Retained Earnings', type: AccountType.EQUITY },
    { code: '3300', name: 'Current Year Earnings', type: AccountType.EQUITY },

    // Revenue (4000-4999)
    { code: '4000', name: 'Revenue', type: AccountType.REVENUE },
    { code: '4100', name: 'Sales Revenue', type: AccountType.REVENUE },
    { code: '4200', name: 'Service Revenue', type: AccountType.REVENUE },
    { code: '4900', name: 'Other Income', type: AccountType.REVENUE },

    // Expenses (5000-5999)
    { code: '5000', name: 'Expenses', type: AccountType.EXPENSE },
    { code: '5100', name: 'Cost of Goods Sold', type: AccountType.EXPENSE },
    { code: '5200', name: 'Salaries and Wages', type: AccountType.EXPENSE },
    { code: '5300', name: 'Rent Expense', type: AccountType.EXPENSE },
    { code: '5400', name: 'Utilities Expense', type: AccountType.EXPENSE },
    { code: '5500', name: 'Marketing and Advertising', type: AccountType.EXPENSE },
    { code: '5600', name: 'Office Supplies', type: AccountType.EXPENSE },
    { code: '5700', name: 'Insurance Expense', type: AccountType.EXPENSE },
    { code: '5800', name: 'Depreciation Expense', type: AccountType.EXPENSE },
    { code: '5900', name: 'Miscellaneous Expenses', type: AccountType.EXPENSE }
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: {},
      create: account
    });
  }

  console.log('✅ Chart of accounts created');

  // Create sample categories
  console.log('Creating product categories...');

  const categories = [
    { name: 'Hardware', description: 'Hardware products and tools' },
    { name: 'Steel Products', description: 'Steel and metal products' },
    { name: 'Building Materials', description: 'Construction and building materials' },
    { name: 'Tools', description: 'Hand and power tools' },
    { name: 'Fasteners', description: 'Bolts, nuts, screws, and fasteners' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    });
  }

  console.log('✅ Categories created');

  // Create sample warehouse
  console.log('Creating warehouses...');

  const warehouse = await prisma.warehouse.upsert({
    where: { name: 'Main Warehouse' },
    update: {},
    create: {
      name: 'Main Warehouse',
      location: 'Default Location'
    }
  });

  console.log('✅ Warehouse created');

  // Create sample customer
  console.log('Creating sample customer...');

  await prisma.customer.upsert({
    where: { id: 'default-customer' },
    update: {},
    create: {
      id: 'default-customer',
      name: 'Walk-in Customer',
      email: 'walkin@customer.com',
      phone: '000-000-0000',
      address: 'N/A',
      creditLimit: 0
    }
  });

  console.log('✅ Sample customer created');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📝 Login Credentials:');
  console.log('Admin: admin@kellyos.com / Admin@123');
  console.log('Owner: pkingori14@gmail.com / owner@2026');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
