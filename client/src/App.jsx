import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";

export default function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
          <Routes>
            <Route path="/" element={<Orders />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/staff" element={<Staff />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}