import { PrismaClient, AccountType, AccountSubType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial system configuration for PRO SHOP...');

  // 1. Default Shop Settings
  await prisma.shopSetting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      shopName: 'PRO SHOP Mobile & Electronics',
      phone: '+92 300 0000000',
      email: 'contact@proshop.pk',
      address: 'Shop # 12, Mobile Plaza, Pakistan',
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      receiptHeader: 'Welcome to PRO SHOP - Premium Mobile, Smart Watches & Repair Services',
      receiptFooter: 'Thank you for your business! Please keep this invoice for warranty verification.',
      invoicePrefix: 'INV-',
      repairTicketPrefix: 'REP-',
    },
  });
  console.log('✔ Shop settings initialized.');

  // 2. Default Chart of Accounts (Double-Entry Engine)
  const defaultAccounts: { code: string; name: string; type: AccountType; subType: AccountSubType; isSystem: boolean }[] = [
    { code: '1010', name: 'Cash in Hand (Counter)', type: AccountType.ASSET, subType: AccountSubType.CASH, isSystem: true },
    { code: '1020', name: 'Main Bank Account', type: AccountType.ASSET, subType: AccountSubType.BANK, isSystem: true },
    { code: '1030', name: 'JazzCash Merchant Account', type: AccountType.ASSET, subType: AccountSubType.MOBILE_WALLET, isSystem: true },
    { code: '1040', name: 'Easypaisa Merchant Account', type: AccountType.ASSET, subType: AccountSubType.MOBILE_WALLET, isSystem: true },
    { code: '1050', name: 'Accounts Receivable (Customers Credit)', type: AccountType.ASSET, subType: AccountSubType.RECEIVABLE, isSystem: true },
    { code: '1060', name: 'Merchandise Inventory Asset', type: AccountType.ASSET, subType: AccountSubType.INVENTORY, isSystem: true },
    
    { code: '2010', name: 'Accounts Payable (Suppliers)', type: AccountType.LIABILITY, subType: AccountSubType.PAYABLE, isSystem: true },
    
    { code: '4010', name: 'Product Sales Revenue', type: AccountType.REVENUE, subType: AccountSubType.SALES_REVENUE, isSystem: true },
    { code: '4020', name: 'Repair Service Revenue', type: AccountType.REVENUE, subType: AccountSubType.SERVICE_REVENUE, isSystem: true },
    
    { code: '5010', name: 'Cost of Goods Sold (COGS)', type: AccountType.EXPENSE, subType: AccountSubType.COGS, isSystem: true },
    { code: '6010', name: 'General Operating Expenses', type: AccountType.EXPENSE, subType: AccountSubType.OPERATING_EXPENSE, isSystem: true },
  ];

  for (const acc of defaultAccounts) {
    await prisma.account.upsert({
      where: { code: acc.code },
      update: {},
      create: acc,
    });
  }
  console.log('✔ Chart of Accounts configured.');

  // 3. Default Product Categories
  const categories = [
    { name: 'New Mobile Phones', description: 'Brand new packaged smartphones tracked by IMEI' },
    { name: 'Mobile Accessories', description: 'Chargers, cables, cases, screen protectors, handsfree' },
    { name: 'Smart Watches', description: 'Smart watches, fitness bands, and wearables' },
    { name: 'Other Electronics', description: 'Power banks, Bluetooth speakers, headphones, gadgets' },
    { name: 'Spare Parts & Tools', description: 'Mobile LCD screens, batteries, charging ports used in repair' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log('✔ Default categories initialized.');

  // 4. Default Expense Categories
  const expenseCategories = [
    { name: 'Shop Rent', description: 'Monthly shop premises rent' },
    { name: 'Electricity Bill', description: 'Commercial electricity utilities' },
    { name: 'Internet & Phone', description: 'Shop broadband and mobile balance' },
    { name: 'Employee Salaries', description: 'Monthly staff remuneration' },
    { name: 'Transport & Courier', description: 'Goods delivery, supplier pickups, courier charges' },
    { name: 'Maintenance & Repairs', description: 'Shop fittings, air conditioning, tools' },
    { name: 'Tea & Refreshment', description: 'Daily tea and refreshments for staff & guests' },
    { name: 'Other Miscellaneous Expenses', description: 'Uncategorized daily operational expenses' },
  ];

  for (const exp of expenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { name: exp.name },
      update: {},
      create: exp,
    });
  }
  console.log('✔ Expense categories initialized.');

  console.log('Initial setup seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
