import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data.data.orders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    const previousOrders = [...orders];
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o))
    );
    setCancellingId(orderId);
    showToast('Cancelling order...', 'info');

    try {
      const res = await api.delete(`/orders/${orderId}`);
      // Update with server response (includes reverted stock info)
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.data.data.order : o))
      );
      showToast('Order cancelled — stock reverted', 'success');
    } catch (err) {
      // Rollback
      setOrders(previousOrders);
      const msg = err.response?.data?.message || 'Failed to cancel order';
      showToast(msg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Orders</h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-lg bg-white dark:bg-gray-800 p-4 shadow">
            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-4 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Orders</h2>

      {toast && (
        <div className={`mb-4 rounded p-3 text-sm ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          toast.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {toast.message}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg bg-white dark:bg-gray-800 shadow">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Total Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isCancellable = order.status !== 'cancelled' && order.status !== 'completed';
                return (
                  <tr key={order._id} className="border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    <td className="px-4 py-3 font-mono text-xs">{order._id}</td>
                    <td className="px-4 py-3">{order.productId?.name || order.productId}</td>
                    <td className="px-4 py-3">{order.quantity}</td>
                    <td className="px-4 py-3">${order.totalPrice?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {isCancellable ? (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          disabled={cancellingId === order._id}
                          className="rounded bg-red-500 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          {cancellingId === order._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
