import API from '../api/axios';
import React, { useEffect, useState } from 'react';
import { SalesData, SalesReportResponse } from '../types/sales';

const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<SalesData | null>(null);

  useEffect(() => {
    const fetchSalesReport = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await API.get<SalesReportResponse>('/reports/sales', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setSales(response.data.data);
        } else {
          console.error('Failed to fetch sales:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching sales report:', error);
      }
    };

    fetchSalesReport();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Sisig ni Law Dashboard</h1>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Sales Today</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              ₱{sales ? sales.today.toLocaleString() : '...'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">This Week</h3>
            <p className="text-2xl font-bold text-blue-500 mt-2">
              ₱{sales ? sales.thisWeek.toLocaleString() : '...'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">This Month</h3>
            <p className="text-2xl font-bold text-yellow-600 mt-2">
              ₱{sales ? sales.thisMonth.toLocaleString() : '...'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;