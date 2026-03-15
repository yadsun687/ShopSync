import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/axiosInstance';
import useCartStore from '../store/useCartStore';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState(null);
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data.data.products);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const setQuantity = (id, value) => {
    const num = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [id]: num }));
  };

  const addToCart = (product) => {
    const qty = quantities[product._id] || 1;
    const existingCartItem = cartItems.find((item) => item._id === product._id);
    const nextCartQuantity = (existingCartItem?.quantity || 0) + qty;

    if (qty > product.stock || nextCartQuantity > product.stock) {
      showToast(`Only ${product.stock} in stock`, 'error');
      return;
    }

    addItem(product, qty);
    setQuantities((prev) => ({ ...prev, [product._id]: 1 }));
    showToast(`Added ${qty}x ${product.name} to cart`, 'success');
  };

  if (loading) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Shop</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse rounded-lg bg-white dark:bg-gray-800 p-5 shadow">
              <div className="h-5 w-36 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-3 h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-2 h-4 w-20 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="mt-4 h-9 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Shop</h2>
        <div className="flex gap-3">
          <Link
            to="/cart"
            className="rounded bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            View Cart
          </Link>
          <Link
            to="/orders"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            View Orders
          </Link>
        </div>
      </div>

      {toast && (
        <div className={`mb-4 rounded p-3 text-sm ${
          toast.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
          toast.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
        }`}>
          {toast.message}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const qty = quantities[product._id] || 1;
            const outOfStock = product.stock === 0;
            const itemInCart = cartItems.find((item) => item._id === product._id);

            return (
              <div
                key={product._id}
                className="flex flex-col justify-between rounded-lg bg-white dark:bg-gray-800 p-5 shadow"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{product.name}</h3>
                  <span className="mt-1 inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                    {product.category}
                  </span>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">${product.price?.toFixed(2)}</span>
                    {product.salePrice && product.salePrice < product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${product.originalPrice?.toFixed(2)}</span>
                    )}
                  </div>
                  <p className={`mt-1 text-sm ${outOfStock ? 'text-red-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                    {outOfStock ? 'Out of stock' : `${product.stock} in stock`}
                  </p>
                  {itemInCart && (
                    <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-300">
                      {itemInCart.quantity} currently in cart
                    </p>
                  )}
                  {product.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {product.tags.map((tag) => (
                        <span key={tag} className="rounded bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-xs text-gray-600 dark:text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={qty}
                    onChange={(e) => setQuantity(product._id, e.target.value)}
                    disabled={outOfStock}
                    className="w-16 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-center text-sm text-gray-800 dark:text-gray-200 disabled:opacity-50"
                  />
                  <button
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    className="flex-1 rounded bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {outOfStock ? 'Unavailable' : `Add to Cart · $${(product.price * qty).toFixed(2)}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
