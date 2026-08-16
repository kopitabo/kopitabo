export const API_URL = 'https://kopitabo.onrender.com/api';

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
