import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { toggleSidebar } from "./sidebar.slice";

function Sidebar({ links }) {
  const { sidebarCollapsed } = useSelector((state) => state.sidebar);

  const dispatch = useDispatch();
  const toggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <div
      className={`bg-gray-800 text-white flex flex-col ${
        sidebarCollapsed ? "w-16" : "w-64"
      } transition-all duration-300`}
    >
      <button
        onClick={toggle}
        className="bg-darkbg text-white py-2 px-4 rounded-full m-2 self-end"
      >
        {sidebarCollapsed ? ">" : "<"}
      </button>
      <nav
        className={`flex flex-col space-y-5 ${
          sidebarCollapsed ? "hidden" : "block"
        } `}
      >
        {links.map((link) => (
          <NavLink
            key={link.id}
            to={link.href}
            style={{
              padding: sidebarCollapsed ? "0.8rem 1rem" : "0.8rem 1.5rem",
            }}
            className={({ isActive }) =>
              isActive
                ? "bg-darkbg p-2 rounded-xl"
                : "text-gwhite-300 p-2 rounded"
            }
          >
            {!sidebarCollapsed && (
              <span className="font-light">{link.text}</span>
            )}
            {sidebarCollapsed && (
              <span
                title={link.text}
                className="font-light text-center w-full block"
              ></span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
