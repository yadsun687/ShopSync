import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FormProvider } from './context/FormContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import InventoryPage from './pages/InventoryPage';
import ProductReviewsPage from './pages/ProductReviewsPage';
import SellerCard from './components/SellerCard';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const GuestRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  return user ? <Navigate to="/" /> : children;
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-bold text-indigo-600">ShopSync</Link>
            <Link to="/" className="text-sm text-gray-600 hover:text-indigo-600">Dashboard</Link>
            <Link to="/inventory" className="text-sm text-gray-600 hover:text-indigo-600">Inventory</Link>
            <Link to="/users" className="text-sm text-gray-600 hover:text-indigo-600">Users</Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.username} ({user.role})</span>
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
      <h2 className="mb-6 text-2xl font-bold text-gray-800">Dashboard</h2>
      <h3 className="mb-4 text-lg font-semibold text-gray-700">Seller Rankings</h3>
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
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><FormProvider><RegisterPage /></FormProvider></GuestRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Layout><InventoryPage /></Layout></ProtectedRoute>} />
          <Route path="/products/:productId/reviews" element={<ProtectedRoute><Layout><ProductReviewsPage /></Layout></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Layout><UsersPage /></Layout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;