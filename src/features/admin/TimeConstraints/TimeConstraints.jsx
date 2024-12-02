import React from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const sidebarLinks = [
  { id: 1, href: "/admin/time/all", text: "All Constraints" },
  { id: 2, href: "/admin/time/breaks", text: "Break Constraints" },
  { id: 3, href: "/admin/time/teachers", text: "Teacher Constraints" },
  { id: 4, href: "/admin/time/students", text: "Student Constraints" },
  { id: 5, href: "/admin/time/activities", text: "Activity Constraints" },
];

function TimeConstraints() {
  return (
    <div>
      <div className="flex flex-grow overflow-hidden">
        <Sidebar links={sidebarLinks} />
        <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default TimeConstraints;
