import { useEffect, useState } from "react";
import { fetchStaff } from "../api/api";
import Loader from "../components/Loader";

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStaff()
      .then(res => setStaff(res.data))
      .catch(() => setError("Failed to fetch staff list"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Staff</h2>
      <ul className="space-y-3">
        {staff.map(member => (
          <li key={member.id} className="bg-white p-3 shadow rounded flex justify-between">
            <span>{member.name}</span>
            <span className="text-sm text-gray-600">{member.role}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}