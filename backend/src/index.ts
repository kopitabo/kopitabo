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
        recipes: {
          include: {
            ingredient: true
          }
        }
      },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

function getCostPerBaseUnit(cost: number, unit: string): number {
  const u = (unit || '').toLowerCase();
  if (u === 'galon') return cost / 19000; // Rp per ml
  if (u === 'kg') return cost / 1000;     // Rp per gram
  if (u === 'liter' || u === 'l') return cost / 1000; // Rp per ml
  return cost;
}

// Create a new product
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, hpp, imageUrl, categoryName, recipes } = req.body;
    
    // Find or create category
    let category = await prisma.category.findFirst({
      where: { name: categoryName }
    });
    
    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryName }
      });
    }

    // Auto calculate HPP from recipe ingredients if recipes exist
    let computedHpp = parseFloat(hpp || 0);
    if (recipes && Array.isArray(recipes) && recipes.length > 0) {
      let recipeSum = 0;
      for (const r of recipes) {
        if (r.ingredientId) {
          const ing = await prisma.ingredient.findUnique({ where: { id: r.ingredientId } });
          if (ing) {
            recipeSum += (parseFloat(r.quantity || 0) * getCostPerBaseUnit(ing.costPerUnit || 0, ing.unit || ''));
          }
        }
      }
      if (recipeSum > 0) {
        computedHpp = recipeSum;
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price || 0),
        hpp: computedHpp,
        imageUrl: imageUrl || null,
        categoryId: category.id,
        recipes: recipes && Array.isArray(recipes) ? {
          create: recipes.map((r: any) => ({
            ingredientId: r.ingredientId,
            quantity: parseFloat(r.quantity || 0)
          }))
        } : undefined
      },
      include: {
        category: true,
        recipes: {
          include: {
            ingredient: true
          }
        }
      }
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update an existing product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, hpp, imageUrl, categoryName, recipes } = req.body;

    let category = await prisma.category.findFirst({
      where: { name: categoryName }
    });

    if (!category && categoryName) {
      category = await prisma.category.create({
        data: { name: categoryName }
      });
    }

    // Clear existing recipes if new ones provided
    if (recipes && Array.isArray(recipes)) {
      await prisma.recipe.deleteMany({
        where: { productId: id }
      });
    }

    // Auto calculate HPP from recipe ingredients if recipes exist
    let computedHpp = hpp !== undefined ? parseFloat(hpp) : undefined;
    if (recipes && Array.isArray(recipes) && recipes.length > 0) {
      let recipeSum = 0;
      for (const r of recipes) {
        if (r.ingredientId) {
          const ing = await prisma.ingredient.findUnique({ where: { id: r.ingredientId } });
          if (ing) {
            recipeSum += (parseFloat(r.quantity || 0) * getCostPerBaseUnit(ing.costPerUnit || 0, ing.unit || ''));
          }
        }
      }
      if (recipeSum > 0) {
        computedHpp = recipeSum;
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: price !== undefined ? parseFloat(price) : undefined,
        hpp: computedHpp,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        categoryId: category ? category.id : undefined,
        recipes: recipes && Array.isArray(recipes) ? {
          create: recipes.map((r: any) => ({
            ingredientId: r.ingredientId,
            quantity: parseFloat(r.quantity || 0)
          }))
        } : undefined
      },
      include: {
        category: true,
        recipes: {
          include: {
            ingredient: true
          }
        }
      }
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.recipe.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete product' });
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

// Create a new ingredient
app.post('/api/inventory', async (req, res) => {
  try {
    const { name, unit, stock, costPerUnit } = req.body;
    
    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        stock: parseFloat(stock || 0),
        costPerUnit: parseFloat(costPerUnit || 0)
      }
    });
    
    res.status(201).json(ingredient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// Update an ingredient
app.put('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, stock, costPerUnit } = req.body;

    const updatedIngredient = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        unit,
        stock: stock !== undefined ? parseFloat(stock) : undefined,
        costPerUnit: costPerUnit !== undefined ? parseFloat(costPerUnit) : undefined
      }
    });

    // Automatically recalculate HPP for all menu products using this ingredient
    if (costPerUnit !== undefined) {
      const affectedRecipes = await prisma.recipe.findMany({
        where: { ingredientId: id },
        select: { productId: true }
      });
      const productIds = Array.from(new Set(affectedRecipes.map(r => r.productId)));

      for (const prodId of productIds) {
        const prodRecipes = await prisma.recipe.findMany({
          where: { productId: prodId },
          include: { ingredient: true }
        });
        const newHpp = prodRecipes.reduce((sum, r) => sum + (r.quantity * getCostPerBaseUnit(r.ingredient.costPerUnit || 0, r.ingredient.unit || '')), 0);
        await prisma.product.update({
          where: { id: prodId },
          data: { hpp: newHpp }
        });
      }
    }

    res.json(updatedIngredient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// Delete an ingredient
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.recipe.deleteMany({ where: { ingredientId: id } });
    await prisma.ingredient.delete({ where: { id } });
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
