import React from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const sidebarLinks = [
  { id: 1, href: "/admin/data/basic", text: "Basic" },
  { id: 9, href: "/admin/data/faculties", text: "Faculties" },
  { id: 2, href: "/admin/data/subjects", text: "Subjects" },
  // { id: 3, href: "/admin/data/tags", text: "Tags" },
  { id: 4, href: "/admin/data/teachers", text: "Teachers" },
  // { id: 5, href: "/admin/data/students", text: "Students" },
  { id: 6, href: "/admin/data/space", text: "Space" },
  { id: 7, href: "/admin/data/activities", text: "Activities" },
  { id: 8, href: "/admin/data/years", text: "Year and Subgroups" },
  // { id: 8, href: "/admin/data/subactivities", text: "Subactivities" },
  { id: 10, href: "/admin/data/import", text: "Bulk Data Import" }, // Add this new route

];

function DataManagement() {
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

export default DataManagement;
