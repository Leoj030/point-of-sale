import { useContext } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './component/Layout';
import { AuthContext } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import ProtectedRoute from './routes/ProtectedRoute';

const LoginRedirect = () => {
  const { token } = useContext(AuthContext);
  return token ? <Navigate to="/" replace /> : <Login />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginRedirect />} />
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
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}

export default App;