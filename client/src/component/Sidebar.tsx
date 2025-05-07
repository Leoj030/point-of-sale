import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6 z-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Sisig ni Law</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/" className="text-gray-700 hover:text-blue-500">
          Dashboard
        </Link>
        <Link to="/products" className="text-gray-700 hover:text-blue-500">
          Products
        </Link>
        <Link to="/orders" className="text-gray-700 hover:text-blue-500">
          Orders
        </Link>
        <Link to="/reports" className="text-gray-700 hover:text-blue-500">
          Reports
        </Link>
        <button
          onClick={handleLogout}
          className="mt-6 bg-red-500 text-white py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;