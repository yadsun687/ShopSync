import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';

const StatCard = ({ title, value, prefix = '$' }) => (
  <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
      {prefix}{typeof value === 'number' ? value.toFixed(2) : value}
    </p>
  </div>
);

const SkeletonCard = () => (
  <div className="animate-pulse rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
    <div className="mt-4 h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
  </div>
);

const BarChart = ({ data }) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
      <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">Products by Category</h3>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item._id} className="flex items-center gap-3">
            <span className="w-24 text-sm font-medium text-gray-600 dark:text-gray-300">{item._id}</span>
            <div className="flex-1">
              <div
                className="h-8 rounded bg-indigo-500 transition-all duration-500"
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
            </div>
            <span className="w-8 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const results = await Promise.allSettled([
        api.get('/products/stats'),
        api.get('/products'),
      ]);

      const [statsResult, productsResult] = results;

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value.data.data);
      } else {
        setStatsError('Failed to load statistics.');
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value.data.data.products);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="animate-pulse rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="mt-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>

      {statsError && (
        <div className="mb-4 rounded bg-red-100 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-300">
          {statsError}
        </div>
      )}

      {stats && (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard title="Max Sale Price" value={stats.maxSalePrice} />
            <StatCard title="Average Sale Price" value={stats.avgSalePrice} />
          </div>

          {stats.totalByCategory && stats.totalByCategory.length > 0 && (
            <BarChart data={stats.totalByCategory} />
          )}
        </>
      )}

      {products.length > 0 && (
        <div className="mt-6 rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
          <h3 className="mb-3 text-lg font-semibold text-gray-800 dark:text-gray-100">
            Products ({products.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <th className="py-2">Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.category}</td>
                    <td className="py-2">${p.price?.toFixed(2)}</td>
                    <td className="py-2">{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
