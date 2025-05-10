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

  const linkClasses =
    'block py-2 px-4 rounded hover:bg-gray-700 transition-colors';

  return (
    <aside id="app-sidebar" className="w-64 bg-gray-800 text-white flex flex-col justify-between">
      <div>
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Sisig ni Law</h1>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          <Link to="/" className={linkClasses}>Dashboard</Link>
          <Link to="/categories" className={linkClasses}>Categories</Link>
          <Link to="/products" className={linkClasses}>Products</Link>
          <Link to="/orders" className={linkClasses}>Orders</Link>
          <Link to="/staff" className={linkClasses}>Staff</Link>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;