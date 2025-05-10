import { useContext } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Layout from './component/Layout';
import { AuthContext } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Staff from './pages/Staff';
import OrdersHistory from './pages/OrdersHistory';
import ReceiptView from './pages/ReceiptView';
import Categories from './pages/Categories';

import './index.css';

const LoginRedirect = () => {
  const { token } = useContext(AuthContext);
  return token ? <Navigate to="/" replace /> : <Login />;
};

function App() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginRedirect />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff"
            element={
              <ProtectedRoute>
                <Layout>
                  <Staff />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Layout>
                  <Categories />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <Orders />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrdersHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/receipt/:orderId"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReceiptView />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;