import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sisig ni Law Dashboard</h1>
        <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </header>

      {/* Content */}
      <main className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Sales</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">₱12,350</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Orders Today</h3>
            <p className="text-2xl font-bold text-blue-500 mt-2">27</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Inventory Items</h3>
            <p className="text-2xl font-bold text-yellow-600 mt-2">123</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;