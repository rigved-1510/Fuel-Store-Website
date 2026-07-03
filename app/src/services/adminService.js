import { apiFetch } from './api';

export async function getAdminProducts() {
  const res = await apiFetch('/products?admin=true');
  return res.data || [];
}

export async function createProduct(formData) {
  const res = await apiFetch('/products', {
    method: 'POST',
    body: formData
  });
  return res.data;
}

export async function updateProduct(id, formData) {
  const res = await apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: formData
  });
  return res.data;
}

export async function deleteProduct(id) {
  const res = await apiFetch(`/products/${id}`, {
    method: 'DELETE'
  });
  return res;
}

export async function activateProduct(id) {
  const res = await apiFetch(`/products/${id}/activate`, {
    method: 'PATCH'
  });
  return res;
}

export async function getAdminOrders(status = '') {
  const query = status ? `?status=${status}` : '';
  const res = await apiFetch(`/orders${query}`);
  return res.data || [];
}

export async function getAdminOrderDetail(id) {
  const res = await apiFetch(`/orders/${id}`);
  return res.data;
}

export async function updateOrderStatus(id, statusData) {
  const res = await apiFetch(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData)
  });
  return res.data;
}

export async function getAdminUsers() {
  const res = await apiFetch('/auth/users');
  return res.data || [];
}

export async function getDashboardStats() {
  const [products, orders, users] = await Promise.all([
    getAdminProducts(),
    getAdminOrders(),
    getAdminUsers()
  ]);

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid' || o.orderStatus === 'delivered')
    .reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);

  const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
  const activeProducts = products.filter(p => p.isActive).length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    totalUsers: users.length,
    pendingOrders,
    activeProducts,
    recentOrders: orders.slice(0, 5),
    recentUsers: users.slice(0, 5)
  };
}
