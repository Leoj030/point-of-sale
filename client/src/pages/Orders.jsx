import { useEffect, useState } from "react";
import { fetchOrders } from "../api/api";
import Loader from "../components/Loader";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders()
      .then(res => setOrders(res.data))
      .catch(err => setError("Failed to fetch orders"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Orders</h2>
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">ID</th>
            <th className="p-3">Customer</th>
            <th className="p-3">Total</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id} className="border-t">
              <td className="p-3">{order.id}</td>
              <td className="p-3">{order.customer}</td>
              <td className="p-3">₱{order.total}</td>
              <td className="p-3">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}