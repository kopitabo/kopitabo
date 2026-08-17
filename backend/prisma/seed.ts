import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      permissions: JSON.stringify(['ALL']),
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'Cashier' },
    update: {},
    create: {
      name: 'Cashier',
      permissions: JSON.stringify(['CREATE_ORDER', 'VIEW_PRODUCTS']),
    },
  });

  // 2. Create Default User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kopitabo.com' },
    update: {},
    create: {
      name: 'Admin Kopi Tabo',
      email: 'admin@kopitabo.com',
      password: 'hashed_password_123', // Dummy password
      roleId: adminRole.id,
    },
  });

  // 3. Create Categories
  const categoryCoffee = await prisma.category.create({
    data: { name: 'Coffee' }
  });

  const categoryNonCoffee = await prisma.category.create({
    data: { name: 'Non-Coffee' }
  });

  const categoryPastry = await prisma.category.create({
    data: { name: 'Pastry' }
  });

  // 4. Create Initial Ingredients
  await prisma.ingredient.createMany({
    data: [
      { name: 'Air Galon (Refill)', unit: 'ml', stock: 38000, costPerUnit: 0.32 },
      { name: 'Biji Kopi House Blend', unit: 'g', stock: 2000, costPerUnit: 250 },
      { name: 'Susu UHT / Fresh Milk', unit: 'ml', stock: 5000, costPerUnit: 18 },
      { name: 'Sirup Gula Aren', unit: 'ml', stock: 2000, costPerUnit: 30 },
      { name: 'Cup + Sedotan 16oz', unit: 'pcs', stock: 500, costPerUnit: 650 }
    ]
  });

  // 5. Create Products
  await prisma.product.createMany({
    data: [
      { name: 'Es Kopi Susu Gula Aren', price: 25000, hpp: 7500, categoryId: categoryCoffee.id, description: 'Signature Kopi Tabo' },
      { name: 'Americano (Hot/Cold)', price: 20000, hpp: 4500, categoryId: categoryCoffee.id, description: 'Espresso with water' },
      { name: 'Cappuccino', price: 28000, hpp: 7800, categoryId: categoryCoffee.id, description: 'Espresso with steamed milk and foam' },
      { name: 'Matcha Latte', price: 30000, hpp: 8500, categoryId: categoryNonCoffee.id, description: 'Premium matcha with milk' },
      { name: 'Red Velvet Latte', price: 30000, hpp: 8500, categoryId: categoryNonCoffee.id, description: 'Red velvet flavor with milk' },
      { name: 'Croissant Butter', price: 22000, hpp: 10000, categoryId: categoryPastry.id, description: 'Flaky and buttery croissant' },
      { name: 'Pain au Chocolat', price: 25000, hpp: 11000, categoryId: categoryPastry.id, description: 'Chocolate filled pastry' }
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
