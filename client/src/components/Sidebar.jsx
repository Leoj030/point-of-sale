import { BarChart, Box, LayoutDashboard, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Orders", icon: <LayoutDashboard /> },
  { to: "/inventory", label: "Inventory", icon: <Box /> },
  { to: "/reports", label: "Reports", icon: <BarChart /> },
  { to: "/staff", label: "Staff", icon: <Users /> },
];

const getLinkClass = (isActive) =>
  [
    "flex items-center gap-3 p-2 rounded-lg transition-colors",
    isActive
      ? "bg-[#ec5f2b] text-white"
      : "text-[#544a41] border-[1px] hover:bg-[#fdeeeb] hover:border-[#ec5f2b] hover:text-[#ec5f2b]",
  ].join(" ");

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md p-4 h-screen sticky top-0">
      <h1 className="text-xl font-bold mb-8">POS System</h1>
      <nav className="space-y-4">
        {links.map(({ to, label, icon }) => (
          <NavLink key={label} to={to} className={({ isActive }) => getLinkClass(isActive)}>
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}