import React from "react";
import Navbar from "../../components/navbar/Navbar";
import { Outlet } from "react-router-dom";

function AdminContainer() {
  const links = [
    { id: 1, href: "/admin/dashboard", text: "Dashboard" },
    { id: 2, href: "/admin/users", text: "Users" },
    { id: 3, href: "/admin/data", text: "Data" },
    { id: 4, href: "/admin/time", text: "Time" },
    { id: 5, href: "/admin/space", text: "Space" },
    { id: 6, href: "/admin/timetable", text: "Timetable" },
    { id: 7, href: "/admin/settings", text: "Settings" },
  ];

  return (
    <div>
      <Navbar links={links} />
      <div className="flex-grow p-6 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminContainer;
