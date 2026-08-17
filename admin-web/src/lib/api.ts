export const API_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000/api'
    : 'https://kopitabo.onrender.com/api');

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function deleteProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function fetchOrders() {
  try {
    const res = await fetch(`${API_URL}/orders`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchInventory() {
  try {
    const res = await fetch(`${API_URL}/inventory`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function deleteIngredient(id: string) {
  try {
    const res = await fetch(`${API_URL}/inventory/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    console.error(error);
    return false;
  }
}
