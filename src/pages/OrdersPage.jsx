// src/pages/OrdersPage.jsx
import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../api/orders';
import { deliveryBoyAPI } from '../api/deliveryBoy';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Search } from 'lucide-react';
import { FaSyncAlt, FaTag, FaTruck, FaMapMarkerAlt, FaEdit, FaPhone, FaUser, FaBox } from 'react-icons/fa';

const OrdersPage = () => {
  const { logout, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [wards, setWards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundStatus, setRefundStatus] = useState({});
  const [activeRefundOrderId, setActiveRefundOrderId] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({});
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, orderId: null, orderNumber: null });

  // ✅ Today's Orders PDF state
  const [downloadingToday, setDownloadingToday] = useState(false);

  // Edit Address modal state
  const [editAddressOrder, setEditAddressOrder] = useState(null);
  const [editAddressForm, setEditAddressForm] = useState({
    name: '', phone: '', city: '', wardId: '', typedArea: '',
    street: '', postalCode: '', state: '', country: '', email: ''
  });
  const [editAddressLoading, setEditAddressLoading] = useState(false);

  // Filtering States
  const [sortOption, setSortOption] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: '📋' },
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', icon: '✅' },
    { value: 'processing', label: 'Processing', icon: '⚙️' },
    { value: 'shipped', label: 'Shipped', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', icon: '📦' },
    { value: 'cancelled', label: 'Cancelled', icon: '❌' }
  ];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (user) setUserRole(user.role || 'admin');
  }, [user]);

  useEffect(() => {
    fetchOrders();
    fetchDeliveryBoys();
    fetchWards();
  }, []);

  const fetchDeliveryBoys = async () => {
    try {
      const response = await deliveryBoyAPI.getAllDeliveryBoys();
      let list = [];
      if (response.data?.deliveryBoys && Array.isArray(response.data.deliveryBoys)) list = response.data.deliveryBoys;
      else if (Array.isArray(response.data)) list = response.data;
      setDeliveryBoys(list.filter(b => b.status === 'active'));
    } catch (err) {
      console.error('Error fetching delivery boys:', err);
    }
  };

  const fetchWards = async () => {
    try {
      const response = await deliveryBoyAPI.getWardsList();
      const list = response.data?.wards || [];
      setWards(list);
    } catch (err) {
      console.error('Error fetching wards:', err);
    }
  };

  useEffect(() => {
    if (!orders.length) { setFilteredOrders([]); return; }

    let result = [...orders];
    if (selectedStatus !== 'all') result = result.filter(o => o.orderStatus === selectedStatus);

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => {
        const customer = getCustomerInfo(order);
        return (
          (order.orderId && order.orderId.toLowerCase().includes(term)) ||
          (customer.name && customer.name.toLowerCase().includes(term)) ||
          (customer.email && customer.email.toLowerCase().includes(term)) ||
          (customer.phone && customer.phone.toLowerCase().includes(term))
        );
      });
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'amount-high': return (b.finalAmount || 0) - (a.finalAmount || 0);
        case 'amount-low': return (a.finalAmount || 0) - (b.finalAmount || 0);
        default: return 0;
      }
    });

    setFilteredOrders(result);
  }, [orders, sortOption, selectedStatus, searchTerm]);

  const fetchOrders = async (showRefreshingState = false) => {
    try {
      if (showRefreshingState) setRefreshing(true);
      else setLoading(true);
      setError('');

      const response = await ordersAPI.getOrders();
      let ordersData = [];
      if (Array.isArray(response.data)) ordersData = response.data;
      else if (response.data && Array.isArray(response.data.orders)) ordersData = response.data.orders;
      else if (response.data && Array.isArray(response.data.data)) ordersData = response.data.data;
      else if (Array.isArray(response)) ordersData = response;

      setOrders(ordersData || []);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchOrders(true);
    fetchDeliveryBoys();
    fetchWards();
  };

  // ✅ Download today's orders PDF
  const handleDownloadTodayOrders = async () => {
    try {
      setDownloadingToday(true);
      const response = await ordersAPI.downloadTodayOrdersPDF();

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const today = new Date().toISOString().slice(0, 10);
      link.download = `today-orders-${today}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Download failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setDownloadingToday(false);
    }
  };

  const getAssignedBoy = (order) => {
    if (!order?.deliveryBoy) return null;
    if (typeof order.deliveryBoy === 'object' && order.deliveryBoy._id) return order.deliveryBoy;
    const id = typeof order.deliveryBoy === 'string' ? order.deliveryBoy : order.deliveryBoy?.toString?.();
    return deliveryBoys.find(b => (b._id || b.id) === id) || null;
  };

  const getBoyLocation = (boy) => {
    if (!boy) return '—';
    const parts = [];
    if (boy.city) parts.push(boy.city.toUpperCase());
    if (Array.isArray(boy.wardIds) && boy.wardIds.length) parts.push(`Wards ${boy.wardIds.join(',')}`);
    if (Array.isArray(boy.areas) && boy.areas.length) parts.push(boy.areas.join(', '));
    return parts.join(' • ') || '—';
  };

  const handleAssignDeliveryBoy = async (orderId, deliveryBoyId) => {
    try {
      setAssigningOrderId(orderId);
      const response = await ordersAPI.assignDeliveryBoy(orderId, deliveryBoyId);
      if (response.data?.success) {
        setOrders(prev => prev.map(o =>
          o._id === orderId
            ? { ...o,
                deliveryBoy: response.data.order?.deliveryBoy || (deliveryBoyId ? { _id: deliveryBoyId } : null),
                deliveryStatus: response.data.order?.deliveryStatus || (deliveryBoyId ? 'assigned' : 'unassigned') }
            : o
        ));
        setTimeout(() => fetchOrders(), 800);
      } else {
        alert(`❌ ${response.data?.message || 'Failed to assign'}`);
      }
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setAssigningOrderId(null);
    }
  };

  const openEditAddress = (order) => {
    setEditAddressOrder(order);
    setEditAddressForm({
      name: order.name || order.shippingAddress?.name || '',
      phone: order.shippingAddress?.phone || '',
      city: order.shippingAddress?.city || '',
      wardId: order.wardId != null ? String(order.wardId) : '',
      typedArea: order.typedArea || '',
      street: order.shippingAddress?.street || '',
      postalCode: order.shippingAddress?.postalCode || '',
      state: order.shippingAddress?.state || '',
      country: order.shippingAddress?.country || '',
      email: order.shippingAddress?.email || ''
    });
  };

  const closeEditAddress = () => {
    setEditAddressOrder(null);
    setEditAddressLoading(false);
  };

  const handleEditAddressSubmit = async (e) => {
    e.preventDefault();
    if (!editAddressOrder) return;

    try {
      setEditAddressLoading(true);
      const payload = {
        name: editAddressForm.name,
        phone: editAddressForm.phone,
        city: editAddressForm.city,
        wardId: editAddressForm.wardId === '' ? null : editAddressForm.wardId,
        typedArea: editAddressForm.typedArea,
        street: editAddressForm.street,
        postalCode: editAddressForm.postalCode,
        state: editAddressForm.state,
        country: editAddressForm.country,
        email: editAddressForm.email,
      };

      const response = await ordersAPI.editOrderAddress(editAddressOrder._id, payload);

      if (response.data?.success) {
        setOrders(prev => prev.map(o =>
          o._id === editAddressOrder._id
            ? {
                ...o,
                name: response.data.order?.name ?? o.name,
                wardId: response.data.order?.wardId ?? o.wardId,
                wardName: response.data.order?.wardName ?? o.wardName,
                typedArea: response.data.order?.typedArea ?? o.typedArea,
                shippingAddress: response.data.order?.shippingAddress ?? o.shippingAddress,
              }
            : o
        ));
        alert('✅ Order address updated');
        closeEditAddress();
        setTimeout(() => fetchOrders(), 800);
      } else {
        alert(`❌ ${response.data?.message || 'Failed to update'}`);
      }
    } catch (err) {
      alert(`❌ ${err.response?.data?.message || err.message}`);
    } finally {
      setEditAddressLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await ordersAPI.deleteOrder(orderId);
      if (response.data.success) {
        setOrders(prev => prev.filter(order => order._id !== orderId));
        setDeleteModal({ show: false, orderId: null, orderNumber: null });
        setError('✅ Order deleted successfully');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      setError('❌ Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (newStatus === 'cancelled') {
      if (!window.confirm('⚠️ Cancel this order?')) return;
    }
    if (newStatus === 'delivered') {
      if (!window.confirm('✅ Mark this order as delivered?')) return;
    }
    try {
      setStatusUpdating(prev => ({ ...prev, [orderId]: true }));
      const response = await ordersAPI.updateOrderStatus(orderId, {
        orderStatus: newStatus,
        ...(newStatus === 'cancelled' && { cancellationReason: 'Cancelled by admin via dashboard' })
      });
      if (response.data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? {
          ...o, orderStatus: newStatus,
          deliveryStatus: response.data.order?.deliveryStatus || o.deliveryStatus,
          paymentStatus: response.data.order?.paymentStatus || o.paymentStatus,
          deliveryBoy: newStatus === 'cancelled' ? null : o.deliveryBoy
        } : o));
        setTimeout(() => fetchOrders(), 1000);
      }
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setStatusUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      setStatusUpdating(prev => ({ ...prev, [orderId]: true }));
      const response = await ordersAPI.updateOrderStatus(orderId, { paymentStatus: newPaymentStatus });
      if (response.data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, paymentStatus: newPaymentStatus } : o));
        setTimeout(() => fetchOrders(), 1000);
      }
    } catch (error) {
      alert(`❌ ${error.response?.data?.message || error.message}`);
    } finally {
      setStatusUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusOptions = (currentStatus) => {
    const all = [
      { value: 'pending', label: 'Pending' },
      { value: 'confirmed', label: 'Confirmed' },
      { value: 'processing', label: 'Processing' },
      { value: 'shipped', label: 'Shipped' },
      { value: 'delivered', label: 'Delivered' },
      { value: 'cancelled', label: 'Cancelled' },
    ];
    const flow = {
      pending: ['pending', 'confirmed', 'processing', 'cancelled'],
      confirmed: ['confirmed', 'processing', 'shipped', 'cancelled'],
      processing: ['processing', 'shipped', 'cancelled'],
      shipped: ['shipped', 'delivered', 'cancelled'],
      delivered: ['delivered'],
      cancelled: ['cancelled'],
    };
    return all.filter(s => (flow[currentStatus] || [currentStatus]).includes(s.value));
  };

  const getPaymentStatusOptions = (current) => {
    const all = [
      { value: 'pending', label: 'Pending' },
      { value: 'completed', label: 'Completed' },
      { value: 'failed', label: 'Failed' },
      { value: 'refunded', label: 'Refunded' },
    ];
    const flow = {
      pending: ['pending', 'completed', 'failed'],
      completed: ['completed', 'refunded'],
      failed: ['failed'],
      refunded: ['refunded'],
    };
    return all.filter(s => (flow[current] || [current]).includes(s.value));
  };

  const getDeliveryStatusBadge = (status) => {
    if (!status) return <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800">Unassigned</span>;
    const cfg = {
      unassigned: { color: 'bg-gray-100 text-gray-800', label: 'Unassigned' },
      assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned' },
      picked_up: { color: 'bg-yellow-100 text-yellow-800', label: 'Picked Up' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      returned: { color: 'bg-red-100 text-red-800', label: 'Returned' }
    };
    const c = cfg[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.color}`}>{c.label}</span>;
  };

  const isRefundable = (order) => order && order.orderStatus === 'cancelled' && order.paymentStatus === 'completed' && order.refundStatus !== 'completed';

  const processRefund = async (order) => {
    if (!order || !isRefundable(order)) { alert('This order cannot be refunded'); return; }
    const refundAmount = order.finalAmount || order.totalAmount || 0;
    if (!confirm(`Refund ₹${refundAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}?`)) return;
    try {
      setRefundLoading(true);
      setActiveRefundOrderId(order._id);
      const response = await ordersAPI.processRefund(order._id, { amount: refundAmount, reason: 'Customer requested refund' });
      if (response.data.success) {
        setOrders(prev => prev.map(o => o._id === order._id ? { ...o, paymentStatus: 'refunded', refundStatus: 'completed' } : o));
        alert('✅ Refund processed');
        setTimeout(() => fetchOrders(), 1500);
      }
    } catch (error) {
      alert(`❌ Refund failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setRefundLoading(false);
      setTimeout(() => setActiveRefundOrderId(null), 2000);
    }
  };

  const fetchOrderReceipt = async (orderId) => {
    try {
      if (!orderId) { alert('Order ID missing'); return; }
      setReceiptLoading(true);
      const response = await ordersAPI.printOrderReceipt(orderId);
      setSelectedOrder(response.data || response);
      setShowReceiptModal(true);
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setReceiptLoading(false);
    }
  };

  const downloadPDFReceipt = async (orderId) => {
    try {
      if (!orderId) { alert('Order ID missing'); return; }
      setReceiptLoading(true);
      setDownloadStatus('Starting download...');
      const response = await ordersAPI.printOrderReceiptPDF(orderId, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `order-receipt-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setDownloadStatus('PDF downloaded successfully!');
    } catch (err) {
      alert(`Download failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setReceiptLoading(false);
      setTimeout(() => setDownloadStatus(''), 3000);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return 'Invalid Date'; }
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    try { return new Date(dateString).toLocaleDateString('en-US', { year: '2-digit', month: 'short', day: 'numeric' }); }
    catch { return 'Invalid Date'; }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

  const getStatusBadge = (status) => {
    if (!status) return null;
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    if (!paymentStatus) return null;
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-purple-100 text-purple-800'
    };
    return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${colors[paymentStatus] || 'bg-gray-100 text-gray-800'}`}>{paymentStatus}</span>;
  };

  const getCustomerInfo = (order) => {
    const name = order.name || order.shippingAddress?.name || order.customer?.name || order.user?.name || order.customerName || order.guestUser?.name || 'Customer';
    const email = order.shippingAddress?.email || order.customer?.email || order.user?.email || order.customerEmail || order.guestUser?.email || order.email || '';
    const phone = order.shippingAddress?.phone || order.customer?.phone || order.user?.phone || order.phoneNumber || order.guestUser?.phone || '';
    const isGuest = !order.user || (typeof order.user === 'string' && !order.user);
    return { name, email, phone, isGuest };
  };

  const getOrderId = (order) => {
    if (!order) return null;
    if (order.receipt) return order.receipt.receiptNumber || order.receipt._id || order.receipt.orderId || order.receipt.id;
    return order._id || order.id || order.orderId;
  };

  const truncateOrderId = (order) => {
    const id = order.orderId || order.orderNumber || order._id || '';
    return id.length > 12 ? id.slice(-8) : id;
  };

  const getFullAddress = (receiptData) => {
    const addr = receiptData?.shippingAddress;
    if (!addr) return '—';
    const parts = [];
    const typed = (receiptData?.typedArea || receiptData?.wardName || '').trim();
    const street = (addr.street || '').trim();
    if (typed && !street.toLowerCase().includes(typed.toLowerCase())) parts.push(typed);
    if (street) parts.push(street);
    if (addr.city) parts.push(addr.city);
    if (addr.state) parts.push(addr.state);
    if (addr.postalCode) parts.push(addr.postalCode);
    return parts.length > 0 ? parts.join(', ') : '—';
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.orderStatus === 'pending').length;
  const deliveredOrders = orders.filter(o => o.orderStatus === 'delivered' || o.orderStatus === 'completed').length;
  const cancelledOrders = orders.filter(o => o.orderStatus === 'cancelled').length;

  // ============================================================
  // ✅ Reusable ORDER CARD — used for both mobile and desktop
  // ============================================================
  const OrderCard = ({ order, index }) => {
    const customer = getCustomerInfo(order);
    const orderId = getOrderId(order);
    const isRefundableOrder = isRefundable(order);
    const assigned = getAssignedBoy(order);
    const statusOptionsList = getStatusOptions(order.orderStatus);
    const paymentStatusOptionsList = getPaymentStatusOptions(order.paymentStatus);
    const isUpdating = statusUpdating[order._id];
    const isAssigning = assigningOrderId === order._id;

    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Header strip */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#ff0000]/10 text-[#ff0000] flex items-center justify-center text-xs font-bold flex-shrink-0">
              {index + 1}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono font-bold text-gray-800 truncate">
                #{order.orderId || order._id?.slice(-8)}
              </p>
              <p className="text-[11px] text-gray-500">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge(order.orderStatus)}
            {getPaymentStatusBadge(order.paymentStatus)}
          </div>
        </div>

        {/* Body */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT: Customer + Address */}
          <div className="space-y-3">
            {/* Customer */}
            <div className="flex items-start gap-2">
              <FaUser className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{customer.name}</p>
                {customer.phone && (
                  <a href={`tel:${customer.phone}`} className="text-[11px] text-[#ff0000] hover:underline flex items-center gap-1">
                    <FaPhone size={9} /> {customer.phone}
                  </a>
                )}
              </div>
            </div>

            {/* Address block */}
            <div className="flex items-start gap-2">
              <FaMapMarkerAlt className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
              <div className="min-w-0 text-[11px] text-gray-600 space-y-0.5">
                {order.wardName && (
                  <p className="text-blue-700 font-medium">Ward {order.wardId} — {order.wardName}</p>
                )}
                {order.typedArea && (
                  <p className="text-orange-700">🏠 {order.typedArea}</p>
                )}
                {order.shippingAddress?.street && (
                  <p>📍 {order.shippingAddress.street}</p>
                )}
                {order.shippingAddress?.city && (
                  <p>🏙️ {order.shippingAddress.city}{order.shippingAddress.postalCode ? ` - ${order.shippingAddress.postalCode}` : ''}</p>
                )}
              </div>
            </div>

            {/* Items summary */}
            <div className="flex items-start gap-2">
              <FaBox className="text-gray-400 mt-0.5 flex-shrink-0" size={12} />
              <div className="min-w-0">
                <p className="text-[11px] text-gray-600">
                  <b>{order.products?.length || 0}</b> item(s)
                  {order.products?.[0] && (
                    <span className="text-gray-500"> — {order.products[0].name}{order.products.length > 1 ? ` +${order.products.length - 1} more` : ''}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Delivery + Amount + Actions */}
          <div className="space-y-3">
            {/* Delivery boy dropdown */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 flex items-center gap-1 mb-1">
                <FaTruck size={10} /> Delivery Boy
              </label>
              <select
                value={assigned?._id || assigned?.id || ''}
                onChange={(e) => handleAssignDeliveryBoy(order._id, e.target.value || null)}
                disabled={isAssigning}
                className={`w-full text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-white font-medium ${isAssigning ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#ff0000]'} transition-colors`}
              >
                <option value="">── Unassigned ──</option>
                {deliveryBoys.map(b => {
                  const id = b._id || b.id;
                  const loc = b.city ? b.city.toUpperCase() : (b.areas?.join(', ') || '');
                  return <option key={id} value={id}>{b.name} {loc ? `(${loc})` : ''}</option>;
                })}
              </select>
              {assigned && (
                <p className="mt-1 text-[10px] text-gray-500 flex items-start gap-1">
                  <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" size={9} />
                  <span className="break-words">{getBoyLocation(assigned)}</span>
                </p>
              )}
            </div>

            {/* Amount + delivery status */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
              <div>
                <p className="text-[10px] text-gray-500">Total</p>
                <p className="text-base font-bold text-gray-800">{formatCurrency(order.finalAmount || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-500">Delivery</p>
                {getDeliveryStatusBadge(order.deliveryStatus)}
              </div>
            </div>

            {/* Order + Payment status selects */}
            {userRole === 'admin' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">Order Status</label>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    disabled={isUpdating}
                    className="w-full text-[11px] border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
                  >
                    {statusOptionsList.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-0.5">Payment Status</label>
                  <select
                    value={order.paymentStatus}
                    onChange={(e) => handlePaymentStatusUpdate(order._id, e.target.value)}
                    disabled={isUpdating}
                    className="w-full text-[11px] border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
                  >
                    {paymentStatusOptionsList.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-4 py-3 bg-gray-50 border-t flex flex-wrap gap-2">
          <button
            onClick={() => fetchOrderReceipt(orderId)}
            className="flex-1 min-w-[100px] bg-gradient-to-r from-[#ff0000] to-[#cc0000] hover:from-[#cc0000] hover:to-[#aa0000] text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
          >
            🧾 Receipt
          </button>
          {userRole === 'admin' && (
            <button
              onClick={() => openEditAddress(order)}
              className="flex-1 min-w-[100px] bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
            >
              <FaEdit size={11} /> Edit Address
            </button>
          )}
          {userRole === 'admin' && (
            <button
              onClick={() => setDeleteModal({ show: true, orderId: order._id, orderNumber: order.orderId })}
              className="flex-1 min-w-[100px] bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            >
              🗑️ Delete
            </button>
          )}
          {isRefundableOrder && (
            <button
              onClick={() => processRefund(order)}
              disabled={refundLoading && activeRefundOrderId === order._id}
              className="flex-1 min-w-[100px] bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              💰 Refund
            </button>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // Edit Address Modal
  // ============================================================
  const EditAddressModal = ({ order, form, setForm, onClose, onSubmit, loading }) => {
    if (!order) return null;

    const wardsByCity = wards.reduce((acc, w) => {
      const key = (w.city || 'karaikudi').toLowerCase();
      if (!acc[key]) acc[key] = [];
      acc[key].push(w);
      return acc;
    }, {});

    const cityKey = (form.city || '').trim().toLowerCase();
    const availableWards = wardsByCity[cityKey] || [];

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50">
        <form onSubmit={onSubmit} className="bg-white rounded-xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl">
          <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-[#ff0000] to-[#cc0000] text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              <FaEdit />
              <h2 className="font-bold text-sm sm:text-base">Edit Order Address</h2>
            </div>
            <button type="button" onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-white/20 rounded text-sm hover:bg-white/30">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500">
              Order <b className="font-mono">#{order.orderId || order._id}</b>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Customer Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Phone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">City</label>
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value, wardId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#ff0000] focus:border-transparent">
                  <option value="">-- Select city --</option>
                  <option value="karaikudi">Karaikudi</option>
                  <option value="pudukkottai">Pudukkottai</option>
                  <option value={form.city && !['karaikudi', 'pudukkottai'].includes(form.city) ? form.city : '_other'}>
                    {form.city && !['karaikudi', 'pudukkottai'].includes(form.city) ? form.city : 'Other (type below)'}
                  </option>
                </select>
                {(!['karaikudi', 'pudukkottai'].includes(form.city)) && (
                  <input type="text" placeholder="Type custom city" value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Ward</label>
                <select value={form.wardId} onChange={(e) => setForm({ ...form, wardId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" disabled={!form.city}>
                  <option value="">── No ward ──</option>
                  {availableWards.map(w => (
                    <option key={w.wardId} value={String(w.wardId)}>
                      Ward {w.wardId} — {w.wardName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Typed Area</label>
                <input type="text" value={form.typedArea} onChange={(e) => setForm({ ...form, typedArea: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Street Address</label>
                <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Postal Code</label>
                <input type="text" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">State</label>
                <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-gray-600 mb-1">Country</label>
                <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#ff0000] focus:border-transparent" />
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-end gap-2 rounded-b-xl">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-100">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-gradient-to-r from-[#ff0000] to-[#cc0000] text-white rounded-lg text-xs font-medium hover:from-[#cc0000] hover:to-[#aa0000] disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // Receipt Modal
  const ReceiptModal = ({ order, onClose, onDownloadPDF }) => {
    if (!order) return null;
    const receiptData = order.receipt || order;
    const orderId = receiptData.receiptNumber || receiptData.orderNumber || receiptData.orderId || receiptData._id;
    const customerName = receiptData.name || receiptData.shippingAddress?.name || receiptData.customer?.name || 'Customer';
    const customerEmail = receiptData.customer?.email || receiptData.user?.email || receiptData.shippingAddress?.email || receiptData.email || 'N/A';
    const customerPhone = receiptData.customer?.phone || receiptData.user?.phone || receiptData.shippingAddress?.phone || 'N/A';
    const items = receiptData.products || receiptData.items || [];
    const subtotal = receiptData.pricing?.subtotal || receiptData.totalAmount || 0;
    const shipping = receiptData.pricing?.shipping || receiptData.shippingFee || 0;
    const tax = receiptData.pricing?.tax || receiptData.taxAmount || 0;
    const total = receiptData.pricing?.total || receiptData.finalAmount || 0;
    const orderDate = receiptData.createdAt || receiptData.orderDate || receiptData.date;
    const paymentStatus = receiptData.payment?.status || receiptData.paymentStatus;
    const paymentMethod = receiptData.payment?.method || receiptData.paymentMethod;
    const orderStatus = receiptData.orderStatus;
    const shippingAddress = receiptData.shippingAddress;

    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-2 sm:p-4 z-50">
        <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl">
          <div className="bg-gradient-to-r from-[#ff0000] to-[#cc0000] text-white p-4 flex justify-between items-center rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-base">🛒</div>
              <div>
                <h1 className="font-bold text-sm sm:text-base">ORDER RECEIPT</h1>
                <p className="text-white/80 text-xs">#{orderId?.substring(0, 12)}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/20 rounded hover:bg-white/30">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 space-y-2">
              <div className="flex justify-between"><span className="text-xs text-gray-500">Date:</span><span className="text-xs font-medium">{formatDate(orderDate)}</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Payment:</span>{getPaymentStatusBadge(paymentStatus)}</div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Status:</span>{getStatusBadge(orderStatus)}</div>
              <div className="flex justify-between"><span className="text-xs text-gray-500">Method:</span><span className="text-xs capitalize font-medium">{paymentMethod}</span></div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg border text-xs space-y-1">
              <div className="flex items-center gap-1"><span>👤</span><span className="font-medium">{customerName}</span></div>
              {customerEmail !== 'N/A' && <div className="flex items-center gap-1"><span>✉️</span><span className="break-all">{customerEmail}</span></div>}
              <div className="flex items-center gap-1"><span>📞</span><span>{customerPhone}</span></div>
              {shippingAddress && (
                <div className="mt-2 pt-2 border-t space-y-1">
                  <div className="font-medium text-gray-600">Shipping Address:</div>
                  <div><b>Street:</b> {shippingAddress.street || '—'}</div>
                  <div><b>City:</b> {shippingAddress.city || '—'}</div>
                  <div><b>State / PIN:</b> {[shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(' - ') || '—'}</div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <h3 className="font-bold text-sm mb-2">Items ({items.length})</h3>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex justify-between border-b pb-2 text-xs">
                    <div>
                      <div className="font-medium">{item.product?.name || item.name}</div>
                      {item.variantName && <div className="text-gray-500">{item.variantName}</div>}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency((item.price || 0) * (item.quantity || 1))}</div>
                      <div className="text-gray-500">{item.quantity} × {formatCurrency(item.price || 0)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#ff0000]/10 p-3 rounded-lg border border-[#ff0000]/20 text-xs space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping:</span><span>{formatCurrency(shipping)}</span></div>
              <div className="flex justify-between"><span>Tax:</span><span>{formatCurrency(tax)}</span></div>
              <div className="flex justify-between font-bold pt-2 border-t border-[#ff0000]/30 text-sm"><span>TOTAL:</span><span className="text-[#ff0000]">{formatCurrency(total)}</span></div>
            </div>
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-end rounded-b-xl">
            <button onClick={onDownloadPDF} disabled={receiptLoading} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium disabled:opacity-50">
              📥 Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = ({ show, onClose, onConfirm, orderNumber }) => {
    if (!show) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <span className="text-red-600 text-xl">🗑️</span>
          </div>
          <h3 className="text-lg font-bold text-center mb-2">Delete Order</h3>
          <p className="text-gray-600 text-sm text-center mb-6">Delete order #{orderNumber}? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium">Delete</button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50"><Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff0000] mx-auto"></div>
            <p className="mt-3 text-sm text-gray-500">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 w-full min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">Orders Management</h1>
            <button onClick={logout} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center text-sm">
              <span className="hidden sm:inline mr-2">Logout</span><LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="p-3 sm:p-6 max-w-7xl mx-auto w-full">
          {/* Page heading + Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaTag className="text-[#ff0000]" size={16} />All Orders
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{filteredOrders.length} of {totalOrders} orders</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* ✅ Today's Orders PDF button */}
              <button
                onClick={handleDownloadTodayOrders}
                disabled={downloadingToday}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {downloadingToday ? '📄 Generating...' : "📄 Today's Orders PDF"}
              </button>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <FaSyncAlt className={refreshing ? 'animate-spin' : ''} size={12} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Orders', value: totalOrders, gradient: 'from-blue-500 to-blue-600' },
              { label: 'Pending', value: pendingOrders, gradient: 'from-yellow-500 to-yellow-600' },
              { label: 'Delivered', value: deliveredOrders, gradient: 'from-green-500 to-green-600' },
              { label: 'Cancelled', value: cancelledOrders, gradient: 'from-red-500 to-red-600' }
            ].map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <p className="text-gray-500 text-xs font-medium">{c.label}</p>
                <p className={`text-2xl font-bold mt-1 bg-gradient-to-r ${c.gradient} bg-clip-text text-transparent`}>{c.value}</p>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative sm:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
                />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
              >
                {statusOptions.map(o => <option key={o.value} value={o.value}>{o.icon} {o.label}</option>)}
              </select>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#ff0000] focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Amount (High to Low)</option>
                <option value="amount-low">Amount (Low to High)</option>
              </select>
            </div>
          </div>

          {error && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-sm ${error.includes('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
              <Search className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-sm font-medium text-gray-700">No orders found</h3>
              <p className="text-xs text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredOrders.map((order, index) => (
                <OrderCard key={order._id} order={order} index={index} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {editAddressOrder && (
        <EditAddressModal
          order={editAddressOrder}
          form={editAddressForm}
          setForm={setEditAddressForm}
          onClose={closeEditAddress}
          onSubmit={handleEditAddressSubmit}
          loading={editAddressLoading}
        />
      )}

      {showReceiptModal && (
        <ReceiptModal
          order={selectedOrder}
          onClose={() => setShowReceiptModal(false)}
          onDownloadPDF={() => {
            const orderId = selectedOrder?.receipt?.receiptNumber || selectedOrder?.receipt?._id || selectedOrder?.receipt?.orderId || selectedOrder?._id || selectedOrder?.orderId;
            if (!orderId) return;
            downloadPDFReceipt(orderId);
          }}
        />
      )}

      <DeleteConfirmationModal
        show={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, orderId: null, orderNumber: null })}
        onConfirm={() => handleDeleteOrder(deleteModal.orderId, deleteModal.orderNumber)}
        orderNumber={deleteModal.orderNumber}
      />
    </div>
  );
};

export default OrdersPage;