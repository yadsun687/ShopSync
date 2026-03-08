import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FormProvider } from './context/FormContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import InventoryPage from './pages/InventoryPage';
import ProductReviewsPage from './pages/ProductReviewsPage';
import SellerCard from './components/SellerCard';
import DynamicFormBuilderPage from './pages/DynamicFormBuilderPage';
import TaskQueuePage from './pages/TaskQueuePage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import SellersPage from './pages/SellersPage';
import ShopPage from './pages/ShopPage';

const ForbiddenPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center">
    <h1 className="text-4xl font-bold text-red-600">403</h1>
    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Forbidden — You do not have permission to access this page.</p>
    <Link to="/" className="mt-4 text-indigo-600 hover:underline dark:text-indigo-400">Go to Dashboard</Link>
  </div>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role) && user.role !== 'admin') return <ForbiddenPage />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  return user ? <Navigate to="/" /> : children;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { config, toggleTheme, setPrimaryColor } = useTheme();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold dark:text-indigo-400" style={{ color: config.primaryColor }}>ShopSync</Link>
            <Link to="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Dashboard</Link>
            <Link to="/inventory" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Inventory</Link>
            <Link to="/users" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Users</Link>
            <Link to="/shop" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Shop</Link>
            <Link to="/orders" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Orders</Link>
            <Link to="/sellers" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Sellers</Link>
            <Link to="/form-builder" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Add Product</Link>
            <Link to="/tasks" className="text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">Tasks</Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="rounded bg-gray-200 dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {config.theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
            <label className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <span>Color:</span>
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded border-0"
              />
            </label>
            <span className="text-sm text-gray-600 dark:text-gray-300">{user.username} ({user.role})</span>
            <button onClick={logout} className="rounded bg-red-500 px-3 py-1.5 text-sm text-white hover:bg-red-600">Logout</button>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  );
};

const Dashboard = () => {
  const sellers = [
    { name: 'Alice', power: 30 },
    { name: 'Bob', power: 75 },
    { name: 'Charlie', power: 120 },
  ];

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>
      <h3 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Seller Rankings</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sellers.map((seller) => (
          <SellerCard key={seller.name} name={seller.name} power={seller.power} />
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><FormProvider><RegisterPage /></FormProvider></GuestRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute roles={['admin', 'editor']}><Layout><InventoryPage /></Layout></ProtectedRoute>} />
          <Route path="/products/:productId/reviews" element={<ProtectedRoute><Layout><ProductReviewsPage /></Layout></ProtectedRoute>} />
          <Route path="/reviews/:productId" element={<ProtectedRoute><Layout><ProductReviewsPage /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute roles={['admin']}><Layout><UsersPage /></Layout></ProtectedRoute>} />
          <Route path="/shop" element={<ProtectedRoute><Layout><ShopPage /></Layout></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
          <Route path="/sellers" element={<ProtectedRoute><Layout><SellersPage /></Layout></ProtectedRoute>} />
          <Route path="/form-builder" element={<ProtectedRoute><Layout><DynamicFormBuilderPage /></Layout></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute roles={['admin']}><Layout><TaskQueuePage /></Layout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;