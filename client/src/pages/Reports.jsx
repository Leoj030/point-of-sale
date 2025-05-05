import { useEffect, useState } from "react";
import { fetchReports } from "../api/api";
import Loader from "../components/Loader";

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports()
      .then(res => setReport(res.data))
      .catch(() => setError("Could not load reports"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Total Sales</p>
          <h3 className="text-xl font-bold">₱{report.totalSales}</h3>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Best Seller</p>
          <h3 className="text-xl font-bold">{report.bestSeller}</h3>
        </div>
        <div className="bg-white shadow p-4 rounded">
          <p className="text-gray-500">Orders Today</p>
          <h3 className="text-xl font-bold">{report.ordersToday}</h3>
        </div>
      </div>
    </div>
  );
}