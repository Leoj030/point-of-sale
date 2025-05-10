import React, { useEffect, useState } from 'react';
import API from '../api/axios';
import { fetchOrders } from '../api/order'; // Import fetchOrders function
import { OrderHistoryItem } from '../types/order'; // Import the required type
import { SalesData, SalesReportResponse } from '../types/sales';

const Dashboard: React.FC = () => {
  const [sales, setSales] = useState<SalesData | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]); // State for Order History
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch sales data
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

  // Fetch order history data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const data = await fetchOrders(token); // Use the fetchOrders function
          setOrderHistory(data || []);
        } else {
          setError('Token not found');
        }
      } catch (error) {
        setError('Failed to fetch order history');
        console.error('Error fetching order history:', error);
      }
      setLoading(false);
    };

    fetchData(); // Call the function inside useEffect
  }, []);

  return (
    <div className="w-full h-full bg-[#fcefe9] text-[#f15734] border-4 border-[#f15734]">
      {/* Header */}
      <header className="bg-white p-4 border-b border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold">Sisig ni Law Dashboard</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        <h2 className="text-xl font-semibold mb-6">Overview</h2>

        {/* Sales Overview */}
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

        {/* Order History */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2">Order History</h2>
          {loading ? (
            <div>Loading...</div>
          ) : orderHistory.length === 0 ? (
            <div className="text-gray-500">No orders yet.</div>
          ) : (
            <table className="w-full text-sm bg-white rounded shadow">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((order) => (
                  <tr
                    key={order.orderId}
                    className={order.status === 'Pending' ? 'bg-yellow-50' : ''}
                  >
                    <td>{order.orderId.slice(0, 8)}</td>
                    <td>{order.status}</td>
                    <td>{order.orderType}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
                      {order.items.map((item) => (
                        <div key={item.id}>{item.productName} x{item.quantity}</div>
                      ))}
                    </td>
                    <td>₱{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {error && <div className="text-red-500">{error}</div>}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;