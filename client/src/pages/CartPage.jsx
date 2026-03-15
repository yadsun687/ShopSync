import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/axiosInstance';
import useCartStore from '../store/useCartStore';

const CartPage = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  const checkoutCart = async () => {
    if (items.length === 0 || isCheckingOut) {
      return;
    }

    setIsCheckingOut(true);

    const successfulItemIds = [];
    const failedItems = [];

    for (const item of items) {
      try {
        await api.post('/orders', { productId: item._id, quantity: item.quantity });
        successfulItemIds.push(item._id);
      } catch (err) {
        failedItems.push({
          name: item.name,
          message: err.response?.data?.message || 'Order failed',
        });
      }
    }

    if (successfulItemIds.length === items.length) {
      clearCart();
      showToast('Cart checked out successfully', 'success');
      setTimeout(() => navigate('/orders'), 800);
    } else {
      successfulItemIds.forEach((itemId) => removeItem(itemId));

      if (successfulItemIds.length > 0) {
        showToast(
          `Placed ${successfulItemIds.length} order${successfulItemIds.length === 1 ? '' : 's'}. ${failedItems.length} item${failedItems.length === 1 ? '' : 's'} left in cart.`,
          'info'
        );
      } else {
        showToast(failedItems[0]?.message || 'Checkout failed', 'error');
      }
    }

    setIsCheckingOut(false);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Shopping Cart</h2>
        <p className="mt-3 text-gray-500 dark:text-gray-400">Your cart is empty.</p>
        <Link
          to="/shop"
          className="mt-6 inline-flex rounded bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Shopping Cart</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review items before placing product orders.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/shop"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Add More Items
          </Link>
          <button
            onClick={clearCart}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            Clear Cart
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`rounded p-3 text-sm ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : toast.type === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
          }`}
        >
          {toast.message}
        </div>
      )}

      {toast && toast.type !== 'success' && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          Failed items remain in the cart so you can adjust quantities or remove them.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex flex-col gap-4 rounded-lg bg-white p-5 shadow dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{item.name}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  ${item.price.toFixed(2)} each
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-gray-500 dark:text-gray-400">Qty</label>
                <input
                  type="number"
                  min="1"
                  max={Math.max(item.stock, 1)}
                  value={item.quantity}
                  onChange={(e) => setItemQuantity(item._id, e.target.value)}
                  className="w-20 rounded border border-gray-300 bg-white px-2 py-1.5 text-center text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                />
                <span className="min-w-24 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
                <button
                  onClick={() => removeItem(item._id)}
                  className="rounded bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-lg bg-white p-5 shadow dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Order Summary</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{itemCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={checkoutCart}
            disabled={isCheckingOut}
            className="mt-6 w-full rounded bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCheckingOut ? 'Placing Orders...' : 'Checkout Cart'}
          </button>
          <Link
            to="/orders"
            className="mt-3 block text-center text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            View Existing Orders
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default CartPage;