import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/axiosInstance';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

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

  const deleteProduct = async (id) => {
    const previousItems = [...products];

    // Optimistic update
    setProducts((prev) => prev.filter((p) => p._id !== id));
    setDeletingId(id);
    showToast('Deleting product...', 'info');

    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted', 'success');
    } catch {
      // Rollback on failure
      setProducts(previousItems);
      showToast('Failed — product restored', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12 text-gray-500 dark:text-gray-400">Loading inventory...</div>;
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Inventory</h2>

      {/* Toast notification */}
      {toast && (
        <div
          className={`mb-4 rounded px-4 py-2 text-sm font-medium ${
            toast.type === 'success'
              ? 'bg-green-100 text-green-800'
              : toast.type === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
          }`}
        >
          {toast.message}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">No products in inventory</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded bg-white dark:bg-gray-800 shadow-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-left text-sm font-medium text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Sale Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3">${product.price.toFixed(2)}</td>
                  <td className="px-4 py-3">${product.salePrice?.toFixed(2) ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${product._id}/reviews`}
                        className="rounded bg-indigo-500 px-3 py-1 text-xs text-white hover:bg-indigo-600"
                      >
                        Reviews
                      </Link>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        disabled={deletingId === product._id}
                        className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        {deletingId === product._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
