// services/ordersAPI.js
import api from './axiosConfig';

export const ordersAPI = {
  // ========== USER ROUTES ==========
  
  // Create a new order
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Get current user's orders
  getUserOrders: () => api.get('/orders/my-orders'),
  
  // Get order by ID (user or admin)
  getOrderById: (id) => api.get(`/orders/${id}`),
  
  // Cancel order (User can cancel their own order)
  cancelOrder: (id, cancelData = {}) => api.put(`/orders/${id}/cancel`, cancelData),
  
  // Get order receipt (JSON)
  printOrderReceipt: (id) => api.get(`/orders/${id}/receipt`),
  
  // Force PDF download of receipt
  printOrderReceiptPDF: (orderId, config = {}) => 
    api.get(`/orders/${orderId}/receipt/pdf`, config),
  
  // ========== ADMIN ROUTES ==========
  
  // Get all orders (Admin only) - with filters & pagination
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  
  // Get order statistics (Admin only)
  getOrderStats: () => api.get('/admin/orders/stats'),
  
  // Get order summary (Admin only) - alias for stats
  getOrderSummary: () => api.get('/admin/orders/stats'),
  
  // Update order status (Admin only) - PATCH method
  updateOrderStatus: (id, statusData) => api.patch(`/admin/orders/${id}/status`, statusData),
  
  // Get single order details for admin (Admin only) - full details with populations
  getAdminOrderById: (id) => api.get(`/admin/orders/${id}`),
  
  // Delete order (Admin only)
  deleteOrder: (id) => api.delete(`/admin/orders/${id}`),
  
  // Update order status by orderId (not MongoDB _id) - Admin only
  updateOrderStatusByOrderId: (orderId, statusData) => 
    api.put(`/admin/orders/order-status/${orderId}`, statusData),
  
  // ========== REFUND ROUTE (Admin only) ==========
  // Process refund for an order
  processRefund: (id, refundData = {}) => api.post(`/admin/orders/${id}/refund`, refundData),
  
  // ========== PAYMENT WEBHOOK ROUTES (Usually not called from frontend) ==========
  
  // Payment success webhook (called by Razorpay)
  updatePaymentSuccess: (data) => api.put('/orders/payment-success', data),
  
  // Payment failed webhook (called by Razorpay)
  updatePaymentFailed: (data) => api.put('/orders/payment-failed', data),
};