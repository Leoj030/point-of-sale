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
    <div className="h-screen w-64 bg-gray-800 text-white flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold p-4 border-b border-gray-700">Sisig ni Law</h1>
        <nav className="mt-4 flex flex-col gap-2 px-4">
          <Link to="/" className="py-2 px-3 rounded hover:bg-gray-700">Dashboard</Link>
          <Link to="/products" className="py-2 px-3 rounded hover:bg-gray-700">Products</Link>
          <Link to="/orders" className="py-2 px-3 rounded hover:bg-gray-700">Orders</Link>
          <Link to="/reports" className="py-2 px-3 rounded hover:bg-gray-700">Reports</Link>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left py-2 px-3 bg-red-600 hover:bg-red-700 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
