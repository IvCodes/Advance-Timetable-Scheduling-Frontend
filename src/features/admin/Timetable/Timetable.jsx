import React from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const sidebarLinks = [
  { id: 1, href: "/admin/timetable/generate", text: "Generate" },
  { id: 2, href: "/admin/timetable/view", text: "View" },
  { id: 3, href: "/admin/timetable/view-sliit", text: "SLIIT Timetables" },
  { id: 4, href: "/admin/timetable/faculty-unavailability", text: "Faculty Unavailability" },
];

function Timetable() {
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

export default Timetable;
