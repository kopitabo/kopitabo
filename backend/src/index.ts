import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Kopi Tabo POS Backend API' });
});

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        modifiers: true,
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, categoryName } = req.body;
    
    // Find or create category
    let category = await prisma.category.findFirst({
      where: { name: categoryName }
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName }
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        categoryId: category.id
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { totalAmount, status, orderItems, payments, localId } = req.body;

    // We need an active shift to attach the order to.
    // For now, let's find the first user and create a dummy shift if none exists.
    let shift = await prisma.shift.findFirst({
      where: { status: 'OPEN' }
    });

    if (!shift) {
      const defaultUser = await prisma.user.findFirst();
      if (!defaultUser) throw new Error('No user found to assign shift');
      
      shift = await prisma.shift.create({
        data: {
          userId: defaultUser.id,
          startTime: new Date(),
          startingCash: 0,
          status: 'OPEN'
        }
      });
    }

    const newOrder = await prisma.order.create({
      data: {
        totalAmount,
        status,
        shiftId: shift.id,
        syncStatus: 'SYNCED',
        localId: localId,
        orderItems: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
          }))
        },
        payments: {
          create: payments?.map((payment: any) => ({
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            status: payment.status
          })) || []
        }
      },
      include: {
        orderItems: true,
        payments: true
      }
    });

    // Track 2: Auto-deduct stock based on recipes
    if (status === 'COMPLETED') {
      for (const item of orderItems) {
        const recipes = await prisma.recipe.findMany({
          where: { productId: item.productId }
        });
        
        for (const recipe of recipes) {
          await prisma.ingredient.update({
            where: { id: recipe.ingredientId },
            data: {
              stock: {
                decrement: recipe.quantity * item.quantity
              }
            }
          });
        }
      }
    }

    res.status(201).json(newOrder);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

// Get all orders (for Admin Web / KDS)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        payments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all inventory (Ingredients)
app.get('/api/inventory', async (req, res) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
