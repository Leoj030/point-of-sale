import { Box, LayoutDashboard, LogOut, ShoppingCart, Tags, Users } from 'lucide-react';
import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `py-2 px-4 rounded-lg border transition-colors ${
      isActive
        ? 'bg-[#f15734] text-white border-[#f15734]'
        : 'border-gray-700 hover:bg-[#fcefe9] hover:border-[#f15734] hover:text-[#f15734]'
    }`;

  return (
    <aside id="app-sidebar" className="w-64 bg-white text-gray-700 flex flex-col justify-between">
      <div>
        <div className="p-4">
          <h1 className="text-2xl font-bold">POS System</h1>
        </div>

        <nav className="mt-4 flex flex-col gap-1 p-6">
          <NavLink to="/" className={linkClasses}>
            <div className="flex items-center gap-2">
              <LayoutDashboard size={18} />
              Dashboard
            </div>
          </NavLink>
          <NavLink to="/categories" className={linkClasses}>
            <div className="flex items-center gap-2">
              <Tags size={18} />
              Categories
            </div>
          </NavLink>
          <NavLink to="/products" className={linkClasses}>
            <div className="flex items-center gap-2">
              <Box size={18} />
              Products
            </div>
          </NavLink>
          <NavLink to="/orders" className={linkClasses}>
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} />
              Orders
            </div>
          </NavLink>
          <NavLink to="/staff" className={linkClasses}>
            <div className="flex items-center gap-2">
              <Users size={18} />
              Staff
            </div>
          </NavLink>
        </nav>
      </div>
      <div className="p-6">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 rounded-lg bg-none hover:bg-[#f15734] hover:border-[#f15734] hover:text-white border border-gray-700 text-gray-700 flex items-center gap-2 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;