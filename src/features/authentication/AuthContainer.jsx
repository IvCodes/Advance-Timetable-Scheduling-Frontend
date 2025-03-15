import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";

function AuthContainer() {
  const links = [
    { id: 1, href: "/login", text: "Login" },
    { id: 2, href: "/register", text: "Register" },
  ];

  return (
    <div className="flex flex-col h-screen">
      <Navbar links={links} />
      <div className="auth-content-container flex justify-center items-center flex-grow">
        <div className="w-full max-w-3xl p-6 border border-lightborder rounded-xl min-h-[40%] h-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthContainer;
