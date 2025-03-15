import React from "react";
import Navbar from "../../components/navbar/Navbar";
import { Outlet } from "react-router-dom";

const links = [{ id: 1, href: "/student/dashboard", text: "Dashboard" }];

function StudentContainer() {
  return (
    <div>
      <Navbar links={links} />
      <div className="flex-grow p-6 bg-gray-100">
        <Outlet />
      </div>
    </div>
  );
}

export default StudentContainer;
