import React, { useEffect, useState } from 'react';
import API from '../api/axios';
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
    <div className="w-full h-full bg-[#fcefe9] text-[#f15734] border-4 border-[#f15734]"> {/* Border added here */}
      {/* Header */}
      <header className="bg-white p-4 border-b border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold">Sisig ni Law Dashboard</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-6">Overview</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold">Sales Today</h3>
            <p className="text-3xl font-bold mt-3 text-green-600">
              ₱{sales ? sales.today.toLocaleString() : '...'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold">This Week</h3>
            <p className="text-3xl font-bold mt-3 text-blue-500">
              ₱{sales ? sales.thisWeek.toLocaleString() : '...'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
            <h3 className="text-lg font-semibold">This Month</h3>
            <p className="text-3xl font-bold mt-3 text-yellow-600">
              ₱{sales ? sales.thisMonth.toLocaleString() : '...'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;